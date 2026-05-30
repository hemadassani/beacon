"use server";

import { createClient } from "@/lib/supabase/server";

export type SignupState = { error: string | null; ok: boolean };

export async function signupAction(
  _prevState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message, ok: false };
  }

  return { error: null, ok: true };
}
