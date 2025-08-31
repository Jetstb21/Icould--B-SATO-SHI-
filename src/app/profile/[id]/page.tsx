"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { satoshiScore, type Metrics } from "@/lib/scoring";
import { exportChecklistPdf } from "@/lib/pdfExport";
import { BENCHMARK_BLUEPRINT } from "@/data/benchmarkBlueprint";
import { computeGaps, type RequirementRow } from "@/lib/gaps";
import { BENCHMARK_BLUEPRINT } from "@/data/benchmarkBlueprint";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer, Legend, Tooltip
} from "recharts";

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
            onClick={() => exportChecklistPdf(row.name, score, gaps, BENCHMARK_BLUEPRINT)}
            className="px-4 py-2 rounded-xl bg-black text-white hover:opacity-90"
          >
            Download PDF Checklist
          </button>
          <button
            onClick={async () => {
              await supabase.from("profiles").update({
                published: !row.published,
              }).eq("id", row.id);

              alert(`Profile is now ${!row.published ? "published" : "unpublished"}`);
              // Refresh the page to show updated state
              window.location.reload();
            }}
            className="px-3 py-2 rounded bg-black text-white hover:bg-gray-800 transition-colors"
          >
            {row.published ? "Unpublish Profile" : "Publish Profile"}
          </button>
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

      {/* Gap Checklist */}
      <GapChecklistSection 
        userScores={{
          cryptography: row.cryptography,
          coding: row.coding,
          writing: row.writing,
          distributedSystems: row.distributedSystems,
          economics: row.economics,
          community: row.community
        }}
      />

      {/* Qualifications Accordion */}
      <div className="rounded-2xl border bg-white p-4">
        <h3 className="text-lg font-bold mb-2">Detailed Qualifications</h3>
        {Object.entries(BENCHMARK_BLUEPRINT).map(([bench, metrics]) => (
          <details key={bench} className="mb-2">
            <summary className="cursor-pointer font-semibold">{bench}</summary>
            <ul className="ml-5 mt-1 list-disc space-y-1">
              {Object.entries(metrics as any).map(([m, tasks]) => (
                <li key={m}>
                  <span className="font-medium">{m}:</span>{" "}
                  {(tasks as string[]).join("; ")}
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
}

function GapChecklistSection({ userScores }: { userScores: Record<string, number> }) {
  const [requirements, setRequirements] = useState<RequirementRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("benchmark_requirements")
          .select("*")
          .eq("benchmark", "Satoshi");
        
        if (error) throw error;
        if (data) setRequirements(data as RequirementRow[]);
      } catch (error) {
        console.error("Failed to load requirements:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-4 text-gray-600">Loading requirements…</div>;

  const gaps = computeGaps(userScores, requirements);

  if (!requirements.length) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <div className="text-gray-600">No requirements found for Satoshi</div>
      </div>
    );
  }

  if (!gaps.length) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
        <div className="text-green-800 font-medium">
          🎉 You already meet all Satoshi requirements—excellent work!
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold mb-4 text-gray-900">
        To reach Satoshi level
      </h3>
      <div className="text-sm text-gray-600 mb-4">
        {gaps.length} requirement{gaps.length === 1 ? '' : 's'} to complete
      </div>
      
      <ul className="space-y-4">
        {gaps.map(g => (
          <li key={g.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
            <input 
              type="checkbox" 
              className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" 
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 mb-1">
                <span className="capitalize">{g.metric}</span> — need +{g.delta} points
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (you: {g.userHas}/10 → target: {g.neededToReach}/10)
                </span>
              </div>
              <div className="text-gray-700 mb-2">{g.detail}</div>
              {g.evidence && (
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Evidence needed:</span> {g.evidence}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
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