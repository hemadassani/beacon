"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface SignupBarProps {
  isAnonymous: boolean;
}

export function SignupBar({ isAnonymous }: SignupBarProps) {
  if (!isAnonymous) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.6, ease: "easeOut" }}
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white"
      style={{
        borderColor: "#EFECE2",
        boxShadow: "0 -8px 24px rgba(0,0,0,0.06)",
        padding: "16px 32px",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div>
          <div
            className="font-medium text-neutral-900"
            style={{ fontSize: 15 }}
          >
            Save your results
          </div>
          <div className="text-[#6B6B7B]" style={{ fontSize: 13 }}>
            Create a free account to unlock deeper analysis
          </div>
        </div>
        <Link
          href="/signup"
          className="inline-flex items-center rounded-full bg-[#4F46E5] font-medium text-white transition hover:bg-indigo-700"
          style={{ padding: "12px 24px", fontSize: 14 }}
        >
          Sign up →
        </Link>
      </div>
    </motion.div>
  );
}
