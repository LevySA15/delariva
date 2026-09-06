import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { getDiretorioDono, getRelacoesAluno, getColegasProfessor } from "@/lib/queries/membros";
import { getDependentes } from "@/lib/queries/dashboard";
import { listAlunosDoProfessor } from "@/lib/queries/graduacao";
import { PageHeader } from "@/components/ui/page-header";
import { RelacoesGrid } from "@/components/relacoes-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { Users } from "lucide-react";

export default async function MembrosPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  if (profile.role === "dono") {
    const grupos = await getDiretorioDono(supabase);
    return (
      <div className="space-y-6">
        <PageHeader title="Membros" subtitle="Toda a academia, agrupada por turma" />
        {grupos.length === 0 ? (
          <EmptyState icon={Users} message="Nenhuma turma com pessoas cadastradas ainda." />
        ) : (
          <RelacoesGrid titulo="Academia" grupos={grupos} />
        )}
      </div>
    );
  }

  if (profile.role === "professor") {
    const [colegas, alunos] = await Promise.all([
      getColegasProfessor(supabase, profile.id),
      listAlunosDoProfessor(supabase, profile.id),
    ]);
    return (
      <div className="space-y-6">
        <PageHeader title="Membros" />
        <RelacoesGrid titulo="Colegas professores" grupos={colegas} />
        {alunos.length > 0 && (
          <RelacoesGrid
            titulo="Meus alunos"
            grupos={[{ turmaId: "todos", turmaNome: "Todas as turmas", pessoas: alunos.map((a) => ({ id: a.id, full_name: a.full_name, avatar_url: null })) }]}
          />
        )}
        {colegas.length === 0 && alunos.length === 0 && (
          <EmptyState icon={Users} message="Você ainda não leciona nenhuma turma." />
        )}
      </div>
    );
  }

  if (profile.role === "aluno" || profile.role === "aluno_menor") {
    const { professores, colegas } = await getRelacoesAluno(supabase, profile.id);
    return (
      <div className="space-y-6">
        <PageHeader title="Membros" />
        <RelacoesGrid titulo="Meus professores" grupos={professores} />
        <RelacoesGrid titulo="Colegas de turma" grupos={colegas} />
        {professores.length === 0 && colegas.length === 0 && (
          <EmptyState icon={Users} message="Você ainda não está matriculado em nenhuma turma." />
        )}
      </div>
    );
  }

  // responsavel
  const dependentes = await getDependentes(supabase, profile.id);
  return (
    <div className="space-y-6">
      <PageHeader title="Membros" />
      {dependentes.length === 0 ? (
        <EmptyState icon={Users} message="Nenhum dependente vinculado a você ainda." />
      ) : (
        <RelacoesGrid
          titulo="Seus dependentes"
          grupos={[
            {
              turmaId: "dependentes",
              turmaNome: "Dependentes",
              pessoas: dependentes.map((d) => ({ id: d.id, full_name: d.full_name, avatar_url: null })),
            },
          ]}
        />
      )}
    </div>
  );
}
