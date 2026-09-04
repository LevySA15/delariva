import { notFound } from "next/navigation";
import { X, Clock, CalendarCheck, ClipboardList } from "lucide-react";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import {
  getAlunosDaTurma,
  getHistoricoPresencaAluno,
  getPresencasDaAula,
  getProfessoresDaTurma,
  getOrCreateAulaHoje,
  getTurma,
  listAlunos,
  listProfessores,
  todayISO,
} from "@/lib/queries/turmas";
import { DIAS_SEMANA_LABELS } from "@/lib/domain";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  adicionarProfessor,
  desmatricularAluno,
  matricularAluno,
  registrarPresenca,
  removerProfessor,
} from "./actions";

export default async function TurmaDetailPage({
  params,
}: {
  params: Promise<{ turmaId: string }>;
}) {
  const { turmaId } = await params;
  const profile = await requireProfile();
  const supabase = await createClient();

  const turma = await getTurma(supabase, turmaId);
  if (!turma) notFound();

  const [professores, alunos] = await Promise.all([
    getProfessoresDaTurma(supabase, turmaId),
    getAlunosDaTurma(supabase, turmaId),
  ]);

  const souProfessorDaTurma = professores.some((p) => p.id === profile.id);
  const podeGerenciar = profile.role === "dono";
  const podeFazerCheckin = podeGerenciar || souProfessorDaTurma;

  return (
    <div className="space-y-8">
      <PageHeader
        title={turma.nome}
        subtitle={`${turma.dias_semana.map((d) => DIAS_SEMANA_LABELS[d]).join(", ")} · ${turma.horario_inicio.slice(0, 5)} às ${turma.horario_fim.slice(0, 5)} · ${turma.faixa_etaria === "adulto" ? "Adulto" : "Infantil"}`}
      />

      <section>
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-ink-900/60">Professores</h2>
        <ul className="mb-3 flex flex-wrap gap-2">
          {professores.map((p) => (
            <li key={p.id}>
              <Badge tone="ink" className="gap-2 py-1 pl-3 pr-1.5 text-[13px]">
                {p.full_name}
                {podeGerenciar && (
                  <form action={removerProfessor.bind(null, turmaId, p.id)}>
                    <button type="submit" className="rounded-full p-0.5 text-white/50 hover:bg-white/10 hover:text-white">
                      <X className="h-3 w-3" />
                    </button>
                  </form>
                )}
              </Badge>
            </li>
          ))}
          {professores.length === 0 && <li className="text-sm text-ink-900/40">Nenhum professor atribuído.</li>}
        </ul>
        {podeGerenciar && <AdicionarProfessorForm supabase={supabase} turmaId={turmaId} jaAtribuidos={professores.map((p) => p.id)} />}
      </section>

      <section>
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-ink-900/60">
          Alunos matriculados ({alunos.length})
        </h2>
        {(podeGerenciar || souProfessorDaTurma) && (
          <ul className="mb-3 space-y-1.5">
            {alunos.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-md border border-ink-900/10 bg-white px-3 py-2 text-sm text-ink-950"
              >
                {a.full_name}
                {podeGerenciar && (
                  <form action={desmatricularAluno.bind(null, turmaId, a.id)}>
                    <button type="submit" className="text-xs font-medium text-ink-900/40 hover:text-brand-700">
                      remover
                    </button>
                  </form>
                )}
              </li>
            ))}
            {alunos.length === 0 && <li className="text-sm text-ink-900/40">Nenhum aluno matriculado.</li>}
          </ul>
        )}
        {podeGerenciar && <MatricularAlunoForm supabase={supabase} turmaId={turmaId} jaMatriculados={alunos.map((a) => a.id)} />}
      </section>

      {podeFazerCheckin && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wide text-ink-900/60">
            <CalendarCheck className="h-4 w-4 text-brand-600" />
            Chamada de hoje ({todayISO()})
          </h2>
          <CheckinForm supabase={supabase} turmaId={turmaId} alunos={alunos} />
        </section>
      )}

      {(profile.role === "aluno" || profile.role === "aluno_menor") && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wide text-ink-900/60">
            <ClipboardList className="h-4 w-4 text-brand-600" />
            Minha frequência
          </h2>
          <HistoricoPresenca supabase={supabase} turmaId={turmaId} alunoId={profile.id} />
        </section>
      )}
    </div>
  );
}

