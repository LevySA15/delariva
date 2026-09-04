"use client";

import { useActionState } from "react";
import { updateOwnProfile, type ProfileFormState } from "./actions";
import { ROLE_LABELS, type UserRole } from "@/lib/domain";

const initialState: ProfileFormState = { error: null };

export function PerfilForm({
  fullName,
  phone,
  email,
  role,
  birthDate,
}: {
  fullName: string;
  phone: string | null;
  email: string | null;
  role: UserRole;
  birthDate: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateOwnProfile, initialState);

  return (
    <form action={formAction} className="max-w-md space-y-4 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="space-y-1">
        <label htmlFor="full_name" className="text-sm text-neutral-600">
          Nome completo
        </label>
        <input
          id="full_name"
          name="full_name"
          defaultValue={fullName}
          required
          className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-red-600"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="phone" className="text-sm text-neutral-600">
          Telefone
        </label>
        <input
          id="phone"
          name="phone"
          defaultValue={phone ?? ""}
          placeholder="(00) 00000-0000"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 outline-none focus:border-red-600"
        />
      </div>

      <div className="space-y-1">
        <span className="text-sm text-neutral-600">E-mail</span>
        <p className="rounded-md bg-neutral-100 px-3 py-2 text-neutral-500">{email ?? "—"}</p>
      </div>

      <div className="space-y-1">
        <span className="text-sm text-neutral-600">Perfil</span>
        <p className="rounded-md bg-neutral-100 px-3 py-2 text-neutral-500">{ROLE_LABELS[role]}</p>
      </div>

      {birthDate && (
        <div className="space-y-1">
          <span className="text-sm text-neutral-600">Data de nascimento</span>
          <p className="rounded-md bg-neutral-100 px-3 py-2 text-neutral-500">
            {new Date(birthDate + "T00:00:00").toLocaleDateString("pt-BR")}
          </p>
        </div>
      )}

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-600">Dados atualizados!</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-red-700 px-3 py-2 font-medium text-white transition hover:bg-red-600 disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}
