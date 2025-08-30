"use client";

import { useState, useEffect } from "react";
import { getScores, setScore } from "@/lib/storage";
import { saveScoresCloud, loadScoresCloud, saveScoreEvent } from "@/lib/cloud";
import CategoryCard from "./CategoryCard";
import RatingModal from "./RatingModal";
import RadarChart from "./RadarChart";
import SharePanel from "./SharePanel";
import AuthPanel from "./AuthPanel";
import Leaderboard from "./Leaderboard";

type Category = {
  title: string;
  descr: string;
  iconNode: React.ReactNode;
};

type Props = {
  categories: Category[];
};

export default function CategoriesGrid({ categories }: Props) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Load scores on mount
  useEffect(() => {
    const localScores = getScores();
    setScores(localScores);
  }, []);

  // Check auth state
  useEffect(() => {
    import("@/lib/supabase").then(({ supabase }) => {
      supabase.auth.getUser().then(({ data }) => {
        setUserEmail(data.user?.email ?? null);
      });
      const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
        setUserEmail(s?.user?.email ?? null);
      });
      return () => sub.subscription.unsubscribe();
    });
  }, []);

  // Load cloud scores when user signs in
  useEffect(() => {
    if (userEmail) {
      loadScoresCloud()
        .then((cloudScores) => {
          setScores(cloudScores);
        })
        .catch(() => {
          // Keep local scores if cloud load fails
        });
    }
  }, [userEmail]);

  function openModal(category: string) {
    setModalCategory(category);
    setModalOpen(true);
  }

  async function handleSave(newScore: number, note?: string) {
    if (!modalCategory) return;

    const newScores = { ...scores, [modalCategory]: newScore };
    setScores(newScores);
    setScore(modalCategory, newScore);

    // Save to cloud if signed in
    if (userEmail) {
      try {
        await saveScoresCloud(newScores);
        if (note) {
          await saveScoreEvent(modalCategory, newScore, note);
        }
      } catch (error) {
        console.error("Failed to save to cloud:", error);
      }
    }
  }

  const labels = categories.map((c) => c.title);
  const values = labels.map((label) => scores[label] || 0);
  const avg = +(values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <CategoryCard
            key={cat.title}
            title={cat.title}
            descr={cat.descr}
            iconNode={cat.iconNode}
            score={scores[cat.title]}
            onAssess={openModal}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Your Skill Radar</h2>
          <p className="text-white/70">
            Average: <span className="font-semibold">{avg}</span> / 5
          </p>
        </div>
        <RadarChart labels={labels} values={values} />
        <SharePanel scores={scores} labels={labels} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <AuthPanel />
        <Leaderboard />
      </div>

      <RatingModal
        open={modalOpen}
        category={modalCategory}
        initialScore={scores[modalCategory || ""] || 1}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}