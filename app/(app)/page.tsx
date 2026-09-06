import { Megaphone, Users, GraduationCap, Swords, Wallet } from "lucide-react";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { ROLE_LABELS, STATUS_MENSALIDADE_LABELS } from "@/lib/domain";
import { StatCard } from "@/components/stat-card";
import { Card, CardLink } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { FaixaBadge } from "@/components/ui/faixa-badge";
import { BarChart } from "@/components/ui/bar-chart";
import {
  getAlunoStats,
  getDependentes,
  getDonoStats,
  getMensalidadeDoMes,
  getMuralRecente,
  getProfessorStats,
} from "@/lib/queries/dashboard";
import { getReceitaMensal } from "@/lib/queries/financeiro";

export default async function DashboardPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const mural = await getMuralRecente(supabase);

  return (
    <div className="space-y-8">
      <PageHeader title={`Olá, ${profile.full_name.split(" ")[0]}`} subtitle={ROLE_LABELS[profile.role]} showBack={false} />

      {profile.role === "dono" && <DonoStats />}
      {profile.role === "professor" && <ProfessorStats professorId={profile.id} />}
      {(profile.role === "aluno" || profile.role === "aluno_menor") && (
        <AlunoStats alunoId={profile.id} isAluno={profile.role === "aluno"} />
      )}
      {profile.role === "responsavel" && <ResponsavelStats responsavelId={profile.id} />}

      <div>
        <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wide text-ink-900/60">
          <Megaphone className="h-4 w-4 text-brand-600" />
          Mural de avisos
        </h2>
        {mural.length === 0 ? (
          <EmptyState icon={Megaphone} message="Nenhum aviso publicado ainda." />
        ) : (
          <div className="space-y-3">
            {mural.map((aviso) => (
              <Card key={aviso.id} className="p-4">
                <p className="font-semibold text-ink-950">{aviso.titulo}</p>
                <p className="mt-1 text-sm text-ink-900/60">{aviso.mensagem}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

async function DonoStats() {
  const supabase = await createClient();
  const [stats, receita] = await Promise.all([getDonoStats(supabase), getReceitaMensal(supabase, 6)]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Alunos" value={stats.alunos} icon={Users} />
        <StatCard label="Professores" value={stats.professores} icon={GraduationCap} />
        <StatCard label="Turmas ativas" value={stats.turmasAtivas} icon={Swords} />
        <StatCard label="Mensalidades pendentes" value={stats.mensalidadesPendentes} hint="mês atual" icon={Wallet} />
      </div>

      <Card className="p-4">
        <p className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-ink-900/60">
          Receita paga · últimos 6 meses
        </p>
        <BarChart data={receita} format="moeda" />
      </Card>
    </div>
  );
}

async function ProfessorStats({ professorId }: { professorId: string }) {
  const supabase = await createClient();
  const stats = await getProfessorStats(supabase, professorId);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard label="Minhas turmas" value={stats.minhasTurmas} icon={Swords} />
      <StatCard label="Meus alunos" value={stats.meusAlunos} icon={Users} />
    </div>
  );
}

async function AlunoStats({ alunoId, isAluno }: { alunoId: string; isAluno: boolean }) {
  const supabase = await createClient();
  const stats = await getAlunoStats(supabase, alunoId);
  const mensalidade = isAluno ? await getMensalidadeDoMes(supabase, alunoId) : null;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard label="Minhas turmas" value={stats.minhasTurmas} icon={Swords} />
      <StatCard
        label="Faixa atual"
        value={stats.faixa ? `${stats.faixa.faixa} · grau ${stats.faixa.grau}` : "—"}
        icon={GraduationCap}
      />
      {isAluno && (
        <StatCard
          label="Mensalidade do mês"
          value={mensalidade ? STATUS_MENSALIDADE_LABELS[mensalidade.status] : "—"}
          icon={Wallet}
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
      <EmptyState
        icon={Users}
        message="Nenhum aluno vinculado a você ainda. Fale com a academia para associar seus dependentes."
      />
    );
  }

  return (
    <div>
      <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-ink-900/60">
        Seus dependentes
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {dependentes.map((dep) => (
          <CardLink key={dep.id} href={`/perfil?aluno=${dep.id}`} className="p-4">
            <p className="font-semibold text-ink-950">{dep.full_name}</p>
            <div className="mt-2">
              {dep.faixa ? <FaixaBadge faixa={dep.faixa.faixa} grau={dep.faixa.grau} /> : <span className="text-sm text-ink-900/40">Sem graduação</span>}
            </div>
          </CardLink>
        ))}
      </div>
    </div>
  );
}
