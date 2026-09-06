import Link from "next/link";
import { MailCheck } from "lucide-react";

export default async function ConfirmeEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="space-y-4 text-center">
      <MailCheck className="mx-auto h-10 w-10 text-brand-500" />
      <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-white">
        Confirme seu e-mail
      </h2>
      <p className="text-sm text-white/60">
        Enviamos um link de confirmação {email && <>para <span className="text-white">{email}</span></>}.
        Clique nele para ativar sua conta e poder entrar no sistema.
      </p>
      <p className="text-xs text-white/40">Não encontrou? Dá uma olhada na caixa de spam ou lixo eletrônico.</p>
      <Link href="/login" className="inline-block text-sm font-medium text-brand-500 hover:underline">
        Voltar para o login
      </Link>
    </div>
  );
}
