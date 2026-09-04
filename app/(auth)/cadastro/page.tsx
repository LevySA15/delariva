"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signup, type AuthState } from "../actions";
import { ROLE_LABELS, type UserRole } from "@/lib/domain";

const initialState: AuthState = { error: null };

const ROLE_OPTIONS: UserRole[] = ["aluno", "aluno_menor", "responsavel", "professor", "dono"];

export default function CadastroPage() {
  const [state, formAction, pending] = useActionState(signup, initialState);
  const [role, setRole] = useState<UserRole>("aluno");

  return (
    <form action={formAction} className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Criar conta</h2>

      <div className="space-y-1">
        <label htmlFor="full_name" className="text-sm text-neutral-300">
          Nome completo
        </label>
        <input
          id="full_name"
          name="full_name"
          required
          className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-white outline-none focus:border-red-600"
        />
      </div>

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
          minLength={6}
          required
          className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-white outline-none focus:border-red-600"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="role" className="text-sm text-neutral-300">
          Perfil
        </label>
        <select
          id="role"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-white outline-none focus:border-red-600"
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
      </div>

      {role === "aluno_menor" && (
        <div className="space-y-1">
          <label htmlFor="birth_date" className="text-sm text-neutral-300">
            Data de nascimento
          </label>
          <input
            id="birth_date"
            name="birth_date"
            type="date"
            required
            className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-white outline-none focus:border-red-600"
          />
          <p className="text-xs text-neutral-500">
            O vínculo com o responsável é feito depois, em Configurações.
          </p>
        </div>
      )}

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-red-700 px-3 py-2 font-medium text-white transition hover:bg-red-600 disabled:opacity-60"
      >
        {pending ? "Criando conta..." : "Criar conta"}
      </button>

      <p className="text-center text-sm text-neutral-400">
        Já tem conta?{" "}
        <Link href="/login" className="text-red-400 hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
