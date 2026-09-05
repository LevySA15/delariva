"use server";

import { createClient } from "@/lib/supabase/server";
import { searchGlobal, type SearchResult } from "@/lib/queries/search";

export async function buscarGlobal(query: string): Promise<{ alunos: SearchResult[]; turmas: SearchResult[] }> {
  const supabase = await createClient();
  return searchGlobal(supabase, query);
}
