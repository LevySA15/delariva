import Link from "next/link";
import { notFound } from "next/navigation";
import { Swords, Trophy, Wallet, Users, Award } from "lucide-react";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { ROLE_LABELS, STATUS_MENSALIDADE_LABELS, FAIXA_COR_HEX, labelVeterania, mesesDesde, type UserRole } from "@/lib/domain";
import { getFaixaAtual, getAlunoStats, getProfessorStats, getMensalidadeDoMes, getDependentes } from "@/lib/queries/dashboard";
import { getTotalPresencas } from "@/lib/queries/frequencia";
import { getRelacoesAluno, getColegasProfessor, getMembro } from "@/lib/queries/membros";
import { listAlunosDoProfessor } from "@/lib/queries/graduacao";
import { getLinhaDoTempo } from "@/lib/queries/timeline";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { FaixaBadge } from "@/components/ui/faixa-badge";
import { Avatar } from "@/components/avatar";
import { Cover } from "@/components/cover";
import { PerfilChips } from "@/components/perfil-chips";
import { LinhaDoTempo } from "@/components/linha-do-tempo";
import { PerfilForm } from "./perfil-form";
import { AvatarUpload } from "./avatar-upload";
import { CoverUpload } from "./cover-upload";
import { RelacoesGrid } from "@/components/relacoes-grid";

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

  const membroDesde = profile.data_entrada ?? profile.created_at;
  const timeline = await getLinhaDoTempo(supabase, profile.id, membroDesde);

  return (
    <div className="space-y-6">
      <PageHeader title="Meu perfil" />

      <Card className="overflow-hidden border-t-4 p-0" style={{ borderTopColor: corFaixa ?? "transparent" }}>
        <CoverUpload userId={profile.id} coverUrl={profile.cover_url} />
        <div className="p-6 pt-0">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <AvatarUpload userId={profile.id} fullName={profile.full_name} avatarUrl={profile.avatar_url} compact />
              <div className="pb-1">
                <p className="font-display text-xl font-semibold text-ink-950">{profile.full_name}</p>
                <p className="text-sm text-ink-900/50">{ROLE_LABELS[profile.role]}</p>
              </div>
            </div>
            {faixa && (
              <div className="text-right">
                <FaixaBadge faixa={faixa.faixa} grau={faixa.grau} />
                <p className="mt-1.5 text-xs text-ink-900/40">{labelVeterania(mesesNaFaixa)}</p>
              </div>
            )}
          </div>

          {profile.bio && <p className="mt-4 text-sm text-ink-900/80">{profile.bio}</p>}

          <div className="mt-3">
            <PerfilChips cidade={profile.cidade} instagram={profile.instagram} membroDesde={membroDesde} />
          </div>
        </div>
      </Card>

      <PerfilStats profile={profile} />
      <PessoasRelacionadas profile={profile} />

      {timeline.length > 0 && (
        <Card className="p-5">
          <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-ink-900/60">
            Linha do tempo
          </h2>
          <LinhaDoTempo eventos={timeline} />
        </Card>
      )}

      <PerfilForm
        fullName={profile.full_name}
        phone={profile.phone}
        email={profile.email}
        role={profile.role}
        birthDate={profile.birth_date}
        bio={profile.bio}
        instagram={profile.instagram}
        cidade={profile.cidade}
        dataEntrada={profile.data_entrada}
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

async function PessoasRelacionadas({ profile }: { profile: Awaited<ReturnType<typeof requireProfile>> }) {
  const supabase = await createClient();

  if (profile.role === "aluno" || profile.role === "aluno_menor") {
    const { professores, colegas } = await getRelacoesAluno(supabase, profile.id);
    return (
      <>
        <RelacoesGrid titulo="Meus professores" grupos={professores} />
        <RelacoesGrid titulo="Colegas de turma" grupos={colegas} />
      </>
    );
  }

  if (profile.role === "professor") {
    const [colegas, alunos] = await Promise.all([
      getColegasProfessor(supabase, profile.id),
      listAlunosDoProfessor(supabase, profile.id),
    ]);
    return (
      <>
        <RelacoesGrid titulo="Colegas professores" grupos={colegas} />
        {alunos.length > 0 && (
          <RelacoesGrid
            titulo="Meus alunos"
            grupos={[{ turmaId: "todos", turmaNome: "Todas as turmas", pessoas: alunos.map((a) => ({ id: a.id, full_name: a.full_name, avatar_url: null })) }]}
          />
        )}
      </>
    );
  }

  return null;
}

async function DependentePerfil({ alunoId }: { alunoId: string }) {
  const supabase = await createClient();
  const [membro, { data: extra }] = await Promise.all([
    getMembro(supabase, alunoId),
    supabase.from("profiles").select("phone, birth_date").eq("id", alunoId).single(),
  ]);

  if (!membro) {
    notFound();
  }

  const corFaixa = membro.faixa ? (FAIXA_COR_HEX[membro.faixa.faixa] ?? null) : null;
  const timeline = await getLinhaDoTempo(supabase, alunoId, membro.membroDesde);

  return (
    <div className="space-y-6">
      <PageHeader title={membro.full_name} />

      <Card className="overflow-hidden border-t-4 p-0" style={{ borderTopColor: corFaixa ?? "transparent" }}>
        <div className="h-28 w-full sm:h-32">
          <Cover coverUrl={membro.cover_url} />
        </div>
        <div className="p-6 pt-0">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <Avatar fullName={membro.full_name} avatarUrl={membro.avatar_url} size="lg" className="ring-4 ring-white" />
              <div className="pb-1">
                <p className="font-display text-xl font-semibold text-ink-950">{membro.full_name}</p>
                <p className="text-sm text-ink-900/50">{ROLE_LABELS[membro.role as UserRole] ?? membro.role}</p>
              </div>
            </div>
            {membro.faixa && <FaixaBadge faixa={membro.faixa.faixa} grau={membro.faixa.grau} />}
          </div>

          {membro.bio && <p className="mt-4 text-sm text-ink-900/80">{membro.bio}</p>}

          <div className="mt-3">
            <PerfilChips cidade={membro.cidade} instagram={membro.instagram} membroDesde={membro.membroDesde} />
          </div>

          <div className="mt-4 space-y-1.5 text-sm text-ink-900/70">
            {extra?.birth_date && (
              <p>Nascimento: {new Date(extra.birth_date + "T00:00:00").toLocaleDateString("pt-BR")}</p>
            )}
            {extra?.phone && <p>Telefone: {extra.phone}</p>}
          </div>
        </div>
      </Card>

      <Link
        href={`/graduacao/${alunoId}`}
        className="flex w-fit items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
      >
        Ver graduação e conquistas completas
      </Link>

      {timeline.length > 0 && (
        <Card className="p-5">
          <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-ink-900/60">
            Linha do tempo
          </h2>
          <LinhaDoTempo eventos={timeline} />
        </Card>
      )}
    </div>
  );
}
