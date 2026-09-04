import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { listPlanos } from "@/lib/queries/financeiro";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PlanosForm } from "./planos-form";

export default async function PlanosPage() {
  const profile = await requireProfile();
  if (profile.role !== "dono") redirect("/financeiro");

  const supabase = await createClient();
  const planos = await listPlanos(supabase);

  return (
    <div className="space-y-6">
      <PageHeader title="Planos" />
      <PlanosForm />

      {planos.length === 0 ? (
        <EmptyState message="Nenhum plano cadastrado." />
      ) : (
        <div className="space-y-2">
          {planos.map((p) => (
            <Card key={p.id} className="flex items-center justify-between p-4">
              <span className="font-semibold text-ink-950">{p.nome}</span>
              <span className="text-sm text-ink-900/50">
                R$ {Number(p.valor).toFixed(2)} · {p.periodicidade}
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
