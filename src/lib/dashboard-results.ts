import type { Answers } from "@/data/onboarding-questions";
import type {
  MockResults,
  ProfileStrength,
  UniversityResult,
} from "@/data/mock-results";
import {
  getUniversityAdmitData,
  type UniversityAdmitData,
} from "@/data/university-data-helpers";
import {
  calculateBaselineProbability,
  calculateHookBonus,
  convertGradeToGpaEquivalent,
} from "@/lib/scoring/heuristic";
import type {
  PerUniversityResult,
  ScoringResults,
} from "@/types/scoring";

export function composeDashboardData(
  scoring: ScoringResults,
  answers: Answers,
): MockResults {
  const userSat = resolveUserSat(answers);
  const userGpaEquivalent = convertGradeToGpaEquivalent(
    answers.grading_system as string | undefined,
    answers.grades,
  );

  const results: UniversityResult[] = (scoring.results ?? []).map((r) =>
    toUniversityResult(r, answers, userSat, userGpaEquivalent),
  );

  return {
    results,
    overall_recommendations: scoring.overall_recommendations ?? [],
    profile_strength: computeProfileStrength(answers, userGpaEquivalent),
  };
}

function toUniversityResult(
  r: PerUniversityResult,
  answers: Answers,
  userSat: number,
  userGpaEquivalent: number,
): UniversityResult {
  const uniData = getUniversityAdmitData(r.university_id);
  const satPercentiles = uniData
    ? { p25: uniData.sat_25, p50: uniData.sat_50, p75: uniData.sat_75 }
    : SAT_PERCENTILE_FALLBACK;
  const gpaPercentiles = uniData
    ? gpaPercentilesFromAvg(uniData.avg_gpa_unweighted)
    : GPA_PERCENTILE_FALLBACK;

  return {
    university_id: r.university_id,
    university_name: r.university_name,
    location: uniData?.location ?? "",
    domain: uniData?.domain ?? "",
    tier: r.tier,
    probability: r.probability,
    reasoning: r.reasoning,
    recommendations: r.recommendations ?? [],
    sat_percentiles: satPercentiles,
    gpa_percentiles: gpaPercentiles,
    user_sat: userSat,
    user_gpa_equivalent: userGpaEquivalent,
    profile_match: computeProfileMatch(answers, uniData, r.probability),
    fallback_estimated: r.fallback_estimated,
    ...(r.estimation_confidence
      ? { estimation_confidence: r.estimation_confidence }
      : {}),
  };
}

function gpaPercentilesFromAvg(avg4: number) {
  const avg = clamp(avg4, 0, 4);
  return {
    p25: round2(Math.max(0, avg - 0.1)),
    p50: round2(avg),
    p75: round2(Math.min(4, avg + 0.08)),
  };
}

function computeProfileMatch(
  answers: Answers,
  uniData: UniversityAdmitData | null,
  probability: number,
): number {
  if (uniData) {
    const { components } = calculateBaselineProbability(answers, uniData);
    const combined = components.scoreFit * 0.4 + components.gradeFit * 0.6;
    return Math.round(clamp(combined, 0, 100));
  }
  return Math.round(clamp(40 + probability * 200, 10, 90));
}

function computeProfileStrength(
  answers: Answers,
  gradeEquivalent: number,
): ProfileStrength {
  const satAct = answers.sat_act as
    | { choice?: string; number?: number }
    | string
    | undefined;
  const hasTestScore =
    typeof satAct === "object" && typeof satAct?.number === "number";

  const academics = Math.round(
    clamp(gradeEquivalent * 0.7 + (hasTestScore ? 25 : 5), 0, 100),
  );
  const hooks = answers.hooks as string[] | undefined;
  const hookBonus = calculateHookBonus(hooks);
  const activities = Math.round(clamp(40 + hookBonus * 2, 0, 100));
  const essays = 0;
  const letters = 0;
  const overall = Math.round(academics * 0.6 + activities * 0.4);

  return { overall, academics, activities, essays, letters };
}

function resolveUserSat(answers: Answers): number {
  const satAct = answers.sat_act as
    | { choice?: string; number?: number }
    | string
    | undefined;
  if (typeof satAct !== "object" || satAct === null) return 0;
  if (satAct.choice === "sat" && typeof satAct.number === "number") {
    return satAct.number;
  }
  if (satAct.choice === "act" && typeof satAct.number === "number") {
    return actToSat(satAct.number);
  }
  return 0;
}

function actToSat(act: number): number {
  const clamped = clamp(act, 1, 36);
  return Math.round(400 + clamped * 33.5);
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

const SAT_PERCENTILE_FALLBACK = { p25: 1300, p50: 1400, p75: 1500 } as const;
const GPA_PERCENTILE_FALLBACK = { p25: 3.5, p50: 3.7, p75: 3.9 } as const;
