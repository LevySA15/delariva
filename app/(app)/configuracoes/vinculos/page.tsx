import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { listAlunosMenores, listResponsaveis, listVinculos } from "@/lib/queries/configuracoes";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { VinculoForm } from "./vinculo-form";
import { desvincularResponsavel } from "../actions";

export default async function VinculosPage() {
  const profile = await requireProfile();
  if (profile.role !== "dono") redirect("/");

  const supabase = await createClient();
  const [responsaveis, alunosMenores, vinculos] = await Promise.all([
    listResponsaveis(supabase),
    listAlunosMenores(supabase),
    listVinculos(supabase),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Vínculos" subtitle="Responsável ↔ aluno menor" />

      <VinculoForm responsaveis={responsaveis} alunosMenores={alunosMenores} />

      {vinculos.length === 0 ? (
        <EmptyState message="Nenhum vínculo cadastrado ainda." />
      ) : (
        <div className="space-y-2">
          {vinculos.map((v) => (
            <Card key={v.id} className="flex items-center justify-between p-4">
              <span className="text-sm text-ink-900/70">
                <strong className="text-ink-950">{v.responsavel?.full_name}</strong> é responsável por{" "}
                <strong className="text-ink-950">{v.aluno?.full_name}</strong>
              </span>
              <form action={desvincularResponsavel.bind(null, v.id)}>
                <button type="submit" className="text-xs font-medium text-ink-900/40 hover:text-brand-700">
                  remover vínculo
                </button>
              </form>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
