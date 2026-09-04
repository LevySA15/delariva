import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="rounded-lg border border-ink-900/10 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-900/50">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-brand-600" strokeWidth={2} />}
      </div>
      <p className="font-display mt-1 text-3xl font-bold text-ink-950">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-900/40">{hint}</p>}
    </div>
  );
}
