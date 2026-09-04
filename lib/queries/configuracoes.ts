import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type DB = SupabaseClient<Database>;

export async function listUsuarios(supabase: DB) {
  const { data } = await supabase.from("profiles").select("*").order("full_name");
  return data ?? [];
}

export async function listVinculos(supabase: DB) {
  const { data } = await supabase
    .from("responsaveis_alunos")
    .select(
      "id, responsavel:profiles!responsaveis_alunos_responsavel_id_fkey(id, full_name), aluno:profiles!responsaveis_alunos_aluno_id_fkey(id, full_name)",
    )
    .order("id");
  return data ?? [];
}

export async function listAlunosMenores(supabase: DB) {
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "aluno_menor")
    .order("full_name");
  return data ?? [];
}

export async function listResponsaveis(supabase: DB) {
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "responsavel")
    .order("full_name");
  return data ?? [];
}
