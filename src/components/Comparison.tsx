import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, Legend, Tooltip, ResponsiveContainer
} from "recharts";

const METRICS = ["cryptography","distributedSystems","economics","coding","writing","community"] as const;
type Metric = typeof METRICS[number];

type Row = {
  id: string;
  name: string;
  cryptography: number;
  distributedSystems: number;
  economics: number;
  coding: number;
  writing: number;
  community: number;
};

const palette = ["#82ca9d","#8884d8","#ffc658","#ff7f7f","#8dd1e1","#a4de6c","#d0ed57"];

export default function Comparison() {
  const [rows, setRows] = useState<Row[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) console.error(error);
      else setRows(data as Row[]);
    })();
  }, []);

  const data = METRICS.map((m) => {
    const row: any = { metric: m };
    selected.forEach((id) => {
      const r = rows.find((r) => r.id === id);
      if (r) row[r.name] = r[m];
    });
    return row;
  });

  const handleSelect = (id: string) => {
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id].slice(-3) // max 3
    );
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Compare Users</h2>

      {/* selection list */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {rows.map((r) => (
          <button
            key={r.id}
            onClick={() => handleSelect(r.id)}
            className={`border rounded px-3 py-2 text-left ${
              selected.includes(r.id) ? "bg-black text-white" : "bg-white"
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>

      {/* chart */}
      <div className="w-full h-[420px] rounded-2xl shadow p-3 bg-white">
        <ResponsiveContainer>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis angle={90} domain={[0, 10]} />
            {selected.map((id, i) => {
              const r = rows.find((r) => r.id === id);
              if (!r) return null;
              return (
                <Radar
                  key={id}
                  name={r.name}
                  dataKey={r.name}
                  stroke={palette[i % palette.length]}
                  fill={palette[i % palette.length]}
                  fillOpacity={0.35}
                />
              );
            })}
            <Tooltip />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}