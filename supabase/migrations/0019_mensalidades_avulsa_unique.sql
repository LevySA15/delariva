-- A unicidade (aluno_id, mes_referencia) fazia sentido pra mensalidade
-- recorrente, mas impedia lançar uma cobrança avulsa no mesmo mês em que
-- já existe a mensalidade do aluno (ou mais de uma avulsa no mesmo mês).
-- Restringe a restrição só ao tipo 'mensalidade'.

alter table mensalidades drop constraint mensalidades_aluno_id_mes_referencia_key;

create unique index mensalidades_aluno_mes_mensalidade_uidx
  on mensalidades (aluno_id, mes_referencia)
  where tipo = 'mensalidade';
