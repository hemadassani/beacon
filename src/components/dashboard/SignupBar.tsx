"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SIGNUP_BAR_DISMISSED_KEY } from "@/types/scoring";

interface SignupBarProps {
  isAnonymous: boolean;
}

export function SignupBar({ isAnonymous }: SignupBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isAnonymous) return;
    try {
      const dismissed =
        window.sessionStorage.getItem(SIGNUP_BAR_DISMISSED_KEY) === "true";
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot sessionStorage read on mount
      if (!dismissed) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, [isAnonymous]);

  function handleDismiss() {
    try {
      window.sessionStorage.setItem(SIGNUP_BAR_DISMISSED_KEY, "true");
    } catch {
      // non-fatal
    }
    setVisible(false);
  }

  if (!isAnonymous) return null;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="signupbar"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.6, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white"
          style={{
            borderColor: "#EFECE2",
            boxShadow: "0 -8px 24px rgba(0,0,0,0.06)",
            padding: "16px 32px",
          }}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
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
            <div className="flex items-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center rounded-full bg-[#4F46E5] font-medium text-white transition hover:bg-indigo-700"
                style={{ padding: "12px 24px", fontSize: 14 }}
              >
                Sign up →
              </Link>
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Dismiss"
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#6B6B7B] transition hover:bg-neutral-100"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
