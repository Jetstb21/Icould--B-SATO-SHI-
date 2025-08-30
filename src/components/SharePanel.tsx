"use client";

import { useMemo, useState } from "react";
import { encodeScores } from "@/lib/share";

type SharePanelProps = {
  scores: Record<string, number>;
  labels: string[]; // category names, for completeness (not strictly needed)
};

export default function SharePanel({ scores, labels }: SharePanelProps) {
  const [copied, setCopied] = useState(false);

  const link = useMemo(() => {
    // Build absolute URL to /share with compact payload
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const d = encodeScores(scores);
    return `${origin}/share?d=${d}`;
  }, [scores]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = link;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  }

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-lg font-semibold">Share your profile</h3>
      <p className="mt-1 text-sm text-white/70">
        This link encodes your current scores. Anyone with the link can view your read-only radar.
      </p>

      <div className="mt-3 break-all rounded-lg border border-white/10 bg-black/30 p-2 text-xs">
        {link}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm hover:bg-white/10"
          onClick={copy}
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/20 px-3 py-1.5 text-sm hover:bg-emerald-500/30"
        >
          Open share page
        </a>
      </div>
    </div>
  );
}