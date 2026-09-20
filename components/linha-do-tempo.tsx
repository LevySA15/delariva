import { LogIn, Award } from "lucide-react";
import type { TimelineEvento } from "@/lib/queries/timeline";

function formatarData(data: string): string {
  const iso = data.includes("T") ? data : `${data}T00:00:00`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export function LinhaDoTempo({ eventos }: { eventos: TimelineEvento[] }) {
  if (eventos.length === 0) return null;

  return (
    <ul className="space-y-5">
      {eventos.map((evento, i) => (
        <li key={`${evento.tipo}-${evento.data}-${i}`} className="relative flex gap-3 pl-1">
          {i < eventos.length - 1 && (
            <span className="absolute left-[15px] top-8 h-[calc(100%-4px)] w-px bg-ink-900/10" aria-hidden />
          )}
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
            {evento.tipo === "entrada" ? <LogIn className="h-4 w-4" /> : <Award className="h-4 w-4" />}
          </span>
          <div className="pt-1">
            <p className="text-sm font-medium text-ink-950">{evento.titulo}</p>
            <p className="text-xs text-ink-900/40">{formatarData(evento.data)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
