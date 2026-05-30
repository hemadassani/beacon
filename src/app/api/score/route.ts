import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import type { Answers } from "@/data/onboarding-questions";
import usUniversities from "@/data/us-universities.json";
import {
  getUniversityAdmitData,
  type UniversityAdmitData,
} from "@/data/university-data-helpers";
import {
  calculateBaselineProbability,
  type ScoringResult,
} from "@/lib/scoring/heuristic";
import type {
  EstimationConfidence,
  PerUniversityResult,
  ScoringResults,
} from "@/types/scoring";

interface ClaudeReasoningPayload {
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
  fallbackEstimated: boolean;
  estimationConfidence?: EstimationConfidence;
}

const REQUIRED_FIELDS = [
  "grading_system",
  "grades",
  "sat_act",
  "major",
  "hooks",
  "financial_aid",
] as const;

const US_UNIVERSITY_NAME_BY_ID: Map<string, string> = new Map(
  (usUniversities as Array<{ value: string; label: string }>).map((u) => [
    u.value,
    u.label,
  ]),
);

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

  const anthropic = new Anthropic({ apiKey });
  const estimationCache = new Map<
    string,
    { data: UniversityAdmitData; confidence: EstimationConfidence } | null
  >();
  const userMajor = (answers.major as string | undefined) ?? "undecided";

  console.log(
    `[score] resolving data for ${universityIds.length} universities`,
  );

  const heuristics: HeuristicEntry[] = [];
  const notFound: string[] = [];

  const resolutions = await Promise.all(
    universityIds.map(async (id) => {
      const hardcoded = getUniversityAdmitData(id);
      if (hardcoded) {
        return { id, uniData: hardcoded, fallbackEstimated: false } as const;
      }
      const name = US_UNIVERSITY_NAME_BY_ID.get(id);
      if (!name) {
        console.log(`[score] no name found for id: ${id}`);
        return { id, missing: true } as const;
      }
      const estimated = await estimateUniversityData(
        id,
        name,
        userMajor,
        anthropic,
        estimationCache,
      );
      if (!estimated) {
        console.log(`[score] estimation failed for ${id} (${name})`);
        return { id, missing: true } as const;
      }
      return {
        id,
        uniData: estimated.data,
        fallbackEstimated: true,
        estimationConfidence: estimated.confidence,
      } as const;
    }),
  );

  for (const r of resolutions) {
    if ("missing" in r) {
      notFound.push(r.id);
      continue;
    }
    const result = calculateBaselineProbability(answers, r.uniData);
    heuristics.push({
      id: r.id,
      name: r.uniData.name,
      uniData: r.uniData,
      result,
      fallbackEstimated: r.fallbackEstimated,
      estimationConfidence: r.estimationConfidence,
    });
  }

  if (heuristics.length === 0) {
    return NextResponse.json(
      { error: "No recognized universities in request", not_found: notFound },
      { status: 400 },
    );
  }

  console.log("[score] calling Claude for reasoning");

  let messageContent: string;
  try {
    const response = await anthropic.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 2000,
      output_config: { effort: "low" },
      system: buildReasoningSystemPrompt(),
      messages: [
        { role: "user", content: buildReasoningUserPrompt(answers, heuristics) },
      ],
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
    console.error("[score] Anthropic reasoning error:", err);
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

  let claudeData: ClaudeReasoningPayload;
  try {
    claudeData = parseReasoningJson(messageContent);
  } catch (err) {
    console.error(
      "[score] failed to parse reasoning JSON:",
      err,
      "raw:",
      messageContent,
    );
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
      fallback_estimated: h.fallbackEstimated,
      ...(h.fallbackEstimated && h.estimationConfidence
        ? { estimation_confidence: h.estimationConfidence }
        : {}),
    };
  });

  console.log("[score] returning response");

  const responseBody: ScoringResults = {
    results,
    overall_recommendations: claudeData.overall_recommendations ?? [],
    ...(notFound.length > 0 ? { not_found: notFound } : {}),
  };
  return NextResponse.json(responseBody);
}

async function estimateUniversityData(
  id: string,
  name: string,
  userMajor: string,
  anthropic: Anthropic,
  cache: Map<
    string,
    { data: UniversityAdmitData; confidence: EstimationConfidence } | null
  >,
): Promise<{ data: UniversityAdmitData; confidence: EstimationConfidence } | null> {
  if (cache.has(name)) return cache.get(name) ?? null;

  console.log(`[score] estimating data for ${name}`);

  const prompt = `Estimate admission data for ${name}, focusing on international applicants for the ${userMajor} major. Respond ONLY in this exact JSON shape with no other text:
{
  "overall_admit_rate": number (0-1),
  "international_admit_rate": number (0-1),
  "sat_25": number (400-1600),
  "sat_50": number,
  "sat_75": number,
  "avg_gpa_unweighted": number (0-4),
  "is_need_aware_international": boolean,
  "is_strong_in_major": boolean,
  "confidence": "high" | "medium" | "low"
}
Base estimates on commonly known data. If you're unsure, say so via confidence level.`;

  let text: string;
  try {
    const response = await anthropic.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 400,
      output_config: { effort: "low" },
      messages: [{ role: "user", content: prompt }],
    });
    const block = response.content.find(
      (b): b is Anthropic.TextBlock => b.type === "text",
    );
    if (!block) {
      cache.set(name, null);
      return null;
    }
    text = block.text;
  } catch (err) {
    console.error(`[score] estimation API error for ${name}:`, err);
    cache.set(name, null);
    return null;
  }

  const parsed = parseEstimation(text);
  if (!parsed) {
    cache.set(name, null);
    return null;
  }

  const strongMajors =
    parsed.is_strong_in_major && userMajor ? [userMajor] : [];

  const data: UniversityAdmitData = {
    id,
    name,
    location: "",
    domain: "",
    tier: tierFromAdmitRate(parsed.overall_admit_rate),
    overall_admit_rate: clamp01(parsed.overall_admit_rate),
    international_admit_rate: clamp01(parsed.international_admit_rate),
    sat_25: clampInt(parsed.sat_25, 400, 1600),
    sat_50: clampInt(parsed.sat_50, 400, 1600),
    sat_75: clampInt(parsed.sat_75, 400, 1600),
    act_25: 0,
    act_50: 0,
    act_75: 0,
    avg_gpa_unweighted: clamp(parsed.avg_gpa_unweighted, 0, 4),
    is_need_aware_international: Boolean(parsed.is_need_aware_international),
    strong_majors: strongMajors,
  };

  const entry = { data, confidence: parsed.confidence };
  cache.set(name, entry);
  return entry;
}

