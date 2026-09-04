"use client";

import { useActionState } from "react";
import { registrarAvaliacao, type FormState } from "./actions";
import { CRITERIOS_AVALIACAO, CRITERIO_LABELS } from "@/lib/domain";

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
    <form action={formAction} className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="font-medium text-neutral-900">Nova avaliação</p>

      <div className="space-y-1">
        <label htmlFor="nota_geral" className="text-xs text-neutral-600">
          Nota geral (0-10)
        </label>
        <input
          id="nota_geral"
          name="nota_geral"
          type="number"
          min={0}
          max={10}
          step={0.5}
          className="w-32 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CRITERIOS_AVALIACAO.map((criterio) => (
          <div key={criterio} className="space-y-1">
            <label htmlFor={`criterio_${criterio}`} className="text-xs text-neutral-600">
              {CRITERIO_LABELS[criterio]}
            </label>
            <input
              id={`criterio_${criterio}`}
              name={`criterio_${criterio}`}
              type="number"
              min={0}
              max={10}
              step={0.5}
              className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </div>
        ))}
      </div>

      <div className="space-y-1">
        <label htmlFor="comentario" className="text-xs text-neutral-600">
          Comentário
        </label>
        <textarea
          id="comentario"
          name="comentario"
          rows={3}
          className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
        />
      </div>

      {graduacoes.length > 0 && (
        <div className="space-y-1">
          <label htmlFor="graduacao_id" className="text-xs text-neutral-600">
            Vincular a uma graduação (opcional)
          </label>
          <select
            id="graduacao_id"
            name="graduacao_id"
            defaultValue=""
            className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
          >
            <option value="">Nenhuma</option>
            {graduacoes.map((g) => (
              <option key={g.id} value={g.id}>
                {g.faixa} · grau {g.grau} ({new Date(g.data + "T00:00:00").toLocaleDateString("pt-BR")})
              </option>
            ))}
          </select>
        </div>
      )}

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white hover:bg-neutral-800 disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Registrar avaliação"}
      </button>
    </form>
  );
}
