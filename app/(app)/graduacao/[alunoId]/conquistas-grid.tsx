import { Award } from "lucide-react";
import type { Conquista } from "@/lib/queries/frequencia";

const GRUPO_LABELS: Record<Conquista["grupo"], string> = {
  faixa: "Faixas conquistadas",
  grau: "Graus na faixa atual",
  presenca: "Frequência",
  tempo: "Tempo de treino",
  graduacao: "Graduações",
};

const ORDEM_GRUPOS: Conquista["grupo"][] = ["faixa", "grau", "presenca", "tempo", "graduacao"];

export function ConquistasGrid({ conquistas }: { conquistas: Conquista[] }) {
  const porGrupo = ORDEM_GRUPOS.map((grupo) => ({
    grupo,
    itens: conquistas.filter((c) => c.grupo === grupo),
  })).filter((g) => g.itens.length > 0);

  return (
    <div className="space-y-5">
      {porGrupo.map(({ grupo, itens }) => (
        <div key={grupo}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-900/50">{GRUPO_LABELS[grupo]}</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {itens.map((c) => (
              <div
                key={c.key}
                className={`flex flex-col items-center gap-1.5 rounded-lg border p-4 text-center ${
                  c.alcancada
                    ? "border-brand-600/30 bg-brand-50"
                    : "border-ink-900/10 bg-ink-950/[0.02] opacity-50"
                }`}
              >
                {c.cor ? (
                  <span
                    className="h-6 w-6 rounded-full ring-2 ring-black/10"
                    style={{ backgroundColor: c.cor, opacity: c.alcancada ? 1 : 0.4 }}
                    aria-hidden
                  />
                ) : (
                  <Award className={`h-6 w-6 ${c.alcancada ? "text-brand-600" : "text-ink-900/30"}`} />
                )}
                <p className="text-xs font-semibold text-ink-950">{c.titulo}</p>
                <p className="text-[11px] text-ink-900/50">{c.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
