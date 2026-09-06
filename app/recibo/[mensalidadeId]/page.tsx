import Image from "next/image";
import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { getMensalidadeDetalhada } from "@/lib/queries/financeiro";
import { PrintButton } from "./print-button";

export default async function ReciboPage({
  params,
}: {
  params: Promise<{ mensalidadeId: string }>;
}) {
  const { mensalidadeId } = await params;
  await requireProfile();
  const supabase = await createClient();

  const mensalidade = await getMensalidadeDetalhada(supabase, mensalidadeId);
  if (!mensalidade || mensalidade.status !== "pago") notFound();

  const referencia = new Date(`${mensalidade.mes_referencia}T00:00:00`).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  const dataPagamento = mensalidade.data_pagamento
    ? new Date(`${mensalidade.data_pagamento}T00:00:00`).toLocaleDateString("pt-BR")
    : "—";

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 p-6 print:min-h-0 print:bg-white print:p-0">
      <PrintButton />

      <div className="w-full max-w-lg border-8 border-double border-brand-600 bg-white p-10 shadow-2xl print:w-[100vw] print:max-w-none print:border-4 print:shadow-none">
        <div className="flex flex-col items-center text-center">
          <Image src="/logo/wordmark.png" alt="DELARIVA" width={240} height={70} className="h-10 w-auto" priority />
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-ink-900/40">Sistema Acadêmico Jiu-Jitsu</p>

          <p className="mt-8 text-sm uppercase tracking-[0.2em] text-ink-900/50">
            Recibo de {mensalidade.tipo === "avulsa" ? "pagamento" : "mensalidade"}
          </p>
          <p className="mt-6 text-lg text-ink-900/70">Recebemos de</p>
          <p className="font-display mt-2 text-3xl font-bold text-ink-950">{mensalidade.aluno?.full_name}</p>
          <p className="mt-6 text-lg text-ink-900/70">
            o valor de <span className="font-bold text-brand-700">R$ {Number(mensalidade.valor).toFixed(2)}</span>
          </p>
          <p className="mt-1 text-sm text-ink-900/50">
            {mensalidade.tipo === "avulsa"
              ? mensalidade.descricao ?? "Cobrança avulsa"
              : `Referente à mensalidade de ${referencia}`}
            {mensalidade.plano?.nome ? ` · ${mensalidade.plano.nome}` : ""}
          </p>
          <p className="mt-1 text-sm text-ink-900/50">
            Pago em {dataPagamento}
            {mensalidade.forma_pagamento ? ` · ${mensalidade.forma_pagamento}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
