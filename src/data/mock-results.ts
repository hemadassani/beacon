export type Tier = "safety" | "target" | "reach";

export type EstimationConfidence = "high" | "medium" | "low";

export interface Percentiles {
  p25: number;
  p50: number;
  p75: number;
}

export interface UniversityResult {
  university_id: string;
  university_name: string;
  location: string;
  domain: string;
  tier: Tier;
  probability: number;
  reasoning: string;
  recommendations: string[];
  sat_percentiles: Percentiles;
  gpa_percentiles: Percentiles;
  user_sat: number;
  user_gpa_equivalent: number;
  profile_match: number;
  fallback_estimated: boolean;
  estimation_confidence?: EstimationConfidence;
}

export interface ProfileStrength {
  overall: number;
  academics: number;
  activities: number;
  essays: number;
  letters: number;
}

export interface MockResults {
  results: UniversityResult[];
  overall_recommendations: string[];
  profile_strength: ProfileStrength;
}

export function getMockResults(): MockResults {
  return {
    results: [
      {
        university_id: "stanford",
        university_name: "Stanford University",
        location: "Stanford, CA",
        domain: "stanford.edu",
        tier: "reach",
        probability: 0.043,
        reasoning:
          "Your CBSE 88% is strong but Stanford's median admit hits closer to 92%. Your SAT 1480 lands in their bottom quartile (25th percentile around 1500). Your CS major intent and national-level recognition help, but Stanford remains a stretch for most international applicants.",
        recommendations: [
          "Push your SAT past 1530 to enter their middle 50%",
          "Highlight your independent CS project in essays. Stanford weighs intellectual initiative heavily.",
          "Add a supplemental letter from a CS mentor if possible",
        ],
        sat_percentiles: { p25: 1500, p50: 1540, p75: 1580 },
        gpa_percentiles: { p25: 3.85, p50: 3.96, p75: 4.0 },
        user_sat: 1480,
        user_gpa_equivalent: 88,
        profile_match: 35,
        fallback_estimated: false,
      },
      {
        university_id: "nyu",
        university_name: "New York University",
        location: "New York, NY",
        domain: "nyu.edu",
        tier: "target",
        probability: 0.111,
        reasoning:
          "Your profile aligns well with NYU's typical admit. CBSE 88% sits near their international median. Your SAT 1480 is comfortably in their middle 50% range (1450 to 1560). NYU is competitive for international students but your first-gen hook works in your favor here.",
        recommendations: [
          "Strengthen Common App essay around your CS project's tangible impact",
          "Apply Early Decision if NYU is your top choice. Significant boost.",
          "Mention specific NYU programs (Stern, Tandon, Courant) by name in essays",
        ],
        sat_percentiles: { p25: 1450, p50: 1520, p75: 1570 },
        gpa_percentiles: { p25: 3.7, p50: 3.85, p75: 3.95 },
        user_sat: 1480,
        user_gpa_equivalent: 88,
        profile_match: 55,
        fallback_estimated: false,
      },
      {
        university_id: "ucla",
        university_name: "UCLA",
        location: "Los Angeles, CA",
        domain: "ucla.edu",
        tier: "target",
        probability: 0.102,
        reasoning:
          "UCLA admits relatively few international students, around 10% international admit rate. Your 88% CBSE and 1480 SAT are competitive, and your CS interest aligns with UCLA's strong CS program. First-gen status helps slightly.",
        recommendations: [
          "Strengthen UC-style Personal Insight Questions. UCLA reads these carefully.",
          "Quantify your CS project's reach (users, lines of code, impact)",
          "Show sustained academic interest in CS over multiple years",
        ],
        sat_percentiles: { p25: 1410, p50: 1500, p75: 1560 },
        gpa_percentiles: { p25: 3.85, p50: 4.0, p75: 4.18 },
        user_sat: 1480,
        user_gpa_equivalent: 88,
        profile_match: 50,
        fallback_estimated: false,
      },
    ],
    overall_recommendations: [
      "Lift your SAT by 30 to 50 points. Would meaningfully shift NYU and UCLA odds.",
      "Add a measurable leadership story. Your profile is light here.",
      "Consider applying ED to your top choice. Boosts admit chances 1.5 to 2x.",
    ],
    profile_strength: {
      overall: 65,
      academics: 80,
      activities: 65,
      essays: 0,
      letters: 0,
    },
  };
}
