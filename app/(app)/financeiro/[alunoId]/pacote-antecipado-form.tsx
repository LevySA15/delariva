"use client";

import { useActionState } from "react";
import { lancarPacoteAntecipado, type FormState } from "../actions";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const initialState: FormState = { error: null };

type Plano = { id: string; nome: string; pacote_meses: number | null; pacote_desconto_percentual: number | null };

export function PacoteAntecipadoForm({ alunoId, planos }: { alunoId: string; planos: Plano[] }) {
  const [state, formAction, pending] = useActionState(lancarPacoteAntecipado, initialState);
  const mesAtual = new Date().toISOString().slice(0, 7) + "-01";

  return (
    <details className="max-w-md rounded-lg border border-ink-900/10 bg-white p-4 shadow-sm">
      <summary className="cursor-pointer text-sm font-semibold text-ink-950">Lançar pacote antecipado</summary>
      <form action={formAction} className="mt-4 space-y-3">
        <input type="hidden" name="aluno_id" value={alunoId} />
        <Field label="Plano" htmlFor="plano_id">
          <select id="plano_id" name="plano_id" required className={inputClass}>
            <option value="">Selecione...</option>
            {planos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} — pague {p.pacote_meses} meses
                {p.pacote_desconto_percentual ? `, ganhe ${p.pacote_desconto_percentual}% off no seguinte` : ""}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Mês inicial do pacote" htmlFor="mes_inicial">
          <input id="mes_inicial" name="mes_inicial" type="date" defaultValue={mesAtual} required className={inputClass} />
        </Field>
        <p className="text-xs text-ink-900/40">
          Os meses do pacote são lançados como já pagos hoje. Se o plano tiver desconto configurado, o mês seguinte
          já entra lançado com o desconto aplicado.
        </p>
        {state.error && <p className="text-sm text-brand-700">{state.error}</p>}
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Lançando..." : "Lançar pacote"}
        </Button>
      </form>
    </details>
  );
}
