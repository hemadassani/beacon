"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { FlowWaves } from "@/components/FlowWaves";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import type { Answers } from "@/data/onboarding-questions";
import {
  SCORING_RESULTS_KEY,
  WIZARD_ANSWERS_KEY,
  type ScoringResults,
} from "@/types/scoring";

const ease = "easeOut" as const;
const headline = "beacon.";

type WizardState = "answering" | "loading" | "error";

function toApiAnswers(answers: Answers): Answers {
  const unis = answers.universities as
    | { selected?: string[]; other?: string }
    | string[]
    | undefined;
  let universities: string[];
  if (Array.isArray(unis)) {
    universities = unis;
  } else if (unis?.selected) {
    universities = unis.selected;
  } else {
    universities = [];
  }
  return { ...answers, universities };
}

type PanelGeometry = {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  width: number;
  height: number;
};

export default function Home() {
  const router = useRouter();
  const [view, setView] = useState<"hero" | "onboarding">("hero");
  const [panel, setPanel] = useState<PanelGeometry | null>(null);
  const [exiting, setExiting] = useState(false);
  const [wizardState, setWizardState] = useState<WizardState>("answering");
  const [answers, setAnswers] = useState<Answers | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  async function runScoring(forAnswers: Answers) {
    setWizardState("loading");
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: toApiAnswers(forAnswers) }),
      });
      const json: unknown = await res.json();
      if (!res.ok) {
        const message =
          (json as { error?: string })?.error ?? `HTTP ${res.status}`;
        throw new Error(message);
      }
      const results = json as ScoringResults;
      window.localStorage.setItem(
        SCORING_RESULTS_KEY,
        JSON.stringify(results),
      );
      setExiting(true);
      window.setTimeout(() => router.push("/dashboard"), 1000);
    } catch (err) {
      console.error("/api/score failed:", err);
      setWizardState("error");
    }
  }

  function handleWizardComplete(finalAnswers: Answers) {
    try {
      window.localStorage.setItem(
        WIZARD_ANSWERS_KEY,
        JSON.stringify(finalAnswers),
      );
    } catch (err) {
      console.error("Failed to persist wizard answers:", err);
    }
    setAnswers(finalAnswers);
    void runScoring(finalAnswers);
  }

  function handleRetry() {
    if (answers) void runScoring(answers);
  }

  function handleCta() {
    if (view !== "hero") return;
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const width = Math.min(window.innerWidth * 0.9, 720);
    const height = Math.min(window.innerHeight * 0.85, 680);

    setPanel({
      fromX: rect.left + rect.width / 2 - 32,
      fromY: rect.top + rect.height / 2 - 32,
      toX: (window.innerWidth - width) / 2,
      toY: (window.innerHeight - height) / 2,
      width,
      height,
    });
    setView("onboarding");
  }

  return (
    <div className="relative flex flex-1 overflow-hidden bg-[#FBFAF5]">
      <FlowWaves />

      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <defs>
          <pattern
            id="beacon-grid"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 80 0 L 0 0 0 80"
              fill="none"
              stroke="#4F46E5"
              strokeOpacity="0.12"
              strokeWidth="0.75"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#beacon-grid)" />
      </svg>

      <AnimatePresence>
        {view === "hero" && (
          <motion.main
            key="hero"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center"
          >
            <h1
              aria-label={headline}
              className="font-display text-6xl font-semibold tracking-tight text-neutral-900 sm:text-7xl"
            >
              {headline.split("").map((char, i) => (
                <motion.span
                  key={i}
                  aria-hidden
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease, delay: i * 0.08 }}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease, delay: 0.7 }}
              className="mt-6 max-w-md text-lg leading-relaxed text-neutral-600 sm:text-xl"
            >
              AI-powered admissions guidance for international students.
            </motion.p>

            <motion.button
              ref={buttonRef}
              type="button"
              onClick={handleCta}
              aria-label="Get started"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 32px rgba(79, 70, 229, 0.5)",
                transition: { duration: 0.2, ease: "easeOut" },
              }}
              transition={{ duration: 0.4, ease, delay: 1.1 }}
              className="mt-12 flex h-16 w-16 items-center justify-center rounded-full bg-[#4F46E5] text-white shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F46E5]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </motion.button>
          </motion.main>
        )}
      </AnimatePresence>

      {panel && view === "onboarding" && (
        <motion.div
          initial={{
            width: 64,
            height: 64,
            left: panel.fromX,
            top: panel.fromY,
            scale: 1,
            opacity: 1,
          }}
          animate={
            exiting
              ? { scale: 0.3, opacity: 0 }
              : {
                  width: panel.width,
                  height: panel.height,
                  left: panel.toX,
                  top: panel.toY,
                }
          }
          transition={{
            duration: exiting ? 1 : 0.6,
            ease: exiting ? "easeInOut" : "easeInOut",
          }}
          style={{ borderRadius: 32, transformOrigin: "center center" }}
          className="fixed z-20 overflow-hidden bg-[#4F46E5] shadow-[0_24px_60px_-12px_rgba(79,70,229,0.4),0_8px_24px_-8px_rgba(0,0,0,0.15)]"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: exiting ? 0 : 1 }}
            transition={{ duration: 0.3, ease, delay: exiting ? 0 : 0.55 }}
            className="absolute inset-0 overflow-y-auto"
          >
            {wizardState === "answering" ? (
              <OnboardingWizard onComplete={handleWizardComplete} />
            ) : wizardState === "loading" ? (
              <LoadingPanel />
            ) : (
              <ErrorPanel onRetry={handleRetry} />
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

function LoadingPanel() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center text-white">
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.04, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        className="font-display text-2xl font-medium tracking-tight"
      >
        analyzing your profile...
      </motion.div>
      <p className="mt-4 max-w-xs text-sm text-indigo-100">
        Comparing your stats to admit data and writing your personalized read.
      </p>
    </div>
  );
}

function ErrorPanel({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center text-white">
      <div className="font-display text-2xl font-medium tracking-tight">
        Something went wrong.
      </div>
      <p className="mt-3 max-w-xs text-sm text-indigo-100">
        We could not reach the scoring service. Your answers are safe.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-medium text-[#4F46E5] transition hover:bg-indigo-50"
      >
        Try again
      </button>
    </div>
  );
}
