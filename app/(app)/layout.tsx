import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { listConversasDiretas, getUnreadCounts } from "@/lib/queries/chat";
import { listTurmas } from "@/lib/queries/turmas";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();
  const supabase = await createClient();
  const [conversas, turmas] = await Promise.all([listConversasDiretas(supabase, profile.id), listTurmas(supabase)]);
  const naoLidas = await getUnreadCounts(
    supabase,
    profile.id,
    turmas.map((t) => t.id),
    conversas.map((c) => c.conversaId),
  );

  return (
    <AppShell
      role={profile.role}
      fullName={profile.full_name}
      avatarUrl={profile.avatar_url}
      email={profile.email}
      userId={profile.id}
      recebePagamento={profile.recebe_pagamento}
      conversas={conversas}
      naoLidas={naoLidas}
    >
      {children}
    </AppShell>
  );
}
