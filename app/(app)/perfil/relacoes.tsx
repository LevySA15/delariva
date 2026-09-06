import Link from "next/link";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/avatar";
import type { TurmaComPessoas } from "@/lib/queries/membros";

export function RelacoesGrid({ titulo, grupos }: { titulo: string; grupos: TurmaComPessoas[] }) {
  if (grupos.length === 0) return null;

  return (
    <Card className="p-5">
      <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wide text-ink-900/60">
        <Users className="h-4 w-4 text-brand-600" />
        {titulo}
      </h2>
      <div className="space-y-4">
        {grupos.map((grupo) => (
          <div key={grupo.turmaId}>
            <p className="mb-2 text-xs font-medium text-ink-900/50">{grupo.turmaNome}</p>
            <div className="flex flex-wrap gap-3">
              {grupo.pessoas.map((pessoa) => (
                <Link
                  key={pessoa.id}
                  href={`/membros/${pessoa.id}`}
                  className="flex items-center gap-2 rounded-full border border-ink-900/10 bg-white py-1 pl-1 pr-3 text-sm transition hover:border-brand-600/40"
                >
                  <Avatar fullName={pessoa.full_name} avatarUrl={pessoa.avatar_url} size="sm" />
                  {pessoa.full_name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
