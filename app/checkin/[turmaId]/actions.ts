"use server";

import { createClient } from "@/lib/supabase/server";

export type CheckinState = { status: "idle" | "ok" | "ja_estava" | "erro"; message?: string };

export async function confirmarCheckin(turmaId: string): Promise<CheckinState> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("checkin_qr", { p_turma_id: turmaId }).maybeSingle();

  if (error) {
    if (error.message.includes("nao_matriculado")) {
      return { status: "erro", message: "Você não está matriculado nesta turma." };
    }
    return { status: "erro", message: "Não foi possível registrar sua presença. Tente novamente." };
  }

  return { status: data?.ja_estava_presente ? "ja_estava" : "ok" };
}
