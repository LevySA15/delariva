import Link from "next/link";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { listMensalidadesDoMes } from "@/lib/queries/financeiro";
import { getDependentes } from "@/lib/queries/dashboard";
import { STATUS_MENSALIDADE_LABELS } from "@/lib/domain";

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
        <h1 className="mb-6 text-2xl font-bold text-neutral-900">Financeiro</h1>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {dependentes.map((d) => (
            <Link
              key={d.id}
              href={`/financeiro/${d.id}`}
              className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-red-300"
            >
              {d.full_name}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // dono
  const mensalidades = await listMensalidadesDoMes(supabase);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Financeiro · mês atual</h1>
        <div className="flex gap-2">
          <Link href="/financeiro/planos" className="rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50">
            Planos
          </Link>
          <Link href="/financeiro/nova" className="rounded-md bg-red-700 px-3 py-2 text-sm font-medium text-white hover:bg-red-600">
            Lançar mensalidade
          </Link>
        </div>
      </div>

      {mensalidades.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhuma mensalidade lançada para este mês ainda.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-neutral-500">
              <tr>
                <th className="px-4 py-2">Aluno</th>
                <th className="px-4 py-2">Plano</th>
                <th className="px-4 py-2">Valor</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {mensalidades.map((m) => (
                <tr key={m.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-2">
                    <Link href={`/financeiro/${m.aluno_id}`} className="hover:underline">
                      {m.aluno?.full_name ?? "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-neutral-500">{m.plano?.nome ?? "—"}</td>
                  <td className="px-4 py-2">R$ {Number(m.valor).toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={m.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
