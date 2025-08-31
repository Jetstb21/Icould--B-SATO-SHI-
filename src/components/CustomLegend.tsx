"use client";

type CustomLegendProps = {
  payload?: Array<{
    value: string;
    color: string;
    type: string;
  }>;
  selected?: string | null;
  onSelect?: (name: string | null) => void;
};

export default function CustomLegend({ payload, selected, onSelect }: CustomLegendProps) {
  if (!payload) return null;

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry) => (
        <button
          key={entry.value}
          onClick={() => onSelect?.(selected === entry.value ? null : entry.value)}
          className="flex items-center gap-2 px-3 py-1 rounded-lg border transition-all hover:bg-gray-50"
          style={{
            borderColor: selected === entry.value ? entry.color : "#ddd",
            backgroundColor: selected === entry.value ? `${entry.color}15` : "transparent"
          }}
        >
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm font-medium">{entry.value}</span>
        </button>
      ))}
    </div>
  );
}