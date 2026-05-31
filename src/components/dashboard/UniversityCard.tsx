"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Info } from "lucide-react";
import { useState } from "react";
import { UniversityLogo } from "@/components/dashboard/UniversityLogo";
import { percentToGpa4 } from "@/lib/scoring/heuristic";
import type { Tier, UniversityResult } from "@/data/mock-results";

interface TierStyle {
  cardBg: string;
  sideBorder: string;
  dark: string;
  badgeBg: string;
  badgeText: string;
  label: string;
}

const TIER_STYLES: Record<Tier, TierStyle> = {
  safety: {
    cardBg: "#F5FBF8",
    sideBorder: "#5A9B8A",
    dark: "#04342C",
    badgeBg: "rgba(15, 110, 86, 0.15)",
    badgeText: "#04342C",
    label: "SAFETY",
  },
  target: {
    cardBg: "#FDF8EE",
    sideBorder: "#B89060",
    dark: "#412402",
    badgeBg: "rgba(176, 126, 24, 0.15)",
    badgeText: "#412402",
    label: "TARGET",
  },
  reach: {
    cardBg: "#FDF4F7",
    sideBorder: "#B86B85",
    dark: "#4B1528",
    badgeBg: "rgba(184, 50, 99, 0.15)",
    badgeText: "#4B1528",
    label: "REACH",
  },
};

type Zone = "below" | "middle" | "above";

const ZONE_LABELS: Record<Zone, string> = {
  below: "below 25th",
  middle: "in middle 50%",
  above: "above 75th",
};

const ZONE_COLORS: Record<Zone, string> = {
  below: "#B07E18",
  middle: "#1F8B5C",
  above: "#3B6FB3",
};

const ZONE_FILL_BELOW = "#F9DEDE";
const ZONE_FILL_MIDDLE = "#DEF5E5";
const ZONE_FILL_ABOVE = "#DEEAF9";

const MUTED = "#6B6B7B";
const CARD_BORDER = "#EFECE2";
const TRACK_BG = "#F1EFE6";

const SAT_SCALE_MIN = 1000;
const SAT_SCALE_MAX = 1600;
const GPA_SCALE_MIN = 0;
const GPA_SCALE_MAX = 4;

interface UniversityCardProps {
  result: UniversityResult;
  index: number;
}

export function UniversityCard({ result, index }: UniversityCardProps) {
  const [expanded, setExpanded] = useState(false);
  const style = TIER_STYLES[result.tier];
  const percent = Math.round(result.probability * 100);
  const userGpa4 = percentToGpa4(result.user_gpa_equivalent);
  const animationDelay = index * 0.1;

  return (
    <div
      className="w-full"
      style={{
        backgroundColor: style.cardBg,
        borderTop: `1px solid ${CARD_BORDER}`,
        borderRight: `1px solid ${CARD_BORDER}`,
        borderBottom: `1px solid ${CARD_BORDER}`,
        borderLeft: `3px solid ${style.sideBorder}`,
        borderRadius: 16,
        padding: "20px 24px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
      }}
    >
      <div className="flex items-center gap-4">
        <LeftSection result={result} style={style} />
        <CenterSection
          percent={percent}
          tierDark={style.dark}
          satP25={result.sat_percentiles.p25}
          satP75={result.sat_percentiles.p75}
          gpaP25={result.gpa_percentiles.p25}
          gpaP75={result.gpa_percentiles.p75}
          userSat={result.user_sat}
          userGpa4={userGpa4}
        />
        <RightSection
          profileMatch={result.profile_match}
          tierDark={style.dark}
          animationDelay={animationDelay}
        />
      </div>

      <div className="mt-4" style={{ height: 1, backgroundColor: CARD_BORDER }} />

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="mt-3 inline-flex items-center gap-1 font-medium text-[#4F46E5] hover:underline"
        style={{ fontSize: 12 }}
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
              className="mt-3"
              style={{ fontSize: 13, lineHeight: 1.6, color: MUTED }}
            >
              {result.reasoning}
            </p>
            <div
              className="mt-4 font-semibold uppercase"
              style={{ fontSize: 11, letterSpacing: "0.12em", color: MUTED }}
            >
              Ways to strengthen
            </div>
            <ul className="mt-2 space-y-1.5">
              {result.recommendations.map((rec, i) => (
                <li
                  key={i}
                  className="flex gap-2"
                  style={{ fontSize: 13, color: MUTED }}
                >
                  <span
                    aria-hidden
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: style.dark }}
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

function LeftSection({
  result,
  style,
}: {
  result: UniversityResult;
  style: TierStyle;
}) {
  return (
    <div className="flex gap-3" style={{ flexBasis: "28%" }}>
      <UniversityLogo
        domain={result.domain}
        schoolName={result.university_name}
        size={48}
      />
      <div className="min-w-0 flex flex-col justify-center">
        <div
          className="font-semibold leading-tight text-neutral-900"
          style={{ fontSize: 17 }}
        >
          {result.university_name}
        </div>
        <div className="mt-0.5" style={{ fontSize: 12, color: MUTED }}>
          {result.location || "\u00A0"}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5">
          <TierBadge style={style} />
          {result.fallback_estimated ? <EstimatedBadge /> : null}
        </div>
      </div>
    </div>
  );
}

function CenterSection({
  percent,
  tierDark,
  satP25,
  satP75,
  gpaP25,
  gpaP75,
  userSat,
  userGpa4,
}: {
  percent: number;
  tierDark: string;
  satP25: number;
  satP75: number;
  gpaP25: number;
  gpaP75: number;
  userSat: number;
  userGpa4: number;
}) {
  return (
    <div
      className="flex items-center gap-6"
      style={{ flexBasis: "52%" }}
    >
      <div className="shrink-0">
        <div
          className="font-display font-semibold leading-none tabular-nums"
          style={{ fontSize: 44, color: tierDark }}
        >
          {percent}%
        </div>
        <div
          className="mt-1 font-semibold uppercase"
          style={{ fontSize: 10, letterSpacing: "0.14em", color: MUTED }}
        >
          Admit rate
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <PercentileBand
          label="SAT"
          tierDark={tierDark}
          scaleMin={SAT_SCALE_MIN}
          scaleMax={SAT_SCALE_MAX}
          rangeStart={satP25}
          rangeEnd={satP75}
          userValue={userSat}
          userText={userSat > 0 ? String(userSat) : "—"}
          showMarker={userSat > 0}
        />
        <PercentileBand
          label="GPA"
          tierDark={tierDark}
          scaleMin={GPA_SCALE_MIN}
          scaleMax={GPA_SCALE_MAX}
          rangeStart={gpaP25}
          rangeEnd={gpaP75}
          userValue={userGpa4}
          userText={userGpa4 > 0 ? userGpa4.toFixed(2) : "—"}
          showMarker={userGpa4 > 0}
        />
      </div>
    </div>
  );
}

interface PercentileBandProps {
  label: string;
  tierDark: string;
  scaleMin: number;
  scaleMax: number;
  rangeStart: number;
  rangeEnd: number;
  userValue: number;
  userText: string;
  showMarker: boolean;
}

function PercentileBand({
  label,
  tierDark,
  scaleMin,
  scaleMax,
  rangeStart,
  rangeEnd,
  userValue,
  userText,
  showMarker,
}: PercentileBandProps) {
  const startPct = scalePct(rangeStart, scaleMin, scaleMax);
  const endPct = scalePct(rangeEnd, scaleMin, scaleMax);
  const middleWidth = Math.max(0, endPct - startPct);
  const aboveWidth = Math.max(0, 100 - endPct);
  const userPct = scalePct(userValue, scaleMin, scaleMax);
  const zone: Zone | null = showMarker
    ? classify(userValue, rangeStart, rangeEnd)
    : null;

  return (
    <div style={{ width: 240 }}>
      <div className="flex items-baseline justify-between">
        <span
          className="font-semibold uppercase"
          style={{ fontSize: 11, letterSpacing: "0.1em", color: MUTED }}
        >
          {label}
        </span>
        <span
          className="font-semibold tabular-nums"
          style={{ fontSize: 13, color: tierDark }}
        >
          {userText}
        </span>
      </div>

      <div
        className="relative mt-1 overflow-hidden rounded-full"
        style={{ width: 240, height: 10, backgroundColor: TRACK_BG }}
      >
        <div
          aria-hidden
          className="absolute top-0 left-0 h-full"
          style={{ width: `${startPct}%`, backgroundColor: ZONE_FILL_BELOW }}
        />
        <div
          aria-hidden
          className="absolute top-0 h-full"
          style={{
            left: `${startPct}%`,
            width: `${middleWidth}%`,
            backgroundColor: ZONE_FILL_MIDDLE,
          }}
        />
        <div
          aria-hidden
          className="absolute top-0 h-full"
          style={{
            left: `${endPct}%`,
            width: `${aboveWidth}%`,
            backgroundColor: ZONE_FILL_ABOVE,
          }}
        />
        {showMarker ? (
          <div
            aria-hidden
            className="absolute"
            style={{
              left: `${userPct}%`,
              top: -2,
              width: 3,
              height: 14,
              backgroundColor: tierDark,
              borderRadius: 2,
              transform: "translateX(-1.5px)",
            }}
          />
        ) : null}
      </div>

      <div className="mt-1 flex justify-end">
        {zone ? (
          <span
            className="italic"
            style={{ fontSize: 11, color: ZONE_COLORS[zone] }}
          >
            {ZONE_LABELS[zone]}
          </span>
        ) : (
          <span className="italic" style={{ fontSize: 11, color: MUTED }}>
            not provided
          </span>
        )}
      </div>
    </div>
  );
}

function RightSection({
  profileMatch,
  tierDark,
  animationDelay,
}: {
  profileMatch: number;
  tierDark: string;
  animationDelay: number;
}) {
  return (
    <div
      className="flex flex-col items-end justify-center gap-2"
      style={{ flexBasis: "20%" }}
    >
      <span
        className="font-semibold uppercase"
        style={{ fontSize: 11, letterSpacing: "0.05em", color: MUTED }}
      >
        Profile match
      </span>
      <MatchRing
        percent={profileMatch}
        color={tierDark}
        delay={animationDelay}
      />
    </div>
  );
}

function MatchRing({
  percent,
  color,
  delay,
}: {
  percent: number;
  color: string;
  delay: number;
}) {
  const size = 84;
  const stroke = 6;
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
        className="absolute inset-0 flex items-center justify-center font-semibold tabular-nums"
        style={{ color, fontSize: 22 }}
      >
        {clamped}%
      </div>
    </div>
  );
}

function TierBadge({ style }: { style: TierStyle }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 font-semibold uppercase"
      style={{
        fontSize: 10,
        letterSpacing: "0.14em",
        backgroundColor: style.badgeBg,
        color: style.badgeText,
      }}
    >
      {style.label}
    </span>
  );
}

function EstimatedBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 italic"
      style={{
        fontSize: 10,
        letterSpacing: "0.08em",
        color: "#8B8B97",
        textTransform: "uppercase",
      }}
      title="University data estimated by AI"
    >
      Estimated
      <Info size={10} aria-hidden />
    </span>
  );
}

function classify(value: number, p25: number, p75: number): Zone {
  if (value < p25) return "below";
  if (value >= p75) return "above";
  return "middle";
}

function scalePct(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  const pct = ((value - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, pct));
}
