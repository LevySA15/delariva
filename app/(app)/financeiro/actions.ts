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

  if (!alunoId || !mesReferencia || valor <= 0) {
    return { error: "Preencha aluno, mês e valor." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("mensalidades")
    .upsert(
      { aluno_id: alunoId, plano_id: planoId, mes_referencia: mesReferencia, valor },
      { onConflict: "aluno_id,mes_referencia" },
    );

  if (error) return { error: error.message };

  redirect(`/financeiro/${alunoId}`);
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
