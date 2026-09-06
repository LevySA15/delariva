import "server-only";
import type { UserRole } from "./domain";

// Contas de teste fixas, uma por papel, usadas pela área Dev pra trocar de
// sessão. "server-only" garante (falha no build) que isso nunca acaba indo
// parar no bundle do cliente — só pode ser importado de Server Actions ou
// Server Components.

export const DEV_ACCOUNTS: Record<UserRole, string> = {
  aluno: "dev.aluno@delariva.dev",
  aluno_menor: "dev.aluno-menor@delariva.dev",
  professor: "dev.professor@delariva.dev",
  responsavel: "dev.responsavel@delariva.dev",
  dono: "dev.dono@delariva.dev",
};

export const DEV_ACCOUNT_PASSWORD = "eHto9BiAKyErErkVfC1Z";
