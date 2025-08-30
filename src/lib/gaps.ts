export type GapItem = {
  id: string;
  metric: string;
  userHas: number;
  neededToReach: number;
  delta: number;
  detail: string;
  evidence: string | null;
};

export type RequirementRow = {
  id: string;
  benchmark: string;
  metric: string;
  target: number;
  detail: string;
  evidence: string | null;
};

export function computeGaps(
  userScores: Record<string, number>,
  requirements: RequirementRow[]
): GapItem[] {
  const gaps: GapItem[] = [];

  for (const req of requirements) {
    const userScore = userScores[req.metric] ?? 0;
    const targetScore = req.target;
    
    // Only include if user hasn't reached the target
    if (userScore < targetScore) {
      gaps.push({
        id: req.id,
        metric: req.metric,
        userHas: userScore,
        neededToReach: targetScore,
        delta: targetScore - userScore,
        detail: req.detail,
        evidence: req.evidence,
      });
    }
  }

  // Sort by largest gap first (most improvement needed)
  return gaps.sort((a, b) => b.delta - a.delta);
}