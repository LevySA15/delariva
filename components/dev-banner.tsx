import { FlaskConical } from "lucide-react";
import { ROLE_LABELS, type UserRole } from "@/lib/domain";
import { isDevAccountEmail } from "@/lib/dev-accounts";
import { logout } from "@/lib/supabase/actions";

export function DevBanner({ email, role }: { email: string | null; role: UserRole }) {
  if (!isDevAccountEmail(email)) return null;

  return (
    <div className="flex items-center justify-between gap-3 bg-amber-500/90 px-4 py-2 text-sm font-medium text-ink-950">
      <span className="flex items-center gap-2">
        <FlaskConical className="h-4 w-4" />
        Modo Dev — visualizando como {ROLE_LABELS[role]}
      </span>
      <form action={logout}>
        <button type="submit" className="underline hover:no-underline">
          Sair da simulação
        </button>
      </form>
    </div>
  );
}
