"use client";

import { useEffect, useState } from "react";
import { getCategoryAverages } from "@/lib/cloud";
import { TrendingUp, Users } from "lucide-react";

type CategoryAverage = {
  category: string;
  avg_score: number;
  samples: number;
};

export default function Leaderboard() {
  const [averages, setAverages] = useState<CategoryAverage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAverages() {
      try {
        const data = await getCategoryAverages();
        setAverages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load averages");
      } finally {
        setLoading(false);
      }
    }

    loadAverages();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Community Averages</h3>
        </div>
        <div className="text-sm text-white/70">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Community Averages</h3>
        </div>
        <div className="text-sm text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Community Averages</h3>
      </div>
      
      {averages.length === 0 ? (
        <div className="text-sm text-white/70">
          No community data yet. Be the first to rate your skills!
        </div>
      ) : (
        <div className="space-y-3">
          {averages.map((avg) => (
            <div key={avg.category} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium">{avg.category}</div>
                <div className="flex items-center gap-1 text-xs text-white/60">
                  <Users className="h-3 w-3" />
                  {avg.samples} rating{avg.samples !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-emerald-400">
                  {avg.avg_score}
                </div>
                <div className="text-xs text-white/60">avg</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}