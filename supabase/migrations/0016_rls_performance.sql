-- Otimização de performance do RLS, sem mudar quem pode ver/editar o quê.
--
-- Dois problemas apontados pelo advisor de performance do Supabase, os dois
-- presentes em quase toda tabela do sistema:
--
-- 1) auth_rls_initplan: políticas chamavam auth.uid() direto. O Postgres
--    reavalia isso linha a linha; envolvendo em "(select auth.uid())" ele
--    vira um initplan calculado uma vez só por consulta. O mesmo vale pra
--    is_dono(), que não recebe argumento nenhum.
-- 2) multiple_permissive_policies: quase toda tabela tinha uma política
--    "_write for all" (que já cobre SELECT sozinha) *junto* com uma
--    "_select for select" separada — pra todo SELECT, o Postgres avaliava
--    as duas e juntava com OR. Aqui cada tabela passa a ter uma política
--    por comando (select/insert/update/delete), sem sobreposição. Onde a
--    política de escrita liberava leitura implícita além da política de
--    select (ex.: professor que dá aula pro aluno podia ler qualquer
--    avaliação dele, não só as que ele mesmo lançou), essa condição foi
--    somada à nova política de select pra não tirar acesso de ninguém.

-- =========================================================
-- PROFILES
-- =========================================================
drop policy profiles_select on profiles;
create policy profiles_select on profiles for select
  using (
    id = (select auth.uid())
    or (select is_dono())
    or is_responsavel_de(id)
    or leciona_aluno(id)
    or tem_conversa_com(id)
  );

drop policy profiles_insert on profiles;
create policy profiles_insert on profiles for insert
  with check (id = (select auth.uid()) or (select is_dono()));

drop policy profiles_update on profiles;
create policy profiles_update on profiles for update
  using (id = (select auth.uid()) or (select is_dono()))
  with check (id = (select auth.uid()) or (select is_dono()));

-- =========================================================
-- TURMAS
-- =========================================================
drop policy turmas_write on turmas;
drop policy turmas_select on turmas;

create policy turmas_select on turmas for select
  using ((select is_dono()) or leciona_turma(id) or matriculado_turma(id) or responsavel_na_turma(id));
create policy turmas_insert on turmas for insert
  with check ((select is_dono()));
create policy turmas_update on turmas for update
  using ((select is_dono())) with check ((select is_dono()));
create policy turmas_delete on turmas for delete
  using ((select is_dono()));

-- =========================================================
-- TURMA_PROFESSORES
-- =========================================================
drop policy turma_professores_write on turma_professores;
drop policy turma_professores_select on turma_professores;

create policy turma_professores_select on turma_professores for select
  using (
    (select is_dono())
    or professor_id = (select auth.uid())
    or matriculado_turma(turma_id)
    or responsavel_na_turma(turma_id)
  );
create policy turma_professores_insert on turma_professores for insert
  with check ((select is_dono()));
create policy turma_professores_update on turma_professores for update
  using ((select is_dono())) with check ((select is_dono()));
create policy turma_professores_delete on turma_professores for delete
  using ((select is_dono()));

-- =========================================================
-- MATRICULAS
-- =========================================================
drop policy matriculas_write on matriculas;
drop policy matriculas_select on matriculas;

create policy matriculas_select on matriculas for select
  using (
    (select is_dono())
    or aluno_id = (select auth.uid())
    or leciona_turma(turma_id)
    or is_responsavel_de(aluno_id)
  );
create policy matriculas_insert on matriculas for insert
  with check ((select is_dono()));
create policy matriculas_update on matriculas for update
  using ((select is_dono())) with check ((select is_dono()));
create policy matriculas_delete on matriculas for delete
  using ((select is_dono()));

-- =========================================================
-- AULAS
-- =========================================================
drop policy aulas_write on aulas;
drop policy aulas_select on aulas;

create policy aulas_select on aulas for select
  using (
    (select is_dono())
    or leciona_turma(turma_id)
    or matriculado_turma(turma_id)
    or responsavel_na_turma(turma_id)
  );
