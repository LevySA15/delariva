"use client";

import { useActionState } from "react";
import { criarPlano, type FormState } from "../actions";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const initialState: FormState = { error: null };

export function PlanosForm() {
  const [state, formAction, pending] = useActionState(criarPlano, initialState);

  return (
    <form
      action={formAction}
      className="flex max-w-lg flex-wrap items-end gap-3 rounded-lg border border-ink-900/10 bg-white p-4 shadow-sm"
    >
      <Field label="Nome do plano" htmlFor="nome">
        <input id="nome" name="nome" required className={inputClass} />
      </Field>
      <Field label="Valor (R$)" htmlFor="valor">
        <input id="valor" name="valor" type="number" min={0} step={0.01} required className={`w-28 ${inputClass}`} />
      </Field>
      <Field label="Periodicidade" htmlFor="periodicidade">
        <select id="periodicidade" name="periodicidade" className={inputClass}>
          <option value="mensal">Mensal</option>
          <option value="trimestral">Trimestral</option>
          <option value="anual">Anual</option>
        </select>
      </Field>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Salvando..." : "Adicionar plano"}
      </Button>
      {state.error && <p className="w-full text-sm text-brand-700">{state.error}</p>}
    </form>
  );
}
