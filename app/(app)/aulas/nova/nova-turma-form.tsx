"use client";

import { useActionState } from "react";
import { criarTurma, type TurmaFormState } from "../actions";
import { DIAS_SEMANA_LABELS } from "@/lib/domain";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const initialState: TurmaFormState = { error: null };

export function NovaTurmaForm() {
  const [state, formAction, pending] = useActionState(criarTurma, initialState);

  return (
    <form
      action={formAction}
      className="max-w-lg space-y-4 rounded-lg border border-ink-900/10 bg-white p-6 shadow-sm"
    >
      <Field label="Nome da turma" htmlFor="nome">
        <input id="nome" name="nome" required placeholder="Ex: Infantil - Ter/Qui 18h" className={inputClass} />
      </Field>

      <Field label="Categoria" htmlFor="faixa_etaria">
        <select id="faixa_etaria" name="faixa_etaria" className={inputClass}>
          <option value="adulto">Adulto</option>
          <option value="infantil">Infantil</option>
        </select>
      </Field>

      <div className="space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-900/50">Dias da semana</span>
        <div className="grid grid-cols-4 gap-2">
          {DIAS_SEMANA_LABELS.map((label, index) => (
            <label
              key={index}
              className="flex items-center gap-1.5 rounded-md border border-ink-900/10 px-2 py-1.5 text-sm text-ink-900/70 has-checked:border-brand-600 has-checked:bg-brand-50 has-checked:text-brand-700"
            >
              <input type="checkbox" name="dias_semana" value={index} className="accent-brand-600" />
              {label.slice(0, 3)}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Início" htmlFor="horario_inicio">
          <input id="horario_inicio" name="horario_inicio" type="time" required className={inputClass} />
        </Field>
        <Field label="Fim" htmlFor="horario_fim">
          <input id="horario_fim" name="horario_fim" type="time" required className={inputClass} />
        </Field>
      </div>

      <Field label="Capacidade máxima de vagas (opcional)" htmlFor="capacidade_maxima">
        <input
          id="capacidade_maxima"
          name="capacidade_maxima"
          type="number"
          min={1}
          placeholder="Sem limite"
          className={inputClass}
        />
      </Field>

      {state.error && <p className="text-sm text-brand-700">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Criando..." : "Criar turma"}
      </Button>
    </form>
  );
}
