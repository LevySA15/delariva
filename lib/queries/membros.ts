import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { getFaixaAtual } from "./dashboard";

type DB = SupabaseClient<Database>;

export type PessoaTurma = { id: string; full_name: string; avatar_url: string | null };
export type TurmaComPessoas = { turmaId: string; turmaNome: string; pessoas: PessoaTurma[] };

function agruparPorTurma(
  linhas: { turma_id: string; pessoa: PessoaTurma | null }[],
  nomeTurma: Map<string, string>,
): TurmaComPessoas[] {
  const porTurma = new Map<string, PessoaTurma[]>();
  for (const { turma_id, pessoa } of linhas) {
    if (!pessoa) continue;
    const lista = porTurma.get(turma_id) ?? [];
    lista.push(pessoa);
    porTurma.set(turma_id, lista);
  }
  return Array.from(porTurma.entries()).map(([turmaId, pessoas]) => ({
    turmaId,
    turmaNome: nomeTurma.get(turmaId) ?? "Turma",
    pessoas,
  }));
}

// Pro aluno/aluno_menor: professores e colegas de cada turma em que está matriculado.
export async function getRelacoesAluno(supabase: DB, alunoId: string) {
  const { data: minhasTurmas } = await supabase
    .from("matriculas")
    .select("turma_id, turma:turmas(id, nome)")
    .eq("aluno_id", alunoId)
    .eq("ativo", true);

  const turmaIds = (minhasTurmas ?? []).map((m) => m.turma_id);
  if (turmaIds.length === 0) return { professores: [] as TurmaComPessoas[], colegas: [] as TurmaComPessoas[] };

  const [professoresRes, colegasRes] = await Promise.all([
    supabase
      .from("turma_professores")
      .select("turma_id, professor:profiles!turma_professores_professor_id_fkey(id, full_name, avatar_url)")
      .in("turma_id", turmaIds),
    supabase
      .from("matriculas")
      .select("turma_id, aluno:profiles!matriculas_aluno_id_fkey(id, full_name, avatar_url)")
      .in("turma_id", turmaIds)
      .eq("ativo", true)
      .neq("aluno_id", alunoId),
  ]);

  const nomeTurma = new Map((minhasTurmas ?? []).map((m) => [m.turma_id, m.turma?.nome ?? "Turma"]));

  return {
    professores: agruparPorTurma(
      (professoresRes.data ?? []).map((r) => ({ turma_id: r.turma_id, pessoa: r.professor })),
      nomeTurma,
    ),
    colegas: agruparPorTurma(
      (colegasRes.data ?? []).map((r) => ({ turma_id: r.turma_id, pessoa: r.aluno })),
      nomeTurma,
    ),
  };
}

// Pro professor: colegas (outros professores) de cada turma que leciona.
export async function getColegasProfessor(supabase: DB, professorId: string): Promise<TurmaComPessoas[]> {
  const { data: minhasTurmas } = await supabase
    .from("turma_professores")
    .select("turma_id, turma:turmas(id, nome)")
    .eq("professor_id", professorId);

  const turmaIds = (minhasTurmas ?? []).map((t) => t.turma_id);
  if (turmaIds.length === 0) return [];

  const { data: colegas } = await supabase
    .from("turma_professores")
    .select("turma_id, professor:profiles!turma_professores_professor_id_fkey(id, full_name, avatar_url)")
    .in("turma_id", turmaIds)
    .neq("professor_id", professorId);

  const nomeTurma = new Map((minhasTurmas ?? []).map((t) => [t.turma_id, t.turma?.nome ?? "Turma"]));
  return agruparPorTurma(
    (colegas ?? []).map((r) => ({ turma_id: r.turma_id, pessoa: r.professor })),
    nomeTurma,
  );
}

export type MembroCard = {
  id: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
  faixa: { faixa: string; grau: number } | null;
  turmasMatriculado: string[];
  turmasLeciona: string[];
};

export async function getMembro(supabase: DB, id: string): Promise<MembroCard | null> {
  const { data: perfil } = await supabase.from("profiles").select("id, full_name, role, avatar_url").eq("id", id).single();
  if (!perfil) return null;

  const [faixa, matriculasRes, turmaProfessoresRes] = await Promise.all([
    getFaixaAtual(supabase, id),
    supabase.from("matriculas").select("turma:turmas(nome)").eq("aluno_id", id).eq("ativo", true),
    supabase.from("turma_professores").select("turma:turmas(nome)").eq("professor_id", id),
  ]);

  return {
    ...perfil,
    faixa,
    turmasMatriculado: (matriculasRes.data ?? []).map((m) => m.turma?.nome).filter((n): n is string => !!n),
    turmasLeciona: (turmaProfessoresRes.data ?? []).map((t) => t.turma?.nome).filter((n): n is string => !!n),
  };
}
