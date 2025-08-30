"use client";

import { useEffect, useMemo, useState } from "react";
import RadarChart from "@/components/RadarChart";
import { getSession, fetchMyHistory } from "@/lib/cloud";
import { getScores } from "@/lib/storage";

type ScoreEvent = { category: string; score: number; note?: string | null; created_at: string };

const LABELS = [
  "Cryptography",
  "Distributed Systems",
  "Economics & Game Theory",
  "Software Engineering",
  "Community & Communication",
  "Vision & Product Sense",
];

export default function ReportPage() {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [events, setEvents] = useState<ScoreEvent[]>([]);
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    (async () => {
      // Always load current local scores
      setScores(getScores());
      // Try cloud history (optional)
      const s = await getSession();
      setSignedIn(!!s);
      if (s) {
        try {
          const rows = await fetchMyHistory(200);
          setEvents(rows);
        } catch {
          // ignore — we still render local scores
        }
      }
      setReady(true);
    })();
  }, []);

  const values = useMemo(() => LABELS.map(l => scores[l] ?? 0), [scores]);
  const avg = useMemo(() => {
    const sum = values.reduce((a, b) => a + (b || 0), 0);
    return +(sum / (values.length || 1)).toFixed(2);
  }, [values]);

  if (!ready) return null;

  return (
    <main className="min-h-dvh bg-gradient-to-b from-slate-900 to-black text-white">
      {/* Print styles (hide buttons, tweak spacing) */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          main { background: white !important; color: black !important; }
          .sheet { background: white !important; color: black !important; }
          .card { border-color: #ddd !important; }
        }
      `}</style>

      <div className="mx-auto max-w-5xl px-6 py-10 sheet">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            Sato-Shi Profile Report
          </h1>
          <div className="ml-auto no-print">
            <button
              className="rounded-lg border border-white/10 px-3 py-1.5 text-sm hover:bg-white/10"
              onClick={() => window.print()}
            >
              Print / Save as PDF
            </button>
          </div>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 card">
          <h2 className="text-lg font-semibold">Summary</h2>
          <p className="mt-1 text-sm text-white/70">
            Average score: <span className="font-semibold">{avg}</span> / 5
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LABELS.map((label) => (
              <div
                key={label}
                className="rounded-xl border border-white/10 bg-black/30 p-3"
              >
                <div className="text-sm text-white/60">{label}</div>
                <div className="text-2xl font-bold">{scores[label] ?? 0}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <RadarChart labels={LABELS} values={values} size={420} />
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5 card">
          <h2 className="text-lg font-semibold">Notes & History</h2>
          {!signedIn && (
            <p className="mt-1 text-sm text-white/70">
              Sign in to store detailed notes/history in the cloud. (This
              report still includes your current local scores.)
            </p>
          )}

          {events.length === 0 ? (
            <p className="mt-3 text-sm text-white/60">No history yet.</p>
          ) : (
            <div className="mt-4 overflow-hidden rounded-lg border border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-3 py-2 text-left">When</th>
                    <th className="px-3 py-2 text-left">Category</th>
                    <th className="px-3 py-2 text-left">Score</th>
                    <th className="px-3 py-2 text-left">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((e) => (
                    <tr key={`${e.category}-${e.created_at}`} className="border-t border-white/10">
                      <td className="px-3 py-2">
                        {new Date(e.created_at).toLocaleString()}
                      </td>
                      <td className="px-3 py-2">{e.category}</td>
                      <td className="px-3 py-2 font-semibold">{e.score}</td>
                      <td className="px-3 py-2 whitespace-pre-wrap">
                        {e.note || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="mt-6 text-center text-xs text-white/60">
          Tip: Use your browser's "Save as PDF" in the print dialog for a clean report.
        </p>
      </div>
    </main>
  );
}