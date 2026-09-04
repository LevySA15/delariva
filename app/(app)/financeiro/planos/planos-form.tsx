"use client";

import { useActionState } from "react";
import { criarPlano, type FormState } from "../actions";

const initialState: FormState = { error: null };

export function PlanosForm() {
  const [state, formAction, pending] = useActionState(criarPlano, initialState);

  return (
    <form action={formAction} className="flex max-w-lg flex-wrap items-end gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="space-y-1">
        <label htmlFor="nome" className="text-xs text-neutral-600">
          Nome do plano
        </label>
        <input id="nome" name="nome" required className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm" />
      </div>
      <div className="space-y-1">
        <label htmlFor="valor" className="text-xs text-neutral-600">
          Valor (R$)
        </label>
        <input
          id="valor"
          name="valor"
          type="number"
          min={0}
          step={0.01}
          required
          className="w-28 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="periodicidade" className="text-xs text-neutral-600">
          Periodicidade
        </label>
        <select id="periodicidade" name="periodicidade" className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm">
          <option value="mensal">Mensal</option>
          <option value="trimestral">Trimestral</option>
          <option value="anual">Anual</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-red-700 px-3 py-1.5 text-sm text-white hover:bg-red-600 disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Adicionar plano"}
      </button>
      {state.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
