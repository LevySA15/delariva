import { redirect } from "next/navigation";
import Link from "next/link";
import { Wallet } from "lucide-react";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { listMensalidadesDoMes } from "@/lib/queries/financeiro";
import { getDependentes } from "@/lib/queries/dashboard";
import { PageHeader } from "@/components/ui/page-header";
import { CardLink, Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusMensalidadeBadge } from "@/components/ui/status-badge";

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
    return (
      <div>
        <PageHeader title="Financeiro" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {dependentes.map((d) => (
            <CardLink key={d.id} href={`/financeiro/${d.id}`} className="p-4 font-medium text-ink-950">
              {d.full_name}
            </CardLink>
          ))}
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
            <LinkButton href="/financeiro/planos" variant="secondary">
              Planos
            </LinkButton>
            <LinkButton href="/financeiro/nova">Lançar mensalidade</LinkButton>
          </div>
        }
      />

      {mensalidades.length === 0 ? (
        <EmptyState icon={Wallet} message="Nenhuma mensalidade lançada para este mês ainda." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-900/10 bg-ink-950/[0.02] text-left text-xs font-semibold uppercase tracking-wide text-ink-900/50">
              <tr>
                <th className="px-4 py-3">Aluno</th>
                <th className="px-4 py-3">Plano</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {mensalidades.map((m) => (
                <tr key={m.id} className="border-b border-ink-900/5 last:border-0 hover:bg-ink-950/[0.015]">
                  <td className="px-4 py-3">
                    <Link href={`/financeiro/${m.aluno_id}`} className="font-medium text-ink-950 hover:text-brand-700 hover:underline">
                      {m.aluno?.full_name ?? "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-900/50">{m.plano?.nome ?? "—"}</td>
                  <td className="px-4 py-3 font-medium text-ink-950">R$ {Number(m.valor).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <StatusMensalidadeBadge status={m.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
