import { MessageCircle, Users } from "lucide-react";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { listTurmas } from "@/lib/queries/turmas";
import { listConversasDiretas, listContatosDisponiveis } from "@/lib/queries/chat";
import { DIAS_SEMANA_LABELS } from "@/lib/domain";
import { PageHeader } from "@/components/ui/page-header";
import { CardLink } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/avatar";
import { NovaConversa } from "./nova-conversa";

export default async function ChatPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const [turmas, conversas, contatos] = await Promise.all([
    listTurmas(supabase),
    listConversasDiretas(supabase, profile.id),
    listContatosDisponiveis(supabase, profile),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Chat"
        action={
          <LinkButton href="/chat/mural" variant="secondary">
            Mural de avisos
          </LinkButton>
        }
      />

      <NovaConversa contatos={contatos} />

      <section>
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-ink-900/60">Conversas</h2>
        {conversas.length === 0 ? (
          <EmptyState icon={MessageCircle} message="Nenhuma conversa ainda. Clique em 'Nova conversa' pra começar." />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {conversas.map((c) => (
              <CardLink key={c.conversaId} href={`/chat/dm/${c.conversaId}`} className="flex items-center gap-3 p-4">
                <Avatar fullName={c.outro!.full_name} avatarUrl={c.outro!.avatar_url} size="sm" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink-950">{c.outro!.full_name}</p>
                  <p className="truncate text-sm text-ink-900/50">{c.ultimaMensagem ?? "Sem mensagens ainda"}</p>
                </div>
              </CardLink>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-ink-900/60">
          Grupos das turmas
        </h2>
        {turmas.length === 0 ? (
          <EmptyState icon={Users} message="Você ainda não tem turmas com chat disponível." />
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
      </section>
    </div>
  );
}
