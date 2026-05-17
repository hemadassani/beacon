"use client";

import { motion } from "framer-motion";

const ease = "easeOut" as const;

export function HeroIntro() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="text-6xl font-semibold tracking-tight text-neutral-900 sm:text-7xl"
      >
        beacon
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.2 }}
        className="mt-6 max-w-md text-lg leading-relaxed text-neutral-600 sm:text-xl"
      >
        AI-powered admissions guidance for international students.
      </motion.p>

      <motion.button
        type="button"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.4 }}
        className="mt-12 inline-flex h-12 items-center justify-center rounded-full bg-indigo-700 px-8 text-base font-medium text-white shadow-md transition duration-200 hover:scale-105 hover:bg-indigo-800 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
      >
        Get started
      </motion.button>
    </main>
  );
}
