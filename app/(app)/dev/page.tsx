import { redirect } from "next/navigation";
import { FlaskConical } from "lucide-react";
import { requireProfile } from "@/lib/supabase/current-user";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS, type UserRole } from "@/lib/domain";
import { DEV_EMAIL } from "@/lib/dev-accounts";
import { entrarComoDev } from "./actions";

const PAPEIS_DEV: UserRole[] = ["aluno", "aluno_menor", "professor", "responsavel", "dono"];

export default async function DevPage() {
  const profile = await requireProfile();
  if (profile.email !== DEV_EMAIL) redirect("/");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dev"
        subtitle="Simule o app logado como cada papel, com uma conta de teste dedicada."
      />

      <Card className="p-6">
        <div className="mb-4 flex items-start gap-3">
          <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
          <p className="text-sm text-ink-900/60">
            Clicar troca sua sessão atual para uma conta de teste com aquele papel — como o &ldquo;ver como&rdquo; de
            servidor do Discord. Pra voltar pra sua conta, saia e entre de novo com seu e-mail e senha reais.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PAPEIS_DEV.map((role) => (
            <form key={role} action={entrarComoDev.bind(null, role)}>
              <Button type="submit" variant="secondary" className="w-full">
                {ROLE_LABELS[role]}
              </Button>
            </form>
          ))}
        </div>
      </Card>
    </div>
  );
}
