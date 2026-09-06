-- Geração automática da mensalidade do mês, no primeiro dia de cada mês.
--
-- Não existe um vínculo persistente aluno->plano (o plano é escolhido a cada
-- lançamento manual), então a regra é: para cada aluno que já teve alguma
-- mensalidade recorrente lançada antes, clona o último plano_id/valor pra o
-- mês novo (se ainda não existir), respeitando o dia_vencimento do aluno.
-- Aluno sem nenhum histórico de mensalidade continua exigindo o primeiro
-- lançamento manual (não há valor a partir do qual "clonar").
create or replace function gerar_mensalidades_mensal()
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_mes_atual date := date_trunc('month', current_date)::date;
  v_aluno record;
begin
  for v_aluno in
    select distinct on (m.aluno_id)
      m.aluno_id, m.plano_id, m.valor, p.dia_vencimento
    from mensalidades m
    join profiles p on p.id = m.aluno_id
    where m.tipo = 'mensalidade' and m.mes_referencia < v_mes_atual
    order by m.aluno_id, m.mes_referencia desc
  loop
    insert into mensalidades (aluno_id, plano_id, mes_referencia, valor, data_vencimento)
    values (
      v_aluno.aluno_id,
      v_aluno.plano_id,
      v_mes_atual,
      v_aluno.valor,
      make_date(extract(year from v_mes_atual)::int, extract(month from v_mes_atual)::int, v_aluno.dia_vencimento)
    )
    on conflict (aluno_id, mes_referencia) where tipo = 'mensalidade' do nothing;
  end loop;
end;
$$;

select cron.schedule('gerar-mensalidades-mensal', '0 6 1 * *', $$select gerar_mensalidades_mensal()$$);
