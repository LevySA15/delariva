// Regras de domínio da academia DELARIVA - SAJ: papéis, permissões de módulo e graduação IBJJF.

export type UserRole = "dono" | "professor" | "aluno" | "aluno_menor" | "responsavel";

export const ROLE_LABELS: Record<UserRole, string> = {
  dono: "Dono",
  professor: "Professor",
  aluno: "Aluno",
  aluno_menor: "Aluno (menor de idade)",
  responsavel: "Responsável",
};

export type ModuleKey =
  | "dashboard"
  | "perfil"
  | "aulas"
  | "graduacao"
  | "financeiro"
  | "chat"
  | "configuracoes";

export const MODULE_LABELS: Record<ModuleKey, string> = {
  dashboard: "Início",
  perfil: "Meu Perfil",
  aulas: "Aulas",
  graduacao: "Graduação",
  financeiro: "Financeiro",
  chat: "Chat",
  configuracoes: "Configurações",
};

// Quais módulos aparecem no menu de cada papel.
// Regra do dono: vê tudo. Regra do aluno menor: tudo sobre treino, menos financeiro.
export const ROLE_MODULES: Record<UserRole, ModuleKey[]> = {
  dono: ["dashboard", "perfil", "aulas", "graduacao", "financeiro", "chat", "configuracoes"],
  professor: ["dashboard", "perfil", "aulas", "graduacao", "chat"],
  aluno: ["dashboard", "perfil", "aulas", "graduacao", "financeiro", "chat"],
  aluno_menor: ["dashboard", "perfil", "aulas", "graduacao", "chat"],
  responsavel: ["dashboard", "perfil", "aulas", "graduacao", "financeiro", "chat"],
};

export function canAccessModule(role: UserRole, module: ModuleKey): boolean {
  return ROLE_MODULES[role].includes(module);
}

// =========================================================
// Graduação — padrão IBJJF
// =========================================================
export type FaixaCategoria = "adulto" | "infantil";

export const FAIXAS_ADULTO = ["branca", "azul", "roxa", "marrom", "preta"] as const;
export const FAIXAS_INFANTIL = ["branca", "cinza", "amarela", "laranja", "verde"] as const;

export const FAIXA_COR_HEX: Record<string, string> = {
  branca: "#f5f5f5",
  azul: "#1d4ed8",
  roxa: "#7e22ce",
  marrom: "#78350f",
  preta: "#111111",
  cinza: "#6b7280",
  amarela: "#eab308",
  laranja: "#f97316",
  verde: "#16a34a",
};

export const GRAUS_POR_FAIXA = [0, 1, 2, 3, 4] as const;

export function faixasPorCategoria(categoria: FaixaCategoria): readonly string[] {
  return categoria === "adulto" ? FAIXAS_ADULTO : FAIXAS_INFANTIL;
}

export const CRITERIOS_AVALIACAO = [
  "tecnica",
  "disciplina",
  "assiduidade",
  "condicionamento",
] as const;

export const CRITERIO_LABELS: Record<(typeof CRITERIOS_AVALIACAO)[number], string> = {
  tecnica: "Técnica",
  disciplina: "Disciplina",
  assiduidade: "Assiduidade",
  condicionamento: "Condicionamento",
};

export const DIAS_SEMANA_LABELS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

export const STATUS_MENSALIDADE_LABELS: Record<string, string> = {
  pago: "Pago",
  pendente: "Pendente",
  atrasado: "Atrasado",
};

// =========================================================
// Conquistas — badges de frequência e tempo de treino
// =========================================================
export const CONQUISTAS_PRESENCA = [10, 25, 50, 100, 250, 500] as const;
export const CONQUISTAS_TEMPO_MESES = [3, 6, 12, 24, 60] as const;

export function labelTempoTreino(meses: number): string {
  if (meses < 12) return `${meses} meses de treino`;
  const anos = meses / 12;
  return `${anos} ${anos === 1 ? "ano" : "anos"} de treino`;
}
