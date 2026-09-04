import Link from "next/link";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/supabase/current-user";

export default async function ConfiguracoesPage() {
  const profile = await requireProfile();
  if (profile.role !== "dono") redirect("/");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Configurações</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link href="/configuracoes/usuarios" className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm hover:border-red-300">
          <p className="font-medium text-neutral-900">Usuários</p>
          <p className="mt-1 text-sm text-neutral-500">Ver e alterar o perfil de cada pessoa cadastrada.</p>
        </Link>
        <Link href="/configuracoes/vinculos" className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm hover:border-red-300">
          <p className="font-medium text-neutral-900">Vínculos responsável ↔ aluno menor</p>
          <p className="mt-1 text-sm text-neutral-500">Associe responsáveis aos alunos menores de idade.</p>
        </Link>
        <Link href="/aulas" className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm hover:border-red-300">
          <p className="font-medium text-neutral-900">Turmas</p>
          <p className="mt-1 text-sm text-neutral-500">Criar turmas, atribuir professores e matricular alunos.</p>
        </Link>
        <Link href="/financeiro/planos" className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm hover:border-red-300">
          <p className="font-medium text-neutral-900">Planos financeiros</p>
          <p className="mt-1 text-sm text-neutral-500">Gerenciar os planos de mensalidade da academia.</p>
        </Link>
      </div>
    </div>
  );
}
