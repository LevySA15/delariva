import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { labelGrau } from "@/lib/domain";

type DB = SupabaseClient<Database>;

export type TimelineEvento = {
  data: string;
  tipo: "entrada" | "graduacao";
  titulo: string;
  descricao?: string;
};

// Linha do tempo de marcos do perfil: gerada automaticamente a partir dos
// dados existentes (entrada na academia + histórico de graduações), sem
// exigir nenhum "post" manual da pessoa.
export async function getLinhaDoTempo(supabase: DB, profileId: string, membroDesde: string): Promise<TimelineEvento[]> {
  const { data: graduacoes } = await supabase
    .from("graduacoes")
    .select("data, faixa, grau")
    .eq("aluno_id", profileId)
    .order("data", { ascending: false });

  const eventos: TimelineEvento[] = (graduacoes ?? []).map((g) => ({
    data: g.data,
    tipo: "graduacao",
    titulo: g.grau === 0 ? `Graduado para faixa ${g.faixa}` : `${labelGrau(g.grau)} na faixa ${g.faixa}`,
  }));

  eventos.push({ data: membroDesde, tipo: "entrada", titulo: "Entrou na academia" });

  return eventos.sort((a, b) => (a.data < b.data ? 1 : -1));
}
