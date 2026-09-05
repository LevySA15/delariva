import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type DB = SupabaseClient<Database>;

export async function getMensagensTurma(supabase: DB, turmaId: string) {
  const { data } = await supabase
    .from("chat_turma_mensagens")
    .select("id, mensagem, created_at, autor_id, autor:profiles!chat_turma_mensagens_autor_id_fkey(full_name)")
    .eq("turma_id", turmaId)
    .order("created_at", { ascending: true })
    .limit(200);
  return data ?? [];
}

export async function listMural(supabase: DB) {
  const { data } = await supabase
    .from("mural_avisos")
    .select("id, titulo, mensagem, created_at, autor:profiles!mural_avisos_autor_id_fkey(full_name)")
    .order("created_at", { ascending: false });
  return data ?? [];
}

// =========================================================
// Chat direto (1:1)
// =========================================================

export async function listConversasDiretas(supabase: DB, userId: string) {
  const { data } = await supabase
    .from("conversas_diretas")
    .select(
      "id, participante_a, participante_b, a:profiles!conversas_diretas_participante_a_fkey(id, full_name, avatar_url), b:profiles!conversas_diretas_participante_b_fkey(id, full_name, avatar_url), mensagens_diretas(mensagem, created_at, autor_id)",
    )
    .or(`participante_a.eq.${userId},participante_b.eq.${userId}`);

  return (data ?? [])
    .map((c) => {
      const outro = c.participante_a === userId ? c.b : c.a;
      const ultima = [...c.mensagens_diretas].sort(
        (x, y) => new Date(y.created_at).getTime() - new Date(x.created_at).getTime(),
      )[0];
      return {
        conversaId: c.id,
        outro,
        ultimaMensagem: ultima?.mensagem ?? null,
        ultimaData: ultima?.created_at ?? null,
      };
    })
    .filter((c) => c.outro)
    .sort((a, b) => new Date(b.ultimaData ?? 0).getTime() - new Date(a.ultimaData ?? 0).getTime());
}

export async function getOrCreateConversaDireta(supabase: DB, userId: string, outroId: string) {
  const [participante_a, participante_b] = [userId, outroId].sort();

  const { data: existente } = await supabase
    .from("conversas_diretas")
    .select("id")
    .eq("participante_a", participante_a)
    .eq("participante_b", participante_b)
    .maybeSingle();

  if (existente) return existente.id;

  const { data: nova, error } = await supabase
    .from("conversas_diretas")
    .insert({ participante_a, participante_b })
    .select("id")
    .single();

  if (error) throw error;
  return nova.id;
}

export async function getMensagensDiretas(supabase: DB, conversaId: string) {
  const { data } = await supabase
    .from("mensagens_diretas")
    .select("id, mensagem, created_at, autor_id")
    .eq("conversa_id", conversaId)
    .order("created_at", { ascending: true })
    .limit(200);
  return data ?? [];
}

export async function getConversaComOutroParticipante(supabase: DB, conversaId: string, userId: string) {
  const { data } = await supabase
    .from("conversas_diretas")
    .select(
      "id, participante_a, participante_b, a:profiles!conversas_diretas_participante_a_fkey(id, full_name, avatar_url), b:profiles!conversas_diretas_participante_b_fkey(id, full_name, avatar_url)",
    )
    .eq("id", conversaId)
    .single();

  if (!data) return null;
  return data.participante_a === userId ? data.b : data.a;
}

export async function getStaffDirectory(supabase: DB) {
  const { data } = await supabase.rpc("staff_directory");
  return data ?? [];
}

// Pessoas com quem o usuário atual pode iniciar uma conversa nova:
// staff (dono/professor) pra todo mundo, e também os alunos que o
// dono/professor já enxerga (RLS de profiles cobre o resto sozinho).
export async function listContatosDisponiveis(
  supabase: DB,
  profile: { id: string; role: "dono" | "professor" | "aluno" | "aluno_menor" | "responsavel" },
) {
  const staff = await getStaffDirectory(supabase);

  let outros: { id: string; full_name: string; role: string }[] = [];

  if (profile.role === "dono") {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .in("role", ["aluno", "aluno_menor", "responsavel"])
      .order("full_name");
    outros = data ?? [];
  } else if (profile.role === "professor") {
    const { data: turmas } = await supabase.from("turma_professores").select("turma_id").eq("professor_id", profile.id);
    const turmaIds = (turmas ?? []).map((t) => t.turma_id);
    if (turmaIds.length > 0) {
      const { data: matriculas } = await supabase
        .from("matriculas")
        .select("aluno:profiles!matriculas_aluno_id_fkey(id, full_name, role)")
        .in("turma_id", turmaIds)
        .eq("ativo", true);
      const unicos = new Map<string, { id: string; full_name: string; role: string }>();
      for (const m of matriculas ?? []) {
        if (m.aluno) unicos.set(m.aluno.id, m.aluno);
      }
      outros = Array.from(unicos.values());
    }
  }

  const todos = [...staff, ...outros].filter((p) => p.id !== profile.id);
  const unicos = new Map(todos.map((p) => [p.id, p]));
  return Array.from(unicos.values()).sort((a, b) => a.full_name.localeCompare(b.full_name));
}
