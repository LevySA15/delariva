import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type DB = SupabaseClient<Database>;

export function todayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export async function listTurmas(supabase: DB) {
  const { data } = await supabase.from("turmas").select("*").order("nome");
  return data ?? [];
}

export async function getTurma(supabase: DB, turmaId: string) {
  const { data } = await supabase.from("turmas").select("*").eq("id", turmaId).single();
  return data;
}

export async function getProfessoresDaTurma(supabase: DB, turmaId: string) {
  const { data } = await supabase
    .from("turma_professores")
    .select("professor_id, professor:profiles!turma_professores_professor_id_fkey(id, full_name)")
    .eq("turma_id", turmaId);
  return (data ?? []).map((d) => d.professor).filter(Boolean) as { id: string; full_name: string }[];
}

export async function getAlunosDaTurma(supabase: DB, turmaId: string) {
  const { data } = await supabase
    .from("matriculas")
    .select("aluno_id, aluno:profiles!matriculas_aluno_id_fkey(id, full_name)")
    .eq("turma_id", turmaId)
    .eq("ativo", true);
  return (data ?? []).map((d) => d.aluno).filter(Boolean) as { id: string; full_name: string }[];
}

export async function getListaEspera(supabase: DB, turmaId: string) {
  const { data } = await supabase
    .from("lista_espera")
    .select("id, aluno_id, created_at, aluno:profiles!lista_espera_aluno_id_fkey(id, full_name)")
    .eq("turma_id", turmaId)
    .order("created_at", { ascending: true });
  return (data ?? []).filter((d) => d.aluno) as {
    id: string;
    aluno_id: string;
    created_at: string;
    aluno: { id: string; full_name: string };
  }[];
}

export async function listProfessores(supabase: DB) {
  // inclui "dono" porque o dono da academia pode acumular a função de professor
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("role", ["professor", "dono"])
    .order("full_name");
  return data ?? [];
}

export async function listAlunos(supabase: DB) {
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .in("role", ["aluno", "aluno_menor"])
    .order("full_name");
  return data ?? [];
}

export async function getOrCreateAulaHoje(supabase: DB, turmaId: string, professorId: string | null) {
  const data = todayISO();
  const { data: existente } = await supabase
    .from("aulas")
    .select("*")
    .eq("turma_id", turmaId)
    .eq("data", data)
    .maybeSingle();

  if (existente) return existente;

  const { data: nova, error } = await supabase
    .from("aulas")
    .insert({ turma_id: turmaId, data, professor_id: professorId })
    .select("*")
    .single();

  if (error) throw error;
  return nova;
}

export async function getPresencasDaAula(supabase: DB, aulaId: string) {
  const { data } = await supabase.from("presencas").select("aluno_id, presente").eq("aula_id", aulaId);
  return data ?? [];
}

export async function getHistoricoPresencaAluno(supabase: DB, turmaId: string, alunoId: string) {
  const { data } = await supabase
    .from("aulas")
    .select("id, data, presencas!inner(presente, aluno_id)")
    .eq("turma_id", turmaId)
    .eq("presencas.aluno_id", alunoId)
    .order("data", { ascending: false })
    .limit(20);

  return (data ?? []).map((a) => ({
    aulaId: a.id,
    data: a.data,
    presente: a.presencas[0]?.presente ?? false,
  }));
}
