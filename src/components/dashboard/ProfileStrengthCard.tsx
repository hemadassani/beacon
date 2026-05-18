"use client";

import { motion } from "framer-motion";
import { useCountUp } from "@/components/dashboard/useCountUp";
import type { ProfileStrength } from "@/data/mock-results";

interface ProfileStrengthCardProps {
  strength: ProfileStrength;
}

export function ProfileStrengthCard({ strength }: ProfileStrengthCardProps) {
  const breakdown: Array<{ label: string; value: number }> = [
    { label: "academics", value: strength.academics },
    { label: "activities", value: strength.activities },
    { label: "essays", value: strength.essays },
    { label: "letters", value: strength.letters },
  ];

  const clamped = Math.max(0, Math.min(100, strength.overall));
  const animatedOverall = useCountUp(clamped, 1000);

  return (
    <div className="rounded-3xl bg-white p-[22px]">
      <div className="flex items-start justify-between">
        <div
          className="font-medium uppercase text-[#6B6B7B]"
          style={{ fontSize: 12, letterSpacing: "0.08em" }}
        >
          Profile strength
        </div>
        <button
          type="button"
          className="font-medium text-[#4F46E5] hover:underline"
          style={{ fontSize: 12 }}
        >
          view breakdown →
        </button>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span
          className="font-display font-medium leading-none text-neutral-900 tabular-nums"
          style={{ fontSize: 44 }}
        >
          {animatedOverall}
        </span>
        <span className="text-[#6B6B7B]" style={{ fontSize: 14 }}>
          out of 100
        </span>
      </div>

      <div
        className="mt-4 w-full overflow-hidden rounded-full bg-[#F1EFE8]"
        style={{ height: 8 }}
      >
        <motion.div
          className="rounded-full bg-[#4F46E5]"
          style={{ height: 8 }}
          initial={{ width: "0%" }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>

      <div
        className="mt-4 flex justify-between text-[#6B6B7B]"
        style={{ fontSize: 11 }}
      >
        {breakdown.map((b) => (
          <span key={b.label}>
            {b.label}{" "}
            <span className="font-medium text-neutral-900">{b.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
