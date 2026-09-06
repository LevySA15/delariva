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

export async function getMensalidadeDetalhada(supabase: DB, mensalidadeId: string) {
  const { data } = await supabase
    .from("mensalidades")
    .select("*, plano:planos(nome), aluno:profiles!mensalidades_aluno_id_fkey(full_name)")
    .eq("id", mensalidadeId)
    .single();
  return data;
}

export async function getPixKey(supabase: DB) {
  const { data } = await supabase.from("academia_config").select("pix_key").eq("id", true).single();
  return data?.pix_key ?? null;
}

export async function getResumoFinanceiroPorAluno(supabase: DB, alunoIds: string[]) {
  if (alunoIds.length === 0) return new Map<string, { pendente: number; atrasado: number; total: number }>();

  const { data } = await supabase
    .from("mensalidades")
    .select("aluno_id, valor, status")
    .in("aluno_id", alunoIds)
    .neq("status", "pago");

  const resumo = new Map<string, { pendente: number; atrasado: number; total: number }>();
  for (const alunoId of alunoIds) resumo.set(alunoId, { pendente: 0, atrasado: 0, total: 0 });

  for (const m of data ?? []) {
    const r = resumo.get(m.aluno_id);
    if (!r) continue;
    if (m.status === "atrasado") r.atrasado += 1;
    else r.pendente += 1;
    r.total += Number(m.valor);
  }

  return resumo;
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
    .select("id, full_name, desconto_percentual")
    .in("role", ["aluno", "aluno_menor"])
    .order("full_name");
  return data ?? [];
}

export async function getAlunoComDesconto(supabase: DB, alunoId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, desconto_percentual")
    .eq("id", alunoId)
    .single();
  return data;
}

export async function listInadimplencia(supabase: DB, inicio?: string, fim?: string) {
  let query = supabase
    .from("mensalidades")
    .select("*, aluno:profiles!mensalidades_aluno_id_fkey(full_name), plano:planos(nome)")
    .in("status", ["pendente", "atrasado"])
    .order("mes_referencia", { ascending: false });

  if (inicio) query = query.gte("mes_referencia", inicio);
  if (fim) query = query.lte("mes_referencia", fim);

  const { data } = await query;
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

export async function getRelatorioMensal(supabase: DB, meses = 6) {
  const janela = mesesAtras(meses);
  const inicio = janela[0].chave;

  const { data } = await supabase
    .from("mensalidades")
    .select("valor, mes_referencia, status")
    .gte("mes_referencia", inicio);

  const porMes = new Map<string, { recebido: number; pendente: number }>();
  for (const m of data ?? []) {
    const cur = porMes.get(m.mes_referencia) ?? { recebido: 0, pendente: 0 };
    if (m.status === "pago") cur.recebido += Number(m.valor);
    else cur.pendente += Number(m.valor);
    porMes.set(m.mes_referencia, cur);
  }

  return janela.map((j) => ({ label: j.label, ...(porMes.get(j.chave) ?? { recebido: 0, pendente: 0 }) }));
}

// Projeção da próxima cobrança recorrente: soma o valor da mensalidade mais
// recente de cada aluno (mesma lógica do cron de geração automática), já que
// não existe um vínculo persistente aluno->plano além do último lançamento.
export async function getProjecaoRecorrente(supabase: DB) {
  const { data } = await supabase
    .from("mensalidades")
    .select("aluno_id, valor, mes_referencia")
    .eq("tipo", "mensalidade")
    .order("mes_referencia", { ascending: false });

  const ultimoPorAluno = new Map<string, number>();
  for (const m of data ?? []) {
    if (!ultimoPorAluno.has(m.aluno_id)) ultimoPorAluno.set(m.aluno_id, Number(m.valor));
  }

  return [...ultimoPorAluno.values()].reduce((soma, v) => soma + v, 0);
}
