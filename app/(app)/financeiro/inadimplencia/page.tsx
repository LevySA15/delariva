import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { listInadimplencia } from "@/lib/queries/financeiro";
import { PageHeader } from "@/components/ui/page-header";
import { inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { InadimplenciaList } from "./inadimplencia-list";

export default async function InadimplenciaPage({
  searchParams,
}: {
  searchParams: Promise<{ inicio?: string; fim?: string }>;
}) {
  const profile = await requireProfile();
  if (profile.role !== "dono") redirect("/financeiro");

  const { inicio, fim } = await searchParams;
  const supabase = await createClient();
  const itens = await listInadimplencia(supabase, inicio, fim);

  return (
    <div className="space-y-6">
      <PageHeader title="Inadimplência" subtitle="Mensalidades pendentes ou atrasadas" />

      <form className="flex flex-wrap items-end gap-3 rounded-lg border border-ink-900/10 bg-white p-4 shadow-sm">
        <div className="space-y-1.5">
          <label htmlFor="inicio" className="text-xs font-semibold uppercase tracking-wide text-ink-900/50">
            De
          </label>
          <input id="inicio" name="inicio" type="date" defaultValue={inicio} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="fim" className="text-xs font-semibold uppercase tracking-wide text-ink-900/50">
            Até
          </label>
          <input id="fim" name="fim" type="date" defaultValue={fim} className={inputClass} />
        </div>
        <Button type="submit" variant="secondary" size="sm">
          Filtrar
        </Button>
      </form>

      <InadimplenciaList itens={itens} />
    </div>
  );
}
