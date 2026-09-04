import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { listUsuarios } from "@/lib/queries/configuracoes";
import { RoleSelectForm } from "./role-select-form";

export default async function UsuariosPage() {
  const profile = await requireProfile();
  if (profile.role !== "dono") redirect("/");

  const supabase = await createClient();
  const usuarios = await listUsuarios(supabase);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Usuários</h1>
      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">E-mail</th>
              <th className="px-4 py-2">Perfil</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-2">{u.full_name}</td>
                <td className="px-4 py-2 text-neutral-500">{u.email ?? "—"}</td>
                <td className="px-4 py-2">
                  <RoleSelectForm userId={u.id} role={u.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
