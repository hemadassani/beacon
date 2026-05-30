"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { composeDashboardData } from "@/lib/dashboard-results";
import type { Answers } from "@/data/onboarding-questions";
import type { MockResults } from "@/data/mock-results";
import {
  SCORING_RESULTS_KEY,
  WIZARD_ANSWERS_KEY,
  isScoringResults,
} from "@/types/scoring";

interface AnonymousDashboardLoaderProps {
  displayName: string;
  identitySubtitle: string;
}

export function AnonymousDashboardLoader({
  displayName,
  identitySubtitle,
}: AnonymousDashboardLoaderProps) {
  const router = useRouter();
  const [data, setData] = useState<MockResults | null>(null);

  useEffect(() => {
    const rawResults = window.localStorage.getItem(SCORING_RESULTS_KEY);
    const rawAnswers = window.localStorage.getItem(WIZARD_ANSWERS_KEY);
    if (!rawResults || !rawAnswers) {
      router.replace("/");
      return;
    }
    try {
      const parsedResults: unknown = JSON.parse(rawResults);
      const parsedAnswers: unknown = JSON.parse(rawAnswers);
      if (!isScoringResults(parsedResults) || typeof parsedAnswers !== "object" || parsedAnswers === null) {
        router.replace("/");
        return;
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot localStorage read on mount; no external subscription to attach
      setData(composeDashboardData(parsedResults, parsedAnswers as Answers));
    } catch (err) {
      console.error("Failed to parse cached results:", err);
      router.replace("/");
    }
  }, [router]);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F3EC]">
        <div className="text-sm text-[#6B6B7B]">loading your dashboard...</div>
      </div>
    );
  }

  return (
    <DashboardLayout
      isAnonymous
      displayName={displayName}
      identitySubtitle={identitySubtitle}
      data={data}
    />
  );
}
