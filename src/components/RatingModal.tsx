"use client";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useStateSafe } from "@/hooks/useStateSafe";

type Props = {
  open: boolean;
  category: string | null;
  initialScore: number;
  onClose: () => void;
  onSave: (score: number, note?: string) => void;
};

export default function RatingModal({ open, category, initialScore, onClose, onSave }: Props) {
  const [score, setScore] = useStateSafe(initialScore);
  const [note, setNote] = useStateSafe("");
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setScore(initialScore); }, [initialScore, setScore]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !category) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div ref={dialogRef} className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-xl">
        <h2 className="text-xl font-bold">Rate: {category}</h2>
        <p className="mt-1 text-sm text-white/70">Give yourself a 1–5 score and optionally add a note.</p>

        <div className="mt-4 flex items-center gap-2">
          {[1,2,3,4,5].map((n) => (
            <button
              key={n}
              className={cn(
                "h-10 w-10 rounded-full border border-white/10 text-sm",
                n <= score ? "bg-white/20" : "bg-white/5 hover:bg-white/10"
              )}
              onClick={() => setScore(n)}
            >
              {n}
            </button>
          ))}
          <span className="ml-2 text-white/70">Selected: {score}</span>
        </div>

        <textarea
          className="mt-4 w-full rounded-lg border border-white/10 bg-black/30 p-2 text-sm outline-none"
          rows={3}
          placeholder="Optional note (what you learned, why this score, links, etc.)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="mt-6 flex justify-end gap-2">
          <button
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm hover:bg-white/10"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="rounded-lg border border-emerald-500/30 bg-emerald-500/20 px-3 py-1.5 text-sm hover:bg-emerald-500/30"
            onClick={() => { onSave(score, note?.trim() || undefined); onClose(); }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}