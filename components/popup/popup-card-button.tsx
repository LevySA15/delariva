"use client";

import { usePopup } from "./popup-provider";

export function PopupStatCard({
  label,
  value,
  hint,
  icon,
  title,
  href,
  content,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ReactNode;
  title: string;
  href?: string;
  content: React.ReactNode;
}) {
  const { push } = usePopup();

  return (
    <button
      type="button"
      onClick={() => push({ title, href, content })}
      className="block w-full text-left transition hover:-translate-y-0.5"
    >
      <div className="rounded-lg border border-ink-900/10 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-900/50">{label}</p>
          {icon}
        </div>
        <p className="font-display mt-1 text-3xl font-bold text-ink-950">{value}</p>
        {hint && <p className="mt-1 text-xs text-ink-900/40">{hint}</p>}
      </div>
    </button>
  );
}
