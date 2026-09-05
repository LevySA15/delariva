-- Check-in via QR code: o aluno escaneia o QR da turma e confirma a própria
-- presença, sem precisar que um professor abra a chamada manualmente.
-- SECURITY DEFINER porque presencas/aulas normalmente só aceitam escrita de
-- dono/professor — aqui a função valida a matrícula ativa e só deixa o
-- aluno marcar a própria presença, na aula de hoje.

create or replace function checkin_qr(p_turma_id uuid)
returns table (aula_id uuid, ja_estava_presente boolean)
language plpgsql security definer set search_path = public
as $$
declare
  v_aluno_id uuid := auth.uid();
  v_aula_id uuid;
  v_ja_presente boolean;
begin
  if v_aluno_id is null then
    raise exception 'not_authenticated';
  end if;

  if not exists (
    select 1 from matriculas
    where turma_id = p_turma_id and aluno_id = v_aluno_id and ativo = true
  ) then
    raise exception 'nao_matriculado';
  end if;

  insert into aulas (turma_id, data)
  values (p_turma_id, current_date)
  on conflict (turma_id, data) do nothing;

  select id into v_aula_id from aulas where turma_id = p_turma_id and data = current_date;

  select presente into v_ja_presente from presencas where presencas.aula_id = v_aula_id and presencas.aluno_id = v_aluno_id;

  insert into presencas (aula_id, aluno_id, presente, registrado_por)
  values (v_aula_id, v_aluno_id, true, v_aluno_id)
  on conflict (aula_id, aluno_id) do update set presente = true;

  return query select v_aula_id, coalesce(v_ja_presente, false);
end;
$$;

revoke execute on function checkin_qr(uuid) from public;
revoke execute on function checkin_qr(uuid) from anon;
grant execute on function checkin_qr(uuid) to authenticated;
