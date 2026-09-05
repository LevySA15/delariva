import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type DB = SupabaseClient<Database>;

export type SearchResult = { id: string; label: string; sublabel?: string; href: string };

export async function searchGlobal(supabase: DB, query: string) {
  const termo = query.trim();
  if (termo.length < 2) {
    return { alunos: [] as SearchResult[], turmas: [] as SearchResult[] };
  }

  const [alunosRes, turmasRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, role")
      .in("role", ["aluno", "aluno_menor"])
      .ilike("full_name", `%${termo}%`)
      .limit(6),
    supabase.from("turmas").select("id, nome").ilike("nome", `%${termo}%`).limit(6),
  ]);

  const alunos: SearchResult[] = (alunosRes.data ?? []).map((a) => ({
    id: a.id,
    label: a.full_name,
    sublabel: a.role === "aluno_menor" ? "Aluno menor" : "Aluno",
    href: `/graduacao/${a.id}`,
  }));

  const turmas: SearchResult[] = (turmasRes.data ?? []).map((t) => ({
    id: t.id,
    label: t.nome,
    sublabel: "Turma",
    href: `/aulas/${t.id}`,
  }));

  return { alunos, turmas };
}
