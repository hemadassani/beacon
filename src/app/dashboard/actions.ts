"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isScoringResults } from "@/types/scoring";
import type { Answers } from "@/data/onboarding-questions";

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export type RefreshState = { error: string | null; ok: boolean };

export async function refreshAnalysisAction(): Promise<RefreshState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return { error: "Not authenticated", ok: false };

  const { data: profileRow, error: profileError } = await supabase
    .from("profiles")
    .select("answers")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) return { error: profileError.message, ok: false };
  const answers = profileRow?.answers as Answers | null;
  if (!answers) return { error: "No profile answers on file", ok: false };

  const h = await headers();
  const host = h.get("host");
  const protocol = h.get("x-forwarded-proto") ?? "http";
  if (!host) return { error: "Cannot resolve host", ok: false };

  const unis = answers.universities as
    | { selected?: string[] }
    | string[]
    | undefined;
  const universities = Array.isArray(unis) ? unis : (unis?.selected ?? []);
  const apiAnswers = { ...answers, universities };

  let json: unknown;
  try {
    const res = await fetch(`${protocol}://${host}/api/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: apiAnswers }),
      cache: "no-store",
    });
    json = await res.json();
    if (!res.ok) {
      const msg = (json as { error?: string })?.error ?? `HTTP ${res.status}`;
      return { error: msg, ok: false };
    }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Network error",
      ok: false,
    };
  }

  if (!isScoringResults(json)) {
    return { error: "Scoring returned unexpected shape", ok: false };
  }

  const { error: insertError } = await supabase
    .from("scoring_results")
    .insert({ user_id: user.id, results: json });
  if (insertError) return { error: insertError.message, ok: false };

  revalidatePath("/dashboard");
  return { error: null, ok: true };
}
