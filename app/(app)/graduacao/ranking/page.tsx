import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { getRankingFrequencia } from "@/lib/queries/frequencia";
import { listTurmas } from "@/lib/queries/turmas";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

const PERIODOS = [
  { valor: "", label: "Desde sempre" },
  { valor: "30", label: "Últimos 30 dias" },
  { valor: "90", label: "Últimos 90 dias" },
];

function desdeParaDias(dias: string | undefined): string | undefined {
  if (!dias) return undefined;
  const data = new Date();
  data.setDate(data.getDate() - Number(dias));
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
}

const MEDALHAS = ["🥇", "🥈", "🥉"];

export default async function RankingFrequenciaPage({
  searchParams,
}: {
  searchParams: Promise<{ turmaId?: string; periodo?: string }>;
}) {
  await requireProfile();
  const { turmaId, periodo } = await searchParams;
  const supabase = await createClient();

  const [turmas, ranking] = await Promise.all([
    listTurmas(supabase),
    getRankingFrequencia(supabase, { turmaId: turmaId || undefined, desde: desdeParaDias(periodo) }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Ranking de frequência" subtitle="Quem mais compareceu às aulas" />

      <form className="flex flex-wrap items-end gap-3 rounded-lg border border-ink-900/10 bg-white p-4 shadow-sm">
        <Field label="Turma" htmlFor="turmaId">
          <select id="turmaId" name="turmaId" defaultValue={turmaId ?? ""} className={inputClass}>
            <option value="">Todas as turmas</option>
            {turmas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Período" htmlFor="periodo">
          <select id="periodo" name="periodo" defaultValue={periodo ?? ""} className={inputClass}>
            {PERIODOS.map((p) => (
              <option key={p.valor} value={p.valor}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>
        <Button type="submit" variant="secondary" size="sm">
          Filtrar
        </Button>
      </form>

      {ranking.length === 0 ? (
        <EmptyState message="Nenhuma presença registrada nesse período." />
      ) : (
        <Card className="p-2">
          <div className="divide-y divide-ink-900/5">
            {ranking.map((r, i) => (
              <div key={r.aluno_id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center text-sm font-bold text-ink-900/40">
                    {MEDALHAS[i] ?? i + 1}
                  </span>
                  <p className="font-medium text-ink-950">{r.full_name}</p>
                </div>
                <Badge tone={i < 3 ? "brand" : "neutral"}>
                  <Trophy className="h-3 w-3" />
                  {r.total_presencas} aulas
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
