"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/domain";

export type AuthState = { error: string | null };

export async function login(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "E-mail ou senha inválidos." };
  }

  redirect("/");
}

export async function signup(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "");
  const role = String(formData.get("role") ?? "aluno") as UserRole;
  const birthDate = String(formData.get("birth_date") ?? "");

  if (password.length < 6) {
    return { error: "A senha precisa ter pelo menos 6 caracteres." };
  }

  if (role === "aluno_menor" && !birthDate) {
    return { error: "Informe a data de nascimento do aluno menor de idade." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
        birth_date: birthDate || null,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/login?cadastrado=1");
}
