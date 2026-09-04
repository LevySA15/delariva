"use client";

import { useActionState, useState } from "react";
import { registrarGraduacao, type FormState } from "./actions";
import { faixasPorCategoria, GRAUS_POR_FAIXA, type FaixaCategoria } from "@/lib/domain";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const initialState: FormState = { error: null };

export function GraduacaoForm({ alunoId, categoriaPadrao }: { alunoId: string; categoriaPadrao: FaixaCategoria }) {
  const [state, formAction, pending] = useActionState(registrarGraduacao.bind(null, alunoId), initialState);
  const [categoria, setCategoria] = useState<FaixaCategoria>(categoriaPadrao);
  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-ink-900/10 bg-white p-4 shadow-sm">
      <p className="font-display text-sm font-semibold uppercase tracking-wide text-ink-950">Nova graduação</p>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Categoria" htmlFor="faixa_categoria">
          <select
            id="faixa_categoria"
            name="faixa_categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as FaixaCategoria)}
            className={inputClass}
          >
            <option value="adulto">Adulto</option>
            <option value="infantil">Infantil</option>
          </select>
        </Field>

        <Field label="Faixa" htmlFor="faixa">
          <select id="faixa" name="faixa" className={inputClass}>
            {faixasPorCategoria(categoria).map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Grau" htmlFor="grau">
          <select id="grau" name="grau" defaultValue={0} className={inputClass}>
            {GRAUS_POR_FAIXA.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Data" htmlFor="data">
          <input id="data" name="data" type="date" defaultValue={hoje} className={inputClass} />
        </Field>
      </div>

      <Field label="Observação" htmlFor="observacao">
        <textarea id="observacao" name="observacao" rows={2} className={inputClass} />
      </Field>

      {state.error && <p className="text-sm text-brand-700">{state.error}</p>}

      <Button type="submit" variant="secondary" size="sm" disabled={pending}>
        {pending ? "Salvando..." : "Registrar graduação"}
      </Button>
    </form>
  );
}
