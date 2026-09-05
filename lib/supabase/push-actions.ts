"use server";

import { createClient } from "./server";

export async function registrarPushToken(token: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("push_tokens")
    .upsert({ user_id: user.id, token, plataforma: "android" }, { onConflict: "user_id,token" });
}
