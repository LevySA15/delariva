"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function PageHeader({
  title,
  subtitle,
  action,
  showBack = true,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  showBack?: boolean;
}) {
  const router = useRouter();

  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-ink-900/10 pb-4">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Voltar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink-900/10 bg-white text-ink-900/60 shadow-sm transition hover:border-brand-600/40 hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div>
          <h1 className="font-display text-2xl font-semibold uppercase tracking-wide text-ink-950">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-ink-900/60">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
