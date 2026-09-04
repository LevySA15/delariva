"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import type { UserRole } from "@/lib/domain";

export function AppShell({
  role,
  fullName,
  children,
}: {
  role: UserRole;
  fullName: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-100">
      {/* sidebar desktop */}
      <div className="hidden md:block">
        <Sidebar role={role} fullName={fullName} />
      </div>

      {/* sidebar mobile (drawer) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-50 h-full">
            <Sidebar role={role} fullName={fullName} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-neutral-200 bg-white px-4 py-3 md:hidden">
          <button
            aria-label="Abrir menu"
            onClick={() => setMobileOpen(true)}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          >
            Menu
          </button>
          <span className="font-semibold text-neutral-900">DELARIVA</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
