"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import {
  SCORING_RESULTS_KEY,
  WIZARD_ANSWERS_KEY,
  isScoringResults,
} from "@/types/scoring";
import { signupAction, type SignupState } from "./actions";

const ease = "easeOut" as const;
const initialState: SignupState = { error: null, ok: false };

export default function SignupPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    signupAction,
    initialState,
  );
  const [migrating, setMigrating] = useState(false);
  const [migrateError, setMigrateError] = useState<string | null>(null);

  useEffect(() => {
    if (!state.ok || migrating) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot trigger after server-action success
    setMigrating(true);
    void migrateAndRedirect(router, setMigrateError);
  }, [state.ok, migrating, router]);

  const busy = pending || migrating;

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#FAFAF7] px-6 py-16">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-400/25 blur-3xl" />
      </div>

      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white/80 p-8 shadow-sm backdrop-blur-sm"
      >
        <Link
          href="/"
          className="font-display block text-center text-2xl font-semibold tracking-tight text-neutral-900"
        >
          beacon.
        </Link>

        <h1 className="mt-8 text-center text-3xl font-semibold tracking-tight text-neutral-900">
          create your account
        </h1>

        <div className="mt-8">
          <GoogleSignInButton />
        </div>

        <div className="mt-6">
          <AuthDivider />
        </div>

        <form action={formAction} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
            Email
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="h-11 rounded-lg border border-neutral-200 bg-white px-3 text-neutral-900 placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
            Password
            <input
              type="password"
              name="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="h-11 rounded-lg border border-neutral-200 bg-white px-3 text-neutral-900 placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </label>

          {state.error && (
            <p role="alert" className="text-sm text-red-600">
              {state.error}
            </p>
          )}
          {migrateError && (
            <p role="alert" className="text-sm text-red-600">
              {migrateError}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-indigo-700 px-8 text-base font-medium text-white shadow-md transition duration-200 hover:scale-105 hover:bg-indigo-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
          >
            {migrating
              ? "Migrating your data..."
              : pending
                ? "Creating account..."
                : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-700 hover:text-indigo-800"
          >
            Sign in
          </Link>
        </p>
      </motion.main>
    </div>
  );
}

async function migrateAndRedirect(
  router: ReturnType<typeof useRouter>,
  setError: (msg: string | null) => void,
) {
  let answers: unknown = null;
  let results: unknown = null;
  try {
    const rawAnswers = window.localStorage.getItem(WIZARD_ANSWERS_KEY);
    const rawResults = window.localStorage.getItem(SCORING_RESULTS_KEY);
    if (rawAnswers) answers = JSON.parse(rawAnswers);
    if (rawResults) results = JSON.parse(rawResults);
  } catch (err) {
    console.error("Failed to parse cached anonymous data:", err);
  }

  if (!answers) {
    router.replace("/");
    return;
  }

  try {
    const res = await fetch("/api/migrate-anonymous-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers,
        results: isScoringResults(results) ? results : undefined,
      }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? `Migration failed (${res.status})`);
      return;
    }
  } catch (err) {
    setError(err instanceof Error ? err.message : "Migration failed");
    return;
  }

  try {
    window.localStorage.removeItem(WIZARD_ANSWERS_KEY);
    window.localStorage.removeItem(SCORING_RESULTS_KEY);
  } catch {
    // non-fatal
  }
  router.replace("/dashboard");
}
