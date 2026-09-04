import { redirect } from "next/navigation";
import { Users, Link2, Swords, Wallet, type LucideIcon } from "lucide-react";
import { requireProfile } from "@/lib/supabase/current-user";
import { PageHeader } from "@/components/ui/page-header";
import { CardLink } from "@/components/ui/card";

const ITEMS: { href: string; icon: LucideIcon; title: string; description: string }[] = [
  { href: "/configuracoes/usuarios", icon: Users, title: "Usuários", description: "Ver e alterar o perfil de cada pessoa cadastrada." },
  { href: "/configuracoes/vinculos", icon: Link2, title: "Vínculos responsável ↔ aluno menor", description: "Associe responsáveis aos alunos menores de idade." },
  { href: "/aulas", icon: Swords, title: "Turmas", description: "Criar turmas, atribuir professores e matricular alunos." },
  { href: "/financeiro/planos", icon: Wallet, title: "Planos financeiros", description: "Gerenciar os planos de mensalidade da academia." },
];

export default async function ConfiguracoesPage() {
  const profile = await requireProfile();
  if (profile.role !== "dono") redirect("/");

  return (
    <div>
      <PageHeader title="Configurações" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {ITEMS.map(({ href, icon: Icon, title, description }) => (
          <CardLink key={href} href={href} className="p-4">
            <Icon className="mb-2 h-5 w-5 text-brand-600" strokeWidth={2} />
            <p className="font-semibold text-ink-950">{title}</p>
            <p className="mt-1 text-sm text-ink-900/50">{description}</p>
          </CardLink>
        ))}
      </div>
    </div>
  );
}
