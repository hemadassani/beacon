"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRightLeft, ChevronDown, Info } from "lucide-react";
import { useState } from "react";
import { UniversityLogo } from "@/components/dashboard/UniversityLogo";
import { percentToGpa4 } from "@/lib/scoring/heuristic";
import type { Tier, UniversityResult } from "@/data/mock-results";

interface TierStyle {
  bg: string;
  ring: string;
  dark: string;
  muted: string;
  label: string;
  trackBg: string;
  pillBg: string;
}

const TIER_STYLES: Record<Tier, TierStyle> = {
  safety: {
    bg: "#E1F5EE",
    ring: "#0F6E56",
    dark: "#04342C",
    muted: "#4A5A4F",
    label: "SAFETY",
    trackBg: "rgba(15, 110, 86, 0.15)",
    pillBg: "rgba(15, 110, 86, 0.2)",
  },
  target: {
    bg: "#FAEEDA",
    ring: "#854F0B",
    dark: "#412402",
    muted: "#5A4A2F",
    label: "TARGET",
    trackBg: "rgba(133, 79, 11, 0.15)",
    pillBg: "rgba(133, 79, 11, 0.2)",
  },
  reach: {
    bg: "#FBEAF0",
    ring: "#993556",
    dark: "#4B1528",
    muted: "#6A2D43",
    label: "REACH",
    trackBg: "rgba(153, 53, 86, 0.15)",
    pillBg: "rgba(153, 53, 86, 0.2)",
  },
};

type Interp = "below" | "middle" | "above";

const INTERP_LABELS: Record<Interp, string> = {
  below: "below 25th percentile",
  middle: "in middle 50%",
  above: "above 75th percentile",
};

const INTERP_COLORS: Record<Interp, string> = {
  below: "#B83263",
  middle: "#B07E18",
  above: "#1F8B5C",
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
  const userGpa4 = percentToGpa4(result.user_gpa_equivalent);
  const shortName = shortSchoolName(result.university_name);

  return (
    <div
      className="w-full rounded-3xl"
      style={{ backgroundColor: style.bg, padding: 22 }}
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-stretch">
        {/* LEFT COLUMN (vertically centered) */}
        <div
          className="flex flex-col items-center justify-center"
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
          {result.fallback_estimated ? <EstimatedBadge /> : null}
        </div>

        {/* MIDDLE COLUMN (top-aligned) */}
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

          <div className="mt-4 flex flex-col gap-[14px]">
            <StatRow
              label="SAT"
              userText={result.user_sat.toString()}
              rangeText={`${result.sat_percentiles.p25} to ${result.sat_percentiles.p75}`}
              interp={classify(
                result.user_sat,
                result.sat_percentiles.p25,
                result.sat_percentiles.p75,
              )}
              shortName={shortName}
              style={style}
            />
            <StatRow
              label="GRADE"
              userText={userGpa4.toFixed(2)}
              rangeText={`${result.gpa_percentiles.p25.toFixed(2)} to ${result.gpa_percentiles.p75.toFixed(2)}`}
              interp={classify(
                userGpa4,
                result.gpa_percentiles.p25,
                result.gpa_percentiles.p75,
              )}
              shortName={shortName}
              style={style}
            />
          </div>
        </div>

        {/* RIGHT COLUMN (top-aligned) */}
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
        {expanded
          ? "hide reasoning and recommendations"
          : "view reasoning and recommendations"}
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

function classify(value: number, p25: number, p75: number): Interp {
  if (value < p25) return "below";
  if (value >= p75) return "above";
  return "middle";
}

function shortSchoolName(full: string): string {
  const stripped = full
    .replace(/\s*\b(University|College|Institute)\b.*$/i, "")
    .trim();
  return stripped || full;
}

function EstimatedBadge() {
  return (
    <span
      className="mt-2 inline-flex items-center gap-1 italic"
      style={{
        fontSize: 10,
        letterSpacing: "0.08em",
        color: "#8B8B97",
        textTransform: "uppercase",
      }}
      title="We're estimating this university's data based on Claude's knowledge. Hardcoded data coming soon."
    >
      Estimated data
      <Info size={11} aria-hidden />
    </span>
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

interface StatRowProps {
  label: string;
  userText: string;
  rangeText: string;
  interp: Interp;
  shortName: string;
  style: TierStyle;
}

function StatRow({
  label,
  userText,
  rangeText,
  interp,
  shortName,
  style,
}: StatRowProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div
        className="font-semibold uppercase"
        style={{
          fontSize: 11,
          letterSpacing: "0.14em",
          color: style.muted,
          minWidth: 56,
        }}
      >
        {label}
      </div>

      <div className="flex items-end gap-3">
        <PillStack caption="you" value={userText} style={style} />
        <ArrowRightLeft
          size={14}
          style={{ color: style.muted, marginBottom: 6 }}
          aria-hidden
        />
        <PillStack
          caption={`${shortName} range`}
          value={rangeText}
          style={style}
        />
      </div>

      <div
        className="ml-auto whitespace-nowrap italic"
        style={{ fontSize: 12, color: INTERP_COLORS[interp] }}
      >
        {INTERP_LABELS[interp]}
      </div>
    </div>
  );
}

function PillStack({
  caption,
  value,
  style,
}: {
  caption: string;
  value: string;
  style: TierStyle;
}) {
  return (
    <div className="flex flex-col items-center">
      <span style={{ fontSize: 10, color: style.muted }}>{caption}</span>
      <span
        className="mt-0.5 rounded-full font-medium"
        style={{
          fontSize: 12,
          padding: "2px 10px",
          backgroundColor: style.pillBg,
          color: style.dark,
        }}
      >
        {value}
      </span>
    </div>
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
