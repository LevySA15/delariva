import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { getRelatorioMensal } from "@/lib/queries/financeiro";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";

export default async function RelatorioFinanceiroPage() {
  const profile = await requireProfile();
  if (profile.role !== "dono") redirect("/financeiro");

  const supabase = await createClient();
  const meses = await getRelatorioMensal(supabase, 6);

  return (
    <div className="space-y-6">
      <PageHeader title="Relatório financeiro" subtitle="Recebido x pendente, últimos 6 meses" />

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
