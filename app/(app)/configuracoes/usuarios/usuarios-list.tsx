"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { inputClass } from "@/components/ui/field";
import { ROLE_LABELS, type UserRole } from "@/lib/domain";
import { RoleSelectForm } from "./role-select-form";

type Usuario = { id: string; full_name: string; email: string | null; role: UserRole };

const ROLE_FILTERS: (UserRole | "todos")[] = ["todos", "dono", "professor", "aluno", "aluno_menor", "responsavel"];

export function UsuariosList({ usuarios }: { usuarios: Usuario[] }) {
  const [busca, setBusca] = useState("");
  const [roleFiltro, setRoleFiltro] = useState<UserRole | "todos">("todos");

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return usuarios.filter((u) => {
      const bateBusca =
        !termo || u.full_name.toLowerCase().includes(termo) || (u.email ?? "").toLowerCase().includes(termo);
      const bateRole = roleFiltro === "todos" || u.role === roleFiltro;
      return bateBusca && bateRole;
    });
  }, [usuarios, busca, roleFiltro]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <SearchInput value={busca} onChange={setBusca} placeholder="Buscar por nome ou e-mail..." className="max-w-xs flex-1" />
        <select
          value={roleFiltro}
          onChange={(e) => setRoleFiltro(e.target.value as UserRole | "todos")}
          className={`${inputClass} w-auto`}
        >
          {ROLE_FILTERS.map((r) => (
            <option key={r} value={r}>
              {r === "todos" ? "Todos os perfis" : ROLE_LABELS[r]}
            </option>
          ))}
        </select>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-900/10 bg-ink-950/[0.02] text-left text-xs font-semibold uppercase tracking-wide text-ink-900/50">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Perfil</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((u) => (
              <tr key={u.id} className="border-b border-ink-900/5 last:border-0 hover:bg-ink-950/[0.015]">
                <td className="px-4 py-3 font-medium text-ink-950">{u.full_name}</td>
                <td className="px-4 py-3 text-ink-900/50">{u.email ?? "—"}</td>
                <td className="px-4 py-3">
                  <RoleSelectForm userId={u.id} role={u.role} />
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-ink-900/40">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
