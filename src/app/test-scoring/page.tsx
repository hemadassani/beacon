"use client";

import { useEffect, useState } from "react";
import { testScoring } from "@/lib/scoring/heuristic";

export default function TestScoringPage() {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    const captured: string[] = [];
    const originalLog = console.log;
    console.log = (...args: unknown[]) => {
      const line = args
        .map((a) => (typeof a === "string" ? a : JSON.stringify(a)))
        .join(" ");
      captured.push(line);
      originalLog(...args);
    };

    try {
      testScoring();
    } finally {
      console.log = originalLog;
    }

    setLines(captured);
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "monospace" }}>
      <h1>testScoring() output</h1>
      <p>Also logged to DevTools console.</p>
      <pre
        style={{
          background: "#111",
          color: "#0f0",
          padding: 16,
          whiteSpace: "pre-wrap",
          fontSize: 13,
        }}
      >
        {lines.length === 0 ? "(running...)" : lines.join("\n")}
      </pre>
    </div>
  );
}