create policy aulas_insert on aulas for insert
  with check ((select is_dono()) or leciona_turma(turma_id));
create policy aulas_update on aulas for update
  using ((select is_dono()) or leciona_turma(turma_id))
  with check ((select is_dono()) or leciona_turma(turma_id));
create policy aulas_delete on aulas for delete
  using ((select is_dono()) or leciona_turma(turma_id));

-- =========================================================
-- PRESENCAS
-- =========================================================
drop policy presencas_write on presencas;
drop policy presencas_select on presencas;

create policy presencas_select on presencas for select
  using (
    (select is_dono())
    or aluno_id = (select auth.uid())
    or is_responsavel_de(aluno_id)
    or exists (select 1 from aulas a where a.id = presencas.aula_id and leciona_turma(a.turma_id))
  );
create policy presencas_insert on presencas for insert
  with check (
    (select is_dono())
    or exists (select 1 from aulas a where a.id = presencas.aula_id and leciona_turma(a.turma_id))
  );
create policy presencas_update on presencas for update
  using (
    (select is_dono())
    or exists (select 1 from aulas a where a.id = presencas.aula_id and leciona_turma(a.turma_id))
  )
  with check (
    (select is_dono())
    or exists (select 1 from aulas a where a.id = presencas.aula_id and leciona_turma(a.turma_id))
  );
create policy presencas_delete on presencas for delete
  using (
    (select is_dono())
    or exists (select 1 from aulas a where a.id = presencas.aula_id and leciona_turma(a.turma_id))
  );

-- =========================================================
-- GRADUACOES
-- =========================================================
drop policy graduacoes_write on graduacoes;
drop policy graduacoes_select on graduacoes;

create policy graduacoes_select on graduacoes for select
  using (
    (select is_dono())
    or aluno_id = (select auth.uid())
    or is_responsavel_de(aluno_id)
    or professor_id = (select auth.uid())
    or (get_my_role() = 'professor'::user_role and leciona_aluno(aluno_id))
  );
create policy graduacoes_insert on graduacoes for insert
  with check (
    (select is_dono())
    or (get_my_role() = 'professor'::user_role and professor_id = (select auth.uid()) and leciona_aluno(aluno_id))
  );
create policy graduacoes_update on graduacoes for update
  using ((select is_dono()) or (get_my_role() = 'professor'::user_role and leciona_aluno(aluno_id)))
  with check (
    (select is_dono())
    or (get_my_role() = 'professor'::user_role and professor_id = (select auth.uid()) and leciona_aluno(aluno_id))
  );
create policy graduacoes_delete on graduacoes for delete
  using ((select is_dono()) or (get_my_role() = 'professor'::user_role and leciona_aluno(aluno_id)));

-- =========================================================
-- AVALIACOES
-- =========================================================
drop policy avaliacoes_write on avaliacoes;
drop policy avaliacoes_select on avaliacoes;

create policy avaliacoes_select on avaliacoes for select
  using (
    (select is_dono())
    or aluno_id = (select auth.uid())
    or is_responsavel_de(aluno_id)
    or professor_id = (select auth.uid())
    or (get_my_role() = 'professor'::user_role and leciona_aluno(aluno_id))
  );
create policy avaliacoes_insert on avaliacoes for insert
  with check (
    (select is_dono())
    or (get_my_role() = 'professor'::user_role and professor_id = (select auth.uid()) and leciona_aluno(aluno_id))
  );
create policy avaliacoes_update on avaliacoes for update
  using ((select is_dono()) or (get_my_role() = 'professor'::user_role and leciona_aluno(aluno_id)))
  with check (
    (select is_dono())
    or (get_my_role() = 'professor'::user_role and professor_id = (select auth.uid()) and leciona_aluno(aluno_id))
  );
create policy avaliacoes_delete on avaliacoes for delete
  using ((select is_dono()) or (get_my_role() = 'professor'::user_role and leciona_aluno(aluno_id)));

-- =========================================================
-- AVALIACAO_CRITERIOS
-- =========================================================
drop policy avaliacao_criterios_write on avaliacao_criterios;
drop policy avaliacao_criterios_select on avaliacao_criterios;

