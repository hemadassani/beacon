import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    return NextResponse.json({ error: "not authenticated" }, { status: 401 });
  }

  try {
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", user.id);
    if (profileError) throw new Error(profileError.message);

    const { error: resultsError } = await supabase
      .from("scoring_results")
      .delete()
      .eq("user_id", user.id);
    if (resultsError) throw new Error(resultsError.message);

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[reset-analysis] failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
