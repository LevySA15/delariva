"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ROLE_LABELS, type UserRole } from "@/lib/domain";

export type FormState = { error: string | null; success?: boolean };

export async function enviarNotificacaoPersonalizada(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const corpo = String(formData.get("corpo") ?? "").trim();
  const publico = String(formData.get("publico") ?? "todos");
  const papel = String(formData.get("papel") ?? "");
  const turmaId = String(formData.get("turma_id") ?? "");

  if (!titulo || !corpo) {
    return { error: "Preencha título e mensagem." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "dono") return { error: "Apenas o dono pode enviar notificações." };

  let destinatarios: string[] = [];

  if (publico === "papel" && papel in ROLE_LABELS) {
    const { data } = await supabase.from("profiles").select("id").eq("role", papel as UserRole);
    destinatarios = (data ?? []).map((p) => p.id);
  } else if (publico === "turma" && turmaId) {
    const { data } = await supabase.from("matriculas").select("aluno_id").eq("turma_id", turmaId).eq("ativo", true);
    destinatarios = (data ?? []).map((m) => m.aluno_id);
  } else {
    const { data } = await supabase.from("profiles").select("id").neq("id", user.id);
    destinatarios = (data ?? []).map((p) => p.id);
  }

  if (destinatarios.length === 0) {
    return { error: "Nenhum destinatário encontrado pra esse público." };
  }

  const { error } = await supabase.from("notificacoes_enviadas").insert({
    autor_id: user.id,
    tipo: "personalizada",
    titulo,
    corpo,
    destinatarios_count: destinatarios.length,
    destinatarios,
  });

  if (error) return { error: error.message };

  revalidatePath("/configuracoes/notificacoes");
  return { error: null, success: true };
}
