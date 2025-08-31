"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, Legend, Tooltip, ResponsiveContainer
} from "recharts";
import { createClient } from "@supabase/supabase-js";

/* --- Supabase client (auto-fallback to local) --- */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseAnon)
  ? createClient(supabaseUrl, supabaseAnon)
  : null;

/* --- Config --- */
const METRICS = ["Cryptography","Coding","Vision","Impact","Credibility"] as const;
type Metric = typeof METRICS[number];

const BENCHMARKS: Record<string, Record<Metric, number>> = {
  "Satoshi":                { Cryptography:10, Coding:10, Vision:10, Impact:10, Credibility:10 },
  "Hal Finney":             { Cryptography: 9, Coding:10, Vision: 8, Impact: 9, Credibility:10 },
  "Wei Dai":                { Cryptography: 8, Coding: 6, Vision: 9, Impact: 7, Credibility: 9 },
  "Gavin Andresen":         { Cryptography: 6, Coding: 7, Vision: 7, Impact: 9, Credibility: 8 },
  'Craig "Wrong" Wright':   { Cryptography: 0, Coding: 0, Vision: 1, Impact: 3, Credibility: 0 },
};

const BENCHMARK_COLORS: Record<string,string> = {
  "Satoshi": "#ff9800",
  "Hal Finney": "#4caf50",
  "Wei Dai": "#2196f3",
  "Gavin Andresen": "#9c27b0",
  'Craig "Wrong" Wright': "#f44336",
};

const PALETTE = ["#8884d8","#82ca9d","#ffc658","#ff7f7f","#8dd1e1","#a4de6c","#d0ed57"];
const LS_KEY = "radar_submissions_v1";

/* --- Helpers --- */
function toRadarRows(source: Record<string, Record<Metric, number>>, active: Record<Metric,boolean>) {
  return METRICS.filter(m=>active[m]).map((metric) => {
    const row: any = { metric };
    Object.entries(source).forEach(([name, vals]) => (row[name] = vals[metric]));
    return row;
  });
}
const loadUsersLS = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return {}; } };
const saveUsersLS = (u: any) => { try { localStorage.setItem(LS_KEY, JSON.stringify(u)); } catch {} };
const levelColor = (i:number) => {
  const t = i/9; const stops = [[230,57,70],[253,216,53],[76,175,80]];
  const seg = t<0.5 ? 0 : 1; const lt = t<0.5 ? t/0.5 : (t-0.5)/0.5;
  const a = stops[seg], b = stops[seg+1];
  const r = Math.round(a[0]+(b[0]-a[0])*lt), g = Math.round(a[1]+(b[1]-a[1])*lt), bl = Math.round(a[2]+(b[2]-a[2])*lt);
  return `rgb(${r},${g},${bl})`;
};
const scoreFromChecks = (arr:boolean[]) => arr.filter(Boolean).length; // 0..10

type Submission = {
  id: string; name: string;
  cryptography: number; coding: number; vision: number; impact: number; credibility: number;
};

