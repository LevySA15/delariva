import { redirect } from "next/navigation";
import { createClient } from "./server";
import type { Database } from "./database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// Busca o usuário autenticado e seu profile (papel, dados pessoais).
// Redireciona para /login se não houver sessão — use em Server Components de página/layout protegidos.
export async function requireProfile(): Promise<Profile> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    redirect("/login");
  }

  return profile;
}
