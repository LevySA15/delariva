"use client";

import { useActionState } from "react";
import { vincularResponsavel, type FormState } from "../actions";

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
    <form action={formAction} className="flex max-w-xl flex-wrap items-end gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="space-y-1">
        <label htmlFor="responsavel_id" className="text-xs text-neutral-600">
          Responsável
        </label>
        <select id="responsavel_id" name="responsavel_id" required className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm">
          <option value="">Selecione...</option>
          {responsaveis.map((r) => (
            <option key={r.id} value={r.id}>
              {r.full_name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="aluno_id" className="text-xs text-neutral-600">
          Aluno menor
        </label>
        <select id="aluno_id" name="aluno_id" required className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm">
          <option value="">Selecione...</option>
          {alunosMenores.map((a) => (
            <option key={a.id} value={a.id}>
              {a.full_name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-red-700 px-3 py-1.5 text-sm text-white hover:bg-red-600 disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Vincular"}
      </button>

      {state.error && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
