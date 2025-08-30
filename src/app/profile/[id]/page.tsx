"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { satoshiScore, type Metrics } from "@/lib/scoring";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Legend, Tooltip
} from "recharts";

const METRICS = ["cryptography","distributedSystems","economics","coding","writing","community"] as const;

type Row = {
  id: string; name: string; note: string | null;
  cryptography: number; distributedSystems: number; economics: number;
  coding: number; writing: number; community: number;
  created_at: string;
};

const BENCHMARKS: Record<string, Record<(typeof METRICS)[number], number>> = {
  Satoshi:            { cryptography:10, distributedSystems:10, economics:10, coding:10, writing:10, community:7 },
  "Hal Finney":       { cryptography: 9, distributedSystems: 8, economics: 7, coding:10, writing: 8, community:9 },
  "Wei Dai":          { cryptography: 8, distributedSystems: 7, economics: 7, coding: 6, writing: 8, community:7 },
  "Gavin Andresen":   { cryptography: 6, distributedSystems: 7, economics: 7, coding: 7, writing: 6, community:9 },
  'Craig "Wrong" Wright': { cryptography:0, distributedSystems:0, economics:1, coding:0, writing:1, community:3 },
};

const palette = ["#8884d8","#82ca9d","#ffc658","#ff7f7f","#8dd1e1","#a4de6c"];

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [row, setRow] = useState<Row | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", id).single();
      if (data) setRow(data as Row);
    })();
  }, [id]);

  if (!row) return <div className="p-6">Loading…</div>;

  const metrics: Metrics = {
    cryptography: row.cryptography,
    distributedSystems: row.distributedSystems,
    economics: row.economics,
    coding: row.coding,
    writing: row.writing,
    community: row.community,
  };
  const score = satoshiScore(metrics);

  // Build combined radar rows: user + benchmarks
  const data = useMemo(() => {
    return METRICS.map((m) => {
      const base: any = { metric: m };
      Object.entries(BENCHMARKS).forEach(([name, vals]) => (base[name] = vals[m]));
      base[row.name] = (row as any)[m];
      return base;
    });
  }, [row]);

  const seriesOrder = [row.name, ...Object.keys(BENCHMARKS)]; // user first on legend

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">{row.name}</h1>
      <div className="text-gray-600 mb-4">
        Satoshi Score: <span className="font-mono">{score}</span> / 100 • Submitted {new Date(row.created_at).toLocaleString()}
      </div>
      {row.note && <p className="mb-4 italic">"{row.note}"</p>}

      <div className="w-full h-[440px] bg-white shadow rounded-2xl p-3 mb-6">
        <ResponsiveContainer>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis domain={[0, 10]} />
            {seriesOrder.map((name, i) => (
              <Radar
                key={name}
                name={name}
                dataKey={name}
                stroke={palette[i % palette.length]}
                fill={palette[i % palette.length]}
                fillOpacity={name === row.name ? 0.45 : 0.12}
              />
            ))}
            <Legend />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-sm text-gray-500">
        Submitted {new Date(row.created_at).toLocaleString()}
      </p>
    </div>
  );
}