import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { listMensalidadesDoMes } from "@/lib/queries/financeiro";
import { getDependentes } from "@/lib/queries/dashboard";
import { PageHeader } from "@/components/ui/page-header";
import { CardLink } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { MensalidadesList } from "./mensalidades-list";

export default async function FinanceiroPage() {
  const profile = await requireProfile();

  if (profile.role === "professor" || profile.role === "aluno_menor") {
    redirect("/");
  }

  if (profile.role === "aluno") {
    redirect(`/financeiro/${profile.id}`);
  }

  const supabase = await createClient();

  if (profile.role === "responsavel") {
    const dependentes = await getDependentes(supabase, profile.id);
    if (dependentes.length === 1) {
      redirect(`/financeiro/${dependentes[0].id}`);
    }
    return (
      <div>
        <PageHeader title="Financeiro" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {dependentes.map((d) => (
            <CardLink key={d.id} href={`/financeiro/${d.id}`} className="p-4 font-medium text-ink-950">
              {d.full_name}
            </CardLink>
          ))}
        </div>
      </div>
    );
  }

  // dono
  const mensalidades = await listMensalidadesDoMes(supabase);

  return (
    <div>
      <PageHeader
        title="Financeiro"
        subtitle="Mês atual"
        action={
          <div className="flex gap-2">
            <LinkButton href="/financeiro/inadimplencia" variant="secondary">
              Inadimplência
            </LinkButton>
            <LinkButton href="/financeiro/planos" variant="secondary">
              Planos
            </LinkButton>
            <LinkButton href="/financeiro/nova">Lançar mensalidade</LinkButton>
          </div>
        }
      />

      <MensalidadesList mensalidades={mensalidades} />
    </div>
  );
}
