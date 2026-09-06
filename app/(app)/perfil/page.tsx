import Link from "next/link";
import { Swords, Trophy, Wallet, Users, Award } from "lucide-react";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { ROLE_LABELS, STATUS_MENSALIDADE_LABELS, FAIXA_COR_HEX, labelVeterania, mesesDesde } from "@/lib/domain";
import { getFaixaAtual, getAlunoStats, getProfessorStats, getMensalidadeDoMes, getDependentes } from "@/lib/queries/dashboard";
import { getTotalPresencas } from "@/lib/queries/frequencia";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { FaixaBadge } from "@/components/ui/faixa-badge";
import { PerfilForm } from "./perfil-form";
import { AvatarUpload } from "./avatar-upload";

export default async function PerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ aluno?: string }>;
}) {
  const profile = await requireProfile();
  const { aluno: alunoId } = await searchParams;

  // Responsável olhando o perfil de um dependente (leitura — RLS garante o vínculo)
  if (alunoId && profile.role === "responsavel" && alunoId !== profile.id) {
    return <DependentePerfil alunoId={alunoId} />;
  }

  const supabase = await createClient();
  const faixa = await getFaixaAtual(supabase, profile.id);
  const corFaixa = faixa ? (FAIXA_COR_HEX[faixa.faixa] ?? null) : null;

  const mesesNaFaixa = faixa ? mesesDesde(faixa.data) : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Meu perfil" />

      <Card
        className="border-t-4 p-6"
        style={{ borderTopColor: corFaixa ?? "transparent" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-display text-xl font-semibold text-ink-950">{profile.full_name}</p>
            <p className="text-sm text-ink-900/50">{ROLE_LABELS[profile.role]}</p>
          </div>
          {faixa && (
            <div className="text-right">
              <FaixaBadge faixa={faixa.faixa} grau={faixa.grau} />
              <p className="mt-1.5 text-xs text-ink-900/40">{labelVeterania(mesesNaFaixa)}</p>
            </div>
          )}
        </div>
      </Card>

      <PerfilStats profile={profile} />

      <div>
        <AvatarUpload userId={profile.id} fullName={profile.full_name} avatarUrl={profile.avatar_url} />
      </div>
      <PerfilForm
        fullName={profile.full_name}
        phone={profile.phone}
        email={profile.email}
        role={profile.role}
        birthDate={profile.birth_date}
      />
    </div>
  );
}

async function PerfilStats({ profile }: { profile: Awaited<ReturnType<typeof requireProfile>> }) {
  const supabase = await createClient();

  if (profile.role === "aluno" || profile.role === "aluno_menor") {
    const [stats, totalPresencas, mensalidade] = await Promise.all([
      getAlunoStats(supabase, profile.id),
      getTotalPresencas(supabase, profile.id),
      profile.role === "aluno" ? getMensalidadeDoMes(supabase, profile.id) : Promise.resolve(null),
    ]);

    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Minhas turmas" value={stats.minhasTurmas} icon={Swords} />
        <StatCard label="Total de presenças" value={totalPresencas} icon={Trophy} />
        <Link href={`/graduacao/${profile.id}`} className="block">
          <StatCard label="Conquistas" value="Ver todas" icon={Award} />
        </Link>
        {profile.role === "aluno" && (
          <Link href={`/financeiro/${profile.id}`} className="block">
            <StatCard
              label="Mensalidade do mês"
              value={mensalidade ? STATUS_MENSALIDADE_LABELS[mensalidade.status] : "—"}
              icon={Wallet}
            />
          </Link>
        )}
      </div>
    );
  }

  if (profile.role === "professor") {
    const stats = await getProfessorStats(supabase, profile.id);
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Minhas turmas" value={stats.minhasTurmas} icon={Swords} />
        <StatCard label="Meus alunos" value={stats.meusAlunos} icon={Users} />
      </div>
    );
  }

  if (profile.role === "responsavel") {
    const dependentes = await getDependentes(supabase, profile.id);
    if (dependentes.length === 0) return null;
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Dependentes" value={dependentes.length} icon={Users} />
      </div>
    );
  }

  return null;
}

async function DependentePerfil({ alunoId }: { alunoId: string }) {
  const supabase = await createClient();
  const { data: aluno } = await supabase.from("profiles").select("*").eq("id", alunoId).single();

  if (!aluno) {
    return <p className="text-ink-900/50">Aluno não encontrado ou sem vínculo com você.</p>;
  }

  const faixa = await getFaixaAtual(supabase, alunoId);
  const corFaixa = faixa ? (FAIXA_COR_HEX[faixa.faixa] ?? null) : null;

  return (
    <div className="space-y-6">
      <PageHeader title={aluno.full_name} />
      <Card className="max-w-md space-y-3 border-t-4 p-6" style={{ borderTopColor: corFaixa ?? "transparent" }}>
        <Info label="Perfil" value={ROLE_LABELS[aluno.role]} />
        <Info
          label="Data de nascimento"
          value={
            aluno.birth_date
              ? new Date(aluno.birth_date + "T00:00:00").toLocaleDateString("pt-BR")
              : "—"
          }
        />
        <Info label="Telefone" value={aluno.phone ?? "—"} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-900/40">Faixa atual</p>
          {faixa ? (
            <div className="mt-1">
              <FaixaBadge faixa={faixa.faixa} grau={faixa.grau} />
            </div>
          ) : (
            <p className="font-medium text-ink-950">—</p>
          )}
        </div>
      </Card>
      <Link
        href={`/graduacao/${alunoId}`}
        className="flex w-fit items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
      >
        Ver graduação e conquistas completas
      </Link>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-900/40">{label}</p>
      <p className="font-medium text-ink-950">{value}</p>
    </div>
  );
}
