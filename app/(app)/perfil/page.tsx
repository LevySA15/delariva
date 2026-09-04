import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { ROLE_LABELS } from "@/lib/domain";
import { getFaixaAtual } from "@/lib/queries/dashboard";
import { PerfilForm } from "./perfil-form";

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
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Meu perfil</h1>
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
    return <p className="text-neutral-500">Aluno não encontrado ou sem vínculo com você.</p>;
  }

  const faixa = await getFaixaAtual(supabase, alunoId);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">{aluno.full_name}</h1>
      <div className="max-w-md space-y-3 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
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
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="font-medium text-neutral-900">{value}</p>
    </div>
  );
}
