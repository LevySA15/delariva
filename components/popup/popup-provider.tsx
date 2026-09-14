"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Maximize2, X } from "lucide-react";

export type PopupScreen = {
  title: string;
  href?: string;
  content: React.ReactNode;
};

type PopupContextValue = {
  push: (screen: PopupScreen) => void;
  pop: () => void;
  close: () => void;
};

const PopupContext = createContext<PopupContextValue | null>(null);

export function usePopup(): PopupContextValue {
  const ctx = useContext(PopupContext);
  if (!ctx) throw new Error("usePopup precisa ser usado dentro de PopupProvider");
  return ctx;
}

export function PopupProvider({ children }: { children: React.ReactNode }) {
  const [stack, setStack] = useState<PopupScreen[]>([]);
  const router = useRouter();

  const push = useCallback((screen: PopupScreen) => setStack((s) => [...s, screen]), []);
  const pop = useCallback(() => setStack((s) => s.slice(0, -1)), []);
  const close = useCallback(() => setStack([]), []);

  const atual = stack[stack.length - 1];

  useEffect(() => {
    if (!atual) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") pop();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [atual, pop]);

  return (
    <PopupContext.Provider value={{ push, pop, close }}>
      {children}
      {atual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60" onClick={close} />
          <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center gap-1 border-b border-ink-900/10 px-4 py-3">
              {stack.length > 1 && (
                <button
                  type="button"
                  onClick={pop}
                  aria-label="Voltar"
                  className="rounded-md p-1.5 text-ink-900/50 transition hover:bg-ink-950/[0.05] hover:text-ink-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <p className="flex-1 truncate font-display text-sm font-semibold uppercase tracking-wide text-ink-950">
                {atual.title}
              </p>
              {atual.href && (
                <button
                  type="button"
                  onClick={() => {
                    const href = atual.href!;
                    close();
                    router.push(href);
                  }}
                  aria-label="Abrir página completa"
                  title="Abrir página completa"
                  className="rounded-md p-1.5 text-ink-900/50 transition hover:bg-ink-950/[0.05] hover:text-brand-700"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={close}
                aria-label="Fechar"
                className="rounded-md p-1.5 text-ink-900/50 transition hover:bg-ink-950/[0.05] hover:text-ink-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-y-auto p-4">{atual.content}</div>
          </div>
        </div>
      )}
    </PopupContext.Provider>
  );
}