/* --- Page Component --- */
export default function Page() {
  const [dark, setDark] = useState(false);
  const [users, setUsers] = useState<Record<string, Record<Metric, number>>>({});
  const [name, setName] = useState("");
  const [scores, setScores] = useState<Record<Metric, number>>(
    Object.fromEntries(METRICS.map(m=>[m,5])) as Record<Metric,number>
  );
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [selected, setSelected] = useState<string|null>(null);

  const [guidedMode, setGuidedMode] = useState(true);
  const [checks, setChecks] = useState<Record<Metric, boolean[]>>(
    Object.fromEntries(METRICS.map(m=>[m, Array(10).fill(false)])) as Record<Metric, boolean[]>
  );
  const [activeMetrics, setActiveMetrics] = useState<Record<Metric, boolean>>(
    Object.fromEntries(METRICS.map(m=>[m,true])) as Record<Metric, boolean>
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

  // custom tooltip uses theme colors
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: c.cardBg, color: c.text, border: `1px solid ${c.border}`,
        borderRadius: 8, padding: "8px 10px", boxShadow: c.shadow, minWidth: 180
      }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
        {payload.map((p:any) => {
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

  const CustomLegend = ({ payload }: any) => (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 12 }}>
      {payload.map((entry:any) => {
        const color = BENCHMARK_COLORS[entry.value] || entry.color;
        return (
          <li key={entry.value} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ display: "inline-block", width: 14, height: 14, backgroundColor: color, borderRadius: 3 }}/>
            {entry.value}
          </li>
        );
      })}
    </ul>
  );

  useEffect(() => {
    (async () => {
      if (supabase) {
        const { data, error } = await supabase.from("submissions").select("*").order("created_at",{ascending:true});
        if (!error && data) {
          const mapped: Record<string, Record<Metric, number>> = {};
          (data as Submission[]).forEach(s=>{
            mapped[s.name] = {
              Cryptography: s.cryptography, Coding: s.coding,
              Vision: s.vision, Impact: s.impact, Credibility: s.credibility
            };
          });
          setUsers(mapped);
        } else {
          setUsers(loadUsersLS());
        }
      } else {
        setUsers(loadUsersLS());
      }
    })();
  }, []);

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
  const data = useMemo(() => toRadarRows(allSeries, activeMetrics), [allSeries, activeMetrics]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim(); if (!n) return;

    const submitScores = guidedMode
      ? {
          Cryptography: scoreFromChecks(checks.Cryptography),
          Coding:       scoreFromChecks(checks.Coding),
          Vision:       scoreFromChecks(checks.Vision),
          Impact:       scoreFromChecks(checks.Impact),
          Credibility:  scoreFromChecks(checks.Credibility),
        }
      : scores;

    if (supabase) {
      await supabase.from("submissions").insert({
        name: n,
        cryptography: submitScores.Cryptography,
        coding:       submitScores.Coding,
        vision:       submitScores.Vision,
        impact:       submitScores.Impact,
        credibility:  submitScores.Credibility,
      });
    } else {
      setUsers(prev => ({ ...prev, [n]: submitScores }));
    }
    setName("");
  };

  const radarStyle = (seriesName:string, i:number, isUser:boolean) => {
    const active = selected === seriesName || selected === null;
    const fixed = BENCHMARK_COLORS[seriesName];
    const stroke = fixed || (isUser ? PALETTE[i % PALETTE.length] : "#444");
    const fill   = stroke;
    return {
      stroke,
      fill,
      fillOpacity: active ? (isUser || fixed ? 0.18 : 0.10) : 0.04,
      strokeOpacity: active ? 1 : 0.25,
      strokeWidth: active ? 3 : 1,
    };
  };

  const clearUsers = () => { setUsers({}); if (!supabase) localStorage.removeItem(LS_KEY); };

  return (
    <div style={{ padding:24, maxWidth:1100, margin:"0 auto",
                  fontFamily:"system-ui, Arial", background:c.appBg, color:c.text }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <h1 style={{ fontSize:24, fontWeight:700, marginBottom:8 }}>Could I Be Satoshi? — Radar Compare</h1>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={()=>setSelected(null)}
            style={{ padding:"8px 12px", borderRadius:10, border:`1px solid ${c.border}`,
                     background:c.btn2Bg, color:c.btn2Text, cursor:"pointer" }}>
            Show all
          </button>
          <button onClick={()=>setDark(d=>!d)}
            style={{ padding:"8px 12px", borderRadius:10, border:`1px solid ${c.border}`,
                     background:c.btn2Bg, color:c.btn2Text, cursor:"pointer" }}>
            {dark ? "Light mode" : "Dark mode"}
          </button>
        </div>
      </div>

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
            {Object.keys(BENCHMARKS).map((n,i) => {
              const s = radarStyle(n, i, false);
              return <Radar key={n} name={n} dataKey={n} {...s} />;
            })}
            {Object.keys(users).map((u,i) => {
              const s = radarStyle(u, i, true);
              return <Radar key={u} name={u} dataKey={u} {...s} />;
            })}
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Mode toggle */}
      <div style={{ marginTop: 6, marginBottom: 12, display:"flex", gap:12, alignItems:"center" }}>
        <label style={{ fontWeight:600 }}>Input mode:</label>
        <button type="button"
          onClick={()=>setGuidedMode(true)}
          style={{ padding:"6px 10px", borderRadius:8, border:`1px solid ${c.border}`,
                   background: guidedMode ? c.btn2Bg : "transparent", color: c.text, cursor:"pointer" }}>
          Guided (10 levels)
        </button>
        <button type="button"
          onClick={()=>setGuidedMode(false)}
          style={{ padding:"6px 10px", borderRadius:8, border:`1px solid ${c.border}`,
                   background: !guidedMode ? c.btn2Bg : "transparent", color: c.text, cursor:"pointer" }}>
          Manual (numbers)
        </button>
      </div>

      {/* Guided 10-box per category */}
      {guidedMode && (
        <div style={{ display:"flex", gap:20, flexWrap:"wrap", marginBottom:8 }}>
          {METRICS.map((m) => {
            const current = checks[m]; const score = scoreFromChecks(current);
            return (
              <div key={m} style={{ marginBottom:16, minWidth: 300 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <strong>{m}</strong><span>Score: {score}/10</span>
                </div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {Array.from({ length: 10 }).map((_, idx) => (
                    <div
                      key={idx}
                      onClick={()=>{
                        setChecks(prev=>{
                          const copy = {...prev};
                          copy[m] = Array(10).fill(false).map((__,i)=>i<=idx);
                          return copy;
                        });
                      }}
                      title={`Level ${idx+1}`}
                      style={{
                        width:24, height:24, border:`1px solid ${c.border}`, borderRadius:4,
                        cursor:"pointer", background: current[idx] ? levelColor(idx) : c.inputBg
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual numeric inputs */}
      {!guidedMode && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr repeat(5,1fr)", gap: 12, alignItems:"end", marginBottom: 8 }}>
          <div />
          {METRICS.map((m) => (
            <div key={m}>
              <label style={{ fontSize:12, fontWeight:600 }}>{m} (0–10)</label>
              <input
                type="number" min={0} max={10}
                value={scores[m]}
                onChange={(e)=>setScores(s=>({...s,[m]:Math.max(0,Math.min(10,Number(e.target.value)))}))}
                style={{ width:"100%", border:`1px solid ${c.border}`, borderRadius:10,
                         padding:"10px 12px", background:c.inputBg, color:c.inputText }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Active axes checkboxes */}
      <div style={{ marginTop: 6, marginBottom: 12 }}>
        <strong>Include categories:</strong>
        <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginTop:8 }}>
          {METRICS.map((m)=>(
            <label key={m} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <input
                type="checkbox"
                checked={activeMetrics[m]}
                onChange={(e)=>setActiveMetrics(s=>({...s,[m]:e.target.checked}))}
              />
              {m}
            </label>
          ))}
        </div>
      </div>

      {/* Submit + Name */}
      <form onSubmit={handleSubmit}
        style={{ display:"grid", gridTemplateColumns:"1.2fr auto", gap:12, alignItems:"end" }}>
        <div>
          <label style={{ fontSize:12, fontWeight:600 }}>Display name</label>
          <input
            placeholder="e.g., Alice"
            value={name}
            onChange={(e)=>setName(e.target.value)}
            style={{ width:"100%", border:`1px solid ${c.border}`, borderRadius:10,
                     padding:"10px 12px", background:c.inputBg, color:c.inputText }}
          />
        </div>
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
      <div style={{ color:c.text }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ textAlign:"left", borderBottom:`2px solid ${c.text}` }}>
              <th style={{ padding:8 }}>Name</th>
              <th>Avg Score</th>
              <th>Distance</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((row:any) => (
              <tr key={row.id}
                  onClick={()=>setSelected(row.name)}
                  style={{
                    borderBottom:`1px solid ${c.border}`, cursor:"pointer",
                    background: selected===row.name ? (dark ? "#1f2228" : "#eef2ff") : "transparent"
                  }}>
                <td style={{ padding:8 }}>{row.name}</td>
                <td>{row.avg_score?.toFixed ? row.avg_score.toFixed(2) : row.avg_score}</td>
                <td>{row.distance_to_satoshi?.toFixed ? row.distance_to_satoshi.toFixed(2) : row.distance_to_satoshi}</td>
              </tr>
            ))}
            {leaderboard.length === 0 && (
              <tr><td colSpan={3} style={{ padding:8, opacity:0.7 }}>No entries yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}