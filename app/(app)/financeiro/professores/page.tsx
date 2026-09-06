import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { listRecebedores, listPagamentosDoMes } from "@/lib/queries/pagamentos";
import { PageHeader } from "@/components/ui/page-header";
import { CardLink } from "@/components/ui/card";
import { StatusMensalidadeBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Users } from "lucide-react";

export default async function FinanceiroProfessoresPage() {
  const profile = await requireProfile();
  if (profile.role !== "dono") redirect("/financeiro");

  const supabase = await createClient();
  const [recebedores, pagamentosDoMes] = await Promise.all([
    listRecebedores(supabase),
    listPagamentosDoMes(supabase),
  ]);

  const pagamentoPorProfessor = new Map(pagamentosDoMes.map((p) => [p.professor_id, p]));

  return (
    <div className="space-y-6">
      <PageHeader title="Pagamento a professor/instrutor" subtitle="Mês atual" />

      {recebedores.length === 0 ? (
        <EmptyState
          icon={Users}
          message='Nenhum professor ou instrutor marcado como "recebe pagamento" ainda. Marque em Configurações → Usuários.'
        />
      ) : (
        <div className="space-y-2">
          {recebedores.map((r) => {
            const pagamento = pagamentoPorProfessor.get(r.id);
            return (
              <CardLink
                key={r.id}
                href={`/financeiro/professores/${r.id}`}
                className="flex items-center justify-between p-4"
              >
                <div>
                  <p className="font-semibold text-ink-950">{r.full_name}</p>
                  <p className="text-sm text-ink-900/50">
                    {r.role === "professor" ? "Professor" : "Aluno instrutor"}
                    {pagamento ? ` · R$ ${Number(pagamento.valor).toFixed(2)}` : " · sem lançamento este mês"}
                  </p>
                </div>
                {pagamento && <StatusMensalidadeBadge status={pagamento.status} />}
              </CardLink>
            );
          })}
        </div>
      )}
    </div>
  );
}
