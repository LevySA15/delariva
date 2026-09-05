import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { CONQUISTAS_PRESENCA, CONQUISTAS_TEMPO_MESES, labelTempoTreino } from "@/lib/domain";

type DB = SupabaseClient<Database>;

export async function getRankingFrequencia(
  supabase: DB,
  opts: { turmaId?: string; desde?: string } = {},
) {
  const { data } = await supabase.rpc("ranking_frequencia", {
    p_turma_id: opts.turmaId ?? null,
    p_desde: opts.desde ?? null,
  });
  return data ?? [];
}

export type Conquista = {
  key: string;
  titulo: string;
  descricao: string;
  alcancada: boolean;
};

export async function getConquistasAluno(supabase: DB, alunoId: string): Promise<Conquista[]> {
  const [presencasRes, matriculasRes, graduacoesRes] = await Promise.all([
    supabase
      .from("presencas")
      .select("id", { count: "exact", head: true })
      .eq("aluno_id", alunoId)
      .eq("presente", true),
    supabase
      .from("matriculas")
      .select("data_matricula")
      .eq("aluno_id", alunoId)
      .order("data_matricula", { ascending: true })
      .limit(1),
    supabase.from("graduacoes").select("id", { count: "exact", head: true }).eq("aluno_id", alunoId),
  ]);

  const totalPresencas = presencasRes.count ?? 0;
  const totalGraduacoes = graduacoesRes.count ?? 0;
  const primeiraMatricula = matriculasRes.data?.[0]?.data_matricula;

  const mesesDeTreino = primeiraMatricula
    ? Math.floor(
        (Date.now() - new Date(`${primeiraMatricula}T00:00:00`).getTime()) / (1000 * 60 * 60 * 24 * 30.44),
      )
    : 0;

  const badgesPresenca: Conquista[] = CONQUISTAS_PRESENCA.map((meta) => ({
    key: `presenca-${meta}`,
    titulo: `${meta} aulas`,
    descricao: `Compareceu a ${meta} aulas`,
    alcancada: totalPresencas >= meta,
  }));

  const badgesTempo: Conquista[] = CONQUISTAS_TEMPO_MESES.map((meta) => ({
    key: `tempo-${meta}`,
    titulo: labelTempoTreino(meta),
    descricao: `${meta} meses desde a primeira matrícula`,
    alcancada: mesesDeTreino >= meta,
  }));

  const badgesGraduacao: Conquista[] = [
    {
      key: "grad-1",
      titulo: "Primeira graduação",
      descricao: "Recebeu a primeira graduação",
      alcancada: totalGraduacoes >= 1,
    },
    {
      key: "grad-5",
      titulo: "5 graduações",
      descricao: "Recebeu 5 graduações",
      alcancada: totalGraduacoes >= 5,
    },
  ];

  return [...badgesPresenca, ...badgesTempo, ...badgesGraduacao];
}
