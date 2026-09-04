import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { currentMonthStart } from "./dashboard";

type DB = SupabaseClient<Database>;

export async function listPlanos(supabase: DB) {
  const { data } = await supabase.from("planos").select("*").order("nome");
  return data ?? [];
}

export async function getMensalidades(supabase: DB, alunoId: string) {
  const { data } = await supabase
    .from("mensalidades")
    .select("*, plano:planos(nome)")
    .eq("aluno_id", alunoId)
    .order("mes_referencia", { ascending: false });
  return data ?? [];
}

export async function listMensalidadesDoMes(supabase: DB) {
  const { data } = await supabase
    .from("mensalidades")
    .select("*, aluno:profiles!mensalidades_aluno_id_fkey(full_name), plano:planos(nome)")
    .eq("mes_referencia", currentMonthStart())
    .order("status");
  return data ?? [];
}

export async function listAlunosAtivos(supabase: DB) {
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("role", ["aluno", "aluno_menor"])
    .order("full_name");
  return data ?? [];
}
