import Link from "next/link";
import { Award } from "lucide-react";
import { FAIXA_COR_HEX } from "@/lib/domain";

type Graduacao = {
  id: string;
  faixa: string;
  grau: number;
  data: string;
  observacao: string | null;
  professor: { full_name: string } | null;
};

export function GraduacaoTimeline({ graduacoes }: { graduacoes: Graduacao[] }) {
  // mais antiga primeiro, pra ler como uma evolução de cima pra baixo
  const ordenadas = [...graduacoes].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  return (
    <div className="relative pl-7">
      <div className="absolute bottom-1 left-[7px] top-1 w-0.5 bg-ink-900/10" />
      <div className="space-y-6">
        {ordenadas.map((g) => (
          <div key={g.id} className="relative">
            <span
              className="absolute -left-7 top-0.5 h-4 w-4 rounded-full ring-4 ring-surface"
              style={{ backgroundColor: FAIXA_COR_HEX[g.faixa] ?? "#9ca3af" }}
            />
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold capitalize text-ink-950">
                {g.faixa} · grau {g.grau}
              </p>
              <p className="text-xs text-ink-900/50">
                {new Date(g.data + "T00:00:00").toLocaleDateString("pt-BR")}
              </p>
            </div>
            {g.observacao && <p className="mt-1 text-sm text-ink-900/70">{g.observacao}</p>}
            <div className="mt-1.5 flex items-center gap-3">
              {g.professor && <p className="text-xs text-ink-900/40">por {g.professor.full_name}</p>}
              <Link
                href={`/certificado/${g.id}`}
                target="_blank"
                className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
              >
                <Award className="h-3 w-3" />
                Certificado
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
