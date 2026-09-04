import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/supabase/current-user";
import { PageHeader } from "@/components/ui/page-header";
import { NovaTurmaForm } from "./nova-turma-form";

export default async function NovaTurmaPage() {
  const profile = await requireProfile();
  if (profile.role !== "dono") {
    redirect("/aulas");
  }

  return (
    <div>
      <PageHeader title="Nova turma" />
      <NovaTurmaForm />
    </div>
  );
}
