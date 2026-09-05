-- Limite de vagas por turma + lista de espera.

alter table turmas add column capacidade_maxima int check (capacidade_maxima is null or capacidade_maxima > 0);

create table lista_espera (
  id uuid primary key default gen_random_uuid(),
  turma_id uuid not null references turmas (id) on delete cascade,
  aluno_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (turma_id, aluno_id)
);

create index on lista_espera (turma_id);

alter table lista_espera enable row level security;

create policy lista_espera_select on lista_espera for select
  using (
    is_dono()
    or aluno_id = auth.uid()
    or is_responsavel_de(aluno_id)
    or leciona_turma(turma_id)
  );

create policy lista_espera_write on lista_espera for all
  using (is_dono())
  with check (is_dono());
