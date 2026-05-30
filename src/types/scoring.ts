export type AdmissionTier = "safety" | "target" | "reach";

export type EstimationConfidence = "high" | "medium" | "low";

export interface PerUniversityResult {
  university_id: string;
  university_name: string;
  tier: AdmissionTier;
  probability: number;
  reasoning: string;
  recommendations: string[];
  fallback_estimated: boolean;
  estimation_confidence?: EstimationConfidence;
}

export interface ScoringResults {
  results: PerUniversityResult[];
  overall_recommendations: string[];
  not_found?: string[];
}

export const SCORING_RESULTS_KEY = "beacon_scoring_results";
export const WIZARD_ANSWERS_KEY = "beacon_wizard_answers";
export const SIGNUP_BAR_DISMISSED_KEY = "beacon_signup_bar_dismissed";

export function isScoringResults(value: unknown): value is ScoringResults {
  if (!value || typeof value !== "object") return false;
  const v = value as { results?: unknown; overall_recommendations?: unknown };
  return Array.isArray(v.results) && Array.isArray(v.overall_recommendations);
}
