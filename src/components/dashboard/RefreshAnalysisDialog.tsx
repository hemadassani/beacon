"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface RefreshAnalysisDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function RefreshAnalysisDialog({
  isOpen,
  onClose,
  onConfirm,
}: RefreshAnalysisDialogProps) {
  const [loading, setLoading] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    cancelRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, loading, onClose]);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.4)", zIndex: 100 }}
          onClick={() => !loading && onClose()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-dialog-title"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full bg-white"
            style={{
              maxWidth: 440,
              borderRadius: 24,
              padding: 32,
              boxShadow:
                "0 4px 12px rgba(0, 0, 0, 0.08), 0 16px 48px rgba(0, 0, 0, 0.12)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 48,
                height: 48,
                backgroundColor: "#FAEEDA",
              }}
            >
              <AlertTriangle size={22} color="#854F0B" strokeWidth={2} />
            </div>

            <h2
              id="reset-dialog-title"
              className="font-display font-medium text-neutral-900"
              style={{ fontSize: 22, marginTop: 20 }}
            >
              Reset your analysis?
            </h2>

            <p
              style={{
                fontSize: 14,
                color: "#6B6B7B",
                lineHeight: 1.5,
                marginTop: 12,
              }}
            >
              This will permanently delete your wizard answers and AI analysis.
              You will need to fill out the questions again to get new results.
            </p>

            <div
              className="flex gap-3"
              style={{ marginTop: 24, justifyContent: "flex-end" }}
            >
              <button
                ref={cancelRef}
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-full bg-white font-medium disabled:opacity-50"
                style={{
                  border: "1px solid #E5E3DA",
                  color: "#1F1F2E",
                  padding: "12px 24px",
                  fontSize: 14,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-full font-medium text-white disabled:opacity-70"
                style={{
                  backgroundColor: "#854F0B",
                  padding: "12px 24px",
                  fontSize: 14,
                  minWidth: 124,
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" aria-hidden />
                    Resetting...
                  </>
                ) : (
                  "Yes, reset"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
