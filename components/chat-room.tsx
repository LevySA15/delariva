"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Mensagem = {
  id: string;
  mensagem: string;
  created_at: string;
  autor_id: string;
};

export function ChatRoom({
  turmaId,
  currentUserId,
  nomesPorId,
  initialMessages,
}: {
  turmaId: string;
  currentUserId: string;
  nomesPorId: Record<string, string>;
  initialMessages: Mensagem[];
}) {
  const [mensagens, setMensagens] = useState<Mensagem[]>(initialMessages);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`chat-turma-${turmaId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_turma_mensagens", filter: `turma_id=eq.${turmaId}` },
        (payload) => {
          const nova = payload.new as Mensagem & { turma_id: string };
          setMensagens((prev) => (prev.some((m) => m.id === nova.id) ? prev : [...prev, nova]));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [turmaId]);

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
    await supabase.from("chat_turma_mensagens").insert({
      turma_id: turmaId,
      autor_id: currentUserId,
      mensagem: conteudo,
    });
    setEnviando(false);
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {mensagens.length === 0 && (
          <p className="text-sm text-neutral-400">Nenhuma mensagem ainda. Diga oi!</p>
        )}
        {mensagens.map((m) => {
          const propria = m.autor_id === currentUserId;
          return (
            <div key={m.id} className={`flex flex-col ${propria ? "items-end" : "items-start"}`}>
              <span className="text-xs text-neutral-400">
                {nomesPorId[m.autor_id] ?? "Membro"}
              </span>
              <div
                className={`max-w-xs rounded-2xl px-3 py-2 text-sm ${
                  propria ? "bg-red-700 text-white" : "bg-neutral-100 text-neutral-800"
                }`}
              >
                {m.mensagem}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={enviar} className="flex gap-2 border-t border-neutral-200 p-3">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escreva uma mensagem..."
          className="flex-1 rounded-full border border-neutral-300 px-4 py-2 text-sm outline-none focus:border-red-600"
        />
        <button
          type="submit"
          disabled={enviando || !texto.trim()}
          className="rounded-full bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
