"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error: string | null };

export async function lancarPagamento(_prevState: FormState, formData: FormData): Promise<FormState> {
  const professorId = String(formData.get("professor_id") ?? "");
  const mesReferencia = String(formData.get("mes_referencia") ?? "");
  const valor = Number(formData.get("valor") ?? 0);

  if (!professorId || !mesReferencia || valor <= 0) {
    return { error: "Preencha o professor/instrutor, o mês e o valor." };
  }

  const supabase = await createClient();

  const { data: existente } = await supabase
    .from("pagamentos_professor")
    .select("id")
    .eq("professor_id", professorId)
    .eq("mes_referencia", mesReferencia)
    .maybeSingle();

  const { error } = existente
    ? await supabase.from("pagamentos_professor").update({ valor }).eq("id", existente.id)
    : await supabase.from("pagamentos_professor").insert({ professor_id: professorId, mes_referencia: mesReferencia, valor });

  if (error) return { error: error.message };

  redirect(`/financeiro/professores/${professorId}`);
}

export async function marcarPagamentoPago(pagamentoId: string, professorId: string, formData: FormData) {
  const formaPagamento = String(formData.get("forma_pagamento") ?? "");

  const supabase = await createClient();
  await supabase
    .from("pagamentos_professor")
    .update({ status: "pago", data_pagamento: new Date().toISOString().slice(0, 10), forma_pagamento: formaPagamento || null })
    .eq("id", pagamentoId);

  revalidatePath(`/financeiro/professores/${professorId}`);
  revalidatePath("/financeiro/professores");
}

export async function marcarPagamentoStatus(pagamentoId: string, professorId: string, status: "pendente" | "atrasado") {
  const supabase = await createClient();
  await supabase
    .from("pagamentos_professor")
    .update({ status, data_pagamento: null, forma_pagamento: null })
    .eq("id", pagamentoId);

  revalidatePath(`/financeiro/professores/${professorId}`);
  revalidatePath("/financeiro/professores");
}
