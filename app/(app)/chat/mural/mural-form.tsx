"use client";

import { useActionState } from "react";
import { publicarAviso, type FormState } from "./actions";

const initialState: FormState = { error: null };

export function MuralForm() {
  const [state, formAction, pending] = useActionState(publicarAviso, initialState);

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="space-y-1">
        <label htmlFor="titulo" className="text-xs text-neutral-600">
          Título
        </label>
        <input id="titulo" name="titulo" required className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
      </div>
      <div className="space-y-1">
        <label htmlFor="mensagem" className="text-xs text-neutral-600">
          Mensagem
        </label>
        <textarea id="mensagem" name="mensagem" rows={3} required className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-red-700 px-3 py-1.5 text-sm text-white hover:bg-red-600 disabled:opacity-60"
      >
        {pending ? "Publicando..." : "Publicar aviso"}
      </button>
    </form>
  );
}
