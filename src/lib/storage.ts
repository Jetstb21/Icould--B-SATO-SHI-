// Tiny safe wrappers around localStorage for SSR environments.
type ScoreMap = Record<string, number>;

const KEY = "satoshi_scores_v1";

function safeWindow(): Window | null {
  try { return typeof window !== "undefined" ? window : null; } catch { return null; }
}

export function getScores(): ScoreMap {
  const w = safeWindow();
  if (!w) return {};
  try {
    const raw = w.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) as ScoreMap : {};
  } catch {
    return {};
  }
}

export function setScore(category: string, score: number) {
  const w = safeWindow();
  if (!w) return;
  try {
    const map = getScores();
    map[category] = score;
    w.localStorage.setItem(KEY, JSON.stringify(map));
  } catch { /* ignore */ }
}