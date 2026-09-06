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
    if (error.code === "email_not_confirmed") {
      return {
        error: "Confirme seu e-mail antes de entrar — veja o link que enviamos para sua caixa de entrada (e a pasta de spam).",
      };
    }
    if (error.code === "invalid_credentials") {
      return { error: "E-mail ou senha inválidos." };
    }
    return { error: "Não foi possível entrar agora. Tente novamente em instantes." };
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

  redirect(`/confirme-email?email=${encodeURIComponent(email)}`);
}
