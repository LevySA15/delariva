import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { listTurmas } from "@/lib/queries/turmas";
import { DIAS_SEMANA_LABELS } from "@/lib/domain";
import { PageHeader } from "@/components/ui/page-header";
import { CardLink } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default async function ChatPage() {
  const supabase = await createClient();
  const turmas = await listTurmas(supabase);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chat"
        action={
          <LinkButton href="/chat/mural" variant="secondary">
            Mural de avisos
          </LinkButton>
        }
      />

      {turmas.length === 0 ? (
        <EmptyState icon={MessageCircle} message="Você ainda não tem turmas com chat disponível." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {turmas.map((turma) => (
            <CardLink key={turma.id} href={`/chat/${turma.id}`} className="p-4">
              <p className="font-semibold text-ink-950">{turma.nome}</p>
              <p className="mt-1 text-sm text-ink-900/50">
                {turma.dias_semana.map((d) => DIAS_SEMANA_LABELS[d]).join(", ")}
              </p>
            </CardLink>
          ))}
        </div>
      )}
    </div>
  );
}
