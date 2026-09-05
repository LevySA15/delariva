import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { getConversaComOutroParticipante, getMensagensDiretas, marcarComoLido } from "@/lib/queries/chat";
import { ChatRoom } from "@/components/chat-room";
import { PageHeader } from "@/components/ui/page-header";
import { Avatar } from "@/components/avatar";

export default async function ChatDiretoPage({
  params,
}: {
  params: Promise<{ conversaId: string }>;
}) {
  const { conversaId } = await params;
  const profile = await requireProfile();
  const supabase = await createClient();

  const outro = await getConversaComOutroParticipante(supabase, conversaId, profile.id);
  if (!outro) notFound();

  const mensagens = await getMensagensDiretas(supabase, conversaId);
  await marcarComoLido(supabase, profile.id, "direta", conversaId);

  return (
    <div>
      <PageHeader
        title={outro.full_name}
        action={<Avatar fullName={outro.full_name} avatarUrl={outro.avatar_url} size="sm" />}
      />
      <ChatRoom
        config={{ tabela: "mensagens_diretas", coluna: "conversa_id", contextoId: conversaId }}
        currentUserId={profile.id}
        nomesPorId={{ [profile.id]: profile.full_name, [outro.id]: outro.full_name }}
        initialMessages={mensagens.map((m) => ({
          id: m.id,
          mensagem: m.mensagem,
          created_at: m.created_at,
          autor_id: m.autor_id,
        }))}
      />
    </div>
  );
}
