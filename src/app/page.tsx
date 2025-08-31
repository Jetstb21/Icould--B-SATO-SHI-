"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, Legend, Tooltip, ResponsiveContainer
} from "recharts";
import { createClient } from "@supabase/supabase-js";
import CustomLegend from "@/components/CustomLegend";

/* ===== Supabase ===== */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseAnon)
  ? createClient(supabaseUrl, supabaseAnon)
  : null;

/* ===== Config ===== */
const METRICS = ["Cryptography","Coding","Vision","Impact","Credibility"];

const BENCHMARKS = {
  "Satoshi":                { Cryptography:10, Coding:10, Vision:10, Impact:10, Credibility:10 },
  "Hal Finney":             { Cryptography: 9, Coding:10, Vision: 8, Impact: 9, Credibility:10 },
  "Wei Dai":                { Cryptography: 8, Coding: 6, Vision: 9, Impact: 7, Credibility: 9 },
  "Gavin Andresen":         { Cryptography: 6, Coding: 7, Vision: 7, Impact: 9, Credibility: 8 },
  'Craig "Wrong" Wright':   { Cryptography: 0, Coding: 0, Vision: 1, Impact: 3, Credibility: 0 },
};

const PALETTE = ["#8884d8","#82ca9d","#ffc658","#ff7f7f","#8dd1e1","#a4de6c","#d0ed57"];
const BENCHMARK_COLORS = {
  "Satoshi": "#ff9800",
  "Hal Finney": "#4caf50",
  "Wei Dai": "#2196f3",
  "Gavin Andresen": "#9c27b0",
  'Craig "Wrong" Wright': "#f44336",
};
const LS_KEY = "radar_submissions_v1";

/* ===== Helpers ===== */
function toRadarRows(source) {
  return METRICS.map((metric) => {
    const row = { metric };
    Object.entries(source).forEach(([name, vals]) => (row[name] = vals[metric]));
    return row;
  });
}
const loadUsersLS = () => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return {}; }
};
const saveUsersLS = (u) => { try { localStorage.setItem(LS_KEY, JSON.stringify(u)); } catch {} };

/* ===== Custom Tooltip ===== */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: c.cardBg, color: c.text, border: `1px solid ${c.border}`,
      borderRadius: 8, padding: "8px 10px", boxShadow: c.shadow, minWidth: 180
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {payload.map((p) => {
        const color = BENCHMARK_COLORS[p.name] || p.color;
        return (
          <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ width: 10, height: 10, background: color, borderRadius: 2, display: "inline-block" }} />
            <span>{p.name}: <b>{p.value}</b></span>
          </div>
        );
      })}
    </div>
  );
};

