import Link from "next/link";
import { notFound } from "next/navigation";
import { X, Clock, CalendarCheck, ClipboardList, Hourglass, QrCode } from "lucide-react";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import {
  getAlunosDaTurma,
  getHistoricoPresencaAluno,
  getListaEspera,
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
import { inputClass } from "@/components/ui/field";
import {
  adicionarProfessor,
  atualizarCapacidade,
  desmatricularAluno,
  matricularAluno,
  promoverDaListaEspera,
  registrarPresenca,
  removerDaListaEspera,
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

  const [professores, alunos, listaEspera] = await Promise.all([
    getProfessoresDaTurma(supabase, turmaId),
    getAlunosDaTurma(supabase, turmaId),
    getListaEspera(supabase, turmaId),
  ]);

  const souProfessorDaTurma = professores.some((p) => p.id === profile.id);
  const podeGerenciar = profile.role === "dono";
  const podeFazerCheckin = podeGerenciar || souProfessorDaTurma;
  const turmaCheia = turma.capacidade_maxima !== null && alunos.length >= turma.capacidade_maxima;

  const subtitlePartes = [
    turma.dias_semana.map((d) => DIAS_SEMANA_LABELS[d]).join(", "),
    `${turma.horario_inicio.slice(0, 5)} às ${turma.horario_fim.slice(0, 5)}`,
    turma.faixa_etaria === "adulto" ? "Adulto" : "Infantil",
    turma.capacidade_maxima !== null ? `${alunos.length}/${turma.capacidade_maxima} vagas` : null,
  ].filter(Boolean);

  return (
    <div className="space-y-8">
      <PageHeader title={turma.nome} subtitle={subtitlePartes.join(" · ")} />

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
          Alunos matriculados ({alunos.length}
          {turma.capacidade_maxima !== null ? `/${turma.capacidade_maxima}` : ""})
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
        {podeGerenciar && (
          <div className="space-y-3">
            <MatricularAlunoForm
              supabase={supabase}
              turmaId={turmaId}
              jaMatriculados={alunos.map((a) => a.id)}
              jaNaEspera={listaEspera.map((l) => l.aluno_id)}
              turmaCheia={turmaCheia}
            />
            <form
              action={atualizarCapacidade.bind(null, turmaId)}
              className="flex max-w-sm items-end gap-2"
            >
              <label className="flex-1 space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-900/50">
                  Capacidade máxima de vagas
                </span>
                <input
                  name="capacidade_maxima"
                  type="number"
                  min={1}
                  defaultValue={turma.capacidade_maxima ?? ""}
                  placeholder="Sem limite"
                  className={inputClass}
                />
              </label>
              <Button type="submit" variant="secondary" size="sm">
                Salvar
              </Button>
            </form>
          </div>
        )}
      </section>

      {listaEspera.length > 0 && (podeGerenciar || souProfessorDaTurma) && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wide text-ink-900/60">
            <Hourglass className="h-4 w-4 text-brand-600" />
            Lista de espera ({listaEspera.length})
          </h2>
          <ul className="space-y-1.5">
            {listaEspera.map((item, i) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-md border border-ink-900/10 bg-white px-3 py-2 text-sm text-ink-950"
              >
                <span>
                  <span className="mr-2 text-xs font-semibold text-ink-900/40">{i + 1}º</span>
                  {item.aluno.full_name}
                </span>
                {podeGerenciar && (
                  <div className="flex items-center gap-3">
                    <form action={promoverDaListaEspera.bind(null, turmaId, item.aluno_id)}>
                      <button type="submit" className="text-xs font-medium text-brand-600 hover:underline">
                        matricular
                      </button>
                    </form>
                    <form action={removerDaListaEspera.bind(null, turmaId, item.aluno_id)}>
                      <button type="submit" className="text-xs font-medium text-ink-900/40 hover:text-brand-700">
                        remover
                      </button>
                    </form>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {podeFazerCheckin && (
        <section>
          <h2 className="mb-3 flex items-center justify-between gap-2 font-display text-sm font-semibold uppercase tracking-wide text-ink-900/60">
            <span className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-brand-600" />
              Chamada de hoje ({todayISO()})
            </span>
            <Link
              href={`/aulas/${turmaId}/qrcode`}
              target="_blank"
              className="flex items-center gap-1 text-xs font-medium normal-case tracking-normal text-brand-600 hover:underline"
            >
              <QrCode className="h-3.5 w-3.5" />
              QR code de check-in
            </Link>
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
  jaNaEspera,
  turmaCheia,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  turmaId: string;
  jaMatriculados: string[];
  jaNaEspera: string[];
  turmaCheia: boolean;
}) {
  const alunos = await listAlunos(supabase);
  const disponiveis = alunos.filter((a) => !jaMatriculados.includes(a.id) && !jaNaEspera.includes(a.id));

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
        {turmaCheia ? "Adicionar à lista de espera" : "Matricular"}
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
