import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { listTurmas } from "@/lib/queries/turmas";
import { PageHeader } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/button";
import { TurmasList } from "./turmas-list";

export default async function AulasPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const turmas = await listTurmas(supabase);

  return (
    <div>
      <PageHeader
        title="Aulas"
        action={
          profile.role === "dono" && <LinkButton href="/aulas/nova">Nova turma</LinkButton>
        }
      />
      <TurmasList turmas={turmas} />
    </div>
  );
}
