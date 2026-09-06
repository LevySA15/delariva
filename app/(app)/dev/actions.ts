"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DEV_EMAIL } from "@/lib/dev-accounts";
import { DEV_ACCOUNTS, DEV_ACCOUNT_PASSWORD } from "@/lib/dev-accounts.server";
import type { UserRole } from "@/lib/domain";

export async function entrarComoDev(role: UserRole) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email !== DEV_EMAIL) return;

  await supabase.auth.signInWithPassword({ email: DEV_ACCOUNTS[role], password: DEV_ACCOUNT_PASSWORD });
  redirect("/");
}
