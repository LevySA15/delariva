import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/supabase/current-user";
import { NovaTurmaForm } from "./nova-turma-form";

export default async function NovaTurmaPage() {
  const profile = await requireProfile();
  if (profile.role !== "dono") {
    redirect("/aulas");
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Nova turma</h1>
      <NovaTurmaForm />
    </div>
  );
}
