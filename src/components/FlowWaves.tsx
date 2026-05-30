"use client";

import { motion } from "framer-motion";

const BAND1_PATH =
  "M -400 125 Q -300 80 -200 125 T 0 125 T 200 125 T 400 125 T 600 125 T 800 125 T 1000 125 T 1200 125 T 1400 125 T 1600 125";

const BAND2_PATH =
  "M -300 75 Q -225 50 -150 75 T 0 75 T 150 75 T 300 75 T 450 75 T 600 75 T 750 75 T 900 75 T 1050 75 T 1200 75 T 1350 75 T 1500 75";

const BAND3_PATH =
  "M -300 50 Q -250 30 -200 50 T -100 50 T 0 50 T 100 50 T 200 50 T 300 50 T 400 50 T 500 50 T 600 50 T 700 50 T 800 50 T 900 50 T 1000 50 T 1100 50 T 1200 50 T 1300 50 T 1400 50 T 1500 50";

type Line = { yOffset: number; opacity: number };

function buildBand(count: number, peak: number, floor: number): Line[] {
  return Array.from({ length: count }, (_, i) => ({
    yOffset: (i - (count - 1) / 2) * 4.5,
    opacity: peak - (i / Math.max(1, count - 1)) * (peak - floor),
  }));
}

interface BandConfig {
  top: string;
  height: number;
  viewBoxHeight: number;
  path: string;
  count: number;
  peakOpacity: number;
  floorOpacity: number;
  driftTo: string;
  driftDuration: number;
  undulateAmp: number;
  undulateDuration: number;
}

const VARIANTS: Record<"hero" | "ambient", BandConfig[]> = {
  hero: [
    {
      top: "25%",
      height: 150,
      viewBoxHeight: 150,
      path: BAND2_PATH,
      count: 20,
      peakOpacity: 0.3,
      floorOpacity: 0.06,
      driftTo: "25%",
      driftDuration: 30,
      undulateAmp: 20,
      undulateDuration: 9,
    },
    {
      top: "55%",
      height: 250,
      viewBoxHeight: 250,
      path: BAND1_PATH,
      count: 40,
      peakOpacity: 0.4,
      floorOpacity: 0.08,
      driftTo: "33.3333%",
      driftDuration: 20,
      undulateAmp: 22,
      undulateDuration: 12,
    },
  ],
  ambient: [
    {
      top: "12%",
      height: 120,
      viewBoxHeight: 120,
      path: BAND3_PATH,
      count: 15,
      peakOpacity: 0.45,
      floorOpacity: 0.1,
      driftTo: "20%",
      driftDuration: 10,
      undulateAmp: 14,
      undulateDuration: 8,
    },
    {
      top: "45%",
      height: 180,
      viewBoxHeight: 180,
      path: BAND2_PATH,
      count: 40,
      peakOpacity: 0.4,
      floorOpacity: 0.1,
      driftTo: "25%",
      driftDuration: 14,
      undulateAmp: 22,
      undulateDuration: 10,
    },
    {
      top: "75%",
      height: 250,
      viewBoxHeight: 250,
      path: BAND1_PATH,
      count: 40,
      peakOpacity: 0.35,
      floorOpacity: 0.08,
      driftTo: "33.3333%",
      driftDuration: 18,
      undulateAmp: 24,
      undulateDuration: 12,
    },
  ],
};

interface FlowWavesProps {
  variant?: "hero" | "ambient";
  opacity?: number;
}

export function FlowWaves({ variant = "hero", opacity = 1 }: FlowWavesProps) {
  const bands = VARIANTS[variant];

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ opacity }}
    >
      {bands.map((b, i) => (
        <Band
          key={i}
          top={b.top}
          height={b.height}
          viewBoxHeight={b.viewBoxHeight}
          path={b.path}
          lines={buildBand(b.count, b.peakOpacity, b.floorOpacity)}
          driftTo={b.driftTo}
          driftDuration={b.driftDuration}
          undulateAmp={b.undulateAmp}
          undulateDuration={b.undulateDuration}
        />
      ))}
    </div>
  );
}

interface BandProps {
  top: string;
  height: number;
  viewBoxHeight: number;
  path: string;
  lines: Line[];
  driftTo: string;
  driftDuration: number;
  undulateAmp: number;
  undulateDuration: number;
}

function Band({
  top,
  height,
  viewBoxHeight,
  path,
  lines,
  driftTo,
  driftDuration,
  undulateAmp,
  undulateDuration,
}: BandProps) {
  return (
    <motion.svg
      className="absolute left-0 w-full"
      style={{
        top,
        height,
        marginTop: -height / 2,
        overflow: "visible",
      }}
      viewBox={`0 0 1200 ${viewBoxHeight}`}
      preserveAspectRatio="none"
      animate={{
        x: ["0%", driftTo],
        y: [-undulateAmp, undulateAmp, -undulateAmp],
      }}
      transition={{
        x: { duration: driftDuration, repeat: Infinity, ease: "linear" },
        y: {
          duration: undulateDuration,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
    >
      {lines.map((line, i) => (
        <path
          key={i}
          d={path}
          transform={`translate(0 ${line.yOffset})`}
          stroke="#4F46E5"
          strokeWidth={0.8}
          strokeOpacity={line.opacity}
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </motion.svg>
  );
}
