-- Chat 1:1 (mensagens diretas) + leitura/não-lidas, complementando o
-- chat em grupo por turma que já existia.

create table conversas_diretas (
  id uuid primary key default gen_random_uuid(),
  participante_a uuid not null references profiles (id) on delete cascade,
  participante_b uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  check (participante_a < participante_b),
  unique (participante_a, participante_b)
);

create table mensagens_diretas (
  id uuid primary key default gen_random_uuid(),
  conversa_id uuid not null references conversas_diretas (id) on delete cascade,
  autor_id uuid not null references profiles (id),
  mensagem text not null,
  created_at timestamptz not null default now()
);

-- Marca até quando cada usuário já leu cada conversa (turma ou direta),
-- usada só para calcular badges de não lidas — nunca visível a terceiros.
create table chat_leituras (
  usuario_id uuid not null references profiles (id) on delete cascade,
  contexto_tipo text not null check (contexto_tipo in ('turma', 'direta')),
  contexto_id uuid not null,
  last_read_at timestamptz not null default now(),
  primary key (usuario_id, contexto_tipo, contexto_id)
);

create index on conversas_diretas (participante_a);
create index on conversas_diretas (participante_b);
create index on mensagens_diretas (conversa_id, created_at);

-- =========================================================
-- Diretório de staff — permite qualquer autenticado encontrar
-- dono/professores pra iniciar uma conversa, sem afrouxar o RLS de
-- profiles (só devolve id/nome/papel, nada sensível).
-- =========================================================
create or replace function staff_directory()
returns table (id uuid, full_name text, role user_role)
language sql security definer stable set search_path = public
as $$
  select id, full_name, role from profiles where role in ('dono', 'professor');
$$;

revoke execute on function staff_directory() from public;
revoke execute on function staff_directory() from anon;
grant execute on function staff_directory() to authenticated;

-- =========================================================
-- RLS
-- =========================================================
alter table conversas_diretas enable row level security;
alter table mensagens_diretas enable row level security;
alter table chat_leituras enable row level security;

create policy conversas_diretas_select on conversas_diretas for select
  using (participante_a = auth.uid() or participante_b = auth.uid());

create policy conversas_diretas_insert on conversas_diretas for insert
  with check (participante_a = auth.uid() or participante_b = auth.uid());

create policy mensagens_diretas_select on mensagens_diretas for select
  using (
    exists (
      select 1 from conversas_diretas c
      where c.id = mensagens_diretas.conversa_id
        and (c.participante_a = auth.uid() or c.participante_b = auth.uid())
    )
  );

create policy mensagens_diretas_insert on mensagens_diretas for insert
  with check (
    autor_id = auth.uid()
    and exists (
      select 1 from conversas_diretas c
      where c.id = mensagens_diretas.conversa_id
        and (c.participante_a = auth.uid() or c.participante_b = auth.uid())
    )
  );

create policy chat_leituras_all on chat_leituras for all
  using (usuario_id = auth.uid())
  with check (usuario_id = auth.uid());

-- Realtime para o chat direto (o de turma já foi habilitado antes)
alter publication supabase_realtime add table mensagens_diretas;
