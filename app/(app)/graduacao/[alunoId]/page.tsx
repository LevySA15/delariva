import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { getAvaliacoes, getGraduacoes } from "@/lib/queries/graduacao";
import { CRITERIO_LABELS } from "@/lib/domain";
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
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{aluno.full_name}</h1>
        <p className="mt-1 text-neutral-500">
          Faixa atual:{" "}
          {faixaAtual ? (
            <span className="font-medium text-neutral-800">
              {faixaAtual.faixa} · grau {faixaAtual.grau}
            </span>
          ) : (
            "sem graduação registrada"
          )}
        </p>
      </div>

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
        <h2 className="mb-3 text-lg font-semibold text-neutral-900">Histórico de graduação</h2>
        {graduacoes.length === 0 ? (
          <p className="text-sm text-neutral-500">Nenhuma graduação registrada ainda.</p>
        ) : (
          <ul className="space-y-2">
            {graduacoes.map((g) => (
              <li key={g.id} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-neutral-900">
                    {g.faixa} · grau {g.grau}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {new Date(g.data + "T00:00:00").toLocaleDateString("pt-BR")}
                  </p>
                </div>
                {g.observacao && <p className="mt-1 text-sm text-neutral-600">{g.observacao}</p>}
                {g.professor && (
                  <p className="mt-1 text-xs text-neutral-400">por {g.professor.full_name}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-neutral-900">Histórico de avaliações</h2>
        {avaliacoes.length === 0 ? (
          <p className="text-sm text-neutral-500">Nenhuma avaliação registrada ainda.</p>
        ) : (
          <ul className="space-y-2">
            {avaliacoes.map((av) => (
              <li key={av.id} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-neutral-900">
                    {av.nota_geral !== null ? `Nota geral: ${av.nota_geral}` : "Sem nota geral"}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {new Date(av.data + "T00:00:00").toLocaleDateString("pt-BR")}
                  </p>
                </div>
                {av.comentario && <p className="mt-1 text-sm text-neutral-600">{av.comentario}</p>}
                {av.avaliacao_criterios.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {av.avaliacao_criterios.map((c) => (
                      <span
                        key={c.criterio}
                        className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600"
                      >
                        {CRITERIO_LABELS[c.criterio]}: {c.nota}
                      </span>
                    ))}
                  </div>
                )}
                {av.professor && <p className="mt-1 text-xs text-neutral-400">por {av.professor.full_name}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
