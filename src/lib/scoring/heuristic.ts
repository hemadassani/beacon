import type { Answers } from "@/data/onboarding-questions";
import {
  getUniversityAdmitData,
  type UniversityAdmitData,
} from "@/data/university-data-helpers";

// ----------------------------------------------------------------------
// 1. Grade normalization to a 0-100 scale
// ----------------------------------------------------------------------

const ALEVEL_GRADE_VALUES: Record<string, number> = {
  "A*": 100,
  A: 90,
  B: 80,
  C: 70,
  D: 60,
  E: 50,
  F: 40,
  G: 30,
};

export function convertGradeToGpaEquivalent(
  gradingSystem: string | undefined,
  gradeData: unknown,
): number {
  if (!gradingSystem || gradeData == null) return 75;

  if (gradingSystem === "CBSE" || gradingSystem === "ICSE") {
    const d = gradeData as { grade10?: number; grade12?: number };
    if (typeof d.grade12 === "number") return d.grade12;
    if (typeof d.grade10 === "number") return d.grade10;
    return 75;
  }

  if (gradingSystem === "IB") {
    const d = gradeData as { totalScore?: number };
    if (typeof d.totalScore === "number") return (d.totalScore / 45) * 100;
    return 75;
  }

  if (gradingSystem === "ALevels" || gradingSystem === "IGCSE") {
    if (!Array.isArray(gradeData)) return 75;
    const rows = gradeData as { subject: string; grade: string }[];
    const values = rows
      .map((r) => ALEVEL_GRADE_VALUES[r.grade])
      .filter((v): v is number => typeof v === "number");
    if (values.length === 0) return 75;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  if (gradingSystem === "AmericanGPA") {
    const d = gradeData as { gpa?: number; scale?: string };
    if (typeof d.gpa !== "number") return 75;
    if (d.scale === "4.0") return (d.gpa / 4.0) * 100;
    if (d.scale === "5.0") return (d.gpa / 5.0) * 100;
    if (d.scale === "100") return d.gpa;
    return 75;
  }

  return 75;
}

// ----------------------------------------------------------------------
// 2. Hook bonus (percentage-point adjustment)
// ----------------------------------------------------------------------

const HOOK_VALUES: Record<string, number> = {
  athlete: 15,
  first_gen: 5,
  underrepresented: 5,
  legacy: 8,
  none: 0,
};

export function calculateHookBonus(hooks: string[] | undefined): number {
  if (!hooks || hooks.length === 0) return 0;
  const total = hooks.reduce((sum, h) => sum + (HOOK_VALUES[h] ?? 0), 0);
  return Math.min(total, 20);
}

// ----------------------------------------------------------------------
// 3. Score fit (0-100) — SAT preferred, ACT fallback, else 40
// ----------------------------------------------------------------------

export function calculateScoreFit(
  userSAT: number | undefined,
  userACT: number | undefined,
  uniData: UniversityAdmitData,
): number {
  if (typeof userSAT === "number" && Number.isFinite(userSAT)) {
    return interpolateScoreFit(userSAT, uniData.sat_25, uniData.sat_50, uniData.sat_75);
  }
  if (typeof userACT === "number" && Number.isFinite(userACT)) {
    return interpolateScoreFit(userACT, uniData.act_25, uniData.act_50, uniData.act_75);
  }
  return 40;
}

function interpolateScoreFit(
  score: number,
  p25: number,
  p50: number,
  p75: number,
): number {
  if (score <= p25) {
    const step = p50 - p25;
    if (step <= 0) return score >= p25 ? 25 : 0;
    return Math.max(0, 25 - ((p25 - score) / step) * 25);
  }
  if (score <= p50) {
    return 25 + ((score - p25) / (p50 - p25)) * 25;
  }
  if (score <= p75) {
    return 50 + ((score - p50) / (p75 - p50)) * 25;
  }
  const step = p75 - p50;
  if (step <= 0) return 100;
  return Math.min(100, 75 + ((score - p75) / step) * 25);
}

// ----------------------------------------------------------------------
// 4. Grade fit (0-100) — asymmetric: above helps a little, below hurts a lot
// ----------------------------------------------------------------------

export function calculateGradeFit(
  gradeEquivalent: number,
  uniData: UniversityAdmitData,
): number {
  const uniPercent = (uniData.avg_gpa_unweighted / 4.0) * 100;
  if (gradeEquivalent >= uniPercent) {
    const excess = gradeEquivalent - uniPercent;
    return Math.min(100, 75 + excess * 0.5);
  }
  const deficit = uniPercent - gradeEquivalent;
  return Math.max(0, 75 - deficit * 2);
}

// ----------------------------------------------------------------------
// 5. Baseline probability
// ----------------------------------------------------------------------

export type AdmissionTier = "safety" | "target" | "reach";

export interface ScoringComponents {
  scoreFit: number;
  gradeFit: number;
  hookBonus: number;
  majorAdjustment: number;
  internationalAdjustment: number;
}

export interface ScoringResult {
  probability: number;
  tier: AdmissionTier;
  components: ScoringComponents;
}

function fitMultiplier(combinedFit: number): number {
  if (combinedFit < 30) return 0.4;
  if (combinedFit < 50) return 0.8;
  if (combinedFit < 70) return 1.3;
  if (combinedFit < 85) return 2.0;
  return 3.0;
}

export function calculateBaselineProbability(
  answers: Answers,
  uniData: UniversityAdmitData,
): ScoringResult {
  const gradingSystem = answers.grading_system as string | undefined;
  const grades = answers.grades;
  const satAct = answers.sat_act as { choice?: string; number?: number } | undefined;
  const userSAT = satAct?.choice === "sat" ? satAct.number : undefined;
  const userACT = satAct?.choice === "act" ? satAct.number : undefined;
  const major = answers.major as string | undefined;
  const hooks = answers.hooks as string[] | undefined;
  const financialAid = answers.financial_aid as string | undefined;

  const gradeEquivalent = convertGradeToGpaEquivalent(gradingSystem, grades);
  const scoreFit = calculateScoreFit(userSAT, userACT, uniData);
  const gradeFit = calculateGradeFit(gradeEquivalent, uniData);
  const hookBonus = calculateHookBonus(hooks);

  const internationalAdjustment =
    uniData.overall_admit_rate > 0
      ? uniData.international_admit_rate / uniData.overall_admit_rate
      : 1;

  const majorAdjustment =
    major && uniData.strong_majors.includes(major) ? 0.85 : 1.0;

  const combinedFit = scoreFit * 0.4 + gradeFit * 0.6;
  const fitMult = fitMultiplier(combinedFit);

  let prob = uniData.overall_admit_rate * internationalAdjustment * fitMult;
  prob *= majorAdjustment;
  if (uniData.is_need_aware_international && financialAid === "significant") {
    prob *= 0.6;
  }
  prob += hookBonus / 100;

  prob = Math.max(0.01, Math.min(0.95, prob));

  let tier: AdmissionTier;
  if (prob >= 0.30) tier = "safety";
  else if (prob >= 0.10) tier = "target";
  else tier = "reach";

  return {
    probability: prob,
    tier,
    components: {
      scoreFit,
      gradeFit,
      hookBonus,
      majorAdjustment,
      internationalAdjustment,
    },
  };
}

// ----------------------------------------------------------------------
// 6. Self-test (manual verification — not exposed to users)
// ----------------------------------------------------------------------

const strongProfile: Answers = {
  grading_system: "AmericanGPA",
  grades: { gpa: 3.95, scale: "4.0" },
  sat_act: { choice: "sat", number: 1560 },
  major: "computer_science",
  hooks: [],
  financial_aid: "full_pay",
};

const averageProfile: Answers = {
  grading_system: "CBSE",
  grades: { grade10: 88, grade12: 85 },
  sat_act: { choice: "sat", number: 1380 },
  major: "economics",
  hooks: ["first_gen"],
  financial_aid: "some",
};

const weakProfile: Answers = {
  grading_system: "IB",
  grades: { totalScore: 28 },
  sat_act: "test_optional",
  major: "english",
  hooks: ["none"],
  financial_aid: "significant",
};

export function testScoring(): void {
  const profiles = [
    { name: "strong ", answers: strongProfile },
    { name: "average", answers: averageProfile },
    { name: "weak   ", answers: weakProfile },
  ];
  const targets = ["stanford", "nyu", "ucla"];

  for (const target of targets) {
    const uni = getUniversityAdmitData(target);
    if (!uni) {
      console.log(`No admit data for ${target}`);
      continue;
    }
    console.log(
      `\n=== ${uni.name} (overall ${(uni.overall_admit_rate * 100).toFixed(1)}%, intl ${(uni.international_admit_rate * 100).toFixed(1)}%) ===`,
    );
    for (const p of profiles) {
      const r = calculateBaselineProbability(p.answers, uni);
      const c = r.components;
      console.log(
        `[${p.name}] ${r.tier.padEnd(7)} ${(r.probability * 100).toFixed(1).padStart(5)}%   ` +
          `score=${c.scoreFit.toFixed(0).padStart(3)}  ` +
          `grade=${c.gradeFit.toFixed(0).padStart(3)}  ` +
          `hook=+${c.hookBonus}  ` +
          `major×${c.majorAdjustment.toFixed(2)}  ` +
          `intl×${c.internationalAdjustment.toFixed(2)}`,
      );
    }
  }
}
