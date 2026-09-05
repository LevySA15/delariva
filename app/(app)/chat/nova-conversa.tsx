"use client";

import { useMemo, useState, useTransition } from "react";
import { MessageSquarePlus } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { SearchInput } from "@/components/ui/search-input";
import { ROLE_LABELS, type UserRole } from "@/lib/domain";
import { iniciarConversa } from "./dm-actions";

type Contato = { id: string; full_name: string; role: string };

export function NovaConversa({ contatos }: { contatos: Contato[] }) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [pending, startTransition] = useTransition();

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return termo ? contatos.filter((c) => c.full_name.toLowerCase().includes(termo)) : contatos;
  }, [contatos, busca]);

  function selecionar(id: string) {
    startTransition(() => {
      iniciarConversa(id);
    });
  }

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        className="flex items-center gap-2 rounded-md border border-ink-900/15 bg-white px-3 py-2 text-sm font-medium text-ink-900 transition hover:border-brand-600/40"
      >
        <MessageSquarePlus className="h-4 w-4 text-brand-600" />
        Nova conversa
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-ink-900/10 bg-white p-3 shadow-sm">
      <SearchInput value={busca} onChange={setBusca} placeholder="Buscar pessoa..." />
      <div className="mt-2 max-h-56 overflow-y-auto">
        {filtrados.length === 0 && <p className="px-2 py-3 text-sm text-ink-900/40">Ninguém encontrado.</p>}
        {filtrados.map((c) => (
          <button
            key={c.id}
            disabled={pending}
            onClick={() => selecionar(c.id)}
            className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-ink-950/[0.04] disabled:opacity-50"
          >
            <Avatar fullName={c.full_name} size="sm" />
            <span className="text-sm text-ink-950">{c.full_name}</span>
            <span className="ml-auto text-xs text-ink-900/40">{ROLE_LABELS[c.role as UserRole] ?? c.role}</span>
          </button>
        ))}
      </div>
      <button onClick={() => setAberto(false)} className="mt-2 text-xs font-medium text-ink-900/40 hover:text-ink-900">
        Cancelar
      </button>
    </div>
  );
}
