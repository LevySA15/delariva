"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function atualizarPixKey(formData: FormData) {
  const pixKey = String(formData.get("pix_key") ?? "").trim();
  const supabase = await createClient();
  await supabase.from("academia_config").update({ pix_key: pixKey || null, updated_at: new Date().toISOString() }).eq("id", true);
  revalidatePath("/configuracoes/financeiro");
}
