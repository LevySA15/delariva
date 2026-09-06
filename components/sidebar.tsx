"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  User,
  Swords,
  Award,
  Wallet,
  MessageCircle,
  Settings,
  LogOut,
  FlaskConical,
  Users,
  type LucideIcon,
} from "lucide-react";
import { logout } from "@/lib/supabase/actions";
import { Avatar } from "@/components/avatar";
import { GlobalSearch } from "@/components/global-search";
import { MODULE_LABELS, ROLE_LABELS, ROLE_MODULES, type ModuleKey, type UserRole } from "@/lib/domain";
import { DEV_EMAIL } from "@/lib/dev-accounts";

const MODULE_HREFS: Record<ModuleKey, string> = {
  dashboard: "/",
  perfil: "/perfil",
  aulas: "/aulas",
  graduacao: "/graduacao",
  financeiro: "/financeiro",
  chat: "/chat",
  membros: "/membros",
  configuracoes: "/configuracoes",
};

const MODULE_ICONS: Record<ModuleKey, LucideIcon> = {
  dashboard: LayoutGrid,
  perfil: User,
  aulas: Swords,
  graduacao: Award,
  financeiro: Wallet,
  chat: MessageCircle,
  membros: Users,
  configuracoes: Settings,
};

export function Sidebar({
  role,
  fullName,
  avatarUrl,
  email,
  recebePagamento = false,
  unreadTotal = 0,
}: {
  role: UserRole;
  fullName: string;
  avatarUrl?: string | null;
  email?: string | null;
  recebePagamento?: boolean;
  unreadTotal?: number;
}) {
  const pathname = usePathname();
  const modules = ROLE_MODULES[role];
  const modulesVisiveis =
    role === "professor" && recebePagamento && !modules.includes("financeiro")
      ? [...modules, "financeiro" as const]
      : modules;

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-ink-950">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <Image src="/logo/badge.png" alt="DELARIVA" width={40} height={40} className="h-10 w-10" />
        <div>
          <p className="font-display text-lg font-semibold uppercase tracking-wider text-white">DELARIVA</p>
          <p className="text-[11px] uppercase tracking-wide text-white/40">Sistema Acadêmico</p>
        </div>
      </div>

      <div className="px-3 pt-3">
        <GlobalSearch />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {modulesVisiveis.map((mod) => {
          const href = MODULE_HREFS[mod];
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          const Icon = MODULE_ICONS[mod];
          return (
            <Link
              key={mod}
              href={href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
              {MODULE_LABELS[mod]}
              {mod === "chat" && unreadTotal > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-xs font-bold text-white">
                  {unreadTotal > 99 ? "99+" : unreadTotal}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3">
          <Avatar fullName={fullName} avatarUrl={avatarUrl} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{fullName}</p>
            <p className="text-xs text-white/40">{ROLE_LABELS[role]}</p>
          </div>
        </div>
        {email === DEV_EMAIL && (
          <Link
            href="/dev"
            className={`mb-2 flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition ${
              pathname === "/dev"
                ? "border-amber-500 bg-amber-500/10 text-amber-400"
                : "border-white/10 text-white/60 hover:border-amber-500/50 hover:text-amber-400"
            }`}
          >
            <FlaskConical className="h-4 w-4" />
            Dev
          </Link>
        )}
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-medium text-white/60 transition hover:border-brand-600/50 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
