"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Mensagem = {
  id: string;
  mensagem: string;
  created_at: string;
  autor_id: string;
};

type ChatConfig =
  | { tabela: "chat_turma_mensagens"; coluna: "turma_id"; contextoId: string }
  | { tabela: "mensagens_diretas"; coluna: "conversa_id"; contextoId: string };

export function ChatRoom({
  config,
  currentUserId,
  nomesPorId,
  initialMessages,
  compact = false,
}: {
  config: ChatConfig;
  currentUserId: string;
  nomesPorId: Record<string, string>;
  initialMessages: Mensagem[];
  compact?: boolean;
}) {
  const [mensagens, setMensagens] = useState<Mensagem[]>(initialMessages);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`${config.tabela}-${config.contextoId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: config.tabela, filter: `${config.coluna}=eq.${config.contextoId}` },
        (payload) => {
          const nova = payload.new as Mensagem;
          setMensagens((prev) => (prev.some((m) => m.id === nova.id) ? prev : [...prev, nova]));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [config.tabela, config.coluna, config.contextoId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens.length]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const conteudo = texto.trim();
    if (!conteudo) return;

    setEnviando(true);
    setTexto("");
    const supabase = createClient();
    await supabase.from(config.tabela).insert({
      [config.coluna]: config.contextoId,
      autor_id: currentUserId,
      mensagem: conteudo,
    } as never);
    setEnviando(false);
  }

  return (
    <div
      className={
        compact
          ? "flex h-full flex-col bg-white"
          : "flex h-[70vh] flex-col rounded-lg border border-ink-900/10 bg-white shadow-sm"
      }
    >
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {mensagens.length === 0 && (
          <p className="text-sm text-ink-900/40">Nenhuma mensagem ainda. Diga oi!</p>
        )}
        {mensagens.map((m) => {
          const propria = m.autor_id === currentUserId;
          return (
            <div key={m.id} className={`flex flex-col ${propria ? "items-end" : "items-start"}`}>
              <span className="text-xs text-ink-900/40">{nomesPorId[m.autor_id] ?? "Membro"}</span>
              <div
                className={`max-w-xs rounded-2xl px-3 py-2 text-sm ${
                  propria ? "bg-brand-600 text-white" : "bg-ink-950/[0.05] text-ink-900"
                }`}
              >
                {m.mensagem}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={enviar} className="flex gap-2 border-t border-ink-900/10 p-3">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escreva uma mensagem..."
          className="flex-1 rounded-full border border-ink-900/15 px-4 py-2 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
        />
        <button
          type="submit"
          disabled={enviando || !texto.trim()}
          className="flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          Enviar
        </button>
      </form>
    </div>
  );
}