/* ===== Component ===== */
export default function App() {
  const [dark, setDark] = useState(false);
  const [users, setUsers] = useState({});
  const [name, setName] = useState("");
  const [scores, setScores] = useState(
    Object.fromEntries(METRICS.map(m => [m, 5]))
  );
  const [leaderboard, setLeaderboard] = useState([]);
  const [selected, setSelected] = useState(null);
  const [checks, setChecks] = useState(
    Object.fromEntries(METRICS.map(m => [m, Array(10).fill(false)]))
  );
  const [descendingLevels, setDescendingLevels] = useState(false);

  const LEVEL_LABELS = {
    "Cryptography": [
      "No knowledge", "Basic concepts", "Hash functions", "Digital signatures", "PKI systems",
      "Advanced protocols", "Zero-knowledge", "Novel constructions", "Research level", "Satoshi level"
    ],
    "Coding": [
      "No coding", "Basic scripts", "Simple apps", "Production code", "System design",
      "Architecture", "Performance optimization", "Security focus", "Protocol design", "Satoshi level"
    ],
    "Vision": [
      "No vision", "Basic understanding", "See problems", "Propose solutions", "System thinking",
      "Paradigm shifts", "Future prediction", "Revolutionary ideas", "World-changing", "Satoshi level"
    ],
    "Impact": [
      "No impact", "Personal use", "Small team", "Company level", "Industry influence",
      "Ecosystem building", "Standard setting", "Global adoption", "Historical significance", "Satoshi level"
    ],
    "Credibility": [
      "Unknown", "Local recognition", "Peer respect", "Industry known", "Thought leader",
      "Expert authority", "Legendary status", "Mythical reputation", "Anonymous genius", "Satoshi level"
    ]
  };

  const scoreFromChecks = (checkArray) => {
    return checkArray.filter(Boolean).length;
  };

  const levelColor = (idx) => {
    const intensity = (idx + 1) / 10;
    return `hsl(${120 - (120 * intensity)}, 70%, ${40 + (intensity * 20)}%)`;
  };
  function radarStyle(name, i, isUser) {
    const active = selected === name || selected === null; // show all if none selected
    const baseStroke = isUser ? PALETTE[i % PALETTE.length] : (BENCHMARK_COLORS[name] || "#444");
    const baseFill = isUser ? PALETTE[i % PALETTE.length] : (BENCHMARK_COLORS[name] || "#444");
    return {
      stroke: baseStroke,
      fill: baseFill,
      fillOpacity: active ? (isUser ? 0.35 : 0.10) : 0.04,
      strokeOpacity: active ? 1 : 0.25,
      strokeWidth: active ? 3 : 1,
    };
  }

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

  // load users
  useEffect(() => {
    (async () => {
      if (supabase) {
        const { data, error } = await supabase.from("submissions").select("*").order("created_at",{ascending:true});
        if (!error && data) {
          const mapped = {};
          data.forEach(s => {
            mapped[s.name] = {
              Cryptography: s.cryptography,
              Coding: s.coding,
              Vision: s.vision,
              Impact: s.impact,
              Credibility: s.credibility
            };
          });
          setUsers(mapped);
          return;
        }
      }
      setUsers(loadUsersLS());
    })();
  }, []);

  // refresh leaderboard
  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const { data, error } = await supabase
        .from("leaderboard")
        .select("id,name,avg_score,distance_to_satoshi")
        .limit(10);
      if (!error && data) setLeaderboard(data);
    })();
  }, [users]);

  useEffect(() => { if (!supabase) saveUsersLS(users); }, [users]);

  const allSeries = useMemo(() => ({ ...BENCHMARKS, ...users }), [users]);
  const data = useMemo(() => toRadarRows(allSeries), [allSeries]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;

    if (supabase) {
      await supabase.from("submissions").insert({
        name: n,
        cryptography: scores.Cryptography,
        coding: scores.Coding,
        vision: scores.Vision,
        impact: scores.Impact,
        credibility: scores.Credibility,
      });
      setName("");
      return;
    }
    setUsers(prev => ({ ...prev, [n]: { ...scores } }));
    setName("");
  };

  const clearUsers = () => {
    setUsers({});
    if (!supabase) localStorage.removeItem(LS_KEY);
  };

  return (
    <div style={{ padding:24, maxWidth:1100, margin:"0 auto",
                  fontFamily:"system-ui, Arial", background:c.appBg, color:c.text }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <h1 style={{ fontSize:24, fontWeight:700, marginBottom:8 }}>
          Could I Be Satoshi? — Radar Compare
        </h1>
        <button onClick={()=>setDark(d=>!d)}
          style={{ padding:"8px 12px", borderRadius:10, border:`1px solid ${c.border}`,
                   background:c.btn2Bg, color:c.btn2Text, cursor:"pointer" }}>
          {dark ? "Light mode" : "Dark mode"}
        </button>
      </div>
      <p style={{ marginBottom:16, opacity:0.85 }}>
        Benchmarks included: Satoshi, Hal Finney, Wei Dai, Gavin Andresen, Craig "Wrong" Wright.
        Add yourself below to compare on the same chart (0–10).
      </p>

      {/* Chart */}
      <div style={{
        width:"100%", height:440, background:c.cardBg, borderRadius:16,
        boxShadow:c.shadow, padding:12, marginBottom:18, border:`1px solid ${c.border}`
      }}>
        <ResponsiveContainer>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis angle={90} domain={[0, 10]} />
            {Object.keys(BENCHMARKS).map((n) => (
              <Radar
                key={n}
                name={n}
                dataKey={n}
                stroke={BENCHMARK_COLORS[n] || "#444"}
                fill={BENCHMARK_COLORS[n] || "#444"}
                fillOpacity={0.08}
              />
            ))}
            {Object.keys(users).map((u, i) => {
              const s = radarStyle(u, i, true);
              return <Radar key={u} name={u} dataKey={u} {...s} />;
            })}
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend selected={selected} onSelect={setSelected} />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Form */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
          Rate Your Skills (Click boxes to fill up to that level)
        </h3>
        <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
          {METRICS.map((m) => {
            const current = checks[m];
            const score = scoreFromChecks(current); // 0..10
            return (
              <div key={m} style={{ marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <strong>{m}</strong>
                  <span>Score: {score}/10</span>
                </div>
                <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                  {Array.from({ length: 10 }).map((_, idx) => {
                    // if descending, level index is reversed for label meaning
                    const labelIdx = descendingLevels ? (9-idx) : idx;
                    const active = current[idx];
                    return (
                      <div
                        key={idx}
                        onClick={()=>{
                          setChecks(prev=>{
                            const copy = {...prev};
                            // fill up to idx inclusive (click = set level)
                            copy[m] = Array(10).fill(false).map((_,i)=>i<=idx);
                            return copy;
                          });
                        }}
                        title={`${LEVEL_LABELS[m][labelIdx]} (Level ${labelIdx+1})`}
                        style={{
                          width:24, height:24, border:`1px solid ${c.border}`, borderRadius:4, cursor:"pointer",
                          background: active ? levelColor(idx) : c.inputBg
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tiny toggle to flip level meaning */}
        <div style={{ marginTop:8 }}>
          <label style={{ display:"inline-flex", gap:8, alignItems:"center" }}>
            <input type="checkbox" checked={descendingLevels}
                   onChange={e=>setDescendingLevels(e.target.checked)} />
            Interpret levels as descending (10=beginner → 1=expert)
          </label>
        </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}
        style={{ display:"grid", gridTemplateColumns:"1.2fr repeat(5,1fr) auto", gap:12, alignItems:"end" }}>
        <div>
          <label style={{ fontSize:12, fontWeight:600 }}>Display name</label>
          <input placeholder="e.g., Alice" value={name}
            onChange={e=>setName(e.target.value)}
            style={{ width:"100%", border:`1px solid ${c.border}`, borderRadius:10,
                     padding:"10px 12px", background:c.inputBg, color:c.inputText }}/>
        </div>
        {METRICS.map((m) => (
          <div key={m}>
            <label style={{ fontSize:12, fontWeight:600 }}>{m} (0–10)</label>
            <input type="number" min={0} max={10}
              value={scores[m]}
              onChange={e=>setScores(s=>({...s,[m]:Math.max(0,Math.min(10,Number(e.target.value)))}))}
              style={{ width:"100%", border:`1px solid ${c.border}`, borderRadius:10,
                       padding:"10px 12px", background:c.inputBg, color:c.inputText }}/>
          </div>
        ))}
        <button type="submit"
          style={{ height:40, padding:"0 16px", borderRadius:10, border:"none",
                   background:c.btnBg, color:c.btnText, fontWeight:700, cursor:"pointer" }}>
          Add
        </button>
      </form>

      {!supabase && (
        <div style={{ marginTop:12, display:"flex", gap:8 }}>
          <button onClick={clearUsers}
            style={{ padding:"8px 12px", borderRadius:10, border:`1px solid ${c.border}`,
                     background:c.btn2Bg, color:c.btn2Text, cursor:"pointer" }}>
            Clear user overlays (local)
          </button>
        </div>
      )}

      {/* Leaderboard */}
      <h2 style={{ fontSize:20, fontWeight:700, marginTop:32, marginBottom:12 }}>
        Leaderboard (Top 10 Closest to Satoshi)
      </h2>
      <div style={{ color: c.text }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ textAlign:"left", borderBottom:`2px solid ${c.text}` }}>
              <th style={{ padding:8 }}>Name</th>
              <th>Avg Score</th>
              <th>Distance to Satoshi</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((row) => (
              <tr
                key={row.id}
                onClick={() => setSelected(row.name)}
                style={{
                  borderBottom: `1px solid ${c.border}`,
                  cursor: "pointer",
                  background: selected === row.name ? (dark ? "#1f2228" : "#eef2ff") : "transparent"
                }}
                title="Click to highlight on chart"
              >
                <td style={{ padding:8 }}>{row.name}</td>
                <td>{row.avg_score.toFixed(2)}</td>
                <td>{row.distance_to_satoshi.toFixed(2)}</td>
              </tr>
            ))}
            {leaderboard.length === 0 && (
              <tr><td colSpan={3} style={{ padding:8, opacity:0.7 }}>No entries yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <button onClick={() => setSelected(null)}
        style={{ marginTop:12, padding:"6px 10px", border:`1px solid ${c.border}`, borderRadius:10,
                 background:c.btn2Bg, color:c.btn2Text, cursor:"pointer" }}>
        Show all
      </button>
    </div>
  );
}