create policy avaliacao_criterios_select on avaliacao_criterios for select
  using (
    exists (
      select 1 from avaliacoes av
      where av.id = avaliacao_criterios.avaliacao_id
        and (
          (select is_dono())
          or av.aluno_id = (select auth.uid())
          or is_responsavel_de(av.aluno_id)
          or av.professor_id = (select auth.uid())
        )
    )
  );
create policy avaliacao_criterios_insert on avaliacao_criterios for insert
  with check (
    exists (
      select 1 from avaliacoes av
      where av.id = avaliacao_criterios.avaliacao_id
        and ((select is_dono()) or (get_my_role() = 'professor'::user_role and av.professor_id = (select auth.uid())))
    )
  );
create policy avaliacao_criterios_update on avaliacao_criterios for update
  using (
    exists (
      select 1 from avaliacoes av
      where av.id = avaliacao_criterios.avaliacao_id
        and ((select is_dono()) or (get_my_role() = 'professor'::user_role and av.professor_id = (select auth.uid())))
    )
  )
  with check (
    exists (
      select 1 from avaliacoes av
      where av.id = avaliacao_criterios.avaliacao_id
        and ((select is_dono()) or (get_my_role() = 'professor'::user_role and av.professor_id = (select auth.uid())))
    )
  );
create policy avaliacao_criterios_delete on avaliacao_criterios for delete
  using (
    exists (
      select 1 from avaliacoes av
      where av.id = avaliacao_criterios.avaliacao_id
        and ((select is_dono()) or (get_my_role() = 'professor'::user_role and av.professor_id = (select auth.uid())))
    )
  );

-- =========================================================
-- PLANOS
-- =========================================================
drop policy planos_write on planos;
drop policy planos_select on planos;

create policy planos_select on planos for select
  using ((select auth.uid()) is not null);
create policy planos_insert on planos for insert
  with check ((select is_dono()));
create policy planos_update on planos for update
  using ((select is_dono())) with check ((select is_dono()));
create policy planos_delete on planos for delete
  using ((select is_dono()));

-- =========================================================
-- MENSALIDADES
-- =========================================================
drop policy mensalidades_write on mensalidades;
drop policy mensalidades_select on mensalidades;

create policy mensalidades_select on mensalidades for select
  using (
    (select is_dono())
    or (aluno_id = (select auth.uid()) and get_my_role() = 'aluno'::user_role)
    or is_responsavel_de(aluno_id)
  );
create policy mensalidades_insert on mensalidades for insert
  with check ((select is_dono()));
create policy mensalidades_update on mensalidades for update
  using ((select is_dono())) with check ((select is_dono()));
create policy mensalidades_delete on mensalidades for delete
  using ((select is_dono()));

-- =========================================================
-- RESPONSAVEIS_ALUNOS
-- =========================================================
drop policy responsaveis_alunos_write on responsaveis_alunos;
drop policy responsaveis_alunos_select on responsaveis_alunos;

create policy responsaveis_alunos_select on responsaveis_alunos for select
  using (
    responsavel_id = (select auth.uid())
    or aluno_id = (select auth.uid())
    or (select is_dono())
  );
create policy responsaveis_alunos_insert on responsaveis_alunos for insert
  with check ((select is_dono()));
create policy responsaveis_alunos_update on responsaveis_alunos for update
  using ((select is_dono())) with check ((select is_dono()));
create policy responsaveis_alunos_delete on responsaveis_alunos for delete
  using ((select is_dono()));

-- =========================================================
-- LISTA_ESPERA
-- =========================================================
drop policy lista_espera_write on lista_espera;
drop policy lista_espera_select on lista_espera;

create policy lista_espera_select on lista_espera for select
  using (
    (select is_dono())
    or aluno_id = (select auth.uid())
    or is_responsavel_de(aluno_id)
    or leciona_turma(turma_id)
  );
create policy lista_espera_insert on lista_espera for insert
  with check ((select is_dono()));
create policy lista_espera_update on lista_espera for update
  using ((select is_dono())) with check ((select is_dono()));
