"use client";

import { useActionState, useState } from "react";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS, type UserRole } from "@/lib/domain";
import { enviarNotificacaoPersonalizada, type FormState } from "./actions";

const initialState: FormState = { error: null };

const PAPEIS = Object.keys(ROLE_LABELS) as UserRole[];

export function NotificacaoForm({ turmas }: { turmas: { id: string; nome: string }[] }) {
  const [state, formAction, pending] = useActionState(enviarNotificacaoPersonalizada, initialState);
  const [publico, setPublico] = useState<"todos" | "papel" | "turma">("todos");

  return (
    <form
      action={formAction}
      className="max-w-lg space-y-4 rounded-lg border border-ink-900/10 bg-white p-6 shadow-sm"
    >
      <Field label="Título" htmlFor="titulo">
        <input id="titulo" name="titulo" required maxLength={80} className={inputClass} />
      </Field>

      <Field label="Mensagem" htmlFor="corpo">
        <textarea id="corpo" name="corpo" required rows={3} maxLength={500} className={inputClass} />
      </Field>

      <div className="space-y-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-900/50">Público</span>
        <select
          name="publico"
          value={publico}
          onChange={(e) => setPublico(e.target.value as typeof publico)}
          className={inputClass}
        >
          <option value="todos">Todos</option>
          <option value="papel">Por papel</option>
          <option value="turma">Por turma</option>
        </select>
      </div>

      {publico === "papel" && (
        <Field label="Papel" htmlFor="papel">
          <select id="papel" name="papel" className={inputClass}>
            {PAPEIS.map((papel) => (
              <option key={papel} value={papel}>
                {ROLE_LABELS[papel]}
              </option>
            ))}
          </select>
        </Field>
      )}

      {publico === "turma" && (
        <Field label="Turma" htmlFor="turma_id">
          <select id="turma_id" name="turma_id" className={inputClass}>
            {turmas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        </Field>
      )}

      {state.error && <p className="text-sm text-brand-700">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-700">Notificação enviada.</p>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Enviando..." : "Enviar notificação"}
      </Button>
    </form>
  );
}
