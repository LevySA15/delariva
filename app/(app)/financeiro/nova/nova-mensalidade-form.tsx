"use client";

import { useActionState, useState } from "react";
import { lancarMensalidade, type FormState } from "../actions";

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
    <form action={formAction} className="max-w-lg space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="space-y-1">
        <label htmlFor="aluno_id" className="text-sm text-neutral-600">
          Aluno
        </label>
        <select id="aluno_id" name="aluno_id" required className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm">
          <option value="">Selecione...</option>
          {alunos.map((a) => (
            <option key={a.id} value={a.id}>
              {a.full_name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="plano_id" className="text-sm text-neutral-600">
          Plano (opcional)
        </label>
        <select
          id="plano_id"
          name="plano_id"
          value={planoId}
          onChange={(e) => setPlanoId(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        >
          <option value="">Nenhum</option>
          {planos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome} (R$ {Number(p.valor).toFixed(2)})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="mes_referencia" className="text-sm text-neutral-600">
            Mês de referência
          </label>
          <input
            id="mes_referencia"
            name="mes_referencia"
            type="date"
            defaultValue={mesAtual}
            required
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="valor" className="text-sm text-neutral-600">
            Valor (R$)
          </label>
          <input
            id="valor"
            name="valor"
            type="number"
            min={0}
            step={0.01}
            defaultValue={planoSelecionado?.valor}
            key={planoSelecionado?.id ?? "sem-plano"}
            required
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-red-700 px-3 py-2 font-medium text-white hover:bg-red-600 disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Lançar mensalidade"}
      </button>
    </form>
  );
}
