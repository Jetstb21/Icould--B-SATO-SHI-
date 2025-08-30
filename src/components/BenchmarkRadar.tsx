"use client";
import React, { useMemo, useState } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, Legend, Tooltip, ResponsiveContainer
} from "recharts";

/** 1) Define axes */
const METRICS = [
  "Cryptography",
  "Coding",
  "Vision",
  "Impact",
  "Credibility",
] as const;
type Metric = typeof METRICS[number];

/** 2) Benchmarks (0–10) */
const benchmarks: Record<string, Record<Metric, number>> = {
  Satoshi:      { Cryptography: 10, Coding: 10, Vision: 10, Impact: 10, Credibility: 10 },
  "Hal Finney": { Cryptography:  9, Coding: 10, Vision:  8, Impact:  9, Credibility: 10 },
  "Wei Dai":    { Cryptography:  8, Coding:  6, Vision:  9, Impact:  7, Credibility:  9 },
  "Gavin Andresen": { Cryptography: 6, Coding: 7, Vision: 7, Impact: 9, Credibility: 8 },
  "Craig "Wrong" Wright": { Cryptography: 0, Coding: 0, Vision: 1, Impact: 3, Credibility: 0 },
};

/** helper: table format for Recharts */
function toRadarRows(source: Record<string, Record<Metric, number>>) {
  return METRICS.map((metric) => {
    const row: any = { metric };
    Object.entries(source).forEach(([name, vals]) => (row[name] = vals[metric]));
    return row;
  });
}

/** color cycle for user overlays */
const palette = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f7f", "#8dd1e1", "#a4de6c", "#d0ed57"];

export default function BenchmarkRadar() {
  const [users, setUsers] = useState<Record<string, Record<Metric, number>>>({});
  const [name, setName] = useState("");
  const [scores, setScores] = useState<Record<Metric, number>>(
    Object.fromEntries(METRICS.map(m => [m, 5])) as Record<Metric, number>
  );

  const allSeries = useMemo(() => ({ ...benchmarks, ...users }), [users]);
  const data = useMemo(() => toRadarRows(allSeries), [allSeries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setUsers(prev => ({ ...prev, [name.trim()]: { ...scores } }));
    setName("");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Could I Be Satoshi? – Radar Compare</h1>

      {/* Chart */}
      <div className="w-full h-[420px] rounded-2xl shadow p-3 bg-white mb-6">
        <ResponsiveContainer>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis angle={90} domain={[0, 10]} />
            {/* Benchmarks */}
            {Object.keys(benchmarks).map((name, i) => (
              <Radar key={name} name={name} dataKey={name} stroke="#444" fill="#444" fillOpacity={0.08} />
            ))}
            {/* Users */}
            {Object.keys(users).map((u, i) => (
              <Radar
                key={u}
                name={u}
                dataKey={u}
                stroke={palette[i % palette.length]}
                fill={palette[i % palette.length]}
                fillOpacity={0.35}
              />
            ))}
            <Tooltip />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Your display name</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="e.g., Alice"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {METRICS.map((m) => (
          <div key={m}>
            <label className="block text-sm font-medium mb-1">{m} (0–10)</label>
            <input
              type="number"
              min={0}
              max={10}
              className="w-full border rounded-lg px-3 py-2"
              value={scores[m]}
              onChange={(e) =>
                setScores((s) => ({ ...s, [m]: Math.max(0, Math.min(10, Number(e.target.value))) }))
              }
            />
          </div>
        ))}

        <button
          type="submit"
          className="md:col-span-1 bg-black text-white rounded-xl px-4 py-2 h-[42px]"
        >
          Add to Chart
        </button>
      </form>
    </div>
  );
}