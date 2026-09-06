import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Wallet, Receipt, Copy } from "lucide-react";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { getMensalidades, getPixKey } from "@/lib/queries/financeiro";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusMensalidadeBadge } from "@/components/ui/status-badge";
import { inputClass } from "@/components/ui/field";
import { marcarPago, marcarStatus, atualizarDesconto, atualizarDiaVencimento, avisarPagamento } from "../actions";
import { NovaCobrancaForm } from "./nova-cobranca-form";

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
    .select("id, full_name, desconto_percentual, dia_vencimento, recebe_pagamento")
    .eq("id", alunoId)
    .single();
  if (!aluno) notFound();

  const [mensalidades, pixKey] = await Promise.all([getMensalidades(supabase, alunoId), getPixKey(supabase)]);
  const podeGerenciar = profile.role === "dono";
  const temPendencia = mensalidades.some((m) => m.status !== "pago");

  return (
    <div className="space-y-6">
      <PageHeader title="Financeiro" subtitle={aluno.full_name} />

      {aluno.recebe_pagamento && (podeGerenciar || profile.id === alunoId) && (
        <Link
          href={`/financeiro/professores/${alunoId}`}
          className="flex w-fit items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
        >
          Ver pagamentos como instrutor
        </Link>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-900/50">Desconto/bolsa</p>
          {podeGerenciar ? (
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
          ) : (
            <p className="text-lg font-semibold text-ink-950">
              {aluno.desconto_percentual > 0 ? `${aluno.desconto_percentual}% de desconto` : "Sem desconto"}
            </p>
          )}
        </Card>

        <Card className="p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-900/50">Dia de vencimento</p>
          {podeGerenciar ? (
            <form action={atualizarDiaVencimento.bind(null, alunoId)} className="flex items-center gap-2">
              <input
                name="dia_vencimento"
                type="number"
                min={1}
                max={28}
                step={1}
                defaultValue={aluno.dia_vencimento}
                className={`w-24 ${inputClass}`}
              />
              <Button type="submit" size="sm" variant="secondary" className="ml-auto">
                Salvar
              </Button>
            </form>
          ) : (
            <p className="text-lg font-semibold text-ink-950">Todo dia {aluno.dia_vencimento}</p>
          )}
        </Card>
      </div>

      {!podeGerenciar && temPendencia && pixKey && (
        <Card className="max-w-md border-brand-600/30 bg-brand-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Chave Pix da academia</p>
          <p className="mt-1 flex items-center gap-2 font-mono text-sm text-ink-950">
            <Copy className="h-3.5 w-3.5 shrink-0 text-ink-900/40" />
            {pixKey}
          </p>
        </Card>
      )}

      {podeGerenciar && <NovaCobrancaForm alunoId={alunoId} />}

      {mensalidades.length === 0 ? (
        <EmptyState icon={Wallet} message="Nenhuma mensalidade lançada ainda." />
      ) : (
        <div className="space-y-2">
          {mensalidades.map((m) => (
            <Card key={m.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-ink-950">
                    {m.tipo === "avulsa"
                      ? (m.descricao ?? "Cobrança avulsa")
                      : new Date(`${m.mes_referencia}T00:00:00`).toLocaleDateString("pt-BR", {
                          month: "long",
                          year: "numeric",
                        })}
                  </p>
                  <p className="text-sm text-ink-900/50">
                    {m.tipo === "avulsa" ? "Avulsa" : (m.plano?.nome ?? "Sem plano")} · R$ {Number(m.valor).toFixed(2)}
                  </p>
                </div>
                <StatusMensalidadeBadge status={m.status} />
              </div>

              {m.status === "pago" && (
                <Link
                  href={`/recibo/${m.id}`}
                  target="_blank"
                  className="mt-3 flex w-fit items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
                >
                  <Receipt className="h-3.5 w-3.5" />
                  Ver recibo
                </Link>
              )}

              {podeGerenciar && m.status !== "pago" && (
                <form action={marcarPago.bind(null, m.id, alunoId)} className="mt-3 flex gap-2">
                  <input name="forma_pagamento" placeholder="Forma de pagamento" className={`flex-1 ${inputClass}`} />
                  <Button type="submit" size="sm" variant="success">
                    Marcar pago
                  </Button>
                </form>
              )}

              {!podeGerenciar && m.status !== "pago" && (
                <form action={avisarPagamento.bind(null, m.id)} className="mt-3">
                  <Button type="submit" size="sm" variant="secondary">
                    Já paguei
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
