"use client";
import { useEffect, useMemo, useState } from "react";
import type { ScoreEvent } from "@/lib/cloud";
import { fetchMyHistory } from "@/lib/cloud";

export default function HistoryPanel() {
  const [events, setEvents] = useState<ScoreEvent[]>([]);
  const [q, setQ] = useState("");          // filter by category text
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      setBusy(true);
      const rows = await fetchMyHistory(200);
      setEvents(rows);
    } catch (e:any) {
      alert(e.message || "Failed to load history");
    } finally { setBusy(false); }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return events;
    return events.filter(e => e.category.toLowerCase().includes(qq));
  }, [events, q]);

  return (
    <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-lg font-semibold">Progress history</h3>
        <button
          className="ml-auto rounded-lg border border-white/10 px-3 py-1.5 text-sm hover:bg-white/10 disabled:opacity-50"
          onClick={load}
          disabled={busy}
        >
          {busy ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <input
        className="mb-3 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none"
        placeholder="Filter by category…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="max-h-[360px] overflow-auto rounded-lg border border-white/5">
        {filtered.length === 0 ? (
          <div className="p-4 text-sm text-white/60">No events yet.</div>
        ) : (
          <ul className="divide-y divide-white/5">
            {filtered.map((e) => (
              <li key={e.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{e.category}</div>
                  <div className="text-sm text-white/70">
                    {new Date(e.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="mt-1 text-sm">
                  Score: <span className="font-semibold">{e.score}</span>
                </div>
                {e.note && (
                  <div className="mt-1 text-sm text-white/80">
                    Note: <span className="whitespace-pre-wrap">{e.note}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}