import Image from "next/image";
import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { getGraduacaoDetalhada } from "@/lib/queries/graduacao";
import { PrintButton } from "./print-button";

export default async function CertificadoPage({
  params,
}: {
  params: Promise<{ graduacaoId: string }>;
}) {
  const { graduacaoId } = await params;
  await requireProfile();
  const supabase = await createClient();

  const graduacao = await getGraduacaoDetalhada(supabase, graduacaoId);
  if (!graduacao) notFound();

  const dataFormatada = new Date(graduacao.data + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 p-6 print:min-h-0 print:bg-white print:p-0">
      <PrintButton />

      <div className="aspect-[1.414/1] w-full max-w-3xl border-8 border-double border-brand-600 bg-white p-10 shadow-2xl print:w-[100vw] print:max-w-none print:border-4 print:shadow-none">
        <div className="flex h-full flex-col items-center justify-between text-center">
          <div>
            <Image
              src="/logo/wordmark.png"
              alt="DELARIVA"
              width={240}
              height={70}
              className="mx-auto mb-2 h-10 w-auto"
              priority
            />
            <p className="text-xs uppercase tracking-[0.25em] text-ink-900/40">Sistema Acadêmico Jiu-Jitsu</p>
          </div>

          <div className="my-8">
            <p className="text-sm uppercase tracking-[0.2em] text-ink-900/50">Certificado de Graduação</p>
            <p className="mt-6 text-lg text-ink-900/70">Certificamos que</p>
            <p className="font-display mt-2 text-4xl font-bold text-ink-950">{graduacao.aluno?.full_name}</p>
            <p className="mt-6 text-lg text-ink-900/70">
              foi graduado(a) à faixa{" "}
              <span className="font-bold capitalize text-brand-700">{graduacao.faixa}</span>
              {graduacao.grau > 0 && <> · {graduacao.grau}º grau</>}
            </p>
            <p className="mt-1 text-sm text-ink-900/50">em {dataFormatada}</p>
            {graduacao.observacao && <p className="mt-4 max-w-md text-sm italic text-ink-900/60">“{graduacao.observacao}”</p>}
          </div>

          <div className="w-full">
            {graduacao.professor && (
              <div className="mx-auto w-64 border-t border-ink-900/20 pt-2">
                <p className="text-sm font-medium text-ink-950">{graduacao.professor.full_name}</p>
                <p className="text-xs text-ink-900/40">Professor responsável</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
