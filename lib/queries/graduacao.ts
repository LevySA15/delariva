import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { getFaixaAtual } from "./dashboard";

type DB = SupabaseClient<Database>;

export async function getGraduacoes(supabase: DB, alunoId: string) {
  const { data } = await supabase
    .from("graduacoes")
    .select("*, professor:profiles!graduacoes_professor_id_fkey(full_name)")
    .eq("aluno_id", alunoId)
    .order("data", { ascending: false });
  return data ?? [];
}

export async function getAvaliacoes(supabase: DB, alunoId: string) {
  const { data } = await supabase
    .from("avaliacoes")
    .select(
      "*, professor:profiles!avaliacoes_professor_id_fkey(full_name), avaliacao_criterios(criterio, nota)",
    )
    .eq("aluno_id", alunoId)
    .order("data", { ascending: false });
  return data ?? [];
}

export async function listAlunosComFaixa(supabase: DB, alunos: { id: string; full_name: string }[]) {
  return Promise.all(
    alunos.map(async (a) => ({ ...a, faixa: await getFaixaAtual(supabase, a.id) })),
  );
}

export async function listTodosAlunos(supabase: DB) {
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("role", ["aluno", "aluno_menor"])
    .order("full_name");
  return listAlunosComFaixa(supabase, data ?? []);
}

export async function listAlunosDoProfessor(supabase: DB, professorId: string) {
  const { data: turmas } = await supabase
    .from("turma_professores")
    .select("turma_id")
    .eq("professor_id", professorId);
  const turmaIds = (turmas ?? []).map((t) => t.turma_id);
  if (turmaIds.length === 0) return [];

  const { data: matriculas } = await supabase
    .from("matriculas")
    .select("aluno:profiles!matriculas_aluno_id_fkey(id, full_name)")
    .in("turma_id", turmaIds)
    .eq("ativo", true);

  const unicos = new Map<string, { id: string; full_name: string }>();
  for (const m of matriculas ?? []) {
    if (m.aluno) unicos.set(m.aluno.id, m.aluno);
  }

  return listAlunosComFaixa(supabase, Array.from(unicos.values()));
}
