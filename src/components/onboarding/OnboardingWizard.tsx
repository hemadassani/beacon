"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { questions, type Answers, type Question } from "@/data/onboarding-questions";
import { QuestionRenderer } from "./QuestionRenderer";

const STORAGE_KEY = "beacon_onboarding_answers";
const ease = "easeOut" as const;

type Props = {
  onComplete: (answers: Answers) => void;
};

// The wizard only mounts after the user clicks the hero CTA, so this
// initializer always runs on the client — safe to touch localStorage.
function loadAnswers(): Answers {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Answers) : {};
  } catch {
    return {};
  }
}

export function OnboardingWizard({ onComplete }: Props) {
  const [answers, setAnswers] = useState<Answers>(loadAnswers);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch {
      // quota or private-mode — non-fatal
    }
  }, [answers]);

  const activeQuestions = useMemo<Question[]>(
    () => questions.filter((q) => !q.skipIf?.(answers)),
    [answers],
  );

  const total = activeQuestions.length;
  const clampedIndex = Math.min(index, Math.max(0, total - 1));
  const current = activeQuestions[clampedIndex];
  const answer = answers[current.id];
  const progress = ((clampedIndex + 1) / total) * 100;

  function setAnswer(value: unknown) {
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  }

  function isAnswered(q: Question, a: unknown): boolean {
    if (a === undefined || a === null || a === "") return false;
    if (q.type === "multi-select") {
      return Array.isArray(a) && a.length > 0;
    }
    if (q.type === "searchable-multi-select") {
      if (!a || typeof a !== "object" || !("selected" in a)) return false;
      const v = a as { selected: string[]; other?: string };
      const count = v.selected.length + (v.other ? 1 : 0);
      const min = q.minSelection ?? 1;
      return count >= min;
    }
    if (q.type === "single-select") {
      if (typeof a === "string") return a.length > 0;
      if (typeof a === "object" && a !== null && "choice" in a) {
        const v = a as { choice: string; number?: number | null };
        const option = q.options?.find((o) => o.value === v.choice);
        if (option?.withNumber) return typeof v.number === "number" && !Number.isNaN(v.number);
        return Boolean(v.choice);
      }
      return false;
    }
    if (q.type === "conditional-form") {
      return isGradesComplete(answers.grading_system as string | undefined, a);
    }
    return true;
  }

  const canProceed = !current.required || isAnswered(current, answer);

  function handleNext() {
    if (!canProceed) return;
    if (clampedIndex >= total - 1) {
      onComplete(answers);
      return;
    }
    setIndex(clampedIndex + 1);
  }

  function handleBack() {
    setIndex(Math.max(0, clampedIndex - 1));
  }

  function handleSkip() {
    if (current.required) return;
    if (clampedIndex >= total - 1) {
      onComplete(answers);
      return;
    }
    setIndex(clampedIndex + 1);
  }

  return (
    <div className="flex h-full flex-col px-6 pb-6 pt-5 sm:px-10 sm:pb-8 sm:pt-7">
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/30">
        <motion.div
          className="h-full bg-white"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease }}
        />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={clampedIndex === 0}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <span className="text-sm text-white/70">
          question {clampedIndex + 1} of {total}
        </span>
        <span className="h-9 w-9" aria-hidden />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease }}
          className="mt-6 flex flex-1 flex-col overflow-y-auto"
        >
          <h2 className="text-2xl font-medium text-white sm:text-3xl">
            {current.question}
          </h2>
          {current.subtitle && (
            <p className="mt-2 text-sm text-white/70 sm:text-base">
              {current.subtitle}
            </p>
          )}
          <div className="mt-6">
            <QuestionRenderer
              question={current}
              answer={answer}
              answers={answers}
              onChange={setAnswer}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-between">
        {!current.required ? (
          <button
            type="button"
            onClick={handleSkip}
            className="text-sm text-white/60 underline-offset-4 transition hover:text-white hover:underline"
          >
            skip for now
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed}
          className="inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-medium text-[#4F46E5] shadow-md transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:bg-white/40 disabled:text-white disabled:hover:scale-100"
        >
          {clampedIndex >= total - 1 ? "finish" : "next"}
        </button>
      </div>
    </div>
  );
}

function isGradesComplete(system: string | undefined, answer: unknown): boolean {
  if (!system || !answer) return false;
  if (system === "CBSE" || system === "ICSE") {
    const v = answer as { grade10?: number; grade12?: number };
    return typeof v.grade10 === "number" && typeof v.grade12 === "number";
  }
  if (system === "IB") {
    const v = answer as { totalScore?: number };
    return typeof v.totalScore === "number";
  }
  if (system === "ALevels" || system === "IGCSE") {
    if (!Array.isArray(answer)) return false;
    const rows = answer as { subject: string; grade: string }[];
    const filled = rows.filter((r) => r.subject.trim() && r.grade);
    return filled.length >= 3;
  }
  if (system === "AmericanGPA") {
    const v = answer as { gpa?: number; scale?: string };
    return typeof v.gpa === "number" && Boolean(v.scale);
  }
  if (system === "Other") {
    return typeof answer === "string" && answer.trim().length > 0;
  }
  return false;
}
