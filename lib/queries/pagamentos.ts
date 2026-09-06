import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { currentMonthStart } from "./dashboard";

type DB = SupabaseClient<Database>;

export async function listRecebedores(supabase: DB) {
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("recebe_pagamento", true)
    .order("full_name");
  return data ?? [];
}

export async function getPagamentos(supabase: DB, professorId: string) {
  const { data } = await supabase
    .from("pagamentos_professor")
    .select("*")
    .eq("professor_id", professorId)
    .order("mes_referencia", { ascending: false });
  return data ?? [];
}

export async function listPagamentosDoMes(supabase: DB) {
  const { data } = await supabase
    .from("pagamentos_professor")
    .select("*, professor:profiles!pagamentos_professor_professor_id_fkey(full_name)")
    .eq("mes_referencia", currentMonthStart())
    .order("status");
  return data ?? [];
}
