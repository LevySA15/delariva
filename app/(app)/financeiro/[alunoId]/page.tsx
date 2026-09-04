import { notFound, redirect } from "next/navigation";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { getMensalidades } from "@/lib/queries/financeiro";
import { STATUS_MENSALIDADE_LABELS } from "@/lib/domain";
import { marcarPago, marcarStatus } from "../actions";

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
  const { data: aluno } = await supabase.from("profiles").select("id, full_name").eq("id", alunoId).single();
  if (!aluno) notFound();

  const mensalidades = await getMensalidades(supabase, alunoId);
  const podeGerenciar = profile.role === "dono";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Financeiro · {aluno.full_name}</h1>

      {mensalidades.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhuma mensalidade lançada ainda.</p>
      ) : (
        <ul className="space-y-2">
          {mensalidades.map((m) => (
            <li key={m.id} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-neutral-900">
                    {new Date(m.mes_referencia + "T00:00:00").toLocaleDateString("pt-BR", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {m.plano?.nome ?? "Sem plano"} · R$ {Number(m.valor).toFixed(2)}
                  </p>
                </div>
                <StatusBadge status={m.status} />
              </div>

              {podeGerenciar && m.status !== "pago" && (
                <form action={marcarPago.bind(null, m.id, alunoId)} className="mt-3 flex gap-2">
                  <input
                    name="forma_pagamento"
                    placeholder="Forma de pagamento"
                    className="flex-1 rounded-md border border-neutral-300 px-2 py-1 text-sm"
                  />
                  <button type="submit" className="rounded-md bg-emerald-700 px-3 py-1 text-sm text-white hover:bg-emerald-600">
                    Marcar pago
                  </button>
                </form>
              )}

              {podeGerenciar && m.status === "pago" && (
                <form action={marcarStatus.bind(null, m.id, alunoId, "pendente")} className="mt-3">
                  <button type="submit" className="text-xs text-neutral-400 hover:text-red-600">
                    desfazer pagamento
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: "pago" | "pendente" | "atrasado" }) {
  const colors = {
    pago: "bg-emerald-100 text-emerald-700",
    pendente: "bg-amber-100 text-amber-700",
    atrasado: "bg-red-100 text-red-700",
  } as const;
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs ${colors[status]}`}>
      {STATUS_MENSALIDADE_LABELS[status]}
    </span>
  );
}
