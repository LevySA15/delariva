"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, X, ArrowLeft, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/avatar";
import { ChatRoom } from "@/components/chat-room";

type Conversa = {
  conversaId: string;
  outro: { id: string; full_name: string; avatar_url: string | null } | null;
  ultimaMensagem: string | null;
};

type Mensagem = { id: string; mensagem: string; created_at: string; autor_id: string };

export function ChatBubble({
  currentUserId,
  conversas,
  unreadPorConversa,
}: {
  currentUserId: string;
  conversas: Conversa[];
  unreadPorConversa: Record<string, number>;
}) {
  const [open, setOpen] = useState(false);
  const [ativa, setAtiva] = useState<Conversa | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [naoLidas, setNaoLidas] = useState(unreadPorConversa);
  const router = useRouter();

  useEffect(() => {
    if (!ativa) return;
    let cancelado = false;
    const supabase = createClient();
    supabase
      .from("mensagens_diretas")
      .select("id, mensagem, created_at, autor_id")
      .eq("conversa_id", ativa.conversaId)
      .order("created_at", { ascending: true })
      .limit(200)
      .then(({ data }) => {
        if (!cancelado) setMensagens(data ?? []);
      });
    return () => {
      cancelado = true;
    };
  }, [ativa]);

  function abrirConversa(c: Conversa) {
    setAtiva(c);
    setNaoLidas((prev) => ({ ...prev, [c.conversaId]: 0 }));
    const supabase = createClient();
    supabase
      .from("chat_leituras")
      .upsert(
        { usuario_id: currentUserId, contexto_tipo: "direta", contexto_id: c.conversaId, last_read_at: new Date().toISOString() },
        { onConflict: "usuario_id,contexto_tipo,contexto_id" },
      )
      .then(() => {});
  }

  const totalNaoLidas = Object.values(naoLidas).reduce((a, b) => a + b, 0);

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open && (
        <div className="mb-3 flex h-[28rem] w-80 flex-col overflow-hidden rounded-lg border border-ink-900/10 bg-white shadow-2xl">
          <div className="flex items-center gap-2 border-b border-ink-900/10 bg-ink-950 px-3 py-2.5">
            {ativa && (
              <button onClick={() => setAtiva(null)} className="text-white/60 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <p className="flex-1 truncate text-sm font-semibold text-white">{ativa ? ativa.outro?.full_name : "Conversas"}</p>
            {ativa && (
              <button
                onClick={() => router.push(`/chat/dm/${ativa.conversaId}`)}
                className="text-white/60 hover:text-white"
                aria-label="Abrir em tela cheia"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
            )}
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {ativa ? (
              <ChatRoom
                compact
                config={{ tabela: "mensagens_diretas", coluna: "conversa_id", contextoId: ativa.conversaId }}
                currentUserId={currentUserId}
                nomesPorId={{ [currentUserId]: "Você", [ativa.outro?.id ?? ""]: ativa.outro?.full_name ?? "" }}
                initialMessages={mensagens}
              />
            ) : (
              <div className="h-full overflow-y-auto">
                {conversas.length === 0 && (
                  <p className="px-4 py-6 text-center text-sm text-ink-900/40">
                    Nenhuma conversa ainda.{" "}
                    <button onClick={() => router.push("/chat")} className="text-brand-600 hover:underline">
                      Começar uma
                    </button>
                  </p>
                )}
                {conversas.map((c) => (
                  <button
                    key={c.conversaId}
                    onClick={() => abrirConversa(c)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-ink-950/[0.03]"
                  >
                    <Avatar fullName={c.outro?.full_name ?? "?"} avatarUrl={c.outro?.avatar_url} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-950">{c.outro?.full_name}</p>
                      <p className="truncate text-xs text-ink-900/50">{c.ultimaMensagem ?? "Sem mensagens ainda"}</p>
                    </div>
                    {!!naoLidas[c.conversaId] && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-xs font-bold text-white">
                        {naoLidas[c.conversaId] > 9 ? "9+" : naoLidas[c.conversaId]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Abrir chat"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition hover:bg-brand-700"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && totalNaoLidas > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-surface bg-white px-1 text-xs font-bold text-brand-700">
            {totalNaoLidas > 9 ? "9+" : totalNaoLidas}
          </span>
        )}
      </button>
    </div>
  );
}
