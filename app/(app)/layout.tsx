import { requireProfile } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { listConversasDiretas } from "@/lib/queries/chat";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();
  const supabase = await createClient();
  const conversas = await listConversasDiretas(supabase, profile.id);

  return (
    <AppShell
      role={profile.role}
      fullName={profile.full_name}
      avatarUrl={profile.avatar_url}
      userId={profile.id}
      conversas={conversas}
    >
      {children}
    </AppShell>
  );
}