interface EstimationJson {
  overall_admit_rate: number;
  international_admit_rate: number;
  sat_25: number;
  sat_50: number;
  sat_75: number;
  avg_gpa_unweighted: number;
  is_need_aware_international: boolean;
  is_strong_in_major: boolean;
  confidence: EstimationConfidence;
}

function parseEstimation(text: string): EstimationJson | null {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
  }
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1)) as Partial<EstimationJson>;
    if (
      typeof parsed.overall_admit_rate !== "number" ||
      typeof parsed.international_admit_rate !== "number" ||
      typeof parsed.sat_25 !== "number" ||
      typeof parsed.sat_50 !== "number" ||
      typeof parsed.sat_75 !== "number" ||
      typeof parsed.avg_gpa_unweighted !== "number"
    ) {
      return null;
    }
    const confidence: EstimationConfidence =
      parsed.confidence === "high" || parsed.confidence === "medium" || parsed.confidence === "low"
        ? parsed.confidence
        : "low";
    return {
      overall_admit_rate: parsed.overall_admit_rate,
      international_admit_rate: parsed.international_admit_rate,
      sat_25: parsed.sat_25,
      sat_50: parsed.sat_50,
      sat_75: parsed.sat_75,
      avg_gpa_unweighted: parsed.avg_gpa_unweighted,
      is_need_aware_international: Boolean(parsed.is_need_aware_international),
      is_strong_in_major: Boolean(parsed.is_strong_in_major),
      confidence,
    };
  } catch {
    return null;
  }
}

function tierFromAdmitRate(rate: number): UniversityAdmitData["tier"] {
  if (rate < 0.1) return "most_selective";
  if (rate < 0.25) return "highly_selective";
  return "selective";
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
function clamp01(n: number): number {
  return clamp(n, 0, 1);
}
function clampInt(n: number, lo: number, hi: number): number {
  return Math.round(clamp(n, lo, hi));
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

function buildReasoningSystemPrompt(): string {
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

function buildReasoningUserPrompt(
  answers: Answers,
  heuristics: HeuristicEntry[],
): string {
  const profile: Record<string, unknown> = {
    ...(answers as Record<string, unknown>),
  };
  delete profile.universities;
  const profileSection = JSON.stringify(profile, null, 2);
  const universitiesSection = heuristics
    .map((h) => {
      const c = h.result.components;
      const u = h.uniData;
      const estTag = h.fallbackEstimated
        ? ` [data estimated, confidence: ${h.estimationConfidence ?? "low"}]`
        : "";
      return `- ${h.name} (id: ${h.id})${estTag}
  probability: ${(h.result.probability * 100).toFixed(1)}%
  tier: ${h.result.tier}
  components: scoreFit=${c.scoreFit.toFixed(0)}, gradeFit=${c.gradeFit.toFixed(0)}, hookBonus=+${c.hookBonus}, majorAdjustment=${c.majorAdjustment.toFixed(2)}, internationalAdjustment=${c.internationalAdjustment.toFixed(2)}
  overall_admit_rate: ${(u.overall_admit_rate * 100).toFixed(1)}%, international_admit_rate: ${(u.international_admit_rate * 100).toFixed(1)}%
  sat_25/50/75: ${u.sat_25}/${u.sat_50}/${u.sat_75}, avg_gpa_unweighted: ${u.avg_gpa_unweighted}
  strong_majors: ${u.strong_majors.join(", ") || "(none specified)"}`;
    })
    .join("\n\n");
  const idList = heuristics.map((h) => `"${h.id}"`).join(", ");
  const anyEstimated = heuristics.some((h) => h.fallbackEstimated);
  const estimationNote = anyEstimated
    ? `\n\nNote: Some universities have [data estimated]. For those, soften your reasoning slightly to acknowledge that the school's admit data is estimated.`
    : "";
  return `STUDENT PROFILE:
${profileSection}

UNIVERSITIES (with heuristic results):
${universitiesSection}

For each university listed above, write a 2-3 sentence reasoning that explains the verdict in plain English, referencing the student's specific stats. Then suggest 3 concrete improvement recommendations for that university. At the end, suggest 3 overall recommendations that would help across all the universities.

Return your response as valid JSON matching the schema in the system prompt. The "university_id" in each result must exactly match an id above (${idList}).${estimationNote}`;
}

function parseReasoningJson(text: string): ClaudeReasoningPayload {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  }
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in response");
  }
  const parsed = JSON.parse(cleaned.slice(start, end + 1)) as ClaudeReasoningPayload;
  if (!parsed || !Array.isArray(parsed.results)) {
    throw new Error("Parsed JSON missing results array");
  }
  return parsed;
}
