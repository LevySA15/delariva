import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type DB = SupabaseClient<Database>;

export async function getHistoricoNotificacoes(supabase: DB) {
  const { data } = await supabase
    .from("notificacoes_enviadas")
    .select(
      "id, tipo, titulo, corpo, destinatarios_count, created_at, autor:profiles!notificacoes_enviadas_autor_id_fkey(full_name)",
    )
    .order("created_at", { ascending: false })
    .limit(30);
  return data ?? [];
}
