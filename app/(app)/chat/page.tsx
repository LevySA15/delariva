import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listTurmas } from "@/lib/queries/turmas";
import { DIAS_SEMANA_LABELS } from "@/lib/domain";

export default async function ChatPage() {
  const supabase = await createClient();
  const turmas = await listTurmas(supabase);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Chat</h1>
        <Link href="/chat/mural" className="rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50">
          Mural de avisos
        </Link>
      </div>

      {turmas.length === 0 ? (
        <p className="text-sm text-neutral-500">Você ainda não tem turmas com chat disponível.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {turmas.map((turma) => (
            <Link
              key={turma.id}
              href={`/chat/${turma.id}`}
              className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-red-300"
            >
              <p className="font-semibold text-neutral-900">{turma.nome}</p>
              <p className="mt-1 text-sm text-neutral-500">
                {turma.dias_semana.map((d) => DIAS_SEMANA_LABELS[d]).join(", ")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
