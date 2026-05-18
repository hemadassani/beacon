"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useActionState } from "react";
import { signupAction, type SignupState } from "./actions";

const ease = "easeOut" as const;
const initialState: SignupState = { error: null };

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signupAction, initialState);

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#FAFAF7] px-6 py-16">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-400/25 blur-3xl" />
      </div>

      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white/80 p-8 shadow-sm backdrop-blur-sm"
      >
        <Link
          href="/"
          className="font-display block text-center text-2xl font-semibold tracking-tight text-neutral-900"
        >
          beacon
        </Link>

        <h1 className="mt-8 text-center text-3xl font-semibold tracking-tight text-neutral-900">
          create your account
        </h1>

        <form action={formAction} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
            Email
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="h-11 rounded-lg border border-neutral-200 bg-white px-3 text-neutral-900 placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
            Password
            <input
              type="password"
              name="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="h-11 rounded-lg border border-neutral-200 bg-white px-3 text-neutral-900 placeholder:text-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </label>

          {state.error && (
            <p role="alert" className="text-sm text-red-600">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-indigo-700 px-8 text-base font-medium text-white shadow-md transition duration-200 hover:scale-105 hover:bg-indigo-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700"
          >
            {pending ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-700 hover:text-indigo-800"
          >
            Sign in
          </Link>
        </p>
      </motion.main>
    </div>
  );
}
