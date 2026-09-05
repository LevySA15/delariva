import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { listTurmas } from "@/lib/queries/turmas";
import { getHistoricoNotificacoes } from "@/lib/queries/notificacoes";
import { TIPO_NOTIFICACAO_LABELS } from "@/lib/domain";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { NotificacaoForm } from "./notificacao-form";

export default async function NotificacoesPage() {
  const profile = await requireProfile();
  if (profile.role !== "dono") redirect("/");

  const supabase = await createClient();
  const [turmas, historico] = await Promise.all([listTurmas(supabase), getHistoricoNotificacoes(supabase)]);

  return (
    <div className="space-y-8">
      <PageHeader title="Notificações" subtitle="Envie um push personalizado ou acompanhe os envios automáticos" />

      <NotificacaoForm turmas={turmas} />

      <section>
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-ink-900/60">
          Histórico de envios
        </h2>
        {historico.length === 0 ? (
          <EmptyState message="Nenhuma notificação enviada ainda." />
        ) : (
          <div className="space-y-2">
            {historico.map((n) => (
              <Card key={n.id} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-ink-950">{n.titulo}</p>
                  <div className="flex items-center gap-2">
                    <Badge tone="neutral">{TIPO_NOTIFICACAO_LABELS[n.tipo] ?? n.tipo}</Badge>
                    <p className="text-xs text-ink-900/40">{n.destinatarios_count} destinatário(s)</p>
                  </div>
                </div>
                <p className="mt-1 text-sm text-ink-900/70">{n.corpo}</p>
                <p className="mt-2 text-xs text-ink-900/40">
                  {n.autor?.full_name ? `por ${n.autor.full_name} · ` : "automática · "}
                  {new Date(n.created_at).toLocaleString("pt-BR")}
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
