"use client";
import { supabase } from "@/lib/supabase";

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

export async function saveScoresCloud(scores: Record<string, number>) {
  const session = await getSession();
  if (!session) throw new Error("Not signed in");
  const user_id = session.user.id;
  const { error } = await supabase.from("user_scores")
    .upsert({ user_id, scores, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw error;
  return true;
}

export async function loadScoresCloud(): Promise<Record<string, number>> {
  const session = await getSession();
  if (!session) throw new Error("Not signed in");
  const user_id = session.user.id;
  const { data, error } = await supabase.from("user_scores")
    .select("scores").eq("user_id", user_id).maybeSingle();
  if (error) throw error;
  return (data?.scores ?? {}) as Record<string, number>;
}

/** ⬇️ New: append a score event (with optional note) */
export async function logScoreEvent(category: string, score: number, note?: string) {
  const session = await getSession();
  if (!session) return; // silently ignore if not signed in
  const user_id = session.user.id;
  const { error } = await supabase.from("user_score_events").insert({ user_id, category, score, note });
  if (error) throw error;
}

/** ⬇️ New: fetch own history (latest first) */
export type ScoreEvent = { id: number; category: string; score: number; note: string | null; created_at: string; };
export async function fetchMyHistory(limit = 50): Promise<ScoreEvent[]> {
  const session = await getSession();
  if (!session) throw new Error("Not signed in");
  const user_id = session.user.id;
  const { data, error } = await supabase
    .from("user_score_events")
    .select("id, category, score, note, created_at")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

/** ⬇️ New: leaderboard aggregates (anonymous) */
export type CatAvg = { category: string; avg_score: number; samples: number };
export async function fetchCategoryAverages(): Promise<CatAvg[]> {
  const { data, error } = await supabase.rpc("get_category_averages");
  if (error) throw error;
  return data ?? [];
}