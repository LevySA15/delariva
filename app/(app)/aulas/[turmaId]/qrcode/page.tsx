import { notFound } from "next/navigation";
import { headers } from "next/headers";
import QRCode from "qrcode";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { getProfessoresDaTurma, getTurma } from "@/lib/queries/turmas";
import { PrintButton } from "./print-button";

export default async function TurmaQrCodePage({
  params,
}: {
  params: Promise<{ turmaId: string }>;
}) {
  const { turmaId } = await params;
  const profile = await requireProfile();
  const supabase = await createClient();

  const turma = await getTurma(supabase, turmaId);
  if (!turma) notFound();

  const professores = await getProfessoresDaTurma(supabase, turmaId);
  const podeVer = profile.role === "dono" || professores.some((p) => p.id === profile.id);
  if (!podeVer) notFound();

  const h = await headers();
  const host = h.get("host");
  const protocolo = host?.startsWith("localhost") ? "http" : "https";
  const url = `${protocolo}://${host}/checkin/${turmaId}`;

  const svg = await QRCode.toString(url, { type: "svg", width: 320, margin: 1 });

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 p-6 print:min-h-0 print:bg-white print:p-0">
      <PrintButton />
      <div className="w-full max-w-sm rounded-lg border border-ink-900/10 bg-white p-8 text-center shadow-2xl print:shadow-none">
        <p className="font-display text-lg font-bold uppercase tracking-widest text-ink-950">{turma.nome}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-ink-900/40">Check-in por QR code</p>
        <div className="mx-auto mt-6 w-fit" dangerouslySetInnerHTML={{ __html: svg }} />
        <p className="mt-6 text-sm text-ink-900/60">
          Escaneie com a câmera do celular para marcar presença na aula de hoje.
        </p>
      </div>
    </div>
  );
}
