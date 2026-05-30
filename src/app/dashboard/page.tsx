import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AnonymousDashboardLoader } from "@/components/dashboard/AnonymousDashboardLoader";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { composeDashboardData } from "@/lib/dashboard-results";
import { createClient } from "@/lib/supabase/server";
import type { Answers } from "@/data/onboarding-questions";
import { isScoringResults, type ScoringResults } from "@/types/scoring";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return (
      <AnonymousDashboardLoader
        displayName="Friend"
        identitySubtitle="Guest profile"
      />
    );
  }

  const emailPrefix = user.email.split("@")[0];
  const displayName =
    emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
  const identitySubtitle = "Class of 2025";

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("answers")
    .eq("id", user.id)
    .maybeSingle();

  const answers = profileRow?.answers as Answers | null;
  if (!answers) {
    redirect("/auth/post-signin");
  }

  const { data: latestResultRow } = await supabase
    .from("scoring_results")
    .select("results")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let scoring: ScoringResults;
  if (latestResultRow && isScoringResults(latestResultRow.results)) {
    scoring = latestResultRow.results;
  } else {
    scoring = await generateAndCacheScoring(user.id, answers, supabase);
  }

  const data = composeDashboardData(scoring, answers);

  return (
    <DashboardLayout
      isAnonymous={false}
      displayName={displayName}
      identitySubtitle={identitySubtitle}
      data={data}
    />
  );
}

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function generateAndCacheScoring(
  userId: string,
  answers: Answers,
  supabase: SupabaseClient,
): Promise<ScoringResults> {
  const h = await headers();
  const host = h.get("host");
  const protocol = h.get("x-forwarded-proto") ?? "http";
  if (!host) throw new Error("Cannot resolve request host for /api/score call");
  const url = `${protocol}://${host}/api/score`;

  const apiAnswers = normalizeUniversitiesForApi(answers);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers: apiAnswers }),
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Scoring failed (${res.status}): ${body}`);
  }
  const json: unknown = await res.json();
  if (!isScoringResults(json)) {
    throw new Error("Scoring returned an unexpected shape");
  }
  await supabase
    .from("scoring_results")
    .insert({ user_id: userId, results: json });
  return json;
}

function normalizeUniversitiesForApi(answers: Answers): Answers {
  const unis = answers.universities as
    | { selected?: string[] }
    | string[]
    | undefined;
  if (Array.isArray(unis)) return answers;
  if (unis?.selected) return { ...answers, universities: unis.selected };
  return { ...answers, universities: [] };
}
