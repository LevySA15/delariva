import Link from "next/link";
import { DIAS_SEMANA_LABELS, type FaixaCategoria } from "@/lib/domain";

type Turma = {
  id: string;
  nome: string;
  dias_semana: number[];
  horario_inicio: string;
  horario_fim: string;
  faixa_etaria: FaixaCategoria;
};

const PX_POR_MINUTO = 0.8; // 48px por hora

function horaParaMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

export function TurmasCalendar({ turmas }: { turmas: Turma[] }) {
  const inicios = turmas.map((t) => horaParaMinutos(t.horario_inicio));
  const fins = turmas.map((t) => horaParaMinutos(t.horario_fim));
  const horaInicio = turmas.length ? Math.max(0, Math.floor(Math.min(...inicios) / 60)) : 6;
  const horaFim = turmas.length ? Math.min(24, Math.ceil(Math.max(...fins) / 60)) : 22;
  const alturaTotal = (horaFim - horaInicio) * 60 * PX_POR_MINUTO;

  const porDia: Turma[][] = Array.from({ length: 7 }, () => []);
  for (const t of turmas) {
    for (const d of t.dias_semana) {
      porDia[d]?.push(t);
    }
  }

  const horas = Array.from({ length: horaFim - horaInicio + 1 }, (_, i) => horaInicio + i);

  return (
    <div className="overflow-x-auto rounded-lg border border-ink-900/10 bg-white shadow-sm">
      <div className="grid min-w-[760px] grid-cols-[56px_repeat(7,1fr)]">
        <div className="border-b border-ink-900/10" />
        {DIAS_SEMANA_LABELS.map((label) => (
          <div
            key={label}
            className="border-b border-l border-ink-900/10 p-2 text-center text-xs font-semibold uppercase tracking-wide text-ink-900/50"
          >
            {label.slice(0, 3)}
          </div>
        ))}

        <div className="relative" style={{ height: `${alturaTotal}px` }}>
          {horas.map((h) => (
            <div
              key={h}
              className="absolute right-1.5 -translate-y-2 text-[11px] text-ink-900/40"
              style={{ top: `${(h - horaInicio) * 60 * PX_POR_MINUTO}px` }}
            >
              {String(h).padStart(2, "0")}h
            </div>
          ))}
        </div>

        {porDia.map((turmasDoDia, dia) => (
          <div
            key={dia}
            className="relative border-l border-ink-900/10"
            style={{ height: `${alturaTotal}px` }}
          >
            {horas.map((h) => (
              <div
                key={h}
                className="absolute inset-x-0 border-t border-ink-900/5"
                style={{ top: `${(h - horaInicio) * 60 * PX_POR_MINUTO}px` }}
              />
            ))}
            {turmasDoDia.map((t) => {
              const inicio = horaParaMinutos(t.horario_inicio);
              const fim = horaParaMinutos(t.horario_fim);
              const top = (inicio - horaInicio * 60) * PX_POR_MINUTO;
              const altura = Math.max((fim - inicio) * PX_POR_MINUTO, 24);
              return (
                <Link
                  key={t.id}
                  href={`/aulas/${t.id}`}
                  className={`absolute inset-x-0.5 overflow-hidden rounded px-1.5 py-1 text-[11px] font-medium leading-tight shadow-sm transition hover:brightness-95 ${
                    t.faixa_etaria === "adulto" ? "bg-ink-950 text-white" : "bg-brand-600 text-white"
                  }`}
                  style={{ top: `${top}px`, height: `${altura}px` }}
                >
                  <p className="truncate font-semibold">{t.nome}</p>
                  <p className="truncate opacity-80">
                    {t.horario_inicio.slice(0, 5)}-{t.horario_fim.slice(0, 5)}
                  </p>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
