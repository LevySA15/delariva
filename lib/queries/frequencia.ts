import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import {
  CONQUISTAS_PRESENCA,
  CONQUISTAS_TEMPO_MESES,
  CONQUISTAS_GRAUS,
  FAIXA_COR_HEX,
  labelTempoTreino,
  labelGrau,
  capitalizar,
  faixasPorCategoria,
  type FaixaCategoria,
} from "@/lib/domain";

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

export async function getTotalPresencas(supabase: DB, alunoId: string): Promise<number> {
  const { count } = await supabase
    .from("presencas")
    .select("id", { count: "exact", head: true })
    .eq("aluno_id", alunoId)
    .eq("presente", true);
  return count ?? 0;
}

export type Conquista = {
  key: string;
  titulo: string;
  descricao: string;
  alcancada: boolean;
  grupo: "faixa" | "grau" | "presenca" | "tempo" | "graduacao";
  cor?: string;
};

export async function getConquistasAluno(
  supabase: DB,
  alunoId: string,
  categoria: FaixaCategoria = "adulto",
): Promise<Conquista[]> {
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
    supabase.from("graduacoes").select("faixa, grau, data").eq("aluno_id", alunoId).order("data", { ascending: false }),
  ]);

  const totalPresencas = presencasRes.count ?? 0;
  const graduacoes = graduacoesRes.data ?? [];
  const totalGraduacoes = graduacoes.length;
  const primeiraMatricula = matriculasRes.data?.[0]?.data_matricula;

  const mesesDeTreino = primeiraMatricula
    ? Math.floor(
        (Date.now() - new Date(`${primeiraMatricula}T00:00:00`).getTime()) / (1000 * 60 * 60 * 24 * 30.44),
      )
    : 0;

  const faixasAlcancadas = new Set(graduacoes.map((g) => g.faixa));
  const grauAtual = graduacoes[0]?.grau ?? 0;

  const badgesPresenca: Conquista[] = CONQUISTAS_PRESENCA.map((meta) => ({
    key: `presenca-${meta}`,
    titulo: `${meta} aulas`,
    descricao: `Compareceu a ${meta} aulas`,
    alcancada: totalPresencas >= meta,
    grupo: "presenca",
  }));

  const badgesTempo: Conquista[] = CONQUISTAS_TEMPO_MESES.map((meta) => ({
    key: `tempo-${meta}`,
    titulo: labelTempoTreino(meta),
    descricao: `${meta} meses desde a primeira matrícula`,
    alcancada: mesesDeTreino >= meta,
    grupo: "tempo",
  }));

  const badgesGraduacao: Conquista[] = [
    {
      key: "grad-1",
      titulo: "Primeira graduação",
      descricao: "Recebeu a primeira graduação",
      alcancada: totalGraduacoes >= 1,
      grupo: "graduacao",
    },
    {
      key: "grad-5",
      titulo: "5 graduações",
      descricao: "Recebeu 5 graduações",
      alcancada: totalGraduacoes >= 5,
      grupo: "graduacao",
    },
  ];

  const badgesFaixa: Conquista[] = faixasPorCategoria(categoria).map((faixa) => ({
    key: `faixa-${faixa}`,
    titulo: `Faixa ${capitalizar(faixa)}`,
    descricao: `Alcançou a faixa ${faixa}`,
    alcancada: faixasAlcancadas.has(faixa),
    grupo: "faixa",
    cor: FAIXA_COR_HEX[faixa],
  }));

  const badgesGrau: Conquista[] = CONQUISTAS_GRAUS.map((meta) => ({
    key: `grau-${meta}`,
    titulo: labelGrau(meta),
    descricao: `${meta}º grau na faixa atual`,
    alcancada: grauAtual >= meta,
    grupo: "grau",
  }));

  return [...badgesFaixa, ...badgesGrau, ...badgesPresenca, ...badgesTempo, ...badgesGraduacao];
}
