import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { listAlunosAtivos, listPlanos } from "@/lib/queries/financeiro";
import { NovaMensalidadeForm } from "./nova-mensalidade-form";

export default async function NovaMensalidadePage() {
  const profile = await requireProfile();
  if (profile.role !== "dono") redirect("/financeiro");

  const supabase = await createClient();
  const [alunos, planos] = await Promise.all([listAlunosAtivos(supabase), listPlanos(supabase)]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Lançar mensalidade</h1>
      <NovaMensalidadeForm alunos={alunos} planos={planos} />
    </div>
  );
}
