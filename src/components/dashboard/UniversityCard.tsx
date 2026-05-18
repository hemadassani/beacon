"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { UniversityLogo } from "@/components/dashboard/UniversityLogo";
import type { Percentiles, Tier, UniversityResult } from "@/data/mock-results";

interface TierStyle {
  bg: string;
  ring: string;
  dark: string;
  muted: string;
  label: string;
  trackBg: string;
}

const TIER_STYLES: Record<Tier, TierStyle> = {
  safety: {
    bg: "#E1F5EE",
    ring: "#0F6E56",
    dark: "#04342C",
    muted: "#4A5A4F",
    label: "SAFETY",
    trackBg: "rgba(15, 110, 86, 0.15)",
  },
  target: {
    bg: "#FAEEDA",
    ring: "#854F0B",
    dark: "#412402",
    muted: "#5A4A2F",
    label: "TARGET",
    trackBg: "rgba(133, 79, 11, 0.15)",
  },
  reach: {
    bg: "#FBEAF0",
    ring: "#993556",
    dark: "#4B1528",
    muted: "#6A2D43",
    label: "REACH",
    trackBg: "rgba(153, 53, 86, 0.15)",
  },
};

interface UniversityCardProps {
  result: UniversityResult;
  index: number;
}

export function UniversityCard({ result, index }: UniversityCardProps) {
  const [expanded, setExpanded] = useState(false);
  const style = TIER_STYLES[result.tier];
  const percent = Math.round(result.probability * 100);
  const ringDelay = index * 0.2;
  const userGpa4 = (result.user_gpa_equivalent / 100) * 4.0;

  return (
    <div
      className="w-full rounded-3xl"
      style={{ backgroundColor: style.bg, padding: 22 }}
    >
      <div className="flex flex-col gap-6 md:flex-row">
        {/* LEFT COLUMN */}
        <div
          className="flex flex-col items-center"
          style={{ flexBasis: "28%" }}
        >
          <ProbabilityRing
            percent={percent}
            color={style.ring}
            darkColor={style.dark}
            delay={ringDelay}
          />
          <div
            className="mt-3 font-semibold uppercase"
            style={{
              fontSize: 10,
              letterSpacing: "0.14em",
              color: style.muted,
            }}
          >
            Admission odds
          </div>
          <TierBadge style={style} />
        </div>

        {/* MIDDLE COLUMN */}
        <div className="min-w-0 flex-1" style={{ flexBasis: "50%" }}>
          <div
            className="font-medium leading-tight"
            style={{ fontSize: 20, color: style.dark }}
          >
            {result.university_name}
          </div>
          <div className="mt-0.5" style={{ fontSize: 13, color: style.muted }}>
            {result.location}
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <ComparisonBar
              label="SAT"
              percentiles={result.sat_percentiles}
              userValue={result.user_sat}
              formatTick={(v) => Math.round(v).toString()}
              formatUser={(v) => `you ${Math.round(v)}`}
              style={style}
              animationDelay={ringDelay + 0.2}
            />
            <ComparisonBar
              label="GRADE"
              percentiles={result.gpa_percentiles}
              userValue={userGpa4}
              formatTick={(v) => v.toFixed(2)}
              formatUser={(v) => `you ${v.toFixed(2)}`}
              style={style}
              animationDelay={ringDelay + 0.3}
            />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div
          className="flex flex-col items-end"
          style={{ flexBasis: "22%" }}
        >
          <UniversityLogo
            domain={result.domain}
            schoolName={result.university_name}
            size={64}
          />

          <div className="mt-6 w-full">
            <ProfileMatchBar
              percent={result.profile_match}
              color={style.ring}
              trackBg={style.trackBg}
              mutedColor={style.muted}
              delay={ringDelay}
            />
            <div
              className="mt-2 italic"
              style={{ fontSize: 11, color: style.muted }}
            >
              Complete profile to unlock detail
            </div>
            <button
              type="button"
              className="mt-2 inline-flex items-center font-medium hover:underline"
              style={{ fontSize: 12, color: style.ring }}
            >
              view detail →
            </button>
          </div>
        </div>
      </div>

      <div
        className="mt-5"
        style={{ height: 1, backgroundColor: "rgba(239, 236, 226, 0.5)" }}
      />

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 inline-flex items-center gap-1 font-medium text-[#4F46E5] hover:underline"
        style={{ fontSize: 12 }}
        aria-expanded={expanded}
      >
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="inline-flex"
        >
          <ChevronDown size={14} />
        </motion.span>
        {expanded ? "hide reasoning and recommendations" : "view reasoning and recommendations"}
      </button>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="expand"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <p
              className="mt-4"
              style={{ fontSize: 13, lineHeight: 1.6, color: style.muted }}
            >
              {result.reasoning}
            </p>
            <div
              className="mt-4 font-semibold uppercase"
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                color: style.muted,
              }}
            >
              Ways to strengthen
            </div>
            <ul className="mt-2 space-y-1.5">
              {result.recommendations.map((rec, i) => (
                <li
                  key={i}
                  className="flex gap-2"
                  style={{ fontSize: 13, color: style.muted }}
                >
                  <span
                    aria-hidden
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: style.ring }}
                  />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function TierBadge({ style }: { style: TierStyle }) {
  return (
    <span
      className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 font-semibold"
      style={{
        color: style.ring,
        fontSize: 10,
        letterSpacing: "0.14em",
      }}
    >
      <span
        aria-hidden
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: style.ring }}
      />
      {style.label}
    </span>
  );
}

