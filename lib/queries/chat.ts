import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type DB = SupabaseClient<Database>;

export async function getMensagensTurma(supabase: DB, turmaId: string) {
  const { data } = await supabase
    .from("chat_turma_mensagens")
    .select("id, mensagem, created_at, autor_id, autor:profiles!chat_turma_mensagens_autor_id_fkey(full_name)")
    .eq("turma_id", turmaId)
    .order("created_at", { ascending: true })
    .limit(200);
  return data ?? [];
}

export async function listMural(supabase: DB) {
  const { data } = await supabase
    .from("mural_avisos")
    .select("id, titulo, mensagem, created_at, autor:profiles!mural_avisos_autor_id_fkey(full_name)")
    .order("created_at", { ascending: false });
  return data ?? [];
}
