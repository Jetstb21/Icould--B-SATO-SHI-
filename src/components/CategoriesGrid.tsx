"use client";
import { useEffect, useState } from "react";
import CategoryCard from "@/components/CategoryCard";
import CategoryCard from "@/components/CategoryCard";
import RatingModal from "@/components/RatingModal";
import { getScores, setScore } from "@/lib/storage";

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

  function onSave(score: number) {
    if (!active) return;
    setScore(active, score);
    setScores((s) => ({ ...s, [active]: score }));
  }

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