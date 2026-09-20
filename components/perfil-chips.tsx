import { MapPin, AtSign, CalendarDays } from "lucide-react";

export function PerfilChips({
  cidade,
  instagram,
  membroDesde,
}: {
  cidade: string | null;
  instagram: string | null;
  membroDesde: string;
}) {
  const desdeIso = membroDesde.includes("T") ? membroDesde : `${membroDesde}T00:00:00`;
  const desde = new Date(desdeIso).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const handle = instagram?.replace(/^@/, "");

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-900/60">
      {cidade && (
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {cidade}
        </span>
      )}
      {handle && (
        <a
          href={`https://instagram.com/${handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-brand-700 hover:underline"
        >
          <AtSign className="h-3.5 w-3.5" />
          {handle}
        </a>
      )}
      <span className="flex items-center gap-1">
        <CalendarDays className="h-3.5 w-3.5" />
        Na academia desde {desde}
      </span>
    </div>
  );
}
