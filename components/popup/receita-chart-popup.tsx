"use client";

import { useState } from "react";
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon } from "lucide-react";
import { BarChart } from "@/components/ui/bar-chart";
import { LineChart } from "@/components/ui/line-chart";
import { PieChart } from "@/components/ui/pie-chart";

type Ponto = { label: string; value: number };

const TIPOS = [
  { id: "barra", label: "Barras", icon: BarChart3 },
  { id: "linha", label: "Linha", icon: LineChartIcon },
  { id: "pizza", label: "Pizza", icon: PieChartIcon },
] as const;

export function ReceitaChartPopup({ data }: { data: Ponto[] }) {
  const [tipo, setTipo] = useState<(typeof TIPOS)[number]["id"]>("barra");

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5">
        {TIPOS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTipo(t.id)}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition ${
              tipo === t.id
                ? "border-brand-600 bg-brand-50 text-brand-700"
                : "border-ink-900/10 text-ink-900/60 hover:bg-ink-950/[0.03]"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>
      {tipo === "barra" && <BarChart data={data} format="moeda" />}
      {tipo === "linha" && <LineChart data={data} format="moeda" />}
      {tipo === "pizza" && <PieChart data={data} format="moeda" />}
    </div>
  );
}
