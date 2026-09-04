"use client";

import { useActionState } from "react";
import { publicarAviso, type FormState } from "./actions";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const initialState: FormState = { error: null };

export function MuralForm() {
  const [state, formAction, pending] = useActionState(publicarAviso, initialState);

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-ink-900/10 bg-white p-4 shadow-sm">
      <Field label="Título" htmlFor="titulo">
        <input id="titulo" name="titulo" required className={inputClass} />
      </Field>
      <Field label="Mensagem" htmlFor="mensagem">
        <textarea id="mensagem" name="mensagem" rows={3} required className={inputClass} />
      </Field>
      {state.error && <p className="text-sm text-brand-700">{state.error}</p>}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Publicando..." : "Publicar aviso"}
      </Button>
    </form>
  );
}
