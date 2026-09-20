"use client";

import { ChevronRight } from "lucide-react";
import { usePopup } from "./popup-provider";
import { PopupLoader } from "./popup-loader";
import { EmptyState } from "@/components/ui/empty-state";
import { FaixaBadge } from "@/components/ui/faixa-badge";
import { Badge } from "@/components/ui/badge";
import { StatusMensalidadeBadge } from "@/components/ui/status-badge";
import { DIAS_SEMANA_LABELS } from "@/lib/domain";
import {
  popupListaAlunos,
  popupListaProfessores,
  popupListaTurmas,
  popupListaMensalidadesPendentes,
  popupListaMensalidadesPagas,
  popupProjecaoPorAluno,
  popupMinhasTurmasProfessor,
  popupMeusAlunosProfessor,
  popupMinhasTurmasAluno,
  popupMembro,
  popupTurmaMini,
  popupMensalidadeMini,
  popupPagamentoProfessorMini,
} from "@/app/(app)/popup-actions";

type Pessoa = { id: string; full_name: string; faixa: { faixa: string; grau: number } | null };
type Turma = { id: string; nome: string; dias_semana: number[]; horario_inicio: string; horario_fim: string; faixa_etaria: string };
type MensalidadeComAluno = { id: string; aluno_id: string; valor: number | string; status: "pendente" | "atrasado" | "pago"; aluno: { full_name: string } | null };

function PessoaRow({ pessoa, onClick }: { pessoa: Pessoa; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-2.5 text-left text-sm transition hover:bg-ink-950/[0.03]"
    >
      <span className="font-medium text-ink-950">{pessoa.full_name}</span>
      <span className="flex items-center gap-2">
        {pessoa.faixa && <FaixaBadge faixa={pessoa.faixa.faixa} grau={pessoa.faixa.grau} />}
        <ChevronRight className="h-4 w-4 text-ink-900/30" />
      </span>
    </button>
  );
}

function TurmaRow({ turma, onClick }: { turma: Turma; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-2.5 text-left text-sm transition hover:bg-ink-950/[0.03]"
    >
      <div>
        <p className="font-medium text-ink-950">{turma.nome}</p>
        <p className="text-xs text-ink-900/50">
          {turma.dias_semana.map((d) => DIAS_SEMANA_LABELS[d]).join(", ")} · {turma.horario_inicio.slice(0, 5)}
        </p>
      </div>
      <span className="flex items-center gap-2">
        <Badge tone={turma.faixa_etaria === "adulto" ? "ink" : "brand"}>
          {turma.faixa_etaria === "adulto" ? "Adulto" : "Infantil"}
        </Badge>
        <ChevronRight className="h-4 w-4 text-ink-900/30" />
      </span>
    </button>
  );
}

export function useOpenMembro() {
  const { push } = usePopup();
  return (id: string, nome: string, href?: string) =>
    push({ title: nome, href: href ?? `/membros/${id}`, content: <MembroMiniContent id={id} /> });
}

export function useOpenTurma() {
  const { push } = usePopup();
  return (id: string, nome: string) =>
    push({ title: nome, href: `/aulas/${id}`, content: <TurmaMiniContent turmaId={id} /> });
}

export function useOpenFinanceiroAluno() {
  const { push } = usePopup();
  return (id: string, nome: string) =>
    push({ title: nome, href: `/financeiro/${id}`, content: <MensalidadeMiniContent alunoId={id} /> });
}

export function useOpenPagamentoProfessor() {
  const { push } = usePopup();
  return (id: string, nome: string) =>
    push({ title: nome, href: `/financeiro/professores/${id}`, content: <PagamentoProfessorMiniContent professorId={id} /> });
}

function MensalidadeRow({ mensalidade, onClick }: { mensalidade: MensalidadeComAluno; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-2.5 text-left text-sm transition hover:bg-ink-950/[0.03]"
    >
      <div>
        <p className="font-medium text-ink-950">{mensalidade.aluno?.full_name ?? "—"}</p>
        <p className="text-xs text-ink-900/50">R$ {Number(mensalidade.valor).toFixed(2)}</p>
      </div>
      <span className="flex items-center gap-2">
        <StatusMensalidadeBadge status={mensalidade.status} />
        <ChevronRight className="h-4 w-4 text-ink-900/30" />
      </span>
    </button>
  );
}

export function AlunosPopupContent() {
  const abrirMembro = useOpenMembro();
  return (
    <PopupLoader
      load={popupListaAlunos}
      render={(alunos) =>
        alunos.length === 0 ? (
          <EmptyState message="Nenhum aluno cadastrado ainda." />
        ) : (
          <div className="divide-y divide-ink-900/5">
            {alunos.map((a) => (
              <PessoaRow key={a.id} pessoa={a} onClick={() => abrirMembro(a.id, a.full_name)} />
            ))}
          </div>
        )
      }
    />
  );
}

