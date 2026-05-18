"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { DashboardBackdrop } from "@/components/dashboard/DashboardBackdrop";
import { DeadlineCard } from "@/components/dashboard/DeadlineCard";
import { ProfileStrengthCard } from "@/components/dashboard/ProfileStrengthCard";
import { RecommendationRow } from "@/components/dashboard/RecommendationRow";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { SignupBar } from "@/components/dashboard/SignupBar";
import { UniversityCard } from "@/components/dashboard/UniversityCard";
import type { MockResults } from "@/data/mock-results";

interface DashboardLayoutProps {
  isAnonymous: boolean;
  displayName: string;
  identitySubtitle: string;
  data: MockResults;
}

const REC_ICONS = ["trending", "language", "star"] as const;

export function DashboardLayout({
  isAnonymous,
  displayName,
  identitySubtitle,
  data,
}: DashboardLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F5F3EC]">
      <DashboardBackdrop />

      <div className="relative z-10 mx-auto flex w-full max-w-[1424px] gap-6 p-4 md:p-6">
        <Sidebar
          userIdentity={{ displayName, subtitle: identitySubtitle }}
          isAnonymous={isAnonymous}
        />

        <main
          className="flex-1"
          style={{ padding: "28px 32px", maxWidth: 1180, paddingBottom: 100 }}
        >
          <Section delay={0}>
            <h1
              className="font-display font-medium tracking-tight text-neutral-900"
              style={{ fontSize: 30 }}
            >
              welcome back, {displayName} 👋
            </h1>
            <p className="mt-1 text-[#6B6B7B]" style={{ fontSize: 14 }}>
              here&apos;s where your profile stands today
            </p>
          </Section>

          <Section delay={0.1}>
            <div className="mt-7 grid grid-cols-1 gap-[14px] md:grid-cols-5">
              <div className="md:col-span-3">
                <ProfileStrengthCard strength={data.profile_strength} />
              </div>
              <div className="md:col-span-2">
                <DeadlineCard isAnonymous={isAnonymous} />
              </div>
            </div>
          </Section>

          <Section delay={0.2}>
            <div className="mt-10 flex items-center justify-between">
              <h2
                className="font-semibold uppercase text-[#6B6B7B]"
                style={{ fontSize: 12, letterSpacing: "0.08em" }}
              >
                Your universities
              </h2>
              <button
                type="button"
                className="inline-flex items-center gap-1 font-semibold uppercase text-[#4F46E5] hover:underline"
                style={{ fontSize: 12, letterSpacing: "0.04em" }}
              >
                <Plus size={14} />
                add university
              </button>
            </div>
            <div className="mt-3 flex flex-col gap-3">
              {data.results.map((r, i) => (
                <UniversityCard
                  key={r.university_id}
                  result={r}
                  index={i}
                />
              ))}
            </div>
          </Section>

          <Section delay={0.3}>
            <h2
              className="mt-10 font-semibold uppercase text-[#6B6B7B]"
              style={{ fontSize: 12, letterSpacing: "0.08em" }}
            >
              Strengthen your profile
            </h2>
            <div className="mt-3 flex flex-col gap-2">
              {data.overall_recommendations.map((rec, i) => (
                <RecommendationRow
                  key={i}
                  recommendation={rec}
                  iconType={REC_ICONS[i % REC_ICONS.length]}
                />
              ))}
            </div>
          </Section>
        </main>
      </div>

      <SignupBar isAnonymous={isAnonymous} />
    </div>
  );
}

function Section({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay }}
    >
      {children}
    </motion.section>
  );
}
