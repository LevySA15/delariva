import { FAIXA_COR_HEX } from "@/lib/domain";

export function FaixaBadge({ faixa, grau }: { faixa: string; grau?: number }) {
  const cor = FAIXA_COR_HEX[faixa] ?? "#9ca3af";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-900/10 bg-white px-2.5 py-0.5 text-xs font-semibold text-ink-900/80">
      <span
        className="h-2.5 w-2.5 rounded-full ring-1 ring-black/10"
        style={{ backgroundColor: cor }}
        aria-hidden
      />
      {faixa}
      {grau !== undefined && <span className="text-ink-900/40">· grau {grau}</span>}
    </span>
  );
}