async function AdicionarProfessorForm({
  supabase,
  turmaId,
  jaAtribuidos,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  turmaId: string;
  jaAtribuidos: string[];
}) {
  const professores = await listProfessores(supabase);
  const disponiveis = professores.filter((p) => !jaAtribuidos.includes(p.id));

  if (disponiveis.length === 0) return null;

  return (
    <form action={adicionarProfessor.bind(null, turmaId)} className="flex max-w-sm gap-2">
      <select name="professor_id" className="flex-1 rounded-md border border-ink-900/15 bg-white px-3 py-1.5 text-sm">
        {disponiveis.map((p) => (
          <option key={p.id} value={p.id}>
            {p.full_name}
          </option>
        ))}
      </select>
      <Button type="submit" variant="secondary" size="sm">
        Adicionar
      </Button>
    </form>
  );
}

async function MatricularAlunoForm({
  supabase,
  turmaId,
  jaMatriculados,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  turmaId: string;
  jaMatriculados: string[];
}) {
  const alunos = await listAlunos(supabase);
  const disponiveis = alunos.filter((a) => !jaMatriculados.includes(a.id));

  if (disponiveis.length === 0) return null;

  return (
    <form action={matricularAluno.bind(null, turmaId)} className="flex max-w-sm gap-2">
      <select name="aluno_id" className="flex-1 rounded-md border border-ink-900/15 bg-white px-3 py-1.5 text-sm">
        {disponiveis.map((a) => (
          <option key={a.id} value={a.id}>
            {a.full_name}
          </option>
        ))}
      </select>
      <Button type="submit" variant="secondary" size="sm">
        Matricular
      </Button>
    </form>
  );
}

async function CheckinForm({
  supabase,
  turmaId,
  alunos,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  turmaId: string;
  alunos: { id: string; full_name: string }[];
}) {
  if (alunos.length === 0) {
    return <EmptyState message="Matricule alunos para poder fazer a chamada." />;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const aula = await getOrCreateAulaHoje(supabase, turmaId, user?.id ?? null);
  const presencas = await getPresencasDaAula(supabase, aula.id);
  const presentesHoje = new Set(presencas.filter((p) => p.presente).map((p) => p.aluno_id));

  return (
    <form
      action={registrarPresenca.bind(null, turmaId)}
      className="space-y-1 rounded-lg border border-ink-900/10 bg-white p-4 shadow-sm"
    >
      {alunos.map((a) => (
        <label
          key={a.id}
          className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-ink-900/80 hover:bg-ink-950/[0.03]"
        >
          <input type="hidden" name="aluno_id" value={a.id} />
          <input type="checkbox" name="presente" value={a.id} defaultChecked={presentesHoje.has(a.id)} className="h-4 w-4 accent-brand-600" />
          {a.full_name}
        </label>
      ))}
      <Button type="submit" size="sm" className="mt-2">
        Salvar chamada
      </Button>
    </form>
  );
}

async function HistoricoPresenca({
  supabase,
  turmaId,
  alunoId,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  turmaId: string;
  alunoId: string;
}) {
  const historico = await getHistoricoPresencaAluno(supabase, turmaId, alunoId);

  if (historico.length === 0) {
    return <EmptyState message="Ainda sem registros de presença nesta turma." />;
  }

  return (
    <ul className="space-y-1.5">
      {historico.map((h) => (
        <li
          key={h.aulaId}
          className="flex items-center justify-between rounded-md border border-ink-900/10 bg-white px-3 py-2 text-sm"
        >
          <span className="flex items-center gap-1.5 text-ink-900/70">
            <Clock className="h-3.5 w-3.5" />
            {new Date(h.data + "T00:00:00").toLocaleDateString("pt-BR")}
          </span>
          <Badge tone={h.presente ? "success" : "danger"}>{h.presente ? "Presente" : "Faltou"}</Badge>
        </li>
      ))}
    </ul>
  );
}
