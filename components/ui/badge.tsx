type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "ink";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-ink-950/[0.06] text-ink-900/70",
  brand: "bg-brand-50 text-brand-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-brand-100 text-brand-700",
  ink: "bg-ink-950 text-white",
};

export function Badge({
  tone = "neutral",
  className = "",
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
