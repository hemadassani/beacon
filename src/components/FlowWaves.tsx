"use client";

import { motion } from "framer-motion";

const BAND1_PATH =
  "M -400 125 Q -300 80 -200 125 T 0 125 T 200 125 T 400 125 T 600 125 T 800 125 T 1000 125 T 1200 125 T 1400 125 T 1600 125";

const BAND2_PATH =
  "M -300 75 Q -225 50 -150 75 T 0 75 T 150 75 T 300 75 T 450 75 T 600 75 T 750 75 T 900 75 T 1050 75 T 1200 75 T 1350 75 T 1500 75";

type Line = { yOffset: number; opacity: number };

const band1Lines: Line[] = Array.from({ length: 40 }, (_, i) => ({
  yOffset: (i - 19.5) * 4.5,
  opacity: 0.4 - (i / 39) * (0.4 - 0.08),
}));

const band2Lines: Line[] = Array.from({ length: 20 }, (_, i) => ({
  yOffset: (i - 9.5) * 4.5,
  opacity: 0.3 - (i / 19) * (0.3 - 0.06),
}));

type BandProps = {
  top: string;
  height: number;
  viewBoxHeight: number;
  path: string;
  lines: Line[];
  driftTo: string;
  driftDuration: number;
  undulateAmp: number;
  undulateDuration: number;
};

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

export function FlowWaves() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <Band
        top="25%"
        height={150}
        viewBoxHeight={150}
        path={BAND2_PATH}
        lines={band2Lines}
        driftTo="25%"
        driftDuration={30}
        undulateAmp={20}
        undulateDuration={9}
      />
      <Band
        top="55%"
        height={250}
        viewBoxHeight={250}
        path={BAND1_PATH}
        lines={band1Lines}
        driftTo="33.3333%"
        driftDuration={20}
        undulateAmp={22}
        undulateDuration={12}
      />
    </div>
  );
}
