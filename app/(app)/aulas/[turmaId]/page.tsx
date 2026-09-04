import { notFound } from "next/navigation";
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
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{turma.nome}</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {turma.dias_semana.map((d) => DIAS_SEMANA_LABELS[d]).join(", ")} ·{" "}
          {turma.horario_inicio.slice(0, 5)} às {turma.horario_fim.slice(0, 5)} ·{" "}
          {turma.faixa_etaria === "adulto" ? "Adulto" : "Infantil"}
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-neutral-900">Professores</h2>
        <ul className="mb-3 flex flex-wrap gap-2">
          {professores.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-700"
            >
              {p.full_name}
              {podeGerenciar && (
                <form action={removerProfessor.bind(null, turmaId, p.id)}>
                  <button type="submit" className="text-neutral-400 hover:text-red-600">
                    ×
                  </button>
                </form>
              )}
            </li>
          ))}
          {professores.length === 0 && <li className="text-sm text-neutral-500">Nenhum professor atribuído.</li>}
        </ul>
        {podeGerenciar && <AdicionarProfessorForm supabase={supabase} turmaId={turmaId} jaAtribuidos={professores.map((p) => p.id)} />}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-neutral-900">Alunos matriculados ({alunos.length})</h2>
        {(podeGerenciar || souProfessorDaTurma) && (
          <ul className="mb-3 space-y-1">
            {alunos.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
              >
                {a.full_name}
                {podeGerenciar && (
                  <form action={desmatricularAluno.bind(null, turmaId, a.id)}>
                    <button type="submit" className="text-xs text-neutral-400 hover:text-red-600">
                      remover
                    </button>
                  </form>
                )}
              </li>
            ))}
            {alunos.length === 0 && <li className="text-sm text-neutral-500">Nenhum aluno matriculado.</li>}
          </ul>
        )}
        {podeGerenciar && <MatricularAlunoForm supabase={supabase} turmaId={turmaId} jaMatriculados={alunos.map((a) => a.id)} />}
      </section>

      {podeFazerCheckin && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">Chamada de hoje ({todayISO()})</h2>
          <CheckinForm supabase={supabase} turmaId={turmaId} alunos={alunos} />
        </section>
      )}

      {(profile.role === "aluno" || profile.role === "aluno_menor") && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-neutral-900">Minha frequência</h2>
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
      <select name="professor_id" className="flex-1 rounded-md border border-neutral-300 px-3 py-1.5 text-sm">
        {disponiveis.map((p) => (
          <option key={p.id} value={p.id}>
            {p.full_name}
          </option>
        ))}
      </select>
      <button type="submit" className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white hover:bg-neutral-800">
        Adicionar
      </button>
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
      <select name="aluno_id" className="flex-1 rounded-md border border-neutral-300 px-3 py-1.5 text-sm">
        {disponiveis.map((a) => (
          <option key={a.id} value={a.id}>
            {a.full_name}
          </option>
        ))}
      </select>
      <button type="submit" className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white hover:bg-neutral-800">
        Matricular
      </button>
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
    return <p className="text-sm text-neutral-500">Matricule alunos para poder fazer a chamada.</p>;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const aula = await getOrCreateAulaHoje(supabase, turmaId, user?.id ?? null);
  const presencas = await getPresencasDaAula(supabase, aula.id);
  const presentesHoje = new Set(presencas.filter((p) => p.presente).map((p) => p.aluno_id));

  return (
    <form action={registrarPresenca.bind(null, turmaId)} className="space-y-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      {alunos.map((a) => (
        <label key={a.id} className="flex items-center gap-2 text-sm text-neutral-700">
          <input type="hidden" name="aluno_id" value={a.id} />
          <input type="checkbox" name="presente" value={a.id} defaultChecked={presentesHoje.has(a.id)} />
          {a.full_name}
        </label>
      ))}
      <button type="submit" className="mt-2 rounded-md bg-red-700 px-3 py-1.5 text-sm text-white hover:bg-red-600">
        Salvar chamada
      </button>
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
    return <p className="text-sm text-neutral-500">Ainda sem registros de presença nesta turma.</p>;
  }

  return (
    <ul className="space-y-1">
      {historico.map((h) => (
        <li
          key={h.aulaId}
          className="flex items-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm"
        >
          <span>{new Date(h.data + "T00:00:00").toLocaleDateString("pt-BR")}</span>
          <span className={h.presente ? "text-emerald-600" : "text-red-600"}>
            {h.presente ? "Presente" : "Faltou"}
          </span>
        </li>
      ))}
    </ul>
  );
}
