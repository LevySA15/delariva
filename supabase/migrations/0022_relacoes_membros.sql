-- Amplia quem pode ver o perfil de quem, pra dar suporte a explorar as
-- relações entre membros da academia (perfil "quem é quem", diretório,
-- card de membro). Antes só dono, responsável, professor->aluno e quem
-- já tem uma DM conseguiam ver o perfil de outra pessoa — colegas de
-- turma e o próprio aluno->professor não enxergavam um ao outro.
create or replace function sou_lecionado_por(target_professor uuid)
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1
    from matriculas m
    join turma_professores tp on tp.turma_id = m.turma_id
    where m.aluno_id = auth.uid() and tp.professor_id = target_professor and m.ativo = true
  );
$$;

create or replace function colega_de_turma(target_aluno uuid)
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1
    from matriculas m1
    join matriculas m2 on m1.turma_id = m2.turma_id
    where m1.aluno_id = (select auth.uid()) and m2.aluno_id = target_aluno
      and m1.ativo = true and m2.ativo = true
  );
$$;

create or replace function colega_professor(target_professor uuid)
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1
    from turma_professores tp1
    join turma_professores tp2 on tp1.turma_id = tp2.turma_id
    where tp1.professor_id = (select auth.uid()) and tp2.professor_id = target_professor
  );
$$;

drop policy profiles_select on profiles;
create policy profiles_select on profiles for select
  using (
    (id = (select auth.uid()))
    or (select is_dono())
    or is_responsavel_de(id)
    or leciona_aluno(id)
    or tem_conversa_com(id)
    or sou_lecionado_por(id)
    or colega_de_turma(id)
    or colega_professor(id)
  );
