import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { listPlanos } from "@/lib/queries/financeiro";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { PlanosForm } from "./planos-form";
import { PlanoCard } from "./plano-card";

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
            <PlanoCard key={p.id} plano={p} />
          ))}
        </div>
      )}
    </div>
  );
}
