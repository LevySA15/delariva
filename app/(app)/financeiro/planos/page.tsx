import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { listPlanos } from "@/lib/queries/financeiro";
import { PlanosForm } from "./planos-form";

export default async function PlanosPage() {
  const profile = await requireProfile();
  if (profile.role !== "dono") redirect("/financeiro");

  const supabase = await createClient();
  const planos = await listPlanos(supabase);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Planos</h1>
      <PlanosForm />

      <ul className="space-y-2">
        {planos.map((p) => (
          <li key={p.id} className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
            <span className="font-medium text-neutral-900">{p.nome}</span>
            <span className="text-sm text-neutral-500">
              R$ {Number(p.valor).toFixed(2)} · {p.periodicidade}
            </span>
          </li>
        ))}
        {planos.length === 0 && <p className="text-sm text-neutral-500">Nenhum plano cadastrado.</p>}
      </ul>
    </div>
  );
}
