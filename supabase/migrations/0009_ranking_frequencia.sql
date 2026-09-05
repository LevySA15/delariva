-- Ranking de frequência (geral ou por turma) — expõe só contagem
-- agregada de presenças por aluno, sem afrouxar o RLS de presencas
-- (que continua restrito a dono/professor da turma/próprio aluno).

create or replace function ranking_frequencia(p_turma_id uuid default null, p_desde date default null)
returns table (aluno_id uuid, full_name text, total_presencas bigint)
language sql security definer stable set search_path = public
as $$
  select p.aluno_id, pr.full_name, count(*) as total_presencas
  from presencas p
  join aulas a on a.id = p.aula_id
  join profiles pr on pr.id = p.aluno_id
  where p.presente
    and pr.role in ('aluno', 'aluno_menor')
    and (p_turma_id is null or a.turma_id = p_turma_id)
    and (p_desde is null or a.data >= p_desde)
  group by p.aluno_id, pr.full_name
  order by total_presencas desc;
$$;

revoke execute on function ranking_frequencia(uuid, date) from public;
revoke execute on function ranking_frequencia(uuid, date) from anon;
grant execute on function ranking_frequencia(uuid, date) to authenticated;
