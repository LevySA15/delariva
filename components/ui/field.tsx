export const inputClass =
  "w-full rounded-md border border-ink-900/15 bg-white px-3 py-2 text-sm text-ink-950 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20";

export function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-xs font-semibold uppercase tracking-wide text-ink-900/50">
      {children}
    </label>
  );
}

export function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
