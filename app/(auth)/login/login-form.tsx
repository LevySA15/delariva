"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { login, type AuthState } from "../actions";

const initialState: AuthState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);
  const searchParams = useSearchParams();
  const cadastrado = searchParams.get("cadastrado");

  return (
    <form action={formAction} className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Entrar</h2>

      {cadastrado && (
        <p className="rounded-md bg-emerald-950 px-3 py-2 text-sm text-emerald-300">
          Cadastro realizado! Faça login para continuar.
        </p>
      )}

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm text-neutral-300">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-white outline-none focus:border-red-600"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm text-neutral-300">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-white outline-none focus:border-red-600"
        />
      </div>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-red-700 px-3 py-2 font-medium text-white transition hover:bg-red-600 disabled:opacity-60"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>

      <p className="text-center text-sm text-neutral-400">
        Não tem conta?{" "}
        <Link href="/cadastro" className="text-red-400 hover:underline">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
