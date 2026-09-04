export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-ink-900/10 pb-4">
      <div>
        <h1 className="font-display text-2xl font-semibold uppercase tracking-wide text-ink-950">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-900/60">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
