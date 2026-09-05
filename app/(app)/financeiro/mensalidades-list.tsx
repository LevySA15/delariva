"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { StatusMensalidadeBadge } from "@/components/ui/status-badge";
import { inputClass } from "@/components/ui/field";
import { STATUS_MENSALIDADE_LABELS } from "@/lib/domain";
import type { listMensalidadesDoMes } from "@/lib/queries/financeiro";
import type { StatusMensalidade } from "@/lib/supabase/database.types";

type Mensalidade = Awaited<ReturnType<typeof listMensalidadesDoMes>>[number];

export function MensalidadesList({ mensalidades }: { mensalidades: Mensalidade[] }) {
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<StatusMensalidade | "todos">("todos");

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return mensalidades.filter((m) => {
      const bateBusca = !termo || (m.aluno?.full_name ?? "").toLowerCase().includes(termo);
      const bateStatus = status === "todos" || m.status === status;
      return bateBusca && bateStatus;
    });
  }, [mensalidades, busca, status]);

  if (mensalidades.length === 0) {
    return <EmptyState icon={Wallet} message="Nenhuma mensalidade lançada para este mês ainda." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <SearchInput value={busca} onChange={setBusca} placeholder="Buscar aluno..." className="max-w-xs flex-1" />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusMensalidade | "todos")}
          className={`${inputClass} w-auto`}
        >
          <option value="todos">Todos os status</option>
          {(Object.keys(STATUS_MENSALIDADE_LABELS) as StatusMensalidade[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_MENSALIDADE_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {filtradas.length === 0 ? (
        <EmptyState icon={Wallet} message="Nenhuma mensalidade bate com esse filtro." />
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
              {filtradas.map((m) => (
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
