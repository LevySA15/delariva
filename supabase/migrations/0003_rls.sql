-- Row Level Security — cada perfil só acessa o que pode acessar

alter table profiles enable row level security;
alter table responsaveis_alunos enable row level security;
alter table turmas enable row level security;
alter table turma_professores enable row level security;
alter table matriculas enable row level security;
alter table aulas enable row level security;
alter table presencas enable row level security;
alter table graduacoes enable row level security;
alter table avaliacoes enable row level security;
alter table avaliacao_criterios enable row level security;
alter table planos enable row level security;
alter table mensalidades enable row level security;
alter table chat_turma_mensagens enable row level security;
alter table mural_avisos enable row level security;

-- =========================================================
-- PROFILES
-- =========================================================
create policy profiles_select on profiles for select
  using (
    id = auth.uid()
    or is_dono()
    or is_responsavel_de(id)
    or leciona_aluno(id)
  );

create policy profiles_update on profiles for update
  using (id = auth.uid() or is_dono())
  with check (id = auth.uid() or is_dono());

create policy profiles_insert on profiles for insert
  with check (id = auth.uid() or is_dono());

-- =========================================================
-- RESPONSAVEIS_ALUNOS
-- =========================================================
create policy responsaveis_alunos_select on responsaveis_alunos for select
  using (responsavel_id = auth.uid() or aluno_id = auth.uid() or is_dono());

create policy responsaveis_alunos_write on responsaveis_alunos for all
  using (is_dono())
  with check (is_dono());

-- =========================================================
-- TURMAS
-- =========================================================
create policy turmas_select on turmas for select
  using (
    is_dono()
    or leciona_turma(id)
    or matriculado_turma(id)
    or responsavel_na_turma(id)
  );

create policy turmas_write on turmas for all
  using (is_dono())
  with check (is_dono());

-- =========================================================
-- TURMA_PROFESSORES
-- =========================================================
create policy turma_professores_select on turma_professores for select
  using (
    is_dono()
    or professor_id = auth.uid()
    or matriculado_turma(turma_id)
    or responsavel_na_turma(turma_id)
  );

create policy turma_professores_write on turma_professores for all
  using (is_dono())
  with check (is_dono());

-- =========================================================
-- MATRICULAS
-- =========================================================
create policy matriculas_select on matriculas for select
  using (
    is_dono()
    or aluno_id = auth.uid()
    or leciona_turma(turma_id)
    or is_responsavel_de(aluno_id)
  );

create policy matriculas_write on matriculas for all
  using (is_dono())
  with check (is_dono());

-- =========================================================
-- AULAS
-- =========================================================
create policy aulas_select on aulas for select
  using (
    is_dono()
    or leciona_turma(turma_id)
    or matriculado_turma(turma_id)
    or responsavel_na_turma(turma_id)
  );

create policy aulas_write on aulas for all
  using (is_dono() or leciona_turma(turma_id))
  with check (is_dono() or leciona_turma(turma_id));

-- =========================================================
-- PRESENCAS
-- =========================================================
create policy presencas_select on presencas for select
  using (
    is_dono()
    or aluno_id = auth.uid()
    or is_responsavel_de(aluno_id)
    or exists (select 1 from aulas a where a.id = presencas.aula_id and leciona_turma(a.turma_id))
  );

create policy presencas_write on presencas for all
  using (
    is_dono()
    or exists (select 1 from aulas a where a.id = presencas.aula_id and leciona_turma(a.turma_id))
  )
  with check (
    is_dono()
    or exists (select 1 from aulas a where a.id = presencas.aula_id and leciona_turma(a.turma_id))
  );

-- =========================================================
-- GRADUACOES
-- =========================================================
create policy graduacoes_select on graduacoes for select
  using (
    is_dono()
    or aluno_id = auth.uid()
    or is_responsavel_de(aluno_id)
    or professor_id = auth.uid()
  );

create policy graduacoes_write on graduacoes for all
  using (is_dono() or (get_my_role() = 'professor' and leciona_aluno(aluno_id)))
  with check (is_dono() or (get_my_role() = 'professor' and professor_id = auth.uid() and leciona_aluno(aluno_id)));

-- =========================================================
-- AVALIACOES
-- =========================================================
create policy avaliacoes_select on avaliacoes for select
  using (
    is_dono()
    or aluno_id = auth.uid()
    or is_responsavel_de(aluno_id)
    or professor_id = auth.uid()
  );

create policy avaliacoes_write on avaliacoes for all
  using (is_dono() or (get_my_role() = 'professor' and leciona_aluno(aluno_id)))
  with check (is_dono() or (get_my_role() = 'professor' and professor_id = auth.uid() and leciona_aluno(aluno_id)));

-- =========================================================
-- AVALIACAO_CRITERIOS (segue a mesma regra da avaliação-mãe)
-- =========================================================
create policy avaliacao_criterios_select on avaliacao_criterios for select
  using (
    exists (
      select 1 from avaliacoes av
      where av.id = avaliacao_criterios.avaliacao_id
        and (is_dono() or av.aluno_id = auth.uid() or is_responsavel_de(av.aluno_id) or av.professor_id = auth.uid())
    )
  );

create policy avaliacao_criterios_write on avaliacao_criterios for all
  using (
    exists (
      select 1 from avaliacoes av
      where av.id = avaliacao_criterios.avaliacao_id
        and (is_dono() or (get_my_role() = 'professor' and av.professor_id = auth.uid()))
    )
  )
  with check (
    exists (
      select 1 from avaliacoes av
      where av.id = avaliacao_criterios.avaliacao_id
        and (is_dono() or (get_my_role() = 'professor' and av.professor_id = auth.uid()))
    )
  );

-- =========================================================
-- PLANOS (não é sigiloso — todo autenticado pode ver, só o dono gerencia)
-- =========================================================
create policy planos_select on planos for select
  using (auth.uid() is not null);

create policy planos_write on planos for all
  using (is_dono())
  with check (is_dono());

-- =========================================================
-- MENSALIDADES — aluno_menor NUNCA vê financeiro, mesmo o seu
-- =========================================================
create policy mensalidades_select on mensalidades for select
  using (
    is_dono()
    or (aluno_id = auth.uid() and get_my_role() = 'aluno')
    or is_responsavel_de(aluno_id)
  );

create policy mensalidades_write on mensalidades for all
  using (is_dono())
  with check (is_dono());

-- =========================================================
-- CHAT_TURMA_MENSAGENS
-- =========================================================
create policy chat_turma_select on chat_turma_mensagens for select
  using (
    is_dono()
    or leciona_turma(turma_id)
    or matriculado_turma(turma_id)
    or responsavel_na_turma(turma_id)
  );

create policy chat_turma_insert on chat_turma_mensagens for insert
  with check (
    autor_id = auth.uid()
    and (is_dono() or leciona_turma(turma_id) or matriculado_turma(turma_id))
  );

-- =========================================================
-- MURAL_AVISOS — leitura geral, escrita só dono/professor
-- =========================================================
create policy mural_select on mural_avisos for select
  using (auth.uid() is not null);

create policy mural_insert on mural_avisos for insert
  with check (autor_id = auth.uid() and get_my_role() in ('dono', 'professor'));

-- update/delete separados do insert para não afrouxar a checagem de role acima
-- ("for all" também vale para insert, o que permitiria qualquer autenticado postar)
create policy mural_update on mural_avisos for update
  using (is_dono() or autor_id = auth.uid())
  with check (is_dono() or autor_id = auth.uid());

create policy mural_delete on mural_avisos for delete
  using (is_dono() or autor_id = auth.uid());
