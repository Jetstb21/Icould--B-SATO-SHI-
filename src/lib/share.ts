// Utility functions for encoding/decoding skill scores for sharing

export function encodeScores(scores: Record<string, number>): string {
  try {
    const json = JSON.stringify(scores);
    return btoa(json);
  } catch {
    return "";
  }
}

export function decodeScores(encoded: string | null): Record<string, number> {
  if (!encoded) return {};
  try {
    const json = atob(encoded);
    const parsed = JSON.parse(json);
    // Validate that it's an object with number values
    if (typeof parsed === "object" && parsed !== null) {
      const result: Record<string, number> = {};
      for (const [key, value] of Object.entries(parsed)) {
        if (typeof value === "number" && value >= 0 && value <= 5) {
          result[key] = value;
        }
      }
      return result;
    }
    return {};
  } catch {
    return {};
  }
}