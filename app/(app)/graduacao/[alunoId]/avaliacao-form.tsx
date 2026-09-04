"use client";

import { useActionState } from "react";
import { registrarAvaliacao, type FormState } from "./actions";
import { CRITERIOS_AVALIACAO, CRITERIO_LABELS } from "@/lib/domain";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const initialState: FormState = { error: null };

export function AvaliacaoForm({
  alunoId,
  graduacoes,
}: {
  alunoId: string;
  graduacoes: { id: string; faixa: string; grau: number; data: string }[];
}) {
  const [state, formAction, pending] = useActionState(registrarAvaliacao.bind(null, alunoId), initialState);

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-ink-900/10 bg-white p-4 shadow-sm">
      <p className="font-display text-sm font-semibold uppercase tracking-wide text-ink-950">Nova avaliação</p>

      <Field label="Nota geral (0-10)" htmlFor="nota_geral">
        <input id="nota_geral" name="nota_geral" type="number" min={0} max={10} step={0.5} className={`w-32 ${inputClass}`} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        {CRITERIOS_AVALIACAO.map((criterio) => (
          <Field key={criterio} label={CRITERIO_LABELS[criterio]} htmlFor={`criterio_${criterio}`}>
            <input
              id={`criterio_${criterio}`}
              name={`criterio_${criterio}`}
              type="number"
              min={0}
              max={10}
              step={0.5}
              className={inputClass}
            />
          </Field>
        ))}
      </div>

      <Field label="Comentário" htmlFor="comentario">
        <textarea id="comentario" name="comentario" rows={3} className={inputClass} />
      </Field>

      {graduacoes.length > 0 && (
        <Field label="Vincular a uma graduação (opcional)" htmlFor="graduacao_id">
          <select id="graduacao_id" name="graduacao_id" defaultValue="" className={inputClass}>
            <option value="">Nenhuma</option>
            {graduacoes.map((g) => (
              <option key={g.id} value={g.id}>
                {g.faixa} · grau {g.grau} ({new Date(g.data + "T00:00:00").toLocaleDateString("pt-BR")})
              </option>
            ))}
          </select>
        </Field>
      )}

      {state.error && <p className="text-sm text-brand-700">{state.error}</p>}

      <Button type="submit" variant="secondary" size="sm" disabled={pending}>
        {pending ? "Salvando..." : "Registrar avaliação"}
      </Button>
    </form>
  );
}
