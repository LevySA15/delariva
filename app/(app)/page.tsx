import Link from "next/link";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { ROLE_LABELS, STATUS_MENSALIDADE_LABELS } from "@/lib/domain";
import { StatCard } from "@/components/stat-card";
import {
  getAlunoStats,
  getDependentes,
  getDonoStats,
  getMensalidadeDoMes,
  getMuralRecente,
  getProfessorStats,
} from "@/lib/queries/dashboard";

export default async function DashboardPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const mural = await getMuralRecente(supabase);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          Olá, {profile.full_name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-neutral-500">Perfil: {ROLE_LABELS[profile.role]}</p>
      </div>

      {profile.role === "dono" && <DonoStats />}
      {profile.role === "professor" && <ProfessorStats professorId={profile.id} />}
      {(profile.role === "aluno" || profile.role === "aluno_menor") && (
        <AlunoStats alunoId={profile.id} isAluno={profile.role === "aluno"} />
      )}
      {profile.role === "responsavel" && <ResponsavelStats responsavelId={profile.id} />}

      <div>
        <h2 className="mb-3 text-lg font-semibold text-neutral-900">Mural de avisos</h2>
        {mural.length === 0 ? (
          <p className="text-sm text-neutral-500">Nenhum aviso publicado ainda.</p>
        ) : (
          <ul className="space-y-3">
            {mural.map((aviso) => (
              <li key={aviso.id} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                <p className="font-medium text-neutral-900">{aviso.titulo}</p>
                <p className="mt-1 text-sm text-neutral-600">{aviso.mensagem}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

async function DonoStats() {
  const supabase = await createClient();
  const stats = await getDonoStats(supabase);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard label="Alunos" value={stats.alunos} />
      <StatCard label="Professores" value={stats.professores} />
      <StatCard label="Turmas ativas" value={stats.turmasAtivas} />
      <StatCard
        label="Mensalidades pendentes"
        value={stats.mensalidadesPendentes}
        hint="mês atual"
      />
    </div>
  );
}

async function ProfessorStats({ professorId }: { professorId: string }) {
  const supabase = await createClient();
  const stats = await getProfessorStats(supabase, professorId);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard label="Minhas turmas" value={stats.minhasTurmas} />
      <StatCard label="Meus alunos" value={stats.meusAlunos} />
    </div>
  );
}

async function AlunoStats({ alunoId, isAluno }: { alunoId: string; isAluno: boolean }) {
  const supabase = await createClient();
  const stats = await getAlunoStats(supabase, alunoId);
  const mensalidade = isAluno ? await getMensalidadeDoMes(supabase, alunoId) : null;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard label="Minhas turmas" value={stats.minhasTurmas} />
      <StatCard
        label="Faixa atual"
        value={stats.faixa ? `${stats.faixa.faixa} · grau ${stats.faixa.grau}` : "—"}
      />
      {isAluno && (
        <StatCard
          label="Mensalidade do mês"
          value={mensalidade ? STATUS_MENSALIDADE_LABELS[mensalidade.status] : "—"}
        />
      )}
    </div>
  );
}

async function ResponsavelStats({ responsavelId }: { responsavelId: string }) {
  const supabase = await createClient();
  const dependentes = await getDependentes(supabase, responsavelId);

  if (dependentes.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        Nenhum aluno vinculado a você ainda. Fale com a academia para associar seus dependentes.
      </p>
    );
  }

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold text-neutral-900">Seus dependentes</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {dependentes.map((dep) => (
          <Link
            key={dep.id}
            href={`/perfil?aluno=${dep.id}`}
            className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-red-300"
          >
            <p className="font-medium text-neutral-900">{dep.full_name}</p>
            <p className="mt-1 text-sm text-neutral-500">
              Faixa: {dep.faixa ? `${dep.faixa.faixa} · grau ${dep.faixa.grau}` : "—"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
