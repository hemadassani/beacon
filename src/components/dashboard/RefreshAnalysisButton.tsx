"use client";

import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  refreshAnalysisAction,
  type RefreshState,
} from "@/app/dashboard/actions";

export function RefreshAnalysisButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result: RefreshState = await refreshAnalysisAction();
      if (result.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error ?? "Refresh failed");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-[#6B6B7B] transition hover:bg-neutral-50"
      >
        <span className="flex items-center gap-2">
          <RefreshCw size={14} aria-hidden />
          refresh analysis
        </span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
            onClick={() => !pending && setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-display text-xl font-medium text-neutral-900">
                Generate a new analysis?
              </h2>
              <p className="mt-2 text-sm text-[#6B6B7B]">
                This will recalculate your chances based on your current
                profile.
              </p>
              {error ? (
                <p className="mt-3 text-sm text-red-600">{error}</p>
              ) : null}
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={pending}
                  className="rounded-full px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={pending}
                  className="rounded-full bg-[#4F46E5] px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {pending ? "Generating..." : "Generate"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
