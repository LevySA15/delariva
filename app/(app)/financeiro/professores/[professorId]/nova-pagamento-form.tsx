"use client";

import { useActionState } from "react";
import { lancarPagamento, type FormState } from "../actions";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const initialState: FormState = { error: null };

export function NovaPagamentoForm({ professorId }: { professorId: string }) {
  const [state, formAction, pending] = useActionState(lancarPagamento, initialState);
  const mesAtual = new Date().toISOString().slice(0, 7) + "-01";

  return (
    <details className="max-w-md rounded-lg border border-ink-900/10 bg-white p-4 shadow-sm">
      <summary className="cursor-pointer text-sm font-semibold text-ink-950">Lançar pagamento</summary>
      <form action={formAction} className="mt-4 space-y-3">
        <input type="hidden" name="professor_id" value={professorId} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Mês de referência" htmlFor="mes_referencia">
            <input id="mes_referencia" name="mes_referencia" type="date" defaultValue={mesAtual} required className={inputClass} />
          </Field>
          <Field label="Valor (R$)" htmlFor="valor">
            <input id="valor" name="valor" type="number" min={0.01} step={0.01} required className={inputClass} />
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
