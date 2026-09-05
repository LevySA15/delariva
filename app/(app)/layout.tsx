import { requireProfile } from "@/lib/supabase/current-user";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile();

  return (
    <AppShell role={profile.role} fullName={profile.full_name} avatarUrl={profile.avatar_url}>
      {children}
    </AppShell>
  );
}
