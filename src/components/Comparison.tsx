import { useEffect, useMemo, useState } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, Legend, Tooltip, ResponsiveContainer
} from "recharts";
import { supabase } from "@/lib/supabase";

const METRICS = ["cryptography","distributedSystems","economics","coding","writing","community"] as const;
type Metric = typeof METRICS[number];

type Row = {
  id: string; name: string;
  cryptography: number; distributedSystems: number; economics: number;
  coding: number; writing: number; community: number;
};

const BENCHMARKS: Row[] = [
  { id: "bm-satoshi", name: "Satoshi",
    cryptography:10, distributedSystems:10, economics:10, coding:10, writing:10, community:7 },
  { id: "bm-hal", name: "Hal Finney",
    cryptography:9, distributedSystems:8, economics:7, coding:10, writing:8, community:9 },
  { id: "bm-wei", name: "Wei Dai",
    cryptography:8, distributedSystems:7, economics:7, coding:6, writing:8, community:7 },
  { id: "bm-gavin", name: "Gavin Andresen",
    cryptography:6, distributedSystems:7, economics:7, coding:7, writing:6, community:9 },
  { id: "bm-craig", name: "Craig \"Wrong" Wright",
    cryptography:0, distributedSystems:0, economics:1, coding:0, writing:1, community:3 },
];

const palette = ["#82ca9d","#8884d8","#ffc658","#ff7f7f","#8dd1e1","#a4de6c","#d0ed57"];

export default function Comparison() {
  const [users, setUsers] = useState<Row[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("profiles").select("*");
      if (!error && data) setUsers(data as Row[]);
    })();
  }, []);

  const allOptions = useMemo(() => [...BENCHMARKS, ...users], [users]);

  const data = useMemo(() => {
    return METRICS.map((m) => {
      const row: any = { metric: m };
      selected.forEach((id) => {
        const r = allOptions.find((x) => x.id === id);
        if (r) row[r.name] = r[m];
      });
      return row;
    });
  }, [selected, allOptions]);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter(x => x !== id) : [...s, id].slice(-3))); // max 3

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-3">Compare Users & Benchmarks</h2>

      {/* Pick list */}
      <div className="grid md:grid-cols-2 gap-3 mb-4">
        <div>
          <div className="font-semibold mb-2">Benchmarks</div>
          <div className="flex flex-wrap gap-2">
            {BENCHMARKS.map(b => (
              <button key={b.id} onClick={() => toggle(b.id)}
                className={`px-3 py-2 rounded border ${selected.includes(b.id) ? "bg-black text-white" : "bg-white"}`}>
                {b.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="font-semibold mb-2">Users</div>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-auto">
            {users.map(u => (
              <button key={u.id} onClick={() => toggle(u.id)}
                className={`px-3 py-2 rounded border ${selected.includes(u.id) ? "bg-black text-white" : "bg-white"}`}>
                {u.name || "Anonymous"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-[440px] rounded-2xl shadow p-3 bg-white">
        <ResponsiveContainer>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis angle={90} domain={[0, 10]} />
            {selected.map((id, i) => {
              const r = allOptions.find(x => x.id === id);
              if (!r) return null;
              return (
                <Radar key={id} name={r.name} dataKey={r.name}
                  stroke={palette[i % palette.length]}
                  fill={palette[i % palette.length]}
                  fillOpacity={0.35}/>
              );
            })}
            <Tooltip /><Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-sm text-gray-600 mt-2">Select up to 3 items at a time.</div>
    </div>
  );
}