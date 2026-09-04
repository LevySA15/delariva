"use client";

import { useActionState, useState } from "react";
import { lancarMensalidade, type FormState } from "../actions";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const initialState: FormState = { error: null };

export function NovaMensalidadeForm({
  alunos,
  planos,
}: {
  alunos: { id: string; full_name: string }[];
  planos: { id: string; nome: string; valor: number }[];
}) {
  const [state, formAction, pending] = useActionState(lancarMensalidade, initialState);
  const [planoId, setPlanoId] = useState("");
  const mesAtual = new Date().toISOString().slice(0, 7) + "-01";
  const planoSelecionado = planos.find((p) => p.id === planoId);

  return (
    <form action={formAction} className="max-w-lg space-y-4 rounded-lg border border-ink-900/10 bg-white p-6 shadow-sm">
      <Field label="Aluno" htmlFor="aluno_id">
        <select id="aluno_id" name="aluno_id" required className={inputClass}>
          <option value="">Selecione...</option>
          {alunos.map((a) => (
            <option key={a.id} value={a.id}>
              {a.full_name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Plano (opcional)" htmlFor="plano_id">
        <select
          id="plano_id"
          name="plano_id"
          value={planoId}
          onChange={(e) => setPlanoId(e.target.value)}
          className={inputClass}
        >
          <option value="">Nenhum</option>
          {planos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome} (R$ {Number(p.valor).toFixed(2)})
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Mês de referência" htmlFor="mes_referencia">
          <input id="mes_referencia" name="mes_referencia" type="date" defaultValue={mesAtual} required className={inputClass} />
        </Field>
        <Field label="Valor (R$)" htmlFor="valor">
          <input
            id="valor"
            name="valor"
            type="number"
            min={0}
            step={0.01}
            defaultValue={planoSelecionado?.valor}
            key={planoSelecionado?.id ?? "sem-plano"}
            required
            className={inputClass}
          />
        </Field>
      </div>

      {state.error && <p className="text-sm text-brand-700">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Salvando..." : "Lançar mensalidade"}
      </Button>
    </form>
  );
}
