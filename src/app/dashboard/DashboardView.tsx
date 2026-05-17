"use client";

import { motion } from "framer-motion";
import { signOutAction } from "./actions";

const ease = "easeOut" as const;

export function DashboardView({ email }: { email: string }) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="text-2xl font-semibold tracking-tight text-neutral-900"
      >
        beacon
      </motion.h2>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.15 }}
        className="mt-16 text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl"
      >
        welcome, {email}
      </motion.h1>

      <motion.form
        action={signOutAction}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: 0.35 }}
        className="mt-12"
      >
        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center rounded-full bg-indigo-700 px-8 text-base font-medium text-white shadow-md transition duration-200 hover:scale-105 hover:bg-indigo-800 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
        >
          Sign out
        </button>
      </motion.form>
    </main>
  );
}
