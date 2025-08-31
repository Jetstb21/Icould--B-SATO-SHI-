"use client";

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
  const [dark, setDark] = useState(false);
  const [users, setUsers] = useState<UserMap>({});
  const [name, setName] = useState("");
  const [scores, setScores] = useState<Record<Metric, number>>(
    Object.fromEntries(METRICS.map(m => [m, 5])) as Record<Metric, number>
  );

  const c = {
    appBg:    dark ? "#0b0b0e" : "#f7f7f7",
    text:     dark ? "#f5f5f5" : "#111",
    cardBg:   dark ? "#15161a" : "#fff",
    border:   dark ? "#2a2b31" : "#ddd",
    shadow:   dark ? "0 6px 20px rgba(0,0,0,0.35)" : "0 6px 20px rgba(0,0,0,0.07)",
    btnBg:    "#111",
    btnText:  "#fff",
    btn2Bg:   dark ? "#22252b" : "#f0f0f0",
    btn2Text: dark ? "#f5f5f5" : "#111",
    inputBg:  dark ? "#1b1d22" : "#fff",
    inputText:dark ? "#f5f5f5" : "#111",
  };

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
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto", fontFamily: "system-ui, Arial", background: c.appBg, color: c.text }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          Could I Be Satoshi? — Radar Compare
        </h1>
        <button onClick={()=>setDark(d=>!d)}
          style={{ padding:"8px 12px", borderRadius:10, border:`1px solid ${c.border}`,
                   background: c.btn2Bg, color: c.btn2Text, cursor:"pointer" }}>
          {dark ? "Light mode" : "Dark mode"}
        </button>
      </div>
      <p style={{ marginBottom: 16, opacity: 0.85 }}>
        Benchmarks included: Satoshi, Hal Finney, Wei Dai, Gavin Andresen, Craig "Wrong" Wright.
        Add yourself below to compare on the same chart (0–10).
      </p>

      {/* Chart */}
      <div style={{
        width:"100%", height:440, background: c.cardBg, borderRadius:16,
        boxShadow: c.shadow, padding:12, marginBottom:18, border:`1px solid ${c.border}`
      }}>
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
      <div style={{ background: c.cardBg, borderRadius: 16, boxShadow: c.shadow, padding: 20, border: `1px solid ${c.border}` }}>
        <h3 style={{ marginBottom: 16, fontSize: 18, fontWeight: 600 }}>Add Yourself</h3>
        <form onSubmit={addUser} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, display: "block" }}>Name</label>
            <input
              placeholder="e.g., Alice"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", border: `1px solid ${c.border}`, borderRadius: 10, padding: "10px 12px", background: c.inputBg, color: c.inputText }}
            />
          </div>
          {METRICS.map((m) => (
            <div key={m}>
              <label style={{ fontSize: 12, fontWeight: 600 }}>{m} (0–10)</label>
              <input
                type="range"
                min="0"
                max="10"
                value={scores[m]}
                onChange={(e) => setScores(prev => ({ ...prev, [m]: +e.target.value }))}
                style={{ width: "100%" }}
              />
              <span style={{ fontSize: 12, opacity: 0.7 }}>{scores[m]}</span>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button type="submit" style={{ 
              padding: "10px 16px", 
              borderRadius: 10, 
              border: "none", 
              background: c.btnBg, 
              color: c.btnText, 
              cursor: "pointer" 
            }}>
              Add Me
            </button>
            <button type="button" onClick={clearUsers} style={{ 
              padding: "8px 12px", 
              borderRadius: 10, 
              border: `1px solid ${c.border}`, 
              background: c.btn2Bg, 
              color: c.btn2Text,
              cursor: "pointer"
            }}>
              Clear All
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}