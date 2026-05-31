"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { DashboardBackdrop } from "@/components/dashboard/DashboardBackdrop";

interface ComingSoonProps {
  featureName: string;
}

export function ComingSoon({ featureName }: ComingSoonProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#F5F3EC] px-6">
      <DashboardBackdrop />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full bg-white text-center"
        style={{
          maxWidth: 480,
          borderRadius: 24,
          padding: 48,
          boxShadow:
            "0 1px 2px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.06)",
        }}
      >
        <div
          className="mx-auto flex items-center justify-center rounded-full"
          style={{ width: 60, height: 60, backgroundColor: "#EEEDFE" }}
        >
          <Sparkles size={28} color="#4F46E5" strokeWidth={2} />
        </div>

        <h1
          className="font-display font-medium"
          style={{ fontSize: 28, color: "#1F1F2E", marginTop: 24 }}
        >
          Coming Soon
        </h1>

        <p
          style={{
            fontSize: 14,
            color: "#6B6B7B",
            marginTop: 12,
            lineHeight: 1.5,
          }}
        >
          The {featureName} feature is on its way.
        </p>

        <Link
          href="/dashboard"
          className="inline-block font-medium text-[#4F46E5] hover:underline"
          style={{ fontSize: 14, marginTop: 32 }}
        >
          ← back to dashboard
        </Link>
      </motion.div>
    </div>
  );
}
