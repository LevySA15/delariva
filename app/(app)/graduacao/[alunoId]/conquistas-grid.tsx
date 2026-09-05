import { Award } from "lucide-react";
import type { Conquista } from "@/lib/queries/frequencia";

export function ConquistasGrid({ conquistas }: { conquistas: Conquista[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {conquistas.map((c) => (
        <div
          key={c.key}
          className={`flex flex-col items-center gap-1.5 rounded-lg border p-4 text-center ${
            c.alcancada
              ? "border-brand-600/30 bg-brand-50"
              : "border-ink-900/10 bg-ink-950/[0.02] opacity-50"
          }`}
        >
          <Award className={`h-6 w-6 ${c.alcancada ? "text-brand-600" : "text-ink-900/30"}`} />
          <p className="text-xs font-semibold text-ink-950">{c.titulo}</p>
          <p className="text-[11px] text-ink-900/50">{c.descricao}</p>
        </div>
      ))}
    </div>
  );
}
