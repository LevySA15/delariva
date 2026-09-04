"use client";

import { useActionState } from "react";
import { updateOwnProfile, type ProfileFormState } from "./actions";
import { ROLE_LABELS, type UserRole } from "@/lib/domain";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

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
    <form
      action={formAction}
      className="max-w-md space-y-4 rounded-lg border border-ink-900/10 bg-white p-6 shadow-sm"
    >
      <Field label="Nome completo" htmlFor="full_name">
        <input id="full_name" name="full_name" defaultValue={fullName} required className={inputClass} />
      </Field>

      <Field label="Telefone" htmlFor="phone">
        <input id="phone" name="phone" defaultValue={phone ?? ""} placeholder="(00) 00000-0000" className={inputClass} />
      </Field>

      <Field label="E-mail" htmlFor="email-display">
        <p id="email-display" className="rounded-md bg-ink-950/[0.04] px-3 py-2 text-sm text-ink-900/60">
          {email ?? "—"}
        </p>
      </Field>

      <Field label="Perfil" htmlFor="role-display">
        <p id="role-display" className="rounded-md bg-ink-950/[0.04] px-3 py-2 text-sm text-ink-900/60">
          {ROLE_LABELS[role]}
        </p>
      </Field>

      {birthDate && (
        <Field label="Data de nascimento" htmlFor="birth-display">
          <p id="birth-display" className="rounded-md bg-ink-950/[0.04] px-3 py-2 text-sm text-ink-900/60">
            {new Date(birthDate + "T00:00:00").toLocaleDateString("pt-BR")}
          </p>
        </Field>
      )}

      {state.error && <p className="text-sm text-brand-700">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-600">Dados atualizados!</p>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Salvando..." : "Salvar alterações"}
      </Button>
    </form>
  );
}
