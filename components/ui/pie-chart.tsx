"use client";

import { useState } from "react";

const FORMATTERS = {
  numero: (v: number) => String(v),
  moeda: (v: number) => `R$ ${v.toFixed(0)}`,
} as const;

const CORES = ["#dc2626", "#1d4ed8", "#16a34a", "#eab308", "#7e22ce", "#f97316", "#0891b2", "#db2777"];

export function PieChart({
  data,
  format = "numero",
}: {
  data: { label: string; value: number }[];
  format?: keyof typeof FORMATTERS;
}) {
  const formatValue = FORMATTERS[format];
  const [hover, setHover] = useState<number | null>(null);
  const total = Math.max(1, data.reduce((acc, d) => acc + d.value, 0));

  const fatias = data.reduce<{ label: string; value: number; inicio: number; fim: number; cor: string }[]>(
    (acc, d, i) => {
      const anterior = acc[acc.length - 1]?.fim ?? 0;
      const inicio = anterior;
      const fim = anterior + (d.value / total) * 360;
      return [...acc, { ...d, inicio, fim, cor: CORES[i % CORES.length] }];
    },
    [],
  );

  const gradient = fatias
    .map((f) => `${f.cor} ${f.inicio}deg ${f.fim}deg`)
    .join(", ");

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
      <div
        className="relative h-40 w-40 shrink-0 rounded-full"
        style={{ background: data.length > 0 ? `conic-gradient(${gradient})` : "#e5e5e5" }}
      >
        <div className="absolute inset-3 rounded-full bg-white" />
        {hover !== null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-semibold uppercase text-ink-900/50">{fatias[hover].label}</span>
            <span className="text-sm font-bold text-ink-950">{formatValue(fatias[hover].value)}</span>
          </div>
        )}
      </div>
      <div className="flex w-full flex-col gap-1.5">
        {fatias.map((f, i) => (
          <button
            key={f.label}
            type="button"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left text-sm transition hover:bg-ink-950/[0.03]"
          >
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: f.cor }} />
              <span className={`font-medium ${hover === i ? "text-brand-700" : "text-ink-950"}`}>{f.label}</span>
            </span>
            <span className="text-ink-900/60">{formatValue(f.value)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
