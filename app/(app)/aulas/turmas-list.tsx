"use client";

import { useMemo, useState } from "react";
import { Clock, Swords } from "lucide-react";
import { CardLink } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import { inputClass } from "@/components/ui/field";
import { DIAS_SEMANA_LABELS, type FaixaCategoria } from "@/lib/domain";

type Turma = {
  id: string;
  nome: string;
  dias_semana: number[];
  horario_inicio: string;
  horario_fim: string;
  faixa_etaria: FaixaCategoria;
};

export function TurmasList({ turmas }: { turmas: Turma[] }) {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<FaixaCategoria | "todas">("todas");

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return turmas.filter((t) => {
      const bateBusca = !termo || t.nome.toLowerCase().includes(termo);
      const bateCategoria = categoria === "todas" || t.faixa_etaria === categoria;
      return bateBusca && bateCategoria;
    });
  }, [turmas, busca, categoria]);

  if (turmas.length === 0) {
    return <EmptyState icon={Swords} message="Nenhuma turma encontrada." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <SearchInput value={busca} onChange={setBusca} placeholder="Buscar turma..." className="max-w-xs flex-1" />
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value as FaixaCategoria | "todas")}
          className={`${inputClass} w-auto`}
        >
          <option value="todas">Todas as categorias</option>
          <option value="adulto">Adulto</option>
          <option value="infantil">Infantil</option>
        </select>
      </div>

      {filtradas.length === 0 ? (
        <EmptyState icon={Swords} message="Nenhuma turma bate com esse filtro." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtradas.map((turma) => (
            <CardLink key={turma.id} href={`/aulas/${turma.id}`} className="p-4">
              <p className="font-semibold text-ink-950">{turma.nome}</p>
              <p className="mt-2 text-sm text-ink-900/60">
                {turma.dias_semana.map((d) => DIAS_SEMANA_LABELS[d]).join(", ")}
              </p>
              <p className="flex items-center gap-1.5 text-sm text-ink-900/60">
                <Clock className="h-3.5 w-3.5" />
                {turma.horario_inicio.slice(0, 5)} às {turma.horario_fim.slice(0, 5)}
              </p>
              <Badge tone={turma.faixa_etaria === "adulto" ? "ink" : "brand"} className="mt-3">
                {turma.faixa_etaria === "adulto" ? "Adulto" : "Infantil"}
              </Badge>
            </CardLink>
          ))}
        </div>
      )}
    </div>
  );
}
