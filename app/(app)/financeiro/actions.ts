"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error: string | null };
const ok: FormState = { error: null };

export async function criarPlano(_prevState: FormState, formData: FormData): Promise<FormState> {
  const nome = String(formData.get("nome") ?? "").trim();
  const valor = Number(formData.get("valor") ?? 0);
  const periodicidade = String(formData.get("periodicidade") ?? "mensal");

  if (!nome || valor <= 0) {
    return { error: "Informe nome e valor do plano." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("planos").insert({ nome, valor, periodicidade });
  if (error) return { error: error.message };

  revalidatePath("/financeiro/planos");
  return ok;
}

export async function lancarMensalidade(_prevState: FormState, formData: FormData): Promise<FormState> {
  const alunoId = String(formData.get("aluno_id") ?? "");
  const planoId = String(formData.get("plano_id") ?? "") || null;
  const mesReferencia = String(formData.get("mes_referencia") ?? "");
  const valor = Number(formData.get("valor") ?? 0);
  const dataVencimentoRaw = String(formData.get("data_vencimento") ?? "").trim();

  if (!alunoId || !mesReferencia || valor <= 0) {
    return { error: "Preencha aluno, mês e valor." };
  }

  const supabase = await createClient();

  let dataVencimento = dataVencimentoRaw;
  if (!dataVencimento) {
    const { data: aluno } = await supabase.from("profiles").select("dia_vencimento").eq("id", alunoId).single();
    dataVencimento = diaDoVencimentoDoMes(mesReferencia, aluno?.dia_vencimento ?? 10);
  }

  const { data: existente } = await supabase
    .from("mensalidades")
    .select("id")
    .eq("aluno_id", alunoId)
    .eq("mes_referencia", mesReferencia)
    .eq("tipo", "mensalidade")
    .maybeSingle();

  const { error } = existente
    ? await supabase
        .from("mensalidades")
        .update({ plano_id: planoId, valor, data_vencimento: dataVencimento })
        .eq("id", existente.id)
    : await supabase
        .from("mensalidades")
        .insert({ aluno_id: alunoId, plano_id: planoId, mes_referencia: mesReferencia, valor, data_vencimento: dataVencimento });

  if (error) return { error: error.message };

  redirect(`/financeiro/${alunoId}`);
}

export async function lancarCobrancaAvulsa(_prevState: FormState, formData: FormData): Promise<FormState> {
  const alunoId = String(formData.get("aluno_id") ?? "");
  const descricao = String(formData.get("descricao") ?? "").trim();
  const valor = Number(formData.get("valor") ?? 0);
  const dataVencimento = String(formData.get("data_vencimento") ?? "") || null;

  if (!alunoId || !descricao || valor <= 0) {
    return { error: "Preencha aluno, descrição e valor." };
  }

  const hoje = new Date();
  const mesReferencia = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-01`;

  const supabase = await createClient();
  const { error } = await supabase.from("mensalidades").insert({
    aluno_id: alunoId,
    mes_referencia: mesReferencia,
    valor,
    tipo: "avulsa",
    descricao,
    data_vencimento: dataVencimento,
  });

  if (error) return { error: error.message };

  redirect(`/financeiro/${alunoId}`);
}

function diaDoVencimentoDoMes(mesReferencia: string, dia: number): string {
  const [ano, mes] = mesReferencia.split("-").map(Number);
  return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

export async function atualizarDiaVencimento(alunoId: string, formData: FormData) {
  const dia = Math.min(28, Math.max(1, Number(formData.get("dia_vencimento") ?? 10)));
  const supabase = await createClient();
  await supabase.from("profiles").update({ dia_vencimento: dia }).eq("id", alunoId);
  revalidatePath(`/financeiro/${alunoId}`);
}

export async function marcarPago(mensalidadeId: string, alunoId: string, formData: FormData) {
  const formaPagamento = String(formData.get("forma_pagamento") ?? "");

  const supabase = await createClient();
  await supabase
    .from("mensalidades")
    .update({ status: "pago", data_pagamento: new Date().toISOString().slice(0, 10), forma_pagamento: formaPagamento || null })
    .eq("id", mensalidadeId);

  revalidatePath(`/financeiro/${alunoId}`);
  revalidatePath("/financeiro");
}

export async function marcarStatus(mensalidadeId: string, alunoId: string, status: "pendente" | "atrasado") {
  const supabase = await createClient();
  await supabase
    .from("mensalidades")
    .update({ status, data_pagamento: null, forma_pagamento: null })
    .eq("id", mensalidadeId);

  revalidatePath(`/financeiro/${alunoId}`);
  revalidatePath("/financeiro");
}

export type AvisoState = { error: string | null; sent: boolean };

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- assinatura exigida pelo useActionState, sem uso
export async function avisarPagamento(mensalidadeId: string, _prevState: AvisoState, _formData: FormData): Promise<AvisoState> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("avisar_pagamento", { p_mensalidade_id: mensalidadeId });
  if (error) return { error: error.message, sent: false };
  return { error: null, sent: true };
}

export async function atualizarDesconto(alunoId: string, formData: FormData) {
  const desconto = Number(formData.get("desconto_percentual") ?? 0);
  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ desconto_percentual: Math.min(100, Math.max(0, desconto)) })
    .eq("id", alunoId);

  revalidatePath(`/financeiro/${alunoId}`);
}
