import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { listUsuarios } from "@/lib/queries/configuracoes";
import { PageHeader } from "@/components/ui/page-header";
import { UsuariosList } from "./usuarios-list";

export default async function UsuariosPage() {
  const profile = await requireProfile();
  if (profile.role !== "dono") redirect("/");

  const supabase = await createClient();
  const usuarios = await listUsuarios(supabase);

  return (
    <div>
      <PageHeader title="Usuários" />
      <UsuariosList usuarios={usuarios} />
    </div>
  );
}
