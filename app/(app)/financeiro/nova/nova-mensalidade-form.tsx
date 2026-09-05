"use client";

import { useActionState, useMemo, useState } from "react";
import { lancarMensalidade, type FormState } from "../actions";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const initialState: FormState = { error: null };

export function NovaMensalidadeForm({
  alunos,
  planos,
}: {
  alunos: { id: string; full_name: string; desconto_percentual: number }[];
  planos: { id: string; nome: string; valor: number }[];
}) {
  const [state, formAction, pending] = useActionState(lancarMensalidade, initialState);
  const [planoId, setPlanoId] = useState("");
  const [alunoId, setAlunoId] = useState("");
  const mesAtual = new Date().toISOString().slice(0, 7) + "-01";

  const planoSelecionado = planos.find((p) => p.id === planoId);
  const alunoSelecionado = alunos.find((a) => a.id === alunoId);

  const valorSugerido = useMemo(() => {
    if (!planoSelecionado) return undefined;
    const desconto = alunoSelecionado?.desconto_percentual ?? 0;
    return Number((planoSelecionado.valor * (1 - desconto / 100)).toFixed(2));
  }, [planoSelecionado, alunoSelecionado]);

  return (
    <form action={formAction} className="max-w-lg space-y-4 rounded-lg border border-ink-900/10 bg-white p-6 shadow-sm">
      <Field label="Aluno" htmlFor="aluno_id">
        <select
          id="aluno_id"
          name="aluno_id"
          required
          value={alunoId}
          onChange={(e) => setAlunoId(e.target.value)}
          className={inputClass}
        >
          <option value="">Selecione...</option>
          {alunos.map((a) => (
            <option key={a.id} value={a.id}>
              {a.full_name}
              {a.desconto_percentual > 0 ? ` (desconto ${a.desconto_percentual}%)` : ""}
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
            defaultValue={valorSugerido}
            key={`${planoId}-${alunoId}`}
            required
            className={inputClass}
          />
        </Field>
      </div>
      {alunoSelecionado && alunoSelecionado.desconto_percentual > 0 && planoSelecionado && (
        <p className="text-xs text-ink-900/50">
          Valor já sugerido com o desconto de {alunoSelecionado.desconto_percentual}% desse aluno. Pode ajustar se precisar.
        </p>
      )}

      {state.error && <p className="text-sm text-brand-700">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Salvando..." : "Lançar mensalidade"}
      </Button>
    </form>
  );
}
