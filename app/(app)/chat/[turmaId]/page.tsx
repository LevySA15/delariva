import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { getTurma, getProfessoresDaTurma, getAlunosDaTurma } from "@/lib/queries/turmas";
import { getMensagensTurma, marcarComoLido } from "@/lib/queries/chat";
import { ChatRoom } from "@/components/chat-room";
import { PageHeader } from "@/components/ui/page-header";

export default async function ChatTurmaPage({
  params,
}: {
  params: Promise<{ turmaId: string }>;
}) {
  const { turmaId } = await params;
  const profile = await requireProfile();
  const supabase = await createClient();

  const turma = await getTurma(supabase, turmaId);
  if (!turma) notFound();

  const [professores, alunos, mensagens] = await Promise.all([
    getProfessoresDaTurma(supabase, turmaId),
    getAlunosDaTurma(supabase, turmaId),
    getMensagensTurma(supabase, turmaId),
  ]);

  const nomesPorId: Record<string, string> = { [profile.id]: profile.full_name };
  for (const p of professores) nomesPorId[p.id] = p.full_name;
  for (const a of alunos) nomesPorId[a.id] = a.full_name;

  await marcarComoLido(supabase, profile.id, "turma", turmaId);

  return (
    <div>
      <PageHeader title={turma.nome} />
      <ChatRoom
        config={{ tabela: "chat_turma_mensagens", coluna: "turma_id", contextoId: turmaId }}
        currentUserId={profile.id}
        nomesPorId={nomesPorId}
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
