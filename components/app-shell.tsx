"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./sidebar";
import { ChatBubble } from "./chat-bubble";
import type { UserRole } from "@/lib/domain";
import type { listConversasDiretas, getUnreadCounts } from "@/lib/queries/chat";

export function AppShell({
  role,
  fullName,
  avatarUrl,
  userId,
  conversas,
  naoLidas,
  children,
}: {
  role: UserRole;
  fullName: string;
  avatarUrl?: string | null;
  userId: string;
  conversas: Awaited<ReturnType<typeof listConversasDiretas>>;
  naoLidas: Awaited<ReturnType<typeof getUnreadCounts>>;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* sidebar desktop */}
      <div className="hidden md:block">
        <Sidebar role={role} fullName={fullName} avatarUrl={avatarUrl} unreadTotal={naoLidas.total} />
      </div>

      {/* sidebar mobile (drawer) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative z-50 h-full">
            <Sidebar role={role} fullName={fullName} avatarUrl={avatarUrl} unreadTotal={naoLidas.total} />
            <button
              aria-label="Fechar menu"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-5 text-white/60 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-ink-900/10 bg-ink-950 px-4 py-3 md:hidden">
          <button
            aria-label="Abrir menu"
            onClick={() => setMobileOpen(true)}
            className="rounded-md border border-white/15 p-1.5 text-white"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="h-2 w-5 rounded-sm bg-brand-600" aria-hidden />
          <span className="font-display font-semibold uppercase tracking-wider text-white">DELARIVA</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>

      <ChatBubble currentUserId={userId} conversas={conversas} unreadPorConversa={naoLidas.porConversaId} />
    </div>
  );
}
