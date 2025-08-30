"use client";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

type Props = {
  title: string;
  descr: string;
  iconNode: ReactNode;
};
export default function CategoryCard({ title, descr, iconNode }: Props) {
  return (
    <div className={cn(
      "group relative rounded-2xl border border-white/10 bg-white/5 p-5",
      "shadow-sm hover:shadow-lg transition"
    )}>
      <div className="flex items-start gap-4">
        <div className="rounded-xl border border-white/10 bg-white/10 p-3">
          {iconNode}
        </div>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-white/70">{descr}</p>
        </div>
      </div>
      <button
        className="mt-4 inline-flex items-center rounded-xl border border-white/10 px-3 py-1.5 text-sm hover:bg-white/10"
        onClick={() => alert(`Coming soon: assess ${title}`)}
      >
        Assess skill
      </button>
    </div>
  );
}