function ProbabilityRing({
  percent,
  color,
  darkColor,
  delay,
}: {
  percent: number;
  color: string;
  darkColor: string;
  delay: number;
}) {
  const size = 110;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));
  const targetOffset = circumference * (1 - clamped / 100);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(0,0,0,0.08)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: targetOffset }}
          transition={{ duration: 1, ease: "easeOut", delay }}
          strokeLinecap="round"
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center font-display font-medium tabular-nums"
        style={{ color: darkColor, fontSize: 28 }}
      >
        {percent}%
      </div>
    </div>
  );
}

function ProfileMatchBar({
  percent,
  color,
  trackBg,
  mutedColor,
  delay,
}: {
  percent: number;
  color: string;
  trackBg: string;
  mutedColor: string;
  delay: number;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="w-full">
      <div
        className="font-semibold uppercase"
        style={{
          fontSize: 10,
          letterSpacing: "0.14em",
          color: mutedColor,
        }}
      >
        Profile match
      </div>
      <div
        className="mt-1.5 w-full overflow-hidden rounded-full"
        style={{ height: 6, backgroundColor: trackBg }}
      >
        <motion.div
          className="rounded-full"
          style={{ height: 6, backgroundColor: color }}
          initial={{ width: "0%" }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay }}
        />
      </div>
      <div className="mt-1" style={{ fontSize: 12, color: mutedColor }}>
        {clamped}% complete
      </div>
    </div>
  );
}

interface ComparisonBarProps {
  label: string;
  percentiles: Percentiles;
  userValue: number;
  formatTick: (v: number) => string;
  formatUser: (v: number) => string;
  style: TierStyle;
  animationDelay: number;
}

function ComparisonBar({
  label,
  percentiles,
  userValue,
  formatTick,
  formatUser,
  style,
  animationDelay,
}: ComparisonBarProps) {
  const all = [percentiles.p25, percentiles.p50, percentiles.p75, userValue];
  const minVal = Math.min(...all);
  const maxVal = Math.max(...all);
  const padding = (maxVal - minVal) * 0.2 || 1;
  const lo = minVal - padding;
  const hi = maxVal + padding;
  const range = hi - lo;
  const pos = (v: number) => ((v - lo) / range) * 100;

  const userPos = pos(userValue);

  return (
    <div>
      <div
        className="font-semibold uppercase"
        style={{
          fontSize: 11,
          letterSpacing: "0.14em",
          color: style.muted,
        }}
      >
        {label}
      </div>
      <div className="relative mt-3 mb-1">
        <div
          className="w-full rounded-full"
          style={{ height: 6, backgroundColor: style.trackBg }}
        />
        {[percentiles.p25, percentiles.p50, percentiles.p75].map((v) => (
          <span
            key={v}
            aria-hidden
            className="absolute"
            style={{
              top: -2,
              height: 10,
              width: 1.5,
              left: `${pos(v)}%`,
              backgroundColor: style.muted,
              transform: "translateX(-50%)",
              opacity: 0.6,
            }}
          />
        ))}
        <motion.span
          aria-hidden
          className="absolute rounded-full"
          style={{
            top: -3,
            height: 12,
            width: 12,
            backgroundColor: style.ring,
            border: "2px solid white",
            transform: "translateX(-50%)",
          }}
          initial={{ left: "0%", opacity: 0 }}
          animate={{ left: `${userPos}%`, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: animationDelay }}
        />
        <motion.span
          className="absolute font-medium"
          style={{
            top: -22,
            fontSize: 10,
            color: style.dark,
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
          }}
          initial={{ left: "0%", opacity: 0 }}
          animate={{ left: `${userPos}%`, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: animationDelay }}
        >
          {formatUser(userValue)}
        </motion.span>
      </div>
      <div className="relative" style={{ height: 14 }}>
        {[percentiles.p25, percentiles.p50, percentiles.p75].map((v) => (
          <span
            key={v}
            className="absolute"
            style={{
              fontSize: 10,
              color: style.muted,
              left: `${pos(v)}%`,
              transform: "translateX(-50%)",
            }}
          >
            {formatTick(v)}
          </span>
        ))}
      </div>
    </div>
  );
}
