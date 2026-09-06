-- Base de schema pra expandir o Financeiro: corrige RLS de mensalidades pra
-- quem paga não ser necessariamente "aluno" (um professor pode também ser
-- instrutor e pagar mensalidade), dia de vencimento configurável por
-- pessoa, cobranças avulsas, configuração da academia (chave Pix) e
-- pagamento a professor/instrutor.

-- =========================================================
-- Corrige leitura da própria mensalidade (não depende mais do role)
-- =========================================================
drop policy mensalidades_select on mensalidades;
create policy mensalidades_select on mensalidades for select
  using (
    (select is_dono())
    or aluno_id = (select auth.uid())
    or is_responsavel_de(aluno_id)
  );

-- =========================================================
-- Dia de vencimento por pessoa (default dia 10, como já era fixo)
-- =========================================================
alter table profiles add column dia_vencimento int not null default 10 check (dia_vencimento between 1 and 28);

-- =========================================================
-- Cobranças avulsas (taxa de exame, matrícula, farda...) usando a mesma
-- tabela de mensalidades, diferenciadas por tipo
-- =========================================================
alter table mensalidades add column tipo text not null default 'mensalidade' check (tipo in ('mensalidade', 'avulsa'));
alter table mensalidades add column descricao text;

-- =========================================================
-- Configuração da academia (linha única) — por ora só a chave Pix
-- =========================================================
create table academia_config (
  id boolean primary key default true check (id),
  pix_key text,
  updated_at timestamptz not null default now()
);

insert into academia_config (id) values (true);

alter table academia_config enable row level security;

create policy academia_config_select on academia_config for select
  using ((select auth.uid()) is not null);
create policy academia_config_update on academia_config for update
  using ((select is_dono())) with check ((select is_dono()));

-- =========================================================
-- Pagamento a professor/instrutor — qualquer profile pode ser marcado
-- como remunerado, independente do role (um aluno pode instruir uma
-- turma e receber por isso)
-- =========================================================
alter table profiles add column recebe_pagamento boolean not null default false;

create table pagamentos_professor (
  id uuid primary key default gen_random_uuid(),
  professor_id uuid not null references profiles (id) on delete cascade,
  mes_referencia date not null,
  valor numeric(10, 2) not null,
  status status_mensalidade not null default 'pendente',
  data_pagamento date,
  forma_pagamento text,
  created_at timestamptz not null default now(),
  unique (professor_id, mes_referencia)
);

alter table pagamentos_professor enable row level security;

create policy pagamentos_professor_select on pagamentos_professor for select
  using ((select is_dono()) or professor_id = (select auth.uid()));
create policy pagamentos_professor_insert on pagamentos_professor for insert
  with check ((select is_dono()));
create policy pagamentos_professor_update on pagamentos_professor for update
  using ((select is_dono())) with check ((select is_dono()));
create policy pagamentos_professor_delete on pagamentos_professor for delete
  using ((select is_dono()));
