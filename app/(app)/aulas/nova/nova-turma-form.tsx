"use client";

import { useActionState } from "react";
import { criarTurma, type TurmaFormState } from "../actions";
import { DIAS_SEMANA_LABELS } from "@/lib/domain";

const initialState: TurmaFormState = { error: null };

export function NovaTurmaForm() {
  const [state, formAction, pending] = useActionState(criarTurma, initialState);

  return (
    <form action={formAction} className="max-w-lg space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="space-y-1">
        <label htmlFor="nome" className="text-sm text-neutral-600">
          Nome da turma
        </label>
        <input
          id="nome"
          name="nome"
          required
          placeholder="Ex: Infantil - Ter/Qui 18h"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-red-600"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="faixa_etaria" className="text-sm text-neutral-600">
          Categoria
        </label>
        <select
          id="faixa_etaria"
          name="faixa_etaria"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-red-600"
        >
          <option value="adulto">Adulto</option>
          <option value="infantil">Infantil</option>
        </select>
      </div>

      <div className="space-y-1">
        <span className="text-sm text-neutral-600">Dias da semana</span>
        <div className="grid grid-cols-4 gap-2">
          {DIAS_SEMANA_LABELS.map((label, index) => (
            <label key={index} className="flex items-center gap-1.5 text-sm text-neutral-700">
              <input type="checkbox" name="dias_semana" value={index} />
              {label.slice(0, 3)}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="horario_inicio" className="text-sm text-neutral-600">
            Início
          </label>
          <input
            id="horario_inicio"
            name="horario_inicio"
            type="time"
            required
            className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-red-600"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="horario_fim" className="text-sm text-neutral-600">
            Fim
          </label>
          <input
            id="horario_fim"
            name="horario_fim"
            type="time"
            required
            className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-red-600"
          />
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-red-700 px-3 py-2 font-medium text-white transition hover:bg-red-600 disabled:opacity-60"
      >
        {pending ? "Criando..." : "Criar turma"}
      </button>
    </form>
  );
}
