"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { satoshiScore, type Metrics } from "@/lib/scoring";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Legend, Tooltip
} from "recharts";
import GapChecklist from "@/components/GapChecklist";
import { toCompareCode } from "@/lib/share";

const METRICS = ["cryptography","distributedSystems","economics","coding","writing","community"] as const;

type Row = {
  id: string; name: string; note: string | null;
  cryptography: number; distributedSystems: number; economics: number;
  coding: number; writing: number; community: number;
  created_at: string;
};

const ALL_BENCHMARKS: Record<string, Record<(typeof METRICS)[number], number>> = {
  Satoshi:            { cryptography:10, distributedSystems:10, economics:10, coding:10, writing:10, community:7 },
  "Hal Finney":       { cryptography: 9, distributedSystems: 8, economics: 7, coding:10, writing: 8, community:9 },
  "Wei Dai":          { cryptography: 8, distributedSystems: 7, economics: 7, coding: 6, writing: 8, community:7 },
  "Gavin Andresen":   { cryptography: 6, distributedSystems: 7, economics: 7, coding: 7, writing: 6, community:9 },
  'Craig "Wrong" Wright': { cryptography:0, distributedSystems:0, economics:1, coding:0, writing:1, community:3 },
};

const palette = ["#8884d8","#82ca9d","#ffc658","#ff7f7f","#8dd1e1","#a4de6c","#d0ed57"];

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [row, setRow] = useState<Row | null>(null);

  // which benchmarks to show
  const [shown, setShown] = useState<string[]>(["Satoshi", "Hal Finney", "Wei Dai"]);

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

  // Data rows: user + selected benchmarks
  const data = useMemo(() => {
    return METRICS.map((m) => {
      const base: any = { metric: m, [row.name]: (row as any)[m] };
      shown.forEach((name) => (base[name] = ALL_BENCHMARKS[name][m]));
      return base;
    });
  }, [row, shown]);

  const seriesOrder = [row.name, ...shown];

  // toggle helpers
  const toggle = (name: string) =>
    setShown((s) => (s.includes(name) ? s.filter(x => x !== name) : [...s, name]).slice(0,5));

  // share: short link preloaded with user + chosen benchmarks (max 3 ids)
  async function copyCompareShortLink() {
    try {
      // build selection: profile id plus up to 2 benchmarks (to keep it tidy)
      const chosen = [row.id];
      if (shown.includes("Satoshi")) chosen.push("bm-satoshi");
      else if (shown[0]) chosen.push(aliasToId(shown[0]));
      if (shown[1]) chosen.push(aliasToId(shown[1]));
      const link = buildShortForCompare(chosen.slice(0,3));
      await navigator.clipboard.writeText(link);
      alert("Short link copied!");
    } catch (error) {
      alert("Failed to copy link");
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">{row.name}</h1>
          <div className="text-gray-600">
            Satoshi Score: <span className="font-mono">{score}</span> / 100 • {new Date(row.created_at).toLocaleString()}
          </div>
          {row.note && <p className="mt-2 italic">"{row.note}"</p>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={copyCompareShortLink}
            className="px-3 py-2 rounded bg-black text-white hover:bg-gray-800 transition-colors"
            title="Copies a short link to compare this profile with selected benchmarks"
          >
            Copy compare short link
          </button>
        </div>
      </div>

      {/* benchmark toggles */}
      <div className="mt-4 mb-3">
        <div className="text-sm font-semibold mb-1">Show benchmarks (toggle):</div>
        <div className="flex flex-wrap gap-2">
          {Object.keys(ALL_BENCHMARKS).map((name) => (
            <button
              key={name}
              onClick={() => toggle(name)}
              className={`px-3 py-2 rounded border transition-colors ${
                shown.includes(name) 
                  ? "bg-black text-white border-black" 
                  : "bg-white text-black border-gray-300 hover:bg-gray-50"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-[440px] bg-white shadow rounded-2xl p-3">
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
            <Legend /><Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Gap Analysis */}
      <div className="mt-8">
        <GapChecklist
          benchmark="Satoshi"
          userScores={{
            cryptography: row.cryptography,
            coding: row.coding,
            writing: row.writing,
            distributedSystems: row.distributedSystems,
            economics: row.economics,
            community: row.community
          }}
        />
      </div>
    </div>
  );
}

/** helpers to build short compare link using same scheme as Comparison */
function aliasToId(alias: string): string {
  const map: Record<string, string> = {
    "Satoshi": "bm-satoshi",
    "Hal Finney": "bm-hal",
    "Wei Dai": "bm-wei",
    "Gavin Andresen": "bm-gavin",
    'Craig "Wrong" Wright': "bm-craig",
  };
  return map[alias] ?? "";
}

function buildShortForCompare(ids: string[]): string {
  // encode profile id + benchmark ids into /#/c/<code>
  const code = toCompareCode(ids);
  return `${window.location.origin}/compare#/c/${code}`;
}