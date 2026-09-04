import { Megaphone } from "lucide-react";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { listMural } from "@/lib/queries/chat";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { MuralForm } from "./mural-form";

export default async function MuralPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const avisos = await listMural(supabase);
  const podePublicar = profile.role === "dono" || profile.role === "professor";

  return (
    <div className="space-y-6">
      <PageHeader title="Mural de avisos" />

      {podePublicar && <MuralForm />}

      {avisos.length === 0 ? (
        <EmptyState icon={Megaphone} message="Nenhum aviso publicado ainda." />
      ) : (
        <div className="space-y-3">
          {avisos.map((aviso) => (
            <Card key={aviso.id} className="p-4">
              <p className="font-semibold text-ink-950">{aviso.titulo}</p>
              <p className="mt-1 text-sm text-ink-900/60">{aviso.mensagem}</p>
              <p className="mt-2 text-xs text-ink-900/40">
                {aviso.autor?.full_name ?? "Academia"} · {new Date(aviso.created_at).toLocaleDateString("pt-BR")}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
