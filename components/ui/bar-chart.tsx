"use client";

import { useState } from "react";

const FORMATTERS = {
  numero: (v: number) => String(v),
  moeda: (v: number) => `R$ ${v.toFixed(0)}`,
} as const;

export function BarChart({
  data,
  format = "numero",
  height = 180,
}: {
  data: { label: string; value: number }[];
  format?: keyof typeof FORMATTERS;
  height?: number;
}) {
  const formatValue = FORMATTERS[format];
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="flex items-end gap-2" style={{ height: height + 40 }}>
      {data.map((d, i) => {
        const pct = max > 0 ? (d.value / max) * 100 : 0;
        const isHover = hover === i;
        return (
          <div
            key={d.label}
            className="flex flex-1 flex-col items-center justify-end"
            style={{ height }}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <span className={`mb-1 text-xs font-bold ${isHover ? "text-brand-700" : "text-ink-950"}`}>
              {d.value > 0 ? formatValue(d.value) : ""}
            </span>
            <div
              className={`w-full rounded-t-sm transition-colors ${isHover ? "bg-brand-700" : "bg-brand-600"}`}
              style={{ height: `${Math.max(pct, d.value > 0 ? 2 : 0)}%` }}
            />
            <span className="mt-2 text-xs font-medium uppercase text-ink-900/50">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