export function ProfessoresPopupContent() {
  const abrirMembro = useOpenMembro();
  return (
    <PopupLoader
      load={popupListaProfessores}
      render={(professores) =>
        professores.length === 0 ? (
          <EmptyState message="Nenhum professor cadastrado ainda." />
        ) : (
          <div className="divide-y divide-ink-900/5">
            {professores.map((p) => (
              <PessoaRow key={p.id} pessoa={p} onClick={() => abrirMembro(p.id, p.full_name)} />
            ))}
          </div>
        )
      }
    />
  );
}

export function TurmasPopupContent() {
  const abrirTurma = useOpenTurma();
  return (
    <PopupLoader
      load={popupListaTurmas}
      render={(turmas) =>
        turmas.length === 0 ? (
          <EmptyState message="Nenhuma turma cadastrada ainda." />
        ) : (
          <div className="divide-y divide-ink-900/5">
            {turmas.map((t) => (
              <TurmaRow key={t.id} turma={t} onClick={() => abrirTurma(t.id, t.nome)} />
            ))}
          </div>
        )
      }
    />
  );
}

export function MinhasTurmasPopupContent({ tipo, id }: { tipo: "professor" | "aluno"; id: string }) {
  const abrirTurma = useOpenTurma();
  const load = tipo === "professor" ? () => popupMinhasTurmasProfessor(id) : () => popupMinhasTurmasAluno(id);
  return (
    <PopupLoader
      load={load}
      render={(turmas) =>
        turmas.length === 0 ? (
          <EmptyState message="Nenhuma turma no momento." />
        ) : (
          <div className="divide-y divide-ink-900/5">
            {turmas.map((t) => (
              <TurmaRow key={t.id} turma={t} onClick={() => abrirTurma(t.id, t.nome)} />
            ))}
          </div>
        )
      }
    />
  );
}

export function MeusAlunosPopupContent({ professorId }: { professorId: string }) {
  const abrirMembro = useOpenMembro();
  return (
    <PopupLoader
      load={() => popupMeusAlunosProfessor(professorId)}
      render={(alunos) =>
        alunos.length === 0 ? (
          <EmptyState message="Nenhum aluno nas suas turmas ainda." />
        ) : (
          <div className="divide-y divide-ink-900/5">
            {alunos.map((a) => (
              <PessoaRow key={a.id} pessoa={a} onClick={() => abrirMembro(a.id, a.full_name)} />
            ))}
          </div>
        )
      }
    />
  );
}

export function MensalidadesPendentesPopupContent() {
  const abrirFinanceiro = useOpenFinanceiroAluno();
  return (
    <PopupLoader
      load={popupListaMensalidadesPendentes}
      render={(mensalidades) =>
        mensalidades.length === 0 ? (
          <EmptyState message="Nenhuma pendência este mês. 🎉" />
        ) : (
          <div className="divide-y divide-ink-900/5">
            {mensalidades.map((m) => (
              <MensalidadeRow key={m.id} mensalidade={m} onClick={() => abrirFinanceiro(m.aluno_id, m.aluno?.full_name ?? "Aluno")} />
            ))}
          </div>
        )
      }
    />
  );
}

export function MensalidadesPagasPopupContent() {
  const abrirFinanceiro = useOpenFinanceiroAluno();
  return (
    <PopupLoader
      load={popupListaMensalidadesPagas}
      render={(mensalidades) =>
        mensalidades.length === 0 ? (
          <EmptyState message="Nenhum pagamento registrado este mês ainda." />
        ) : (
          <div className="divide-y divide-ink-900/5">
            {mensalidades.map((m) => (
              <MensalidadeRow key={m.id} mensalidade={m} onClick={() => abrirFinanceiro(m.aluno_id, m.aluno?.full_name ?? "Aluno")} />
            ))}
          </div>
        )
      }
    />
  );
}

export function ProjecaoPopupContent() {
  const abrirFinanceiro = useOpenFinanceiroAluno();
  return (
    <PopupLoader
      load={popupProjecaoPorAluno}
      render={(projecao) =>
        projecao.length === 0 ? (
          <EmptyState message="Nenhuma mensalidade recorrente lançada ainda." />
        ) : (
          <div className="divide-y divide-ink-900/5">
            {projecao.map((p) => (
              <button
                key={p.aluno_id}
                type="button"
                onClick={() => abrirFinanceiro(p.aluno_id, p.full_name)}
                className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-2.5 text-left text-sm transition hover:bg-ink-950/[0.03]"
              >
                <span className="font-medium text-ink-950">{p.full_name}</span>
                <span className="flex items-center gap-2">
                  <span className="text-sm text-ink-900/60">R$ {p.valor.toFixed(2)}</span>
                  <ChevronRight className="h-4 w-4 text-ink-900/30" />
                </span>
              </button>
            ))}
          </div>
        )
      }
    />
  );
}

