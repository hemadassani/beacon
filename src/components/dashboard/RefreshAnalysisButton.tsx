"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RefreshAnalysisDialog } from "@/components/dashboard/RefreshAnalysisDialog";
import {
  SCORING_RESULTS_KEY,
  WIZARD_ANSWERS_KEY,
} from "@/types/scoring";

interface RefreshAnalysisButtonProps {
  isAnonymous: boolean;
}

export function RefreshAnalysisButton({
  isAnonymous,
}: RefreshAnalysisButtonProps) {
  const router = useRouter();
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  async function handleConfirm() {
    if (isAnonymous) {
      clearLocalStorage();
      router.push("/");
      return;
    }

    try {
      const res = await fetch("/api/reset-analysis", { method: "POST" });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      clearLocalStorage();
      router.push("/");
    } catch (err) {
      console.error("Failed to reset analysis:", err);
      window.alert("Could not reset your analysis. Please try again.");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setResetDialogOpen(true)}
        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-[#6B6B7B] transition hover:bg-neutral-50"
      >
        <span className="flex items-center gap-2">
          <RefreshCw size={14} aria-hidden />
          refresh analysis
        </span>
      </button>

      <RefreshAnalysisDialog
        isOpen={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}

function clearLocalStorage() {
  try {
    window.localStorage.removeItem(WIZARD_ANSWERS_KEY);
    window.localStorage.removeItem(SCORING_RESULTS_KEY);
  } catch {
    // non-fatal
  }
}
