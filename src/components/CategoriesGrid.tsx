"use client";
import { useEffect, useMemo, useState } from "react";
import RatingModal from "@/components/RatingModal";
import { getScores, setScore } from "@/lib/storage";
import CategoryCard from "@/components/CategoryCard";
import RadarChart from "@/components/RadarChart";
import SharePanel from "@/components/SharePanel";
import AuthPanel from "@/components/AuthPanel";
import { saveScoresCloud, loadScoresCloud, getSession, logScoreEvent } from "@/lib/cloud";
import HistoryPanel from "@/components/HistoryPanel";

type Category = { title: string; descr: string; iconNode: React.ReactNode; };

export default function CategoriesGrid({ categories }: { categories: Category[] }) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [busy, setBusy] = useState<"save"|"load"|null>(null);

  useEffect(() => { setScores(getScores()); }, []);
  useEffect(() => { getSession().then(s => setSignedIn(!!s)); }, []);

  function onAssess(title: string) { setActive(title); setOpen(true); }

  async function onSaveLocal(val: number, note?: string) {
    if (!active) return;
    setScore(active, val);
    setScores((s) => ({ ...s, [active]: val }));
    try {
      await logScoreEvent(active, val, note); // silently ignored if not signed in
    } catch (e) {
      // optional: console.warn("logScoreEvent failed", e);
    }
  }

  const labels = useMemo(() => categories.map(c => c.title), [categories]);
  const values = useMemo(() => labels.map(l => scores[l] ?? 0), [labels, scores]);
  const avg = useMemo(() => +(values.reduce((a,b)=>a+(b||0),0)/(values.length||1)).toFixed(2), [values]);

  async function saveCloud() {
    try { setBusy("save"); await saveScoresCloud(scores); alert("Saved to cloud ✅"); }
    catch (e:any) { alert(e.message || "Save failed"); }
    finally { setBusy(null); }
  }
  async function loadCloud() {
    try {
      setBusy("load");
      const cloud = await loadScoresCloud();
      setScores(cloud);
      try { localStorage.setItem("satoshi_scores_v1", JSON.stringify(cloud)); } catch {}
      alert("Loaded from cloud ✅");
    } catch (e:any) {
      alert(e.message || "Load failed");
    } finally { setBusy(null); }
  }

  return (
    <>
      <div className="mb-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <h2 className="text-xl font-bold">Your Profile</h2>
        <AuthPanel />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <CategoryCard
            key={c.title}
            title={c.title}
            descr={c.descr}
            iconNode={c.iconNode}
            score={scores[c.title] ?? 0}
            onAssess={onAssess}
          />
        ))}
      </div>

      <div className="mt-10 flex flex-col items-center gap-4">
        <p className="text-sm text-white/70">
          Average score: <span className="font-semibold">{avg}</span> / 5
        </p>
        <RadarChart labels={labels} values={values} size={380} />
        <div className="mt-2 flex gap-2">
          <button
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm hover:bg-white/10 disabled:opacity-50"
            disabled={!signedIn || busy === "save"}
            onClick={saveCloud}
          >
            {busy === "save" ? "Saving..." : "Save to cloud"}
          </button>
          <button
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm hover:bg-white/10 disabled:opacity-50"
            disabled={!signedIn || busy === "load"}
            onClick={loadCloud}
          >
            {busy === "load" ? "Loading..." : "Load from cloud"}
          </button>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <SharePanel scores={scores} labels={labels} />
      </div>

      <div className="mt-8 flex justify-center">
        <HistoryPanel />
      </div>

      <RatingModal
        open={open}
        category={active}
        initialScore={active ? (scores[active] ?? 0) : 0}
        onClose={() => setOpen(false)}
        onSave={onSaveLocal}  // ⬅️ now includes note
      />
    </>
  );
}