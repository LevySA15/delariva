// Área Dev — só o essencial pra checagem de e-mail no cliente (sidebar,
// banner). A senha e o mapeamento de contas de teste ficam em
// dev-accounts.server.ts (protegido por "server-only"), nunca aqui.

export const DEV_EMAIL = "levyvpylli@gmail.com";

export function isDevAccountEmail(email: string | null | undefined): boolean {
  return !!email && email.endsWith("@delariva.dev");
}
