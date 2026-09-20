"use client";

import { useOpenFinanceiroAluno, useOpenPagamentoProfessor } from "@/components/popup/popup-contents";
import { StatusMensalidadeBadge } from "@/components/ui/status-badge";
import type { listInadimplencia } from "@/lib/queries/financeiro";
import type { listRecebedores, listPagamentosDoMes } from "@/lib/queries/pagamentos";

type Inadimplente = Awaited<ReturnType<typeof listInadimplencia>>[number];
type Recebedor = Awaited<ReturnType<typeof listRecebedores>>[number];
type PagamentoDoMes = Awaited<ReturnType<typeof listPagamentosDoMes>>[number];

export function InadimplenciaRows({ inadimplentes }: { inadimplentes: Inadimplente[] }) {
  const abrirFinanceiro = useOpenFinanceiroAluno();
  return (
    <ul className="space-y-2">
      {inadimplentes.slice(0, 5).map((i) => (
        <li key={i.id} className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => abrirFinanceiro(i.aluno_id, i.aluno?.full_name ?? "Aluno")}
            className="font-medium text-ink-950 hover:text-brand-700 hover:underline"
          >
            {i.aluno?.full_name ?? "—"}
          </button>
          <StatusMensalidadeBadge status={i.status} />
        </li>
      ))}
    </ul>
  );
}

export function PagamentosProfessorRows({
  recebedores,
  pagamentosDoMes,
}: {
  recebedores: Recebedor[];
  pagamentosDoMes: PagamentoDoMes[];
}) {
  const abrirPagamento = useOpenPagamentoProfessor();
  const pagamentoPorProfessor = new Map(pagamentosDoMes.map((p) => [p.professor_id, p]));

  return (
    <ul className="space-y-2">
      {recebedores.slice(0, 5).map((r) => {
        const pagamento = pagamentoPorProfessor.get(r.id);
        return (
          <li key={r.id} className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => abrirPagamento(r.id, r.full_name)}
              className="font-medium text-ink-950 hover:text-brand-700 hover:underline"
            >
              {r.full_name}
            </button>
            {pagamento ? (
              <StatusMensalidadeBadge status={pagamento.status} />
            ) : (
              <span className="text-xs text-ink-900/40">sem lançamento</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
