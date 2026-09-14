"use client";

import { useState } from "react";

const FORMATTERS = {
  numero: (v: number) => String(v),
  moeda: (v: number) => `R$ ${v.toFixed(0)}`,
} as const;

export function LineChart({
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
  const chartH = 40;
  const stepX = data.length > 1 ? 100 / (data.length - 1) : 0;

  const pontos = data.map((d, i) => ({
    x: data.length > 1 ? i * stepX : 50,
    y: chartH - (d.value / max) * chartH,
    ...d,
  }));
  const pathD = pontos.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div>
      <div className="relative" style={{ height }}>
        <svg viewBox={`0 0 100 ${chartH}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <path d={pathD} fill="none" stroke="#dc2626" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
        </svg>
        {pontos.map((p, i) => (
          <button
            key={p.label}
            type="button"
            aria-label={`${p.label}: ${formatValue(p.value)}`}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors"
            style={{ left: `${p.x}%`, top: `${(p.y / chartH) * 100}%`, backgroundColor: hover === i ? "#b91c1c" : "#dc2626" }}
          />
        ))}
        {hover !== null && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-[130%] whitespace-nowrap rounded bg-ink-950 px-2 py-1 text-xs font-bold text-white"
            style={{ left: `${pontos[hover].x}%`, top: `${(pontos[hover].y / chartH) * 100}%` }}
          >
            {formatValue(pontos[hover].value)}
          </div>
        )}
      </div>
      <div className="mt-2 flex justify-between">
        {data.map((d, i) => (
          <span
            key={d.label}
            className={`text-xs font-medium uppercase ${hover === i ? "text-brand-700" : "text-ink-900/50"}`}
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
