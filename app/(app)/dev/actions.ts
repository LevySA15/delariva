"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { DEV_EMAIL } from "@/lib/dev-accounts";
import { DEV_ACCOUNTS, DEV_ACCOUNT_PASSWORD } from "@/lib/dev-accounts.server";
import type { UserRole } from "@/lib/domain";

const ADMIN_SESSION_COOKIE = "dev_admin_session";

export async function entrarComoDev(role: UserRole) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email !== DEV_EMAIL) return;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    const cookieStore = await cookies();
    cookieStore.set(
      ADMIN_SESSION_COOKIE,
      JSON.stringify({ access_token: session.access_token, refresh_token: session.refresh_token }),
      { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 },
    );
  }

  await supabase.auth.signInWithPassword({ email: DEV_ACCOUNTS[role], password: DEV_ACCOUNT_PASSWORD });
  redirect("/");
}

export async function sairDaSimulacao() {
  const cookieStore = await cookies();
  const saved = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  cookieStore.delete(ADMIN_SESSION_COOKIE);

  const supabase = await createClient();

  if (saved) {
    const { access_token, refresh_token } = JSON.parse(saved);
    await supabase.auth.setSession({ access_token, refresh_token });
  } else {
    await supabase.auth.signOut();
  }

  redirect("/");
}
