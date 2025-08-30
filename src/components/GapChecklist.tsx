"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { computeGaps, type RequirementRow } from "@/lib/gaps";

export default function GapChecklist({ userScores, benchmark }: {
  userScores: Record<string, number>; // {cryptography:7,...}
  benchmark: string;                   // 'Satoshi' | 'Hal Finney' | ...
}) {
  const [reqs, setReqs] = useState<RequirementRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("benchmark_requirements")
          .select("*")
          .eq("benchmark", benchmark);
        
        if (error) throw error;
        if (data) setReqs(data as RequirementRow[]);
      } catch (error) {
        console.error("Failed to load requirements:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [benchmark]);

  if (loading) return <div className="p-4 text-gray-600">Loading requirements…</div>;

  const gaps = computeGaps(userScores, reqs);

  if (!reqs.length) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <div className="text-gray-600">No requirements found for {benchmark}</div>
      </div>
    );
  }

  if (!gaps.length) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
        <div className="text-green-800 font-medium">
          🎉 You already meet all {benchmark} requirements—excellent work!
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold mb-4 text-gray-900">
        To reach {benchmark} level
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