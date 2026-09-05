import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { getTurma } from "@/lib/queries/turmas";
import { DIAS_SEMANA_LABELS } from "@/lib/domain";
import { CheckinForm } from "./checkin-form";

export default async function CheckinPage({
  params,
}: {
  params: Promise<{ turmaId: string }>;
}) {
  const { turmaId } = await params;
  await requireProfile();
  const supabase = await createClient();

  const turma = await getTurma(supabase, turmaId);
  if (!turma) notFound();

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 p-6">
      <div className="w-full max-w-sm rounded-lg border border-ink-900/10 bg-white p-8 text-center shadow-2xl">
        <p className="font-display text-lg font-bold uppercase tracking-widest text-ink-950">{turma.nome}</p>
        <p className="mt-1 text-sm text-ink-900/50">
          {turma.dias_semana.map((d) => DIAS_SEMANA_LABELS[d]).join(", ")} ·{" "}
          {turma.horario_inicio.slice(0, 5)} às {turma.horario_fim.slice(0, 5)}
        </p>
        <div className="mt-6">
          <CheckinForm turmaId={turmaId} />
        </div>
      </div>
    </div>
  );
}
