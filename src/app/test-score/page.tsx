"use client";

import { useState } from "react";

interface UniversityResult {
  university_id: string;
  university_name: string;
  tier: "safety" | "target" | "reach";
  probability: number;
  reasoning: string;
  recommendations: string[];
}

interface ScoreResponse {
  results: UniversityResult[];
  overall_recommendations: string[];
}

const REQUEST_BODY = {
  answers: {
    grade: "12",
    country: "India",
    grading_system: "cbse",
    grades: { class_10: 92, class_12: 88 },
    sat_act: { type: "sat", score: 1480 },
    english_proficiency: { test: "toefl", score: 108 },
    major: "computer_science",
    ec_peak: "national",
    independent_initiative: "one",
    hooks: ["first_gen"],
    financial_aid: "some_aid",
    universities: ["stanford", "nyu", "ucla"],
  },
};

const TIER_COLORS: Record<UniversityResult["tier"], string> = {
  safety: "green",
  target: "orange",
  reach: "red",
};

export default function TestScorePage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ScoreResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runTest() {
    setLoading(true);
    setData(null);
    setError(null);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(REQUEST_BODY),
      });
      const json = await res.json();
      console.log("API response:", json);
      if (!res.ok) {
        setError(json?.error ?? `HTTP ${res.status}`);
        return;
      }
      setData(json as ScoreResponse);
    } catch (err) {
      console.error("Fetch failed:", err);
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20, color: "black", background: "white" }}>
      <button
        onClick={runTest}
        disabled={loading}
        style={{ padding: "8px 16px", fontSize: 16, marginBottom: 20 }}
      >
        Run Test
      </button>

      {loading && <div>Loading...</div>}

      {error && (
        <div style={{ color: "red", marginBottom: 20 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {data && (
        <div>
          {data.results.map((r) => (
            <div
              key={r.university_id}
              style={{
                border: "1px solid #ccc",
                padding: 12,
                marginBottom: 16,
              }}
            >
              <h2 style={{ margin: "0 0 8px 0" }}>{r.university_name}</h2>
              <div style={{ marginBottom: 8 }}>
                <span
                  style={{
                    color: TIER_COLORS[r.tier],
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  {r.tier}
                </span>
                {" — "}
                {(r.probability * 100).toFixed(1)}%
              </div>
              <p style={{ margin: "0 0 8px 0" }}>{r.reasoning}</p>
              <strong>Recommendations:</strong>
              <ul style={{ margin: "4px 0 0 0", paddingLeft: 20 }}>
                {r.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          ))}

          <div
            style={{
              borderTop: "2px solid black",
              paddingTop: 12,
              marginTop: 20,
            }}
          >
            <h2 style={{ margin: "0 0 8px 0" }}>Overall Recommendations</h2>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {data.overall_recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
