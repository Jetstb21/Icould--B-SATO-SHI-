"use client";
import { useEffect, useState, useMemo } from "react";
import RatingModal from "@/components/RatingModal";
import { getScores, setScore } from "@/lib/storage";
import CategoryCard from "@/components/CategoryCard";
import RadarChart from "@/components/RadarChart";
import SharePanel from "@/components/SharePanel";

type Category = {
  title: string;
  descr: string;
  iconNode: React.ReactNode;
};

export default function CategoriesGrid({ categories }: { categories: Category[] }) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => { setScores(getScores()); }, []);

  function onAssess(title: string) {
    setActive(title);
    setOpen(true);
  }

  function onSave(val: number) {
    if (!active) return;
    setScore(active, val);
    setScores((s) => ({ ...s, [active]: val }));
  }

  const labels = useMemo(() => categories.map(c => c.title), [categories]);
  const values = useMemo(
    () => labels.map(l => scores[l] ?? 0),
    [labels, scores]
  );

  const avg = useMemo(() => {
    const arr = values;
    if (!arr.length) return 0;
    const sum = arr.reduce((a, b) => a + (b || 0), 0);
    return +(sum / arr.length).toFixed(2);
  }, [values]);

  return (
    <>
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
        <h2 className="text-xl font-bold">Your Profile</h2>
        <p className="text-sm text-white/70">
          Average score: <span className="font-semibold">{avg}</span> / 5
        </p>
        <RadarChart labels={labels} values={values} size={380} />
      </div>

      <div className="mt-8 flex justify-center">
        <SharePanel scores={scores} labels={labels} />
      </div>

      <RatingModal
        open={open}
        category={active}
        initialScore={active ? (scores[active] ?? 0) : 0}
        onClose={() => setOpen(false)}
        onSave={onSave}
      />
    </>
  );
}