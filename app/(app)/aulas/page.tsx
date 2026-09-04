import Link from "next/link";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { listTurmas } from "@/lib/queries/turmas";
import { DIAS_SEMANA_LABELS } from "@/lib/domain";

export default async function AulasPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const turmas = await listTurmas(supabase);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Aulas</h1>
        {profile.role === "dono" && (
          <Link
            href="/aulas/nova"
            className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            Nova turma
          </Link>
        )}
      </div>

      {turmas.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhuma turma encontrada.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {turmas.map((turma) => (
            <Link
              key={turma.id}
              href={`/aulas/${turma.id}`}
              className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-red-300"
            >
              <p className="font-semibold text-neutral-900">{turma.nome}</p>
              <p className="mt-1 text-sm text-neutral-500">
                {turma.dias_semana.map((d) => DIAS_SEMANA_LABELS[d]).join(", ")}
              </p>
              <p className="text-sm text-neutral-500">
                {turma.horario_inicio.slice(0, 5)} às {turma.horario_fim.slice(0, 5)}
              </p>
              <span className="mt-2 inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                {turma.faixa_etaria === "adulto" ? "Adulto" : "Infantil"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
