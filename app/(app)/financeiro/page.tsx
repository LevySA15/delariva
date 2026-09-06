import { redirect } from "next/navigation";
import { Copy } from "lucide-react";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { listMensalidadesDoMes, getResumoFinanceiroPorAluno, getPixKey } from "@/lib/queries/financeiro";
import { getDependentes } from "@/lib/queries/dashboard";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardLink } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { MensalidadesList } from "./mensalidades-list";

export default async function FinanceiroPage() {
  const profile = await requireProfile();

  if (profile.role === "professor" || profile.role === "aluno_menor") {
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
  const mensalidades = await listMensalidadesDoMes(supabase);

  return (
    <div>
      <PageHeader
        title="Financeiro"
        subtitle="Mês atual"
        action={
          <div className="flex gap-2">
            <LinkButton href="/financeiro/relatorio" variant="secondary">
              Relatório
            </LinkButton>
            <LinkButton href="/financeiro/inadimplencia" variant="secondary">
              Inadimplência
            </LinkButton>
            <LinkButton href="/financeiro/planos" variant="secondary">
              Planos
            </LinkButton>
            <LinkButton href="/financeiro/nova">Lançar mensalidade</LinkButton>
          </div>
        }
      />

      <MensalidadesList mensalidades={mensalidades} />
    </div>
  );
}
