-- Funções auxiliares e triggers

-- updated_at automático em profiles
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- cria a linha em profiles automaticamente quando um usuário se cadastra no Supabase Auth
-- espera role e full_name em raw_user_meta_data (enviado no signUp)
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, birth_date)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'aluno'),
    nullif(new.raw_user_meta_data ->> 'birth_date', '')::date
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- =========================================================
-- Funções auxiliares para as policies de RLS (security definer
-- para evitar recursão de RLS ao consultar profiles/matriculas)
-- =========================================================

create or replace function get_my_role()
returns user_role
language sql security definer stable set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_dono()
returns boolean
language sql security definer stable set search_path = public
as $$
  select get_my_role() = 'dono';
$$;

create or replace function is_responsavel_de(target_aluno uuid)
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from responsaveis_alunos
    where responsavel_id = auth.uid() and aluno_id = target_aluno
  );
$$;

create or replace function leciona_turma(target_turma uuid)
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from turma_professores
    where professor_id = auth.uid() and turma_id = target_turma
  );
$$;

create or replace function matriculado_turma(target_turma uuid)
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from matriculas
    where aluno_id = auth.uid() and turma_id = target_turma and ativo = true
  );
$$;

-- professor leciona alguma turma em que o aluno está matriculado
create or replace function leciona_aluno(target_aluno uuid)
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1
    from matriculas m
    join turma_professores tp on tp.turma_id = m.turma_id
    where m.aluno_id = target_aluno and tp.professor_id = auth.uid() and m.ativo = true
  );
$$;

-- responsável tem algum dependente matriculado na turma
create or replace function responsavel_na_turma(target_turma uuid)
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from matriculas m
    where m.turma_id = target_turma and is_responsavel_de(m.aluno_id)
  );
$$;
