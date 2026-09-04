import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type DB = SupabaseClient<Database>;

export function currentMonthStart(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

export async function getMuralRecente(supabase: DB) {
  const { data } = await supabase
    .from("mural_avisos")
    .select("id, titulo, mensagem, created_at")
    .order("created_at", { ascending: false })
    .limit(3);
  return data ?? [];
}

export async function getDonoStats(supabase: DB) {
  const mesAtual = currentMonthStart();

  const [alunos, professores, turmasAtivas, mensalidadesPendentes] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).in("role", ["aluno", "aluno_menor"]),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "professor"),
    supabase.from("turmas").select("id", { count: "exact", head: true }).eq("ativo", true),
    supabase
      .from("mensalidades")
      .select("id", { count: "exact", head: true })
      .eq("mes_referencia", mesAtual)
      .neq("status", "pago"),
  ]);

  return {
    alunos: alunos.count ?? 0,
    professores: professores.count ?? 0,
    turmasAtivas: turmasAtivas.count ?? 0,
    mensalidadesPendentes: mensalidadesPendentes.count ?? 0,
  };
}

export async function getProfessorStats(supabase: DB, professorId: string) {
  const { data: turmas } = await supabase
    .from("turma_professores")
    .select("turma_id")
    .eq("professor_id", professorId);

  const turmaIds = (turmas ?? []).map((t) => t.turma_id);

  let alunosCount = 0;
  if (turmaIds.length > 0) {
    const { data: matriculas } = await supabase
      .from("matriculas")
      .select("aluno_id")
      .in("turma_id", turmaIds)
      .eq("ativo", true);
    alunosCount = new Set((matriculas ?? []).map((m) => m.aluno_id)).size;
  }

  return { minhasTurmas: turmaIds.length, meusAlunos: alunosCount };
}

export async function getFaixaAtual(supabase: DB, alunoId: string) {
  const { data } = await supabase
    .from("graduacoes")
    .select("faixa, grau, data")
    .eq("aluno_id", alunoId)
    .order("data", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function getAlunoStats(supabase: DB, alunoId: string) {
  const { data: matriculas } = await supabase
    .from("matriculas")
    .select("turma_id")
    .eq("aluno_id", alunoId)
    .eq("ativo", true);

  const faixa = await getFaixaAtual(supabase, alunoId);

  return { minhasTurmas: matriculas?.length ?? 0, faixa };
}

export async function getMensalidadeDoMes(supabase: DB, alunoId: string) {
  const { data } = await supabase
    .from("mensalidades")
    .select("status, valor, mes_referencia")
    .eq("aluno_id", alunoId)
    .eq("mes_referencia", currentMonthStart())
    .maybeSingle();
  return data;
}

export async function getDependentes(supabase: DB, responsavelId: string) {
  const { data } = await supabase
    .from("responsaveis_alunos")
    .select("aluno:profiles!responsaveis_alunos_aluno_id_fkey(id, full_name)")
    .eq("responsavel_id", responsavelId);

  const dependentes = (data ?? []).map((d) => d.aluno).filter(Boolean) as {
    id: string;
    full_name: string;
  }[];

  const comFaixa = await Promise.all(
    dependentes.map(async (dep) => ({
      ...dep,
      faixa: await getFaixaAtual(supabase, dep.id),
    })),
  );

  return comFaixa;
}
