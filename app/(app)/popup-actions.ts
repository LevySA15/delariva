"use server";

import { createClient } from "@/lib/supabase/server";
import { listTodosAlunos, listAlunosDoProfessor, listAlunosComFaixa } from "@/lib/queries/graduacao";
import { listProfessores, listTurmas, listTurmasDoProfessor, listTurmasDoAluno, getTurma, getProfessoresDaTurma, getAlunosDaTurma } from "@/lib/queries/turmas";
import { listMensalidadesDoMes } from "@/lib/queries/financeiro";
import { getMensalidadeDoMes } from "@/lib/queries/dashboard";
import { getMembro } from "@/lib/queries/membros";

export async function popupListaAlunos() {
  const supabase = await createClient();
  return listTodosAlunos(supabase);
}

export async function popupListaProfessores() {
  const supabase = await createClient();
  const professores = await listProfessores(supabase);
  return listAlunosComFaixa(supabase, professores);
}

export async function popupListaTurmas() {
  const supabase = await createClient();
  return listTurmas(supabase);
}

export async function popupListaMensalidadesPendentes() {
  const supabase = await createClient();
  const mensalidades = await listMensalidadesDoMes(supabase);
  return mensalidades.filter((m) => m.status !== "pago");
}

export async function popupMinhasTurmasProfessor(professorId: string) {
  const supabase = await createClient();
  return listTurmasDoProfessor(supabase, professorId);
}

export async function popupMeusAlunosProfessor(professorId: string) {
  const supabase = await createClient();
  return listAlunosDoProfessor(supabase, professorId);
}

export async function popupMinhasTurmasAluno(alunoId: string) {
  const supabase = await createClient();
  return listTurmasDoAluno(supabase, alunoId);
}

export async function popupMembro(id: string) {
  const supabase = await createClient();
  return getMembro(supabase, id);
}

export async function popupTurmaMini(turmaId: string) {
  const supabase = await createClient();
  const [turma, professores, alunos] = await Promise.all([
    getTurma(supabase, turmaId),
    getProfessoresDaTurma(supabase, turmaId),
    getAlunosDaTurma(supabase, turmaId),
  ]);
  return { turma, professores, alunos };
}

export async function popupMensalidadeMini(alunoId: string) {
  const supabase = await createClient();
  const [{ data: aluno }, mensalidade] = await Promise.all([
    supabase.from("profiles").select("id, full_name").eq("id", alunoId).single(),
    getMensalidadeDoMes(supabase, alunoId),
  ]);
  return { aluno, mensalidade };
}
