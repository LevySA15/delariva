-- Base para notificações push: tokens de dispositivo por usuário, log de
-- envios (auditoria + histórico de mensagens personalizadas do dono) e uma
-- data de vencimento explícita em mensalidades (usada pelo lembrete
-- automático de cobrança).

create table push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  token text not null,
  plataforma text not null default 'android',
  created_at timestamptz not null default now(),
  unique (user_id, token)
);

alter table push_tokens enable row level security;

create policy push_tokens_all on push_tokens for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create table notificacoes_enviadas (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid references profiles (id), -- null quando foi automática (sistema)
  tipo text not null, -- 'mensalidade' | 'mensagem' | 'mural' | 'aula' | 'personalizada'
  titulo text not null,
  corpo text not null,
  destinatarios_count int not null default 0,
  created_at timestamptz not null default now()
);

alter table notificacoes_enviadas enable row level security;

create policy notificacoes_enviadas_select on notificacoes_enviadas for select
  using (is_dono());

create policy notificacoes_enviadas_write on notificacoes_enviadas for all
  using (is_dono())
  with check (is_dono());

alter table mensalidades add column data_vencimento date;
update mensalidades set data_vencimento = (mes_referencia + interval '9 days')::date where data_vencimento is null;
