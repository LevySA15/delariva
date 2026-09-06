import { notFound, redirect } from "next/navigation";
import { Banknote } from "lucide-react";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { getPagamentos } from "@/lib/queries/pagamentos";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusMensalidadeBadge } from "@/components/ui/status-badge";
import { inputClass } from "@/components/ui/field";
import { marcarPagamentoPago, marcarPagamentoStatus } from "../actions";
import { NovaPagamentoForm } from "./nova-pagamento-form";

export default async function FinanceiroProfessorPage({
  params,
}: {
  params: Promise<{ professorId: string }>;
}) {
  const { professorId } = await params;
  const profile = await requireProfile();

  const podeGerenciar = profile.role === "dono";
  if (!podeGerenciar && profile.id !== professorId) {
    redirect("/financeiro");
  }

  const supabase = await createClient();
  const { data: recebedor } = await supabase
    .from("profiles")
    .select("id, full_name, recebe_pagamento")
    .eq("id", professorId)
    .single();
  if (!recebedor || !recebedor.recebe_pagamento) notFound();

  const pagamentos = await getPagamentos(supabase, professorId);

  return (
    <div className="space-y-6">
      <PageHeader title="Pagamentos" subtitle={recebedor.full_name} />

      {podeGerenciar && <NovaPagamentoForm professorId={professorId} />}

      {pagamentos.length === 0 ? (
        <EmptyState icon={Banknote} message="Nenhum pagamento lançado ainda." />
      ) : (
        <div className="space-y-2">
          {pagamentos.map((p) => (
            <Card key={p.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-ink-950">
                    {new Date(`${p.mes_referencia}T00:00:00`).toLocaleDateString("pt-BR", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-ink-900/50">R$ {Number(p.valor).toFixed(2)}</p>
                </div>
                <StatusMensalidadeBadge status={p.status} />
              </div>

              {podeGerenciar && p.status !== "pago" && (
                <form action={marcarPagamentoPago.bind(null, p.id, professorId)} className="mt-3 flex gap-2">
                  <input name="forma_pagamento" placeholder="Forma de pagamento" className={`flex-1 ${inputClass}`} />
                  <Button type="submit" size="sm" variant="success">
                    Marcar pago
                  </Button>
                </form>
              )}

              {podeGerenciar && p.status === "pago" && (
                <form action={marcarPagamentoStatus.bind(null, p.id, professorId, "pendente")} className="mt-3">
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
