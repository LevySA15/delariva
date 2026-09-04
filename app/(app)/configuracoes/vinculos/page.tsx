import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { listAlunosMenores, listResponsaveis, listVinculos } from "@/lib/queries/configuracoes";
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
      <h1 className="text-2xl font-bold text-neutral-900">Vínculos responsável ↔ aluno menor</h1>

      <VinculoForm responsaveis={responsaveis} alunosMenores={alunosMenores} />

      <ul className="space-y-2">
        {vinculos.map((v) => (
          <li key={v.id} className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <span className="text-sm text-neutral-700">
              <strong>{v.responsavel?.full_name}</strong> é responsável por{" "}
              <strong>{v.aluno?.full_name}</strong>
            </span>
            <form action={desvincularResponsavel.bind(null, v.id)}>
              <button type="submit" className="text-xs text-neutral-400 hover:text-red-600">
                remover vínculo
              </button>
            </form>
          </li>
        ))}
        {vinculos.length === 0 && <p className="text-sm text-neutral-500">Nenhum vínculo cadastrado ainda.</p>}
      </ul>
    </div>
  );
}
