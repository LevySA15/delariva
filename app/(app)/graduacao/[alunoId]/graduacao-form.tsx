"use client";

import { useActionState, useState } from "react";
import { registrarGraduacao, type FormState } from "./actions";
import { faixasPorCategoria, GRAUS_POR_FAIXA, type FaixaCategoria } from "@/lib/domain";

const initialState: FormState = { error: null };

export function GraduacaoForm({ alunoId, categoriaPadrao }: { alunoId: string; categoriaPadrao: FaixaCategoria }) {
  const [state, formAction, pending] = useActionState(registrarGraduacao.bind(null, alunoId), initialState);
  const [categoria, setCategoria] = useState<FaixaCategoria>(categoriaPadrao);
  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="font-medium text-neutral-900">Nova graduação</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="faixa_categoria" className="text-xs text-neutral-600">
            Categoria
          </label>
          <select
            id="faixa_categoria"
            name="faixa_categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as FaixaCategoria)}
            className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
          >
            <option value="adulto">Adulto</option>
            <option value="infantil">Infantil</option>
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="faixa" className="text-xs text-neutral-600">
            Faixa
          </label>
          <select id="faixa" name="faixa" className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm">
            {faixasPorCategoria(categoria).map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="grau" className="text-xs text-neutral-600">
            Grau
          </label>
          <select id="grau" name="grau" defaultValue={0} className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm">
            {GRAUS_POR_FAIXA.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="data" className="text-xs text-neutral-600">
            Data
          </label>
          <input
            id="data"
            name="data"
            type="date"
            defaultValue={hoje}
            className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="observacao" className="text-xs text-neutral-600">
          Observação
        </label>
        <textarea
          id="observacao"
          name="observacao"
          rows={2}
          className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white hover:bg-neutral-800 disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Registrar graduação"}
      </button>
    </form>
  );
}
