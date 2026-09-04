"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateAulaHoje } from "@/lib/queries/turmas";

export async function adicionarProfessor(turmaId: string, formData: FormData) {
  const professorId = String(formData.get("professor_id") ?? "");
  if (!professorId) return;

  const supabase = await createClient();
  await supabase
    .from("turma_professores")
    .upsert({ turma_id: turmaId, professor_id: professorId }, { onConflict: "turma_id,professor_id", ignoreDuplicates: true });

  revalidatePath(`/aulas/${turmaId}`);
}

export async function removerProfessor(turmaId: string, professorId: string) {
  const supabase = await createClient();
  await supabase
    .from("turma_professores")
    .delete()
    .eq("turma_id", turmaId)
    .eq("professor_id", professorId);
  revalidatePath(`/aulas/${turmaId}`);
}

export async function matricularAluno(turmaId: string, formData: FormData) {
  const alunoId = String(formData.get("aluno_id") ?? "");
  if (!alunoId) return;

  const supabase = await createClient();
  await supabase
    .from("matriculas")
    .upsert({ turma_id: turmaId, aluno_id: alunoId, ativo: true }, { onConflict: "turma_id,aluno_id" });

  revalidatePath(`/aulas/${turmaId}`);
}

export async function desmatricularAluno(turmaId: string, alunoId: string) {
  const supabase = await createClient();
  await supabase
    .from("matriculas")
    .update({ ativo: false })
    .eq("turma_id", turmaId)
    .eq("aluno_id", alunoId);
  revalidatePath(`/aulas/${turmaId}`);
}

export async function registrarPresenca(turmaId: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const aula = await getOrCreateAulaHoje(supabase, turmaId, user?.id ?? null);

  const alunoIds = formData.getAll("aluno_id").map((v) => String(v));
  const presentes = new Set(formData.getAll("presente").map((v) => String(v)));

  const rows = alunoIds.map((alunoId) => ({
    aula_id: aula.id,
    aluno_id: alunoId,
    presente: presentes.has(alunoId),
    registrado_por: user?.id ?? null,
  }));

  if (rows.length > 0) {
    await supabase.from("presencas").upsert(rows, { onConflict: "aula_id,aluno_id" });
  }

  revalidatePath(`/aulas/${turmaId}`);
}
