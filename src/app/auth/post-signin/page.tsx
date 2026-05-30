"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  SCORING_RESULTS_KEY,
  WIZARD_ANSWERS_KEY,
  isScoringResults,
} from "@/types/scoring";

type Phase = "migrating" | "error";

export default function PostSigninPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("migrating");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const rawAnswers = readStorage(WIZARD_ANSWERS_KEY);
      const rawResults = readStorage(SCORING_RESULTS_KEY);

      if (!rawAnswers && !rawResults) {
        router.replace("/");
        return;
      }

      let answers: unknown = null;
      let results: unknown = null;
      try {
        if (rawAnswers) answers = JSON.parse(rawAnswers);
        if (rawResults) results = JSON.parse(rawResults);
      } catch (err) {
        console.error("Failed to parse cached anonymous data:", err);
      }

      if (!answers || typeof answers !== "object") {
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
          const body = (await res.json().catch(() => ({}))) as {
            error?: string;
          };
          if (!cancelled) {
            setErrorMessage(body.error ?? `Migration failed (${res.status})`);
            setPhase("error");
          }
          return;
        }
      } catch (err) {
        if (!cancelled) {
          setErrorMessage(err instanceof Error ? err.message : "Network error");
          setPhase("error");
        }
        return;
      }

      clearStorage(WIZARD_ANSWERS_KEY);
      clearStorage(SCORING_RESULTS_KEY);
      router.replace("/dashboard");
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [router, attempt]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAF7] px-6">
      {phase === "migrating" ? (
        <div className="text-center">
          <div className="font-display text-2xl font-medium tracking-tight text-neutral-900">
            setting up your dashboard...
          </div>
          <p className="mt-3 text-sm text-neutral-600">
            Saving your profile so it's there next time you sign in.
          </p>
        </div>
      ) : (
        <div className="max-w-sm text-center">
          <div className="font-display text-xl font-medium tracking-tight text-neutral-900">
            We couldn't finish setting things up.
          </div>
          {errorMessage ? (
            <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setErrorMessage(null);
              setPhase("migrating");
              setAttempt((n) => n + 1);
            }}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-indigo-700 px-6 text-sm font-medium text-white transition hover:bg-indigo-800"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function clearStorage(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // non-fatal
  }
}
