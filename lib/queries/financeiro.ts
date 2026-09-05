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

const MES_LABELS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function mesesAtras(n: number): { chave: string; label: string; ano: number; mes: number }[] {
  const hoje = new Date();
  const lista: { chave: string; label: string; ano: number; mes: number }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    lista.push({
      chave: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`,
      label: MES_LABELS[d.getMonth()],
      ano: d.getFullYear(),
      mes: d.getMonth(),
    });
  }
  return lista;
}

export async function getReceitaMensal(supabase: DB, meses = 6) {
  const janela = mesesAtras(meses);
  const inicio = janela[0].chave;

  const { data } = await supabase
    .from("mensalidades")
    .select("valor, mes_referencia")
    .eq("status", "pago")
    .gte("mes_referencia", inicio);

  const somaPorMes = new Map<string, number>();
  for (const m of data ?? []) {
    somaPorMes.set(m.mes_referencia, (somaPorMes.get(m.mes_referencia) ?? 0) + Number(m.valor));
  }

  return janela.map((j) => ({ label: j.label, value: somaPorMes.get(j.chave) ?? 0 }));
}
