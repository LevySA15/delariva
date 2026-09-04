import { redirect } from "next/navigation";
import { Award } from "lucide-react";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { getDependentes } from "@/lib/queries/dashboard";
import { listAlunosDoProfessor, listTodosAlunos } from "@/lib/queries/graduacao";
import { PageHeader } from "@/components/ui/page-header";
import { CardLink } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FaixaBadge } from "@/components/ui/faixa-badge";

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
      <PageHeader title="Graduação" />
      {alunos.length === 0 ? (
        <EmptyState icon={Award} message="Nenhum aluno encontrado." />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {alunos.map((a) => (
            <CardLink key={a.id} href={`/graduacao/${a.id}`} className="p-4">
              <p className="font-semibold text-ink-950">{a.full_name}</p>
              <div className="mt-2">
                {a.faixa ? <FaixaBadge faixa={a.faixa.faixa} grau={a.faixa.grau} /> : <span className="text-sm text-ink-900/40">sem graduação</span>}
              </div>
            </CardLink>
          ))}
        </div>
      )}
    </div>
  );
}
