import React, { useEffect, useMemo, useState } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, Legend, Tooltip, ResponsiveContainer
} from "recharts";

/* ========= Config ========= */
const METRICS = ["Cryptography","Coding","Vision","Impact","Credibility"] as const;
type Metric = typeof METRICS[number];

const BENCHMARKS: Record<string, Record<Metric, number>> = {
  "Satoshi":                { Cryptography:10, Coding:10, Vision:10, Impact:10, Credibility:10 },
  "Hal Finney":             { Cryptography: 9, Coding:10, Vision: 8, Impact: 9, Credibility:10 },
  "Wei Dai":                { Cryptography: 8, Coding: 6, Vision: 9, Impact: 7, Credibility: 9 },
  "Gavin Andresen":         { Cryptography: 6, Coding: 7, Vision: 7, Impact: 9, Credibility: 8 },
  'Craig "Wrong" Wright':   { Cryptography: 0, Coding: 0, Vision: 1, Impact: 3, Credibility: 0 },
};

const PALETTE = ["#8884d8","#82ca9d","#ffc658","#ff7f7f","#8dd1e1","#a4de6c","#d0ed57"];

/* ========= Helpers ========= */
type UserMap = Record<string, Record<Metric, number>>;

const LS_KEY = "radar_submissions_v1";

function toRadarRows(source: Record<string, Record<Metric, number>>) {
  return METRICS.map((metric) => {
    const row: any = { metric };
    Object.entries(source).forEach(([name, vals]) => (row[name] = vals[metric]));
    return row;
  });
}

function loadUsers(): UserMap {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveUsers(users: UserMap) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(users)); } catch {}
}

/* ========= App ========= */
export default function App() {
  const [users, setUsers] = useState<UserMap>({});
  const [name, setName] = useState("");
  const [scores, setScores] = useState<Record<Metric, number>>(
    Object.fromEntries(METRICS.map(m => [m, 5])) as Record<Metric, number>
  );

  // load/save localStorage
  useEffect(() => { setUsers(loadUsers()); }, []);
  useEffect(() => { saveUsers(users); }, [users]);

  const allSeries = useMemo(() => ({ ...BENCHMARKS, ...users }), [users]);
  const data = useMemo(() => toRadarRows(allSeries), [allSeries]);

  const addUser = (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    setUsers(prev => ({ ...prev, [n]: { ...scores } }));
    setName("");
  };

  const clearUsers = () => {
    setUsers({});
    localStorage.removeItem(LS_KEY);
  };

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto", fontFamily: "system-ui, Arial" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Could I Be Satoshi? — Radar Compare</h1>
      <p style={{ marginBottom: 16, opacity: 0.85 }}>
        Benchmarks included: Satoshi, Hal Finney, Wei Dai, Gavin Andresen, Craig "Wrong" Wright.
        Add yourself below to compare on the same chart (0–10).
      </p>

      {/* Chart */}
      <div style={{ width: "100%", height: 440, background: "#fff", borderRadius: 16, boxShadow: "0 6px 20px rgba(0,0,0,0.07)", padding: 12, marginBottom: 18 }}>
        <ResponsiveContainer>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis angle={90} domain={[0, 10]} />
            {/* Benchmarks (subtle gray) */}
            {Object.keys(BENCHMARKS).map((n) => (
              <Radar key={n} name={n} dataKey={n} stroke="#444" fill="#444" fillOpacity={0.08} />
            ))}
            {/* Users (colorful overlays) */}
            {Object.keys(users).map((u, i) => (
              <Radar
                key={u}
                name={u}
                dataKey={u}
                stroke={PALETTE[i % PALETTE.length]}
                fill={PALETTE[i % PALETTE.length]}
                fillOpacity={0.35}
              />
            ))}
            <Tooltip />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Form */}
      <form onSubmit={addUser} style={{ display: "grid", gridTemplateColumns: "1.2fr repeat(5, 1fr) auto", gap: 12, alignItems: "end" }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600 }}>Display name</label>
          <input
            placeholder="e.g., Alice"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", border: "1px solid #ddd", borderRadius: 10, padding: "10px 12px" }}
          />
        </div>
        {METRICS.map((m) => (
          <div key={m}>
            <label style={{ fontSize: 12, fontWeight: 600 }}>{m} (0–10)</label>
            <input
              type="number" min={0} max={10}
              value={scores[m]}
              onChange={(e) =>
                setScores((s) => ({ ...s, [m]: Math.max(0, Math.min(10, Number(e.target.value))) }))
              }
              style={{ width: "100%", border: "1px solid #ddd", borderRadius: 10, padding: "10px 12px" }}
            />
          </div>
        ))}
        <button type="submit" style={{ height: 40, padding: "0 16px", borderRadius: 10, border: "none", background: "#111", color: "#fff", fontWeight: 700 }}>
          Add
        </button>
      </form>

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button onClick={clearUsers} style={{ padding: "8px 12px", borderRadius: 10, border: "1px solid #ddd", background: "#fafafa" }}>
          Clear user overlays
        </button>
      </div>
    </div>
  );
}