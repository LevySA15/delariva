import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { getAvaliacoes, getGraduacoes } from "@/lib/queries/graduacao";
import { CRITERIO_LABELS } from "@/lib/domain";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FaixaBadge } from "@/components/ui/faixa-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { GraduacaoForm } from "./graduacao-form";
import { AvaliacaoForm } from "./avaliacao-form";

export default async function GraduacaoAlunoPage({
  params,
}: {
  params: Promise<{ alunoId: string }>;
}) {
  const { alunoId } = await params;
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: aluno } = await supabase.from("profiles").select("*").eq("id", alunoId).single();
  if (!aluno) notFound();

  const [graduacoes, avaliacoes] = await Promise.all([
    getGraduacoes(supabase, alunoId),
    getAvaliacoes(supabase, alunoId),
  ]);

  const faixaAtual = graduacoes[0];
  const podeGraduar = profile.role === "dono" || profile.role === "professor";

  return (
    <div className="space-y-8">
      <PageHeader
        title={aluno.full_name}
        subtitle={faixaAtual ? undefined : "sem graduação registrada"}
        action={faixaAtual && <FaixaBadge faixa={faixaAtual.faixa} grau={faixaAtual.grau} />}
      />

      {podeGraduar && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <GraduacaoForm alunoId={alunoId} categoriaPadrao={aluno.faixa_categoria ?? "adulto"} />
          <AvaliacaoForm
            alunoId={alunoId}
            graduacoes={graduacoes.map((g) => ({ id: g.id, faixa: g.faixa, grau: g.grau, data: g.data }))}
          />
        </div>
      )}

      <section>
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-ink-900/60">
          Histórico de graduação
        </h2>
        {graduacoes.length === 0 ? (
          <EmptyState message="Nenhuma graduação registrada ainda." />
        ) : (
          <div className="space-y-2">
            {graduacoes.map((g) => (
              <Card key={g.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <FaixaBadge faixa={g.faixa} grau={g.grau} />
                  <p className="text-sm text-ink-900/50">
                    {new Date(g.data + "T00:00:00").toLocaleDateString("pt-BR")}
                  </p>
                </div>
                {g.observacao && <p className="mt-2 text-sm text-ink-900/70">{g.observacao}</p>}
                {g.professor && <p className="mt-1 text-xs text-ink-900/40">por {g.professor.full_name}</p>}
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-ink-900/60">
          Histórico de avaliações
        </h2>
        {avaliacoes.length === 0 ? (
          <EmptyState message="Nenhuma avaliação registrada ainda." />
        ) : (
          <div className="space-y-2">
            {avaliacoes.map((av) => (
              <Card key={av.id} className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-ink-950">
                    {av.nota_geral !== null ? `Nota geral: ${av.nota_geral}` : "Sem nota geral"}
                  </p>
                  <p className="text-sm text-ink-900/50">
                    {new Date(av.data + "T00:00:00").toLocaleDateString("pt-BR")}
                  </p>
                </div>
                {av.comentario && <p className="mt-1 text-sm text-ink-900/70">{av.comentario}</p>}
                {av.avaliacao_criterios.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {av.avaliacao_criterios.map((c) => (
                      <Badge key={c.criterio} tone="neutral">
                        {CRITERIO_LABELS[c.criterio]}: {c.nota}
                      </Badge>
                    ))}
                  </div>
                )}
                {av.professor && <p className="mt-2 text-xs text-ink-900/40">por {av.professor.full_name}</p>}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
