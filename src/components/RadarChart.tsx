"use client";
import React from "react";
import { useEffect, useRef } from "react";

type RadarProps = {
  labels: string[];
  values: number[]; // expected 0..5
  size?: number;    // canvas size in px
};

export default function RadarChart({ labels, values, size = 360 }: RadarProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Basic
    const N = labels.length;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.38;
    const rings = 5; // 1..5

    ctx.clearRect(0, 0, size, size);

    // Background
    ctx.fillStyle = "#0b0b0f";
    ctx.fillRect(0, 0, size, size);

    // Draw grid rings
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    for (let r = 1; r <= rings; r++) {
      const rr = (radius * r) / rings;
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const a = (Math.PI * 2 * i) / N - Math.PI / 2;
        const x = cx + rr * Math.cos(a);
        const y = cy + rr * Math.sin(a);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Axes + labels
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
    for (let i = 0; i < N; i++) {
      const a = (Math.PI * 2 * i) / N - Math.PI / 2;
      const x = cx + radius * Math.cos(a);
      const y = cy + radius * Math.sin(a);
      // Axis line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.stroke();
      // Label
      const lx = cx + (radius + 18) * Math.cos(a);
      const ly = cy + (radius + 18) * Math.sin(a);
      const label = labels[i];
      // center-ish alignment depending on quadrant
      const align =
        Math.cos(a) > 0.3 ? "left" : Math.cos(a) < -0.3 ? "right" : "center";
      ctx.textAlign = align as CanvasTextAlign;
      ctx.textBaseline = "middle";
      ctx.fillText(label, lx, ly);
    }

    // Data polygon
    const max = 5;
    const pts: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < N; i++) {
      const v = Math.max(0, Math.min(max, values[i] ?? 0));
      const r = (radius * v) / max;
      const a = (Math.PI * 2 * i) / N - Math.PI / 2;
      pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
    }

    // Fill
    ctx.beginPath();
    pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.closePath();
    ctx.fillStyle = "rgba(16, 185, 129, 0.25)"; // emerald-ish
    ctx.fill();

    // Stroke
    ctx.beginPath();
    pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.closePath();
    ctx.strokeStyle = "rgba(16, 185, 129, 0.8)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fill();
  }, [labels, values, size]);

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <canvas ref={canvasRef} className="rounded-xl border border-white/10" />
      <button
        className="rounded-lg border border-white/10 px-3 py-1.5 text-sm hover:bg-white/10"
        onClick={() => {
          const c = canvasRef.current;
          if (!c) return;
          const url = c.toDataURL("image/png");
          const a = document.createElement("a");
          a.href = url;
          a.download = "satoshi-skill-radar.png";
          a.click();
        }}
      >
        Download PNG
      </button>
    </div>
  );
}