create policy lista_espera_delete on lista_espera for delete
  using ((select is_dono()));

-- =========================================================
-- NOTIFICACOES_ENVIADAS
-- =========================================================
drop policy notificacoes_enviadas_write on notificacoes_enviadas;
drop policy notificacoes_enviadas_select on notificacoes_enviadas;

create policy notificacoes_enviadas_select on notificacoes_enviadas for select
  using ((select is_dono()));
create policy notificacoes_enviadas_insert on notificacoes_enviadas for insert
  with check ((select is_dono()));
create policy notificacoes_enviadas_update on notificacoes_enviadas for update
  using ((select is_dono())) with check ((select is_dono()));
create policy notificacoes_enviadas_delete on notificacoes_enviadas for delete
  using ((select is_dono()));

-- =========================================================
-- MURAL_AVISOS (já dividido por comando, só falta o wrapping)
-- =========================================================
drop policy mural_select on mural_avisos;
drop policy mural_insert on mural_avisos;
drop policy mural_update on mural_avisos;
drop policy mural_delete on mural_avisos;

create policy mural_select on mural_avisos for select
  using ((select auth.uid()) is not null);
create policy mural_insert on mural_avisos for insert
  with check (
    autor_id = (select auth.uid())
    and get_my_role() = any (array['dono'::user_role, 'professor'::user_role])
  );
create policy mural_update on mural_avisos for update
  using ((select is_dono()) or autor_id = (select auth.uid()))
  with check ((select is_dono()) or autor_id = (select auth.uid()));
create policy mural_delete on mural_avisos for delete
  using ((select is_dono()) or autor_id = (select auth.uid()));

-- =========================================================
-- CHAT_TURMA_MENSAGENS (já dividido, só wrapping)
-- =========================================================
drop policy chat_turma_select on chat_turma_mensagens;
drop policy chat_turma_insert on chat_turma_mensagens;

create policy chat_turma_select on chat_turma_mensagens for select
  using ((select is_dono()) or leciona_turma(turma_id) or matriculado_turma(turma_id) or responsavel_na_turma(turma_id));
create policy chat_turma_insert on chat_turma_mensagens for insert
  with check (
    autor_id = (select auth.uid())
    and ((select is_dono()) or leciona_turma(turma_id) or matriculado_turma(turma_id))
  );

-- =========================================================
-- CONVERSAS_DIRETAS (já dividido, só wrapping)
-- =========================================================
drop policy conversas_diretas_select on conversas_diretas;
drop policy conversas_diretas_insert on conversas_diretas;

create policy conversas_diretas_select on conversas_diretas for select
  using (participante_a = (select auth.uid()) or participante_b = (select auth.uid()));
create policy conversas_diretas_insert on conversas_diretas for insert
  with check (participante_a = (select auth.uid()) or participante_b = (select auth.uid()));

-- =========================================================
-- MENSAGENS_DIRETAS (já dividido, só wrapping)
-- =========================================================
drop policy mensagens_diretas_select on mensagens_diretas;
drop policy mensagens_diretas_insert on mensagens_diretas;

create policy mensagens_diretas_select on mensagens_diretas for select
  using (
    exists (
      select 1 from conversas_diretas c
      where c.id = mensagens_diretas.conversa_id
        and (c.participante_a = (select auth.uid()) or c.participante_b = (select auth.uid()))
    )
  );
create policy mensagens_diretas_insert on mensagens_diretas for insert
  with check (
    autor_id = (select auth.uid())
    and exists (
      select 1 from conversas_diretas c
      where c.id = mensagens_diretas.conversa_id
        and (c.participante_a = (select auth.uid()) or c.participante_b = (select auth.uid()))
    )
  );

-- =========================================================
-- CHAT_LEITURAS / PUSH_TOKENS (política única, só wrapping)
-- =========================================================
drop policy chat_leituras_all on chat_leituras;
create policy chat_leituras_all on chat_leituras for all
  using (usuario_id = (select auth.uid()))
  with check (usuario_id = (select auth.uid()));

drop policy push_tokens_all on push_tokens;
create policy push_tokens_all on push_tokens for all
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
