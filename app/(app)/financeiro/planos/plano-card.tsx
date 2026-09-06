"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { atualizarPlano, deletarPlano } from "../actions";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/lib/supabase/database.types";

type Plano = Database["public"]["Tables"]["planos"]["Row"];

export function PlanoCard({ plano }: { plano: Plano }) {
  const [editando, setEditando] = useState(false);

  if (!editando) {
    return (
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-ink-950">{plano.nome}</span>
              {!plano.ativo && <Badge tone="neutral">inativo</Badge>}
            </div>
            <p className="text-sm text-ink-900/50">
              R$ {Number(plano.valor).toFixed(2)} · {plano.periodicidade}
              {plano.pacote_meses && (
                <> · pacote {plano.pacote_meses} meses{plano.pacote_desconto_percentual ? ` (${plano.pacote_desconto_percentual}% off no seguinte)` : ""}</>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setEditando(true)}>
              Editar
            </Button>
            <form action={deletarPlano.bind(null, plano.id)}>
              <button
                type="submit"
                aria-label="Excluir plano"
                className="flex h-8 w-8 items-center justify-center rounded-md text-ink-900/40 transition hover:bg-brand-50 hover:text-brand-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <form
        action={async (formData) => {
          await atualizarPlano(plano.id, formData);
          setEditando(false);
        }}
        className="space-y-3"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="Nome" htmlFor={`nome-${plano.id}`}>
            <input id={`nome-${plano.id}`} name="nome" defaultValue={plano.nome} required className={inputClass} />
          </Field>
          <Field label="Valor (R$)" htmlFor={`valor-${plano.id}`}>
            <input
              id={`valor-${plano.id}`}
              name="valor"
              type="number"
              min={0}
              step={0.01}
              defaultValue={plano.valor}
              required
              className={inputClass}
            />
          </Field>
          <Field label="Periodicidade" htmlFor={`periodicidade-${plano.id}`}>
            <select id={`periodicidade-${plano.id}`} name="periodicidade" defaultValue={plano.periodicidade} className={inputClass}>
              <option value="mensal">Mensal</option>
              <option value="trimestral">Trimestral</option>
              <option value="anual">Anual</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Pacote antecipado (meses, opcional)" htmlFor={`pacote-${plano.id}`}>
            <input
              id={`pacote-${plano.id}`}
              name="pacote_meses"
              type="number"
              min={1}
              defaultValue={plano.pacote_meses ?? ""}
              placeholder="Ex: 2"
              className={inputClass}
            />
          </Field>
          <Field label="Desconto no mês seguinte (%)" htmlFor={`desconto-${plano.id}`}>
            <input
              id={`desconto-${plano.id}`}
              name="pacote_desconto_percentual"
              type="number"
              min={1}
              max={100}
              defaultValue={plano.pacote_desconto_percentual ?? ""}
              placeholder="Ex: 50"
              className={inputClass}
            />
          </Field>
        </div>
        <p className="text-xs text-ink-900/40">
          Se preenchido, o aluno pode pagar esse tanto de meses de uma vez e o mês seguinte já sai com o desconto
          aplicado automaticamente (em &ldquo;Lançar pacote antecipado&rdquo;, na tela do aluno).
        </p>

        <label className="flex items-center gap-2 text-sm text-ink-900/70">
          <input type="checkbox" name="ativo" defaultChecked={plano.ativo} className="h-4 w-4 accent-brand-600" />
          Ativo (aparece pra escolher em novos lançamentos)
        </label>

        <div className="flex gap-2">
          <Button type="submit" size="sm">
            Salvar
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => setEditando(false)}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}
