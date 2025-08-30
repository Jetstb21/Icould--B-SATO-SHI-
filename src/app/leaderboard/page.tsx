"use client";

import { useEffect, useState } from "react";
import { fetchCategoryAverages, type CatAvg } from "@/lib/cloud";

export default function LeaderboardPage() {
  const [rows, setRows] = useState<CatAvg[]>([]);
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      setBusy(true);
      const data = await fetchCategoryAverages();
      setRows(data);
    } catch (e:any) {
      alert(e.message || "Failed to load leaderboard");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <main className="min-h-dvh bg-gradient-to-b from-slate-900 to-black text-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <header className="mb-6 flex items-center gap-3">
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            Category Leaderboard (Anonymous Averages)
          </h1>
          <button
            className="ml-auto rounded-lg border border-white/10 px-3 py-1.5 text-sm hover:bg-white/10 disabled:opacity-50"
            onClick={load}
            disabled={busy}
          >
            {busy ? "Refreshing..." : "Refresh"}
          </button>
        </header>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-right">Average</th>
                <th className="px-4 py-3 text-right">Samples</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-4 text-center text-white/60">No data yet.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.category} className="border-t border-white/5">
                  <td className="px-4 py-3">{r.category}</td>
                  <td className="px-4 py-3 text-right font-semibold">{Number(r.avg_score).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">{r.samples}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-center text-xs text-white/60">
          Averages are computed from all users' score events, no identities shared.
        </p>
      </div>
    </main>
  );
}