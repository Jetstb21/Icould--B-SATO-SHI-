// Utility functions for encoding/decoding skill scores for sharing

// Comparison sharing utilities
export function buildShareUrl(ids: string[]): string {
  const url = new URL(window.location.href);
  url.searchParams.set("compare", ids.join(","));
  return url.toString();
}

export function readSharedIds(): string[] {
  const url = new URL(window.location.href);
  const val = url.searchParams.get("compare");
  return val ? val.split(",").filter(Boolean) : [];
}

export function toCompareCode(ids: string[]): string {
  return ids.join(",");
}

export function fromCompareCode(code: string): string[] {
  return code.split(",").map(s => s.trim()).filter(Boolean);
}

export function buildShortLink(ids: string[]): string {
  const code = btoa(ids.join(","));
  const url = new URL(window.location.origin);
  url.hash = `#/c/${code}`;
  return url.toString();
}

export function readCodeFromHash(): string[] {
  const hash = window.location.hash;
  // Check for new format: #/c/abc123
  const match = hash.match(/^#\/c\/(.+)$/);
  if (match) {
    try {
      const decoded = atob(match[1]);
      return decoded.split(",").filter(Boolean);
    } catch {
      return [];
    }
  }
  // Fallback to old format: #id1,id2,id3
  const oldFormat = hash.slice(1);
  return oldFormat ? oldFormat.split(",").filter(Boolean) : [];
}

// Original score sharing utilities
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