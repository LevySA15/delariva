import { notFound } from "next/navigation";
import { Swords, MessageCircle } from "lucide-react";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { getMembro } from "@/lib/queries/membros";
import { getLinhaDoTempo } from "@/lib/queries/timeline";
import { ROLE_LABELS, FAIXA_COR_HEX, type UserRole } from "@/lib/domain";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/avatar";
import { Cover } from "@/components/cover";
import { FaixaBadge } from "@/components/ui/faixa-badge";
import { PerfilChips } from "@/components/perfil-chips";
import { LinhaDoTempo } from "@/components/linha-do-tempo";
import { iniciarConversa } from "../../chat/dm-actions";

export default async function MembroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await requireProfile();
  const supabase = await createClient();

  const membro = await getMembro(supabase, id);
  if (!membro) notFound();

  const corFaixa = membro.faixa ? (FAIXA_COR_HEX[membro.faixa.faixa] ?? null) : null;
  const souEu = membro.id === profile.id;
  const timeline = await getLinhaDoTempo(supabase, id, membro.membroDesde);

  return (
    <div className="space-y-6">
      <PageHeader title="Membro" />

      <Card className="overflow-hidden border-t-4 p-0" style={{ borderTopColor: corFaixa ?? "transparent" }}>
        <div className="h-28 w-full sm:h-32">
          <Cover coverUrl={membro.cover_url} />
        </div>
        <div className="p-6 pt-0">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <Avatar fullName={membro.full_name} avatarUrl={membro.avatar_url} size="lg" className="ring-4 ring-white" />
              <div className="pb-1">
                <p className="font-display text-xl font-semibold text-ink-950">{membro.full_name}</p>
                <p className="text-sm text-ink-900/50">{ROLE_LABELS[membro.role as UserRole] ?? membro.role}</p>
                {membro.faixa && (
                  <div className="mt-2">
                    <FaixaBadge faixa={membro.faixa.faixa} grau={membro.faixa.grau} />
                  </div>
                )}
              </div>
            </div>

            {!souEu && (
              <form action={iniciarConversa.bind(null, membro.id)}>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
                >
                  <MessageCircle className="h-4 w-4" />
                  Enviar mensagem
                </button>
              </form>
            )}
          </div>

          {membro.bio && <p className="mt-4 text-sm text-ink-900/80">{membro.bio}</p>}

          <div className="mt-3">
            <PerfilChips cidade={membro.cidade} instagram={membro.instagram} membroDesde={membro.membroDesde} />
          </div>
        </div>
      </Card>

      {(membro.turmasLeciona.length > 0 || membro.turmasMatriculado.length > 0) && (
        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wide text-ink-900/60">
            <Swords className="h-4 w-4 text-brand-600" />
            Turmas
          </h2>
          <div className="space-y-3 text-sm">
            {membro.turmasLeciona.length > 0 && (
              <p>
                <span className="font-medium text-ink-950">Leciona: </span>
                <span className="text-ink-900/70">{membro.turmasLeciona.join(", ")}</span>
              </p>
            )}
            {membro.turmasMatriculado.length > 0 && (
              <p>
                <span className="font-medium text-ink-950">Matriculado em: </span>
                <span className="text-ink-900/70">{membro.turmasMatriculado.join(", ")}</span>
              </p>
            )}
          </div>
        </Card>
      )}

      {timeline.length > 0 && (
        <Card className="p-5">
          <h2 className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-ink-900/60">
            Linha do tempo
          </h2>
          <LinhaDoTempo eventos={timeline} />
        </Card>
      )}
    </div>
  );
}
