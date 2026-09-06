-- Deixa o próprio aluno/responsável avisar que pagou uma mensalidade
-- pendente, sem afrouxar a política geral de notificacoes_enviadas (que
-- continua só-dono pra insert direto). A função confere que quem chama é
-- dono da mensalidade (ou responsável do aluno) antes de notificar.

create or replace function avisar_pagamento(p_mensalidade_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_aluno_id uuid;
  v_nome text;
  v_destinatarios uuid[];
begin
  select aluno_id into v_aluno_id from mensalidades where id = p_mensalidade_id;
  if v_aluno_id is null then
    return;
  end if;

  if not (v_aluno_id = auth.uid() or is_responsavel_de(v_aluno_id)) then
    raise exception 'nao_autorizado';
  end if;

  select full_name into v_nome from profiles where id = v_aluno_id;
  select array_agg(id) into v_destinatarios from profiles where role = 'dono';

  if v_destinatarios is not null then
    insert into notificacoes_enviadas (autor_id, tipo, titulo, corpo, destinatarios_count, destinatarios)
    values (
      auth.uid(),
      'mensalidade',
      'Aviso de pagamento',
      coalesce(v_nome, 'Um aluno') || ' avisou que pagou uma mensalidade. Confira e marque como pago.',
      array_length(v_destinatarios, 1),
      v_destinatarios
    );
  end if;
end;
$$;

revoke execute on function avisar_pagamento(uuid) from public;
revoke execute on function avisar_pagamento(uuid) from anon;
grant execute on function avisar_pagamento(uuid) to authenticated;
