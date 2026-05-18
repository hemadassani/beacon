import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import type { Answers } from "@/data/onboarding-questions";
import {
  getUniversityAdmitData,
  type UniversityAdmitData,
} from "@/data/university-data-helpers";
import {
  calculateBaselineProbability,
  type AdmissionTier,
  type ScoringResult,
} from "@/lib/scoring/heuristic";

interface PerUniversityResult {
  university_id: string;
  university_name: string;
  tier: AdmissionTier;
  probability: number;
  reasoning: string;
  recommendations: string[];
}

interface ScoreResponse {
  results: PerUniversityResult[];
  overall_recommendations: string[];
}

interface ClaudePayload {
  results: Array<{
    university_id: string;
    reasoning: string;
    recommendations: string[];
  }>;
  overall_recommendations: string[];
}

interface HeuristicEntry {
  id: string;
  name: string;
  uniData: UniversityAdmitData;
  result: ScoringResult;
}

const REQUIRED_FIELDS = [
  "grading_system",
  "grades",
  "sat_act",
  "major",
  "hooks",
  "financial_aid",
] as const;

export async function POST(request: Request) {
  console.log("[score] POST received");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseBody(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { answers, universityIds } = parsed;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("[score] ANTHROPIC_API_KEY missing");
    return NextResponse.json(
      { error: "Server missing ANTHROPIC_API_KEY" },
      { status: 500 },
    );
  }

  console.log(`[score] running heuristic for ${universityIds.length} universities`);

  const heuristics: HeuristicEntry[] = [];
  for (const id of universityIds) {
    const uniData = getUniversityAdmitData(id);
    if (!uniData) {
      console.log(`[score] skipping unknown university id: ${id}`);
      continue;
    }
    const result = calculateBaselineProbability(answers, uniData);
    heuristics.push({ id, name: uniData.name, uniData, result });
  }

  if (heuristics.length === 0) {
    return NextResponse.json(
      { error: "No recognized universities in request" },
      { status: 400 },
    );
  }

  console.log("[score] calling Claude API");

  const anthropic = new Anthropic({ apiKey });
  let messageContent: string;
  try {
    const response = await anthropic.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 2000,
      output_config: { effort: "low" },
      system: buildSystemPrompt(),
      messages: [{ role: "user", content: buildUserPrompt(answers, heuristics) }],
    });

    const textBlock = response.content.find(
      (b): b is Anthropic.TextBlock => b.type === "text",
    );
    if (!textBlock) {
      console.error("[score] no text block in Claude response");
      return NextResponse.json(
        { error: "AI returned no text content" },
        { status: 500 },
      );
    }
    messageContent = textBlock.text;
  } catch (err) {
    console.error("[score] Anthropic API error:", err);
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `AI service error (${err.status}): ${err.message}` },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { error: "AI service request failed" },
      { status: 500 },
    );
  }

  let claudeData: ClaudePayload;
  try {
    claudeData = parseClaudeJson(messageContent);
  } catch (err) {
    console.error("[score] failed to parse Claude JSON:", err, "raw:", messageContent);
    return NextResponse.json(
      { error: "AI response could not be parsed" },
      { status: 500 },
    );
  }

  const aiById = new Map(
    claudeData.results.map((r) => [r.university_id, r] as const),
  );

  const results: PerUniversityResult[] = heuristics.map((h) => {
    const ai = aiById.get(h.id);
    return {
      university_id: h.id,
      university_name: h.name,
      tier: h.result.tier,
      probability: h.result.probability,
      reasoning: ai?.reasoning ?? "",
      recommendations: ai?.recommendations ?? [],
    };
  });

  console.log("[score] returning response");

  const responseBody: ScoreResponse = {
    results,
    overall_recommendations: claudeData.overall_recommendations ?? [],
  };
  return NextResponse.json(responseBody);
}

function parseBody(
  body: unknown,
):
  | { answers: Answers; universityIds: string[] }
  | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "Body must be a JSON object" };
  }
  const obj = body as { answers?: unknown };
  if (!obj.answers || typeof obj.answers !== "object") {
    return { error: "Missing or invalid `answers` field" };
  }
  const answers = obj.answers as Answers;
  const unis = answers.universities;
  if (
    !Array.isArray(unis) ||
    unis.length === 0 ||
    !unis.every((u): u is string => typeof u === "string")
  ) {
    return { error: "`answers.universities` must be a non-empty string array" };
  }
  for (const field of REQUIRED_FIELDS) {
    if (!(field in answers)) {
      return { error: `Missing required field: answers.${field}` };
    }
  }
  return { answers, universityIds: unis };
}

function buildSystemPrompt(): string {
  return `You are Beacon's admissions reasoning engine. You receive a student profile and heuristic admit-rate calculations for several universities. Your job is to write a 2-3 sentence reasoning for each verdict and suggest 3 specific improvements.

OUTPUT RULES:
- Respond ONLY with valid JSON matching the schema below.
- No markdown code fences, no prose outside the JSON, no leading or trailing text.
- Start your response with "{" and end with "}".

Schema:
{
  "results": [
    {
      "university_id": "string (must match an id from the input)",
      "reasoning": "string (2-3 sentences explaining the verdict in plain English, referencing the student's specific stats)",
      "recommendations": ["string", "string", "string"]
    }
  ],
  "overall_recommendations": ["string", "string", "string"]
}`;
}

function buildUserPrompt(answers: Answers, heuristics: HeuristicEntry[]): string {
  const profile: Record<string, unknown> = { ...(answers as Record<string, unknown>) };
  delete profile.universities;
  const profileSection = JSON.stringify(profile, null, 2);
  const universitiesSection = heuristics
    .map((h) => {
      const c = h.result.components;
      const u = h.uniData;
      return `- ${h.name} (id: ${h.id})
  probability: ${(h.result.probability * 100).toFixed(1)}%
  tier: ${h.result.tier}
  components: scoreFit=${c.scoreFit.toFixed(0)}, gradeFit=${c.gradeFit.toFixed(0)}, hookBonus=+${c.hookBonus}, majorAdjustment=${c.majorAdjustment.toFixed(2)}, internationalAdjustment=${c.internationalAdjustment.toFixed(2)}
  overall_admit_rate: ${(u.overall_admit_rate * 100).toFixed(1)}%, international_admit_rate: ${(u.international_admit_rate * 100).toFixed(1)}%
  sat_25/50/75: ${u.sat_25}/${u.sat_50}/${u.sat_75}, avg_gpa_unweighted: ${u.avg_gpa_unweighted}
  strong_majors: ${u.strong_majors.join(", ")}`;
    })
    .join("\n\n");
  const idList = heuristics.map((h) => `"${h.id}"`).join(", ");
  return `STUDENT PROFILE:
${profileSection}

UNIVERSITIES (with heuristic results):
${universitiesSection}

For each university listed above, write a 2-3 sentence reasoning that explains the verdict in plain English, referencing the student's specific stats. Then suggest 3 concrete improvement recommendations for that university. At the end, suggest 3 overall recommendations that would help across all the universities.

Return your response as valid JSON matching the schema in the system prompt. The "university_id" in each result must exactly match an id above (${idList}).`;
}

function parseClaudeJson(text: string): ClaudePayload {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  }
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in response");
  }
  const parsed = JSON.parse(cleaned.slice(start, end + 1)) as ClaudePayload;
  if (!parsed || !Array.isArray(parsed.results)) {
    throw new Error("Parsed JSON missing results array");
  }
  return parsed;
}
