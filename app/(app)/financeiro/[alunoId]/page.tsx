import { notFound, redirect } from "next/navigation";
import { Wallet } from "lucide-react";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { getMensalidades } from "@/lib/queries/financeiro";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusMensalidadeBadge } from "@/components/ui/status-badge";
import { inputClass } from "@/components/ui/field";
import { marcarPago, marcarStatus, atualizarDesconto } from "../actions";

export default async function FinanceiroAlunoPage({
  params,
}: {
  params: Promise<{ alunoId: string }>;
}) {
  const { alunoId } = await params;
  const profile = await requireProfile();

  if (profile.role === "professor" || profile.role === "aluno_menor") {
    redirect("/");
  }
  if (profile.role === "aluno" && profile.id !== alunoId) {
    redirect(`/financeiro/${profile.id}`);
  }

  const supabase = await createClient();
  const { data: aluno } = await supabase
    .from("profiles")
    .select("id, full_name, desconto_percentual")
    .eq("id", alunoId)
    .single();
  if (!aluno) notFound();

  const mensalidades = await getMensalidades(supabase, alunoId);
  const podeGerenciar = profile.role === "dono";

  return (
    <div className="space-y-6">
      <PageHeader title="Financeiro" subtitle={aluno.full_name} />

      {podeGerenciar && (
        <Card className="max-w-sm p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-900/50">Desconto/bolsa padrão</p>
          <form action={atualizarDesconto.bind(null, alunoId)} className="flex items-center gap-2">
            <input
              name="desconto_percentual"
              type="number"
              min={0}
              max={100}
              step={1}
              defaultValue={aluno.desconto_percentual}
              className={`w-24 ${inputClass}`}
            />
            <span className="text-sm text-ink-900/50">%</span>
            <Button type="submit" size="sm" variant="secondary" className="ml-auto">
              Salvar
            </Button>
          </form>
          <p className="mt-2 text-xs text-ink-900/40">Sugerido automaticamente ao lançar uma nova mensalidade.</p>
        </Card>
      )}

      {mensalidades.length === 0 ? (
        <EmptyState icon={Wallet} message="Nenhuma mensalidade lançada ainda." />
      ) : (
        <div className="space-y-2">
          {mensalidades.map((m) => (
            <Card key={m.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-ink-950">
                    {new Date(m.mes_referencia + "T00:00:00").toLocaleDateString("pt-BR", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-ink-900/50">
                    {m.plano?.nome ?? "Sem plano"} · R$ {Number(m.valor).toFixed(2)}
                  </p>
                </div>
                <StatusMensalidadeBadge status={m.status} />
              </div>

              {podeGerenciar && m.status !== "pago" && (
                <form action={marcarPago.bind(null, m.id, alunoId)} className="mt-3 flex gap-2">
                  <input name="forma_pagamento" placeholder="Forma de pagamento" className={`flex-1 ${inputClass}`} />
                  <Button type="submit" size="sm" variant="success">
                    Marcar pago
                  </Button>
                </form>
              )}

              {podeGerenciar && m.status === "pago" && (
                <form action={marcarStatus.bind(null, m.id, alunoId, "pendente")} className="mt-3">
                  <button type="submit" className="text-xs font-medium text-ink-900/40 hover:text-brand-700">
                    desfazer pagamento
                  </button>
                </form>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
