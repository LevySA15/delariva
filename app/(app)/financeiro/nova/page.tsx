import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { listAlunosAtivos, listPlanos } from "@/lib/queries/financeiro";
import { PageHeader } from "@/components/ui/page-header";
import { NovaMensalidadeForm } from "./nova-mensalidade-form";

export default async function NovaMensalidadePage() {
  const profile = await requireProfile();
  if (profile.role !== "dono") redirect("/financeiro");

  const supabase = await createClient();
  const [alunos, planos] = await Promise.all([listAlunosAtivos(supabase), listPlanos(supabase)]);

  return (
    <div>
      <PageHeader title="Lançar mensalidade" />
      <NovaMensalidadeForm alunos={alunos} planos={planos} />
    </div>
  );
}
