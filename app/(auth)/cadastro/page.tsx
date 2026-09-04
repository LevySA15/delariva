"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signup, type AuthState } from "../actions";
import { ROLE_LABELS, type UserRole } from "@/lib/domain";

const initialState: AuthState = { error: null };

const ROLE_OPTIONS: UserRole[] = ["aluno", "aluno_menor", "responsavel", "professor", "dono"];

const inputClass =
  "w-full rounded-md border border-white/10 bg-ink-950 px-3 py-2 text-white outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/30";
const labelClass = "text-xs font-semibold uppercase tracking-wide text-white/40";

export default function CadastroPage() {
  const [state, formAction, pending] = useActionState(signup, initialState);
  const [role, setRole] = useState<UserRole>("aluno");

  return (
    <form action={formAction} className="space-y-4">
      <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-white">Criar conta</h2>

      <div className="space-y-1.5">
        <label htmlFor="full_name" className={labelClass}>
          Nome completo
        </label>
        <input id="full_name" name="full_name" required className={inputClass} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className={labelClass}>
          E-mail
        </label>
        <input id="email" name="email" type="email" required className={inputClass} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className={labelClass}>
          Senha
        </label>
        <input id="password" name="password" type="password" minLength={6} required className={inputClass} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="role" className={labelClass}>
          Perfil
        </label>
        <select
          id="role"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className={inputClass}
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
      </div>

      {role === "aluno_menor" && (
        <div className="space-y-1.5">
          <label htmlFor="birth_date" className={labelClass}>
            Data de nascimento
          </label>
          <input id="birth_date" name="birth_date" type="date" required className={inputClass} />
          <p className="text-xs text-white/30">O vínculo com o responsável é feito depois, em Configurações.</p>
        </div>
      )}

      {state.error && <p className="text-sm text-brand-500">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-brand-600 px-3 py-2.5 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Criando conta..." : "Criar conta"}
      </button>

      <p className="text-center text-sm text-white/40">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-brand-500 hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
