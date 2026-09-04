"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error: string | null };

export async function publicarAviso(_prevState: FormState, formData: FormData): Promise<FormState> {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const mensagem = String(formData.get("mensagem") ?? "").trim();

  if (!titulo || !mensagem) {
    return { error: "Preencha título e mensagem." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sessão expirada." };

  const { error } = await supabase.from("mural_avisos").insert({ autor_id: user.id, titulo, mensagem });
  if (error) return { error: error.message };

  revalidatePath("/chat/mural");
  return { error: null };
}
