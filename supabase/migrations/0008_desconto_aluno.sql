-- Desconto/bolsa padrão do aluno (% aplicado ao lançar mensalidade).
alter table profiles
  add column desconto_percentual numeric(5, 2) not null default 0
  check (desconto_percentual between 0 and 100);
