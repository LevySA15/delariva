import { redirect } from "next/navigation";
import Link from "next/link";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { getDependentes } from "@/lib/queries/dashboard";
import { listAlunosDoProfessor, listTodosAlunos } from "@/lib/queries/graduacao";

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
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Graduação</h1>
      {alunos.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhum aluno encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {alunos.map((a) => (
            <Link
              key={a.id}
              href={`/graduacao/${a.id}`}
              className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-red-300"
            >
              <p className="font-medium text-neutral-900">{a.full_name}</p>
              <p className="mt-1 text-sm text-neutral-500">
                {a.faixa ? `${a.faixa.faixa} · grau ${a.faixa.grau}` : "sem graduação"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
