"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { FaixaCategoria } from "@/lib/domain";

export type TurmaFormState = { error: string | null };

export async function criarTurma(
  _prevState: TurmaFormState,
  formData: FormData,
): Promise<TurmaFormState> {
  const nome = String(formData.get("nome") ?? "").trim();
  const faixaEtaria = String(formData.get("faixa_etaria") ?? "adulto") as FaixaCategoria;
  const horarioInicio = String(formData.get("horario_inicio") ?? "");
  const horarioFim = String(formData.get("horario_fim") ?? "");
  const diasSemana = formData.getAll("dias_semana").map((d) => Number(d));

  if (!nome || !horarioInicio || !horarioFim) {
    return { error: "Preencha nome e horários da turma." };
  }
  if (diasSemana.length === 0) {
    return { error: "Selecione ao menos um dia da semana." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("turmas")
    .insert({
      nome,
      faixa_etaria: faixaEtaria,
      horario_inicio: horarioInicio,
      horario_fim: horarioFim,
      dias_semana: diasSemana,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Não foi possível criar a turma." };
  }

  redirect(`/aulas/${data.id}`);
}
