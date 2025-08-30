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

export async function logScoreEvent(category: string, score: number, note?: string) {
  const session = await getSession();
  if (!session) throw new Error("Not signed in");
  const user_id = session.user.id;
  const { error } = await supabase.from("score_events")
    .insert({ user_id, category, score, note, created_at: new Date().toISOString() });
  if (error) throw error;
  return true;
}