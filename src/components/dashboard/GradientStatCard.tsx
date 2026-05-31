"use client";

import type { LucideIcon } from "lucide-react";

export type StatGradient = "indigo" | "peach" | "pink" | "mint";

interface GradientPalette {
  from: string;
  to: string;
  dark: string;
  mid: string;
  iconColor: string;
}

const PALETTES: Record<StatGradient, GradientPalette> = {
  indigo: {
    from: "#E8E6FB",
    to: "#D1CDF5",
    dark: "#3730A3",
    mid: "#4F46E5",
    iconColor: "#3730A3",
  },
  peach: {
    from: "#FCEED8",
    to: "#F7DBB4",
    dark: "#854F0B",
    mid: "#A86A1F",
    iconColor: "#854F0B",
  },
  pink: {
    from: "#FCE5EE",
    to: "#F7CADC",
    dark: "#993556",
    mid: "#B83263",
    iconColor: "#993556",
  },
  mint: {
    from: "#DDF1E6",
    to: "#BFE5CF",
    dark: "#0F6E56",
    mid: "#177D62",
    iconColor: "#0F6E56",
  },
};

interface GradientStatCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  valueSuffix?: string;
  subLabel: string;
  gradient: StatGradient;
}

export function GradientStatCard({
  icon: Icon,
  title,
  value,
  valueSuffix,
  subLabel,
  gradient,
}: GradientStatCardProps) {
  const palette = PALETTES[gradient];

  return (
    <div
      className="flex flex-col justify-between"
      style={{
        background: `linear-gradient(135deg, ${palette.from} 0%, ${palette.to} 100%)`,
        borderRadius: 24,
        padding: 24,
        minHeight: 140,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 40,
            height: 40,
            backgroundColor: "rgba(255, 255, 255, 0.5)",
          }}
        >
          <Icon size={24} color={palette.iconColor} strokeWidth={2} />
        </div>
        <span
          className="font-semibold uppercase"
          style={{ fontSize: 11, letterSpacing: "0.1em", color: palette.dark }}
        >
          {title}
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-1">
        <span
          className="font-display font-bold tabular-nums leading-none"
          style={{ fontSize: 40, color: palette.dark }}
        >
          {value}
        </span>
        {valueSuffix ? (
          <span
            className="font-medium"
            style={{ fontSize: 14, color: palette.mid }}
          >
            {valueSuffix}
          </span>
        ) : null}
      </div>

      <div
        className="mt-2"
        style={{ fontSize: 12, color: palette.mid, opacity: 0.9 }}
      >
        {subLabel}
      </div>
    </div>
  );
}
