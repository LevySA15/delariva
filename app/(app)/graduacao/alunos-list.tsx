"use client";

import { useMemo, useState } from "react";
import { Award } from "lucide-react";
import { CardLink } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { FaixaBadge } from "@/components/ui/faixa-badge";

type Aluno = { id: string; full_name: string; faixa: { faixa: string; grau: number } | null };

export function AlunosList({ alunos }: { alunos: Aluno[] }) {
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return termo ? alunos.filter((a) => a.full_name.toLowerCase().includes(termo)) : alunos;
  }, [alunos, busca]);

  if (alunos.length === 0) {
    return <EmptyState icon={Award} message="Nenhum aluno encontrado." />;
  }

  return (
    <div className="space-y-4">
      {alunos.length > 6 && (
        <SearchInput value={busca} onChange={setBusca} placeholder="Buscar aluno..." className="max-w-xs" />
      )}

      {filtrados.length === 0 ? (
        <EmptyState icon={Award} message="Nenhum aluno bate com essa busca." />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((a) => (
            <CardLink key={a.id} href={`/graduacao/${a.id}`} className="p-4">
              <p className="font-semibold text-ink-950">{a.full_name}</p>
              <div className="mt-2">
                {a.faixa ? (
                  <FaixaBadge faixa={a.faixa.faixa} grau={a.faixa.grau} />
                ) : (
                  <span className="text-sm text-ink-900/40">sem graduação</span>
                )}
              </div>
            </CardLink>
          ))}
        </div>
      )}
    </div>
  );
}
