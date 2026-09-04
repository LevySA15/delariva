import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { listUsuarios } from "@/lib/queries/configuracoes";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { RoleSelectForm } from "./role-select-form";

export default async function UsuariosPage() {
  const profile = await requireProfile();
  if (profile.role !== "dono") redirect("/");

  const supabase = await createClient();
  const usuarios = await listUsuarios(supabase);

  return (
    <div>
      <PageHeader title="Usuários" />
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
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b border-ink-900/5 last:border-0 hover:bg-ink-950/[0.015]">
                <td className="px-4 py-3 font-medium text-ink-950">{u.full_name}</td>
                <td className="px-4 py-3 text-ink-900/50">{u.email ?? "—"}</td>
                <td className="px-4 py-3">
                  <RoleSelectForm userId={u.id} role={u.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
