import Link from "next/link";
import { redirect } from "next/navigation";
import { Copy, ArrowRight } from "lucide-react";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import {
  listMensalidadesDoMes,
  getResumoFinanceiroPorAluno,
  getPixKey,
  getRelatorioMensal,
  getProjecaoRecorrente,
  listInadimplencia,
} from "@/lib/queries/financeiro";
import { listRecebedores, listPagamentosDoMes } from "@/lib/queries/pagamentos";
import { getDependentes } from "@/lib/queries/dashboard";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardLink } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { StatusMensalidadeBadge } from "@/components/ui/status-badge";
import { MensalidadesList } from "./mensalidades-list";

export default async function FinanceiroPage() {
  const profile = await requireProfile();

  if (profile.role === "professor") {
    redirect(profile.recebe_pagamento ? `/financeiro/professores/${profile.id}` : "/");
  }

  if (profile.role === "aluno_menor") {
    redirect("/");
  }

  if (profile.role === "aluno") {
    redirect(`/financeiro/${profile.id}`);
  }

  const supabase = await createClient();

  if (profile.role === "responsavel") {
    const dependentes = await getDependentes(supabase, profile.id);
    if (dependentes.length === 1) {
      redirect(`/financeiro/${dependentes[0].id}`);
    }

    const alunoIds = dependentes.map((d) => d.id);
    const [resumo, pixKey] = await Promise.all([
      getResumoFinanceiroPorAluno(supabase, alunoIds),
      getPixKey(supabase),
    ]);
    const totalPendente = [...resumo.values()].reduce((acc, r) => acc + r.total, 0);
    const temPendencia = totalPendente > 0;

    return (
      <div className="space-y-6">
        <PageHeader title="Financeiro" />

        {temPendencia && (
          <Card className="max-w-md border-brand-600/30 bg-brand-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Total pendente</p>
            <p className="mt-1 text-2xl font-semibold text-ink-950">R$ {totalPendente.toFixed(2)}</p>
            {pixKey && (
              <p className="mt-2 flex items-center gap-2 font-mono text-sm text-ink-900/70">
                <Copy className="h-3.5 w-3.5 shrink-0 text-ink-900/40" />
                {pixKey}
              </p>
            )}
          </Card>
        )}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {dependentes.map((d) => {
            const r = resumo.get(d.id);
            return (
              <CardLink key={d.id} href={`/financeiro/${d.id}`} className="flex items-center justify-between p-4">
                <span className="font-medium text-ink-950">{d.full_name}</span>
                {r && r.atrasado > 0 ? (
                  <Badge tone="danger">{r.atrasado} atrasada{r.atrasado > 1 ? "s" : ""}</Badge>
                ) : r && r.pendente > 0 ? (
                  <Badge tone="warning">{r.pendente} pendente{r.pendente > 1 ? "s" : ""}</Badge>
                ) : (
                  <Badge tone="success">Em dia</Badge>
                )}
              </CardLink>
            );
          })}
        </div>
      </div>
    );
  }

  // dono
  const [mensalidades, meses, projecao, inadimplentes, recebedores, pagamentosDoMes] = await Promise.all([
    listMensalidadesDoMes(supabase),
    getRelatorioMensal(supabase, 1),
    getProjecaoRecorrente(supabase),
    listInadimplencia(supabase),
    listRecebedores(supabase),
    listPagamentosDoMes(supabase),
  ]);

  const mesAtual = meses[0];
  const pagamentoPorProfessor = new Map(pagamentosDoMes.map((p) => [p.professor_id, p]));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financeiro"
        subtitle="Mês atual"
        action={
          <div className="flex flex-wrap gap-2">
            <LinkButton href="/financeiro/planos" variant="secondary">
              Planos
            </LinkButton>
            <LinkButton href="/financeiro/nova">Lançar mensalidade</LinkButton>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-900/50">Recebido este mês</p>
          <p className="mt-1 font-display text-2xl font-bold text-emerald-700">R$ {mesAtual.recebido.toFixed(2)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-900/50">Pendente este mês</p>
          <p className="mt-1 font-display text-2xl font-bold text-brand-700">R$ {mesAtual.pendente.toFixed(2)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-900/50">Projeção recorrente/mês</p>
          <p className="mt-1 font-display text-2xl font-bold text-ink-950">R$ {projecao.toFixed(2)}</p>
        </Card>
      </div>
      <Link
        href="/financeiro/relatorio"
        className="flex w-fit items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
      >
        Ver histórico completo (6 meses)
        <ArrowRight className="h-3 w-3" />
      </Link>

      <MensalidadesList mensalidades={mensalidades} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-900/60">
              Inadimplência
            </h2>
            <Link href="/financeiro/inadimplencia" className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">
              Ver tudo
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {inadimplentes.length === 0 ? (
            <p className="text-sm text-ink-900/40">Nenhuma pendência. 🎉</p>
          ) : (
            <ul className="space-y-2">
              {inadimplentes.slice(0, 5).map((i) => (
                <li key={i.id} className="flex items-center justify-between text-sm">
                  <Link href={`/financeiro/${i.aluno_id}`} className="font-medium text-ink-950 hover:text-brand-700 hover:underline">
                    {i.aluno?.full_name ?? "—"}
                  </Link>
                  <StatusMensalidadeBadge status={i.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-900/60">
              Pagamento a professores/instrutores
            </h2>
            <Link href="/financeiro/professores" className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">
              Ver tudo
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recebedores.length === 0 ? (
            <p className="text-sm text-ink-900/40">
              Ninguém marcado como &ldquo;recebe pagamento&rdquo; ainda (em Configurações → Usuários).
            </p>
          ) : (
            <ul className="space-y-2">
              {recebedores.slice(0, 5).map((r) => {
                const pagamento = pagamentoPorProfessor.get(r.id);
                return (
                  <li key={r.id} className="flex items-center justify-between text-sm">
                    <Link href={`/financeiro/professores/${r.id}`} className="font-medium text-ink-950 hover:text-brand-700 hover:underline">
                      {r.full_name}
                    </Link>
                    {pagamento ? (
                      <StatusMensalidadeBadge status={pagamento.status} />
                    ) : (
                      <span className="text-xs text-ink-900/40">sem lançamento</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
