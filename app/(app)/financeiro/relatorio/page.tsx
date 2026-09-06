import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { getRelatorioMensal, getProjecaoRecorrente } from "@/lib/queries/financeiro";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";

export default async function RelatorioFinanceiroPage() {
  const profile = await requireProfile();
  if (profile.role !== "dono") redirect("/financeiro");

  const supabase = await createClient();
  const [meses, projecao] = await Promise.all([
    getRelatorioMensal(supabase, 6),
    getProjecaoRecorrente(supabase),
  ]);

  const mesAtual = meses[meses.length - 1];

  return (
    <div className="space-y-6">
      <PageHeader title="Relatório financeiro" subtitle="Recebido x pendente, últimos 6 meses" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-900/50">Recebido este mês</p>
          <p className="mt-1 font-display text-2xl font-bold text-emerald-700">
            R$ {mesAtual.recebido.toFixed(2)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-900/50">Pendente este mês</p>
          <p className="mt-1 font-display text-2xl font-bold text-brand-700">
            R$ {mesAtual.pendente.toFixed(2)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-900/50">Projeção recorrente/mês</p>
          <p className="mt-1 font-display text-2xl font-bold text-ink-950">R$ {projecao.toFixed(2)}</p>
          <p className="mt-1 text-xs text-ink-900/40">Soma do último valor lançado por aluno com mensalidade recorrente.</p>
        </Card>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-900/10 bg-ink-950/[0.02] text-left text-xs font-semibold uppercase tracking-wide text-ink-900/50">
            <tr>
              <th className="px-4 py-3">Mês</th>
              <th className="px-4 py-3">Recebido</th>
              <th className="px-4 py-3">Pendente/atrasado</th>
              <th className="px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {meses.map((m) => (
              <tr key={m.label} className="border-b border-ink-900/5 last:border-0">
                <td className="px-4 py-3 font-medium capitalize text-ink-950">{m.label}</td>
                <td className="px-4 py-3 text-emerald-700">R$ {m.recebido.toFixed(2)}</td>
                <td className="px-4 py-3 text-brand-700">R$ {m.pendente.toFixed(2)}</td>
                <td className="px-4 py-3 text-ink-900/50">R$ {(m.recebido + m.pendente).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