function MembroMiniContent({ id }: { id: string }) {
  return (
    <PopupLoader
      load={() => popupMembro(id)}
      render={(membro) =>
        !membro ? (
          <EmptyState message="Membro não encontrado." />
        ) : (
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-ink-950">{membro.full_name}</p>
              {membro.faixa && (
                <div className="mt-1.5">
                  <FaixaBadge faixa={membro.faixa.faixa} grau={membro.faixa.grau} />
                </div>
              )}
            </div>
            {membro.turmasLeciona.length > 0 && (
              <p className="text-sm text-ink-900/70">
                <span className="font-medium text-ink-950">Leciona: </span>
                {membro.turmasLeciona.join(", ")}
              </p>
            )}
            {membro.turmasMatriculado.length > 0 && (
              <p className="text-sm text-ink-900/70">
                <span className="font-medium text-ink-950">Matriculado em: </span>
                {membro.turmasMatriculado.join(", ")}
              </p>
            )}
          </div>
        )
      }
    />
  );
}

function TurmaMiniContent({ turmaId }: { turmaId: string }) {
  const abrirMembro = useOpenMembro();
  return (
    <PopupLoader
      load={() => popupTurmaMini(turmaId)}
      render={({ turma, professores, alunos }) =>
        !turma ? (
          <EmptyState message="Turma não encontrada." />
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-ink-900/50">
              {turma.dias_semana.map((d) => DIAS_SEMANA_LABELS[d]).join(", ")} ·{" "}
              {turma.horario_inicio.slice(0, 5)} às {turma.horario_fim.slice(0, 5)}
            </p>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-900/50">Professores</p>
              {professores.length === 0 ? (
                <p className="text-sm text-ink-900/40">Nenhum.</p>
              ) : (
                <div className="divide-y divide-ink-900/5">
                  {professores.map((p) => (
                    <PessoaRow key={p.id} pessoa={{ ...p, faixa: null }} onClick={() => abrirMembro(p.id, p.full_name)} />
                  ))}
                </div>
              )}
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-900/50">
                Alunos ({alunos.length})
              </p>
              {alunos.length === 0 ? (
                <p className="text-sm text-ink-900/40">Nenhum.</p>
              ) : (
                <div className="divide-y divide-ink-900/5">
                  {alunos.map((a) => (
                    <PessoaRow key={a.id} pessoa={{ ...a, faixa: null }} onClick={() => abrirMembro(a.id, a.full_name)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      }
    />
  );
}

function MensalidadeMiniContent({ alunoId }: { alunoId: string }) {
  return (
    <PopupLoader
      load={() => popupMensalidadeMini(alunoId)}
      render={({ aluno, mensalidade }) =>
        !aluno ? (
          <EmptyState message="Aluno não encontrado." />
        ) : (
          <div className="space-y-3">
            <p className="font-semibold text-ink-950">{aluno.full_name}</p>
            {mensalidade ? (
              <div className="flex items-center justify-between rounded-md border border-ink-900/10 p-3">
                <p className="text-sm text-ink-900/70">R$ {Number(mensalidade.valor).toFixed(2)} · mês atual</p>
                <StatusMensalidadeBadge status={mensalidade.status} />
              </div>
            ) : (
              <p className="text-sm text-ink-900/40">Nenhuma mensalidade lançada este mês.</p>
            )}
          </div>
        )
      }
    />
  );
}

function PagamentoProfessorMiniContent({ professorId }: { professorId: string }) {
  return (
    <PopupLoader
      load={() => popupPagamentoProfessorMini(professorId)}
      render={({ professor, pagamento }) =>
        !professor ? (
          <EmptyState message="Professor não encontrado." />
        ) : (
          <div className="space-y-3">
            <p className="font-semibold text-ink-950">{professor.full_name}</p>
            {pagamento ? (
              <div className="flex items-center justify-between rounded-md border border-ink-900/10 p-3">
                <p className="text-sm text-ink-900/70">R$ {Number(pagamento.valor).toFixed(2)} · mês atual</p>
                <StatusMensalidadeBadge status={pagamento.status} />
              </div>
            ) : (
              <p className="text-sm text-ink-900/40">Nenhum pagamento lançado este mês.</p>
            )}
          </div>
        )
      }
    />
  );
}
