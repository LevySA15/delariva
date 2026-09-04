"use client";

import { useRef } from "react";
import { atualizarRole } from "../actions";
import { ROLE_LABELS, type UserRole } from "@/lib/domain";
import { inputClass } from "@/components/ui/field";

const ROLES: UserRole[] = ["aluno", "aluno_menor", "responsavel", "professor", "dono"];

export function RoleSelectForm({ userId, role }: { userId: string; role: UserRole }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={atualizarRole.bind(null, userId)}>
      <select
        name="role"
        defaultValue={role}
        onChange={() => formRef.current?.requestSubmit()}
        className={`${inputClass} py-1.5 text-sm`}
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABELS[r]}
          </option>
        ))}
      </select>
    </form>
  );
}
