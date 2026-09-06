"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/domain";

export async function atualizarRole(userId: string, formData: FormData) {
  const role = String(formData.get("role") ?? "") as UserRole;
  if (!role) return;

  const supabase = await createClient();
  await supabase.from("profiles").update({ role }).eq("id", userId);
  revalidatePath("/configuracoes/usuarios");
}

export async function atualizarRecebePagamento(userId: string, formData: FormData) {
  const recebePagamento = formData.get("recebe_pagamento") === "on";

  const supabase = await createClient();
  await supabase.from("profiles").update({ recebe_pagamento: recebePagamento }).eq("id", userId);
  revalidatePath("/configuracoes/usuarios");
  revalidatePath("/financeiro/professores");
}

export type FormState = { error: string | null };

export async function vincularResponsavel(_prevState: FormState, formData: FormData): Promise<FormState> {
  const responsavelId = String(formData.get("responsavel_id") ?? "");
  const alunoId = String(formData.get("aluno_id") ?? "");

  if (!responsavelId || !alunoId) {
    return { error: "Selecione o responsável e o aluno menor." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("responsaveis_alunos")
    .upsert({ responsavel_id: responsavelId, aluno_id: alunoId }, { onConflict: "responsavel_id,aluno_id" });

  if (error) return { error: error.message };

  revalidatePath("/configuracoes/vinculos");
  return { error: null };
}

export async function desvincularResponsavel(vinculoId: string) {
  const supabase = await createClient();
  await supabase.from("responsaveis_alunos").delete().eq("id", vinculoId);
  revalidatePath("/configuracoes/vinculos");
}
