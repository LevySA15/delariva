import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { getDependentes } from "@/lib/queries/dashboard";
import { listAlunosDoProfessor, listTodosAlunos } from "@/lib/queries/graduacao";
import { PageHeader } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { AlunosList } from "./alunos-list";

export default async function GraduacaoIndexPage() {
  const profile = await requireProfile();

  if (profile.role === "aluno" || profile.role === "aluno_menor") {
    redirect(`/graduacao/${profile.id}`);
  }

  const supabase = await createClient();

  let alunos: { id: string; full_name: string; faixa: { faixa: string; grau: number } | null }[] = [];

  if (profile.role === "dono") {
    alunos = await listTodosAlunos(supabase);
  } else if (profile.role === "professor") {
    alunos = await listAlunosDoProfessor(supabase, profile.id);
  } else if (profile.role === "responsavel") {
    const dependentes = await getDependentes(supabase, profile.id);
    alunos = dependentes;
    if (alunos.length === 1) {
      redirect(`/graduacao/${alunos[0].id}`);
    }
  }

  return (
    <div>
      <PageHeader
        title="Graduação"
        action={
          <LinkButton href="/graduacao/ranking" variant="secondary" size="sm">
            <Trophy className="h-4 w-4" />
            Ranking de frequência
          </LinkButton>
        }
      />
      <AlunosList alunos={alunos} />
    </div>
  );
}
