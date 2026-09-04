import { Clock, Swords } from "lucide-react";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { listTurmas } from "@/lib/queries/turmas";
import { DIAS_SEMANA_LABELS } from "@/lib/domain";
import { PageHeader } from "@/components/ui/page-header";
import { CardLink } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";

export default async function AulasPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const turmas = await listTurmas(supabase);

  return (
    <div>
      <PageHeader
        title="Aulas"
        action={
          profile.role === "dono" && <LinkButton href="/aulas/nova">Nova turma</LinkButton>
        }
      />

      {turmas.length === 0 ? (
        <EmptyState icon={Swords} message="Nenhuma turma encontrada." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {turmas.map((turma) => (
            <CardLink key={turma.id} href={`/aulas/${turma.id}`} className="p-4">
              <p className="font-semibold text-ink-950">{turma.nome}</p>
              <p className="mt-2 text-sm text-ink-900/60">
                {turma.dias_semana.map((d) => DIAS_SEMANA_LABELS[d]).join(", ")}
              </p>
              <p className="flex items-center gap-1.5 text-sm text-ink-900/60">
                <Clock className="h-3.5 w-3.5" />
                {turma.horario_inicio.slice(0, 5)} às {turma.horario_fim.slice(0, 5)}
              </p>
              <Badge tone={turma.faixa_etaria === "adulto" ? "ink" : "brand"} className="mt-3">
                {turma.faixa_etaria === "adulto" ? "Adulto" : "Infantil"}
              </Badge>
            </CardLink>
          ))}
        </div>
      )}
    </div>
  );
}
