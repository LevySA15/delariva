"use client";

import { useActionState } from "react";
import { vincularResponsavel, type FormState } from "../actions";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const initialState: FormState = { error: null };

export function VinculoForm({
  responsaveis,
  alunosMenores,
}: {
  responsaveis: { id: string; full_name: string }[];
  alunosMenores: { id: string; full_name: string }[];
}) {
  const [state, formAction, pending] = useActionState(vincularResponsavel, initialState);

  return (
    <form
      action={formAction}
      className="flex max-w-xl flex-wrap items-end gap-3 rounded-lg border border-ink-900/10 bg-white p-4 shadow-sm"
    >
      <Field label="Responsável" htmlFor="responsavel_id">
        <select id="responsavel_id" name="responsavel_id" required className={inputClass}>
          <option value="">Selecione...</option>
          {responsaveis.map((r) => (
            <option key={r.id} value={r.id}>
              {r.full_name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Aluno menor" htmlFor="aluno_id">
        <select id="aluno_id" name="aluno_id" required className={inputClass}>
          <option value="">Selecione...</option>
          {alunosMenores.map((a) => (
            <option key={a.id} value={a.id}>
              {a.full_name}
            </option>
          ))}
        </select>
      </Field>

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Salvando..." : "Vincular"}
      </Button>

      {state.error && <p className="w-full text-sm text-brand-700">{state.error}</p>}
    </form>
  );
}
