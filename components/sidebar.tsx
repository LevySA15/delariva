"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/supabase/actions";
import { MODULE_LABELS, ROLE_LABELS, ROLE_MODULES, type ModuleKey, type UserRole } from "@/lib/domain";

const MODULE_HREFS: Record<ModuleKey, string> = {
  dashboard: "/",
  perfil: "/perfil",
  aulas: "/aulas",
  graduacao: "/graduacao",
  financeiro: "/financeiro",
  chat: "/chat",
  configuracoes: "/configuracoes",
};

export function Sidebar({ role, fullName }: { role: UserRole; fullName: string }) {
  const pathname = usePathname();
  const modules = ROLE_MODULES[role];

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-neutral-800 bg-neutral-950">
      <div className="border-b border-neutral-800 px-5 py-5">
        <p className="text-lg font-bold text-white">DELARIVA</p>
        <p className="text-xs text-neutral-500">Sistema Acadêmico Jiu-Jitsu</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {modules.map((mod) => {
          const href = MODULE_HREFS[mod];
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={mod}
              href={href}
              className={`block rounded-md px-3 py-2 text-sm transition ${
                active
                  ? "bg-red-700 text-white"
                  : "text-neutral-300 hover:bg-neutral-900 hover:text-white"
              }`}
            >
              {MODULE_LABELS[mod]}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-neutral-800 px-4 py-4">
        <p className="truncate text-sm font-medium text-white">{fullName}</p>
        <p className="mb-3 text-xs text-neutral-500">{ROLE_LABELS[role]}</p>
        <form action={logout}>
          <button
            type="submit"
            className="w-full rounded-md border border-neutral-700 px-3 py-2 text-sm text-neutral-300 transition hover:border-red-700 hover:text-white"
          >
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
