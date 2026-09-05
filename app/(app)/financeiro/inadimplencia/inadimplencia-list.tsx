"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { StatusMensalidadeBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { STATUS_MENSALIDADE_LABELS } from "@/lib/domain";
import { baixarCsv } from "@/lib/csv";
import type { listInadimplencia } from "@/lib/queries/financeiro";

type Item = Awaited<ReturnType<typeof listInadimplencia>>[number];

export function InadimplenciaList({ itens }: { itens: Item[] }) {
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return termo ? itens.filter((i) => (i.aluno?.full_name ?? "").toLowerCase().includes(termo)) : itens;
  }, [itens, busca]);

  const totalDevido = filtrados.reduce((soma, i) => soma + Number(i.valor), 0);

  function exportar() {
    baixarCsv(
      `inadimplencia-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Aluno", "Plano", "Mês de referência", "Valor", "Status"],
      filtrados.map((i) => [
        i.aluno?.full_name ?? "",
        i.plano?.nome ?? "",
        i.mes_referencia,
        Number(i.valor).toFixed(2),
        STATUS_MENSALIDADE_LABELS[i.status],
      ]),
    );
  }

  if (itens.length === 0) {
    return <EmptyState icon={AlertTriangle} message="Nenhuma mensalidade pendente ou atrasada nesse período. 🎉" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput value={busca} onChange={setBusca} placeholder="Buscar aluno..." className="max-w-xs flex-1" />
        <Button type="button" variant="secondary" size="sm" onClick={exportar} className="ml-auto">
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <Card className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-900/50">Total em aberto</p>
        <p className="font-display text-2xl font-bold text-brand-700">R$ {totalDevido.toFixed(2)}</p>
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-900/10 bg-ink-950/[0.02] text-left text-xs font-semibold uppercase tracking-wide text-ink-900/50">
            <tr>
              <th className="px-4 py-3">Aluno</th>
              <th className="px-4 py-3">Mês</th>
              <th className="px-4 py-3">Plano</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((i) => (
              <tr key={i.id} className="border-b border-ink-900/5 last:border-0 hover:bg-ink-950/[0.015]">
                <td className="px-4 py-3">
                  <Link href={`/financeiro/${i.aluno_id}`} className="font-medium text-ink-950 hover:text-brand-700 hover:underline">
                    {i.aluno?.full_name ?? "—"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-900/50">
                  {new Date(i.mes_referencia + "T00:00:00").toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                </td>
                <td className="px-4 py-3 text-ink-900/50">{i.plano?.nome ?? "—"}</td>
                <td className="px-4 py-3 font-medium text-ink-950">R$ {Number(i.valor).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <StatusMensalidadeBadge status={i.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
