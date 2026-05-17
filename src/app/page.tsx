"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { FlowWaves } from "@/components/FlowWaves";

const ease = "easeOut" as const;
const headline = "beacon.";

type PanelGeometry = {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  width: number;
  height: number;
};

export default function Home() {
  const [view, setView] = useState<"hero" | "onboarding">("hero");
  const [panel, setPanel] = useState<PanelGeometry | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  function handleCta() {
    if (view !== "hero") return;
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const width = Math.min(window.innerWidth * 0.9, 720);
    const height = Math.min(window.innerHeight * 0.8, 600);

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
              className="text-6xl font-semibold tracking-tight text-neutral-900 sm:text-7xl"
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
          }}
          animate={{
            width: panel.width,
            height: panel.height,
            left: panel.toX,
            top: panel.toY,
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ borderRadius: 32 }}
          className="fixed z-20 overflow-hidden bg-[#4F46E5] shadow-[0_24px_60px_-12px_rgba(79,70,229,0.4),0_8px_24px_-8px_rgba(0,0,0,0.15)]"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease, delay: 0.55 }}
            className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
          >
            <span className="text-sm text-white/70">question 1 of 8</span>
            <h2 className="mt-3 text-4xl font-medium text-white sm:text-5xl">
              what&apos;s your current grade?
            </h2>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
