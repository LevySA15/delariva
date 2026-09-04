import type { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, message }: { icon?: LucideIcon; message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-ink-900/15 bg-white/60 py-10 text-center">
      {Icon && <Icon className="h-6 w-6 text-ink-900/30" strokeWidth={1.5} />}
      <p className="text-sm text-ink-900/50">{message}</p>
    </div>
  );
}
