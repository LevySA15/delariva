import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { ROLE_LABELS } from "@/lib/domain";
import { getFaixaAtual } from "@/lib/queries/dashboard";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
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

  return (
    <div>
      <PageHeader title="Meu perfil" />
      <div className="mb-6">
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

async function DependentePerfil({ alunoId }: { alunoId: string }) {
  const supabase = await createClient();
  const { data: aluno } = await supabase.from("profiles").select("*").eq("id", alunoId).single();

  if (!aluno) {
    return <p className="text-ink-900/50">Aluno não encontrado ou sem vínculo com você.</p>;
  }

  const faixa = await getFaixaAtual(supabase, alunoId);

  return (
    <div>
      <PageHeader title={aluno.full_name} />
      <Card className="max-w-md space-y-3 p-6">
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
        <Info label="Faixa atual" value={faixa ? `${faixa.faixa} · grau ${faixa.grau}` : "—"} />
      </Card>
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
