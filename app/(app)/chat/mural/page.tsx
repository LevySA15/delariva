import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { listMural } from "@/lib/queries/chat";
import { MuralForm } from "./mural-form";

export default async function MuralPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const avisos = await listMural(supabase);
  const podePublicar = profile.role === "dono" || profile.role === "professor";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Mural de avisos</h1>

      {podePublicar && <MuralForm />}

      {avisos.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhum aviso publicado ainda.</p>
      ) : (
        <ul className="space-y-3">
          {avisos.map((aviso) => (
            <li key={aviso.id} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
              <p className="font-medium text-neutral-900">{aviso.titulo}</p>
              <p className="mt-1 text-sm text-neutral-600">{aviso.mensagem}</p>
              <p className="mt-2 text-xs text-neutral-400">
                {aviso.autor?.full_name ?? "Academia"} ·{" "}
                {new Date(aviso.created_at).toLocaleDateString("pt-BR")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
