"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CRITERIOS_AVALIACAO, type FaixaCategoria } from "@/lib/domain";

export type FormState = { error: string | null };
const ok: FormState = { error: null };

export async function registrarGraduacao(
  alunoId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const faixaCategoria = String(formData.get("faixa_categoria") ?? "adulto") as FaixaCategoria;
  const faixa = String(formData.get("faixa") ?? "");
  const grau = Number(formData.get("grau") ?? 0);
  const data = String(formData.get("data") ?? "");
  const observacao = String(formData.get("observacao") ?? "").trim();

  if (!faixa || !data) {
    return { error: "Selecione a faixa e a data da graduação." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("graduacoes").insert({
    aluno_id: alunoId,
    professor_id: user?.id ?? null,
    faixa_categoria: faixaCategoria,
    faixa,
    grau,
    data,
    observacao: observacao || null,
  });

  if (error) return { error: error.message };

  revalidatePath(`/graduacao/${alunoId}`);
  return ok;
}

export async function registrarAvaliacao(
  alunoId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const notaGeral = formData.get("nota_geral") ? Number(formData.get("nota_geral")) : null;
  const comentario = String(formData.get("comentario") ?? "").trim();
  const graduacaoId = String(formData.get("graduacao_id") ?? "") || null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Sessão expirada." };

  const { data: avaliacao, error } = await supabase
    .from("avaliacoes")
    .insert({
      aluno_id: alunoId,
      professor_id: user.id,
      nota_geral: notaGeral,
      comentario: comentario || null,
      graduacao_id: graduacaoId,
    })
    .select("id")
    .single();

  if (error || !avaliacao) {
    return { error: error?.message ?? "Não foi possível registrar a avaliação." };
  }

  const criterios = CRITERIOS_AVALIACAO.map((criterio) => ({
    avaliacao_id: avaliacao.id,
    criterio,
    nota: Number(formData.get(`criterio_${criterio}`) ?? 0),
  })).filter((c) => formData.get(`criterio_${c.criterio}`));

  if (criterios.length > 0) {
    const { error: criteriosError } = await supabase.from("avaliacao_criterios").insert(criterios);
    if (criteriosError) return { error: criteriosError.message };
  }

  revalidatePath(`/graduacao/${alunoId}`);
  return ok;
}
