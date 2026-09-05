"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateConversaDireta } from "@/lib/queries/chat";

export async function iniciarConversa(outroId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const conversaId = await getOrCreateConversaDireta(supabase, user.id, outroId);
  redirect(`/chat/dm/${conversaId}`);
}
