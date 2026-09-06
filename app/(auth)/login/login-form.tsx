"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, type AuthState } from "../actions";

const initialState: AuthState = { error: null };

const inputClass =
  "w-full rounded-md border border-white/10 bg-ink-950 px-3 py-2 text-white outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/30";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-white">Entrar</h2>

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-white/40">
          E-mail
        </label>
        <input id="email" name="email" type="email" required className={inputClass} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-white/40">
          Senha
        </label>
        <input id="password" name="password" type="password" required className={inputClass} />
      </div>

      {state.error && <p className="text-sm text-brand-500">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-brand-600 px-3 py-2.5 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>

      <p className="text-center text-sm text-white/40">
        Não tem conta?{" "}
        <Link href="/cadastro" className="font-medium text-brand-500 hover:underline">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
