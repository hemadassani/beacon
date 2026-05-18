import data from "@/data/universities-admit-data.json";

export type UniversityTier = "most_selective" | "highly_selective" | "selective";

export interface UniversityAdmitData {
  id: string;
  name: string;
  location: string;
  domain: string;
  tier: UniversityTier;
  overall_admit_rate: number;
  international_admit_rate: number;
  sat_25: number;
  sat_50: number;
  sat_75: number;
  act_25: number;
  act_50: number;
  act_75: number;
  avg_gpa_unweighted: number;
  is_need_aware_international: boolean;
  strong_majors: string[];
  notes?: string;
}

const universities = data as UniversityAdmitData[];

export function getUniversityAdmitData(id: string): UniversityAdmitData | null {
  return universities.find((u) => u.id === id) ?? null;
}
