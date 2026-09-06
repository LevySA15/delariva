"use client";

import { useActionState } from "react";
import { lancarCobrancaAvulsa, type FormState } from "../actions";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const initialState: FormState = { error: null };

export function NovaCobrancaForm({ alunoId }: { alunoId: string }) {
  const [state, formAction, pending] = useActionState(lancarCobrancaAvulsa, initialState);

  return (
    <details className="max-w-md rounded-lg border border-ink-900/10 bg-white p-4 shadow-sm">
      <summary className="cursor-pointer text-sm font-semibold text-ink-950">Lançar cobrança avulsa</summary>
      <form action={formAction} className="mt-4 space-y-3">
        <input type="hidden" name="aluno_id" value={alunoId} />
        <Field label="Descrição" htmlFor="descricao">
          <input id="descricao" name="descricao" required placeholder="Ex: Taxa de exame de faixa" className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Valor" htmlFor="valor">
            <input id="valor" name="valor" type="number" min={0.01} step={0.01} required className={inputClass} />
          </Field>
          <Field label="Vencimento (opcional)" htmlFor="data_vencimento">
            <input id="data_vencimento" name="data_vencimento" type="date" className={inputClass} />
          </Field>
        </div>
        {state.error && <p className="text-sm text-brand-700">{state.error}</p>}
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Lançando..." : "Lançar"}
        </Button>
      </form>
    </details>
  );
}
