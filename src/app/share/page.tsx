"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { decodeScores } from "@/lib/share";
import RadarChart from "@/components/RadarChart";

// Fallback to your canonical 6 categories in a fixed order:
const DEFAULT_LABELS = [
  "Cryptography",
  "Distributed Systems",
  "Economics & Game Theory",
  "Software Engineering",
  "Community & Communication",
  "Vision & Product Sense",
];

export default function SharePage() {
  const sp = useSearchParams();
  const encoded = sp.get("d");

  // Build scores from URL or fallback to localStorage values for labels:
  const { labels, values } = useMemo(() => {
    const urlScores = decodeScores(encoded);
    const labels = DEFAULT_LABELS.slice();

    let values = labels.map((l) => urlScores[l] ?? 0);

    // Fallback: if URL empty or zeroed, try localStorage (viewer's device)
    if (!encoded || values.every(v => v === 0)) {
      try {
        const raw = localStorage.getItem("satoshi_scores_v1");
        const local = raw ? (JSON.parse(raw) as Record<string, number>) : {};
        values = labels.map((l) => local[l] ?? 0);
      } catch { /* ignore */ }
    }
    return { labels, values };
  }, [encoded]);

  const avg = useMemo(() => {
    const sum = values.reduce((a, b) => a + (b || 0), 0);
    return +(sum / (values.length || 1)).toFixed(2);
  }, [values]);

  return (
    <main className="min-h-dvh bg-gradient-to-b from-slate-900 to-black text-white">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <header className="mb-8">
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            Sato-Shi Profile (Read-only)
          </h1>
          <p className="mt-2 text-white/70">
            Average score: <span className="font-semibold">{avg}</span> / 5
          </p>
        </header>

        <div className="flex justify-center">
          <RadarChart labels={labels} values={values} size={420} />
        </div>

        {!encoded && (
          <p className="mt-6 text-center text-sm text-white/60">
            Tip: open the main page, click <span className="font-semibold">Share my profile</span>, then copy the link.
          </p>
        )}
      </div>
    </main>
  );
}