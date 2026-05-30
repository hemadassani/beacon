import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isScoringResults } from "@/types/scoring";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { answers, results } = (body ?? {}) as {
    answers?: unknown;
    results?: unknown;
  };

  if (!answers || typeof answers !== "object") {
    return NextResponse.json(
      { error: "Missing or invalid `answers`" },
      { status: 400 },
    );
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(
      { id: user.id, answers, updated_at: new Date().toISOString() },
      { onConflict: "id" },
    );
  if (profileError) {
    console.error("[migrate] profile upsert failed:", profileError);
    return NextResponse.json(
      { error: `profile upsert failed: ${profileError.message}` },
      { status: 500 },
    );
  }

  if (isScoringResults(results)) {
    const { error: resultsError } = await supabase
      .from("scoring_results")
      .insert({ user_id: user.id, results });
    if (resultsError) {
      console.error("[migrate] scoring_results insert failed:", resultsError);
      return NextResponse.json(
        { error: `results insert failed: ${resultsError.message}` },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ ok: true });
}
