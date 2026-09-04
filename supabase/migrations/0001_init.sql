-- DELARIVA SAJ - Schema inicial
-- Perfis: dono, professor, aluno, aluno_menor, responsavel

create extension if not exists "pgcrypto";

-- =========================================================
-- ENUMS
-- =========================================================
create type user_role as enum ('dono', 'professor', 'aluno', 'aluno_menor', 'responsavel');
create type faixa_categoria as enum ('adulto', 'infantil');
create type status_mensalidade as enum ('pago', 'pendente', 'atrasado');
create type criterio_avaliacao as enum ('tecnica', 'disciplina', 'assiduidade', 'condicionamento');

-- =========================================================
-- PROFILES (estende auth.users)
-- =========================================================
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  avatar_url text,
  role user_role not null,
  birth_date date,
  faixa_categoria faixa_categoria, -- categoria de treino do aluno (adulto/infantil), null para professor/dono/responsavel
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- vínculo responsável <-> aluno menor (N:N — um menor pode ter mais de um responsável)
create table responsaveis_alunos (
  id uuid primary key default gen_random_uuid(),
  responsavel_id uuid not null references profiles (id) on delete cascade,
  aluno_id uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (responsavel_id, aluno_id)
);

-- =========================================================
-- TURMAS / AULAS / PRESENÇA
-- =========================================================
create table turmas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  faixa_etaria faixa_categoria not null,
  dias_semana int[] not null default '{}', -- 0=domingo .. 6=sábado
  horario_inicio time not null,
  horario_fim time not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

-- múltiplos professores por turma
create table turma_professores (
  turma_id uuid not null references turmas (id) on delete cascade,
  professor_id uuid not null references profiles (id) on delete cascade,
  primary key (turma_id, professor_id)
);

create table matriculas (
  id uuid primary key default gen_random_uuid(),
  turma_id uuid not null references turmas (id) on delete cascade,
  aluno_id uuid not null references profiles (id) on delete cascade,
  ativo boolean not null default true,
  data_matricula date not null default current_date,
  unique (turma_id, aluno_id)
);

-- uma "aula" é uma ocorrência concreta de uma turma em uma data
create table aulas (
  id uuid primary key default gen_random_uuid(),
  turma_id uuid not null references turmas (id) on delete cascade,
  data date not null,
  professor_id uuid references profiles (id),
  observacao text,
  created_at timestamptz not null default now(),
  unique (turma_id, data)
);

create table presencas (
  id uuid primary key default gen_random_uuid(),
  aula_id uuid not null references aulas (id) on delete cascade,
  aluno_id uuid not null references profiles (id) on delete cascade,
  presente boolean not null default true,
  registrado_por uuid references profiles (id),
  created_at timestamptz not null default now(),
  unique (aula_id, aluno_id)
);

-- =========================================================
-- GRADUAÇÃO E AVALIAÇÕES
-- =========================================================
create table graduacoes (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references profiles (id) on delete cascade,
  professor_id uuid references profiles (id),
  faixa_categoria faixa_categoria not null,
  faixa text not null, -- ex: branca, azul, roxa, marrom, preta (adulto) / branca, cinza, amarela, laranja, verde (infantil)
  grau int not null default 0 check (grau between 0 and 4),
  data date not null default current_date,
  observacao text,
  created_at timestamptz not null default now()
);

create table avaliacoes (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references profiles (id) on delete cascade,
  professor_id uuid not null references profiles (id),
  data date not null default current_date,
  nota_geral numeric(3, 1) check (nota_geral between 0 and 10),
  comentario text,
  graduacao_id uuid references graduacoes (id) on delete set null, -- avaliação que embasou uma graduação
  created_at timestamptz not null default now()
);

create table avaliacao_criterios (
  id uuid primary key default gen_random_uuid(),
  avaliacao_id uuid not null references avaliacoes (id) on delete cascade,
  criterio criterio_avaliacao not null,
  nota numeric(3, 1) not null check (nota between 0 and 10),
  unique (avaliacao_id, criterio)
);

-- =========================================================
-- FINANCEIRO
-- =========================================================
create table planos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  valor numeric(10, 2) not null,
  periodicidade text not null default 'mensal',
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table mensalidades (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null references profiles (id) on delete cascade,
  plano_id uuid references planos (id),
  mes_referencia date not null, -- sempre dia 1 do mês de referência
  valor numeric(10, 2) not null,
  status status_mensalidade not null default 'pendente',
  data_pagamento date,
  forma_pagamento text,
  created_at timestamptz not null default now(),
  unique (aluno_id, mes_referencia)
);

-- =========================================================
-- CHAT E MURAL
-- =========================================================
create table chat_turma_mensagens (
  id uuid primary key default gen_random_uuid(),
  turma_id uuid not null references turmas (id) on delete cascade,
  autor_id uuid not null references profiles (id),
  mensagem text not null,
  created_at timestamptz not null default now()
);

create table mural_avisos (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid not null references profiles (id),
  titulo text not null,
  mensagem text not null,
  created_at timestamptz not null default now()
);

-- =========================================================
-- ÍNDICES
-- =========================================================
create index on responsaveis_alunos (aluno_id);
create index on matriculas (aluno_id);
create index on matriculas (turma_id);
create index on aulas (turma_id, data);
create index on presencas (aluno_id);
create index on graduacoes (aluno_id);
create index on avaliacoes (aluno_id);
create index on mensalidades (aluno_id, mes_referencia);
create index on chat_turma_mensagens (turma_id, created_at);
