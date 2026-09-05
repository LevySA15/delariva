-- Infraestrutura de notificações push automáticas.
--
-- Desenho: toda notificação (automática ou manual) vira uma linha em
-- notificacoes_enviadas com a lista de destinatários. Um único trigger
-- AFTER INSERT nessa tabela chama a edge function send-push (via pg_net),
-- que consulta os push_tokens de cada destinatário e envia pelo FCM. Os
-- gatilhos de cada evento (mensagem nova, aviso no mural, cron de
-- mensalidade/aula) só precisam saber inserir a linha certa — a entrega em
-- si é sempre a mesma.

create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema extensions;

alter table notificacoes_enviadas add column destinatarios uuid[] not null default '{}';

create or replace function notificar_push()
returns trigger
language plpgsql security definer set search_path = public, extensions, vault
as $$
declare
  v_secret text;
begin
  if new.destinatarios is null or array_length(new.destinatarios, 1) is null then
    return new;
  end if;

  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'internal_push_secret';
  if v_secret is null then
    return new; -- segredo ainda não configurado (Firebase pendente) — não bloqueia o insert
  end if;

  perform net.http_post(
    url := 'https://jupyguvoddqiytvvoyuf.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-internal-secret', v_secret),
    body := jsonb_build_object(
      'notificacao_id', new.id,
      'user_ids', to_jsonb(new.destinatarios),
      'titulo', new.titulo,
      'corpo', new.corpo
    )
  );
  return new;
end;
$$;

create trigger notificacoes_enviadas_push
after insert on notificacoes_enviadas
for each row execute function notificar_push();

-- =========================================================
-- Mensagem nova em turma -> notifica matriculados ativos (menos o autor)
-- =========================================================
create or replace function notificar_mensagem_turma()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_nome_turma text;
  v_destinatarios uuid[];
begin
  select nome into v_nome_turma from turmas where id = new.turma_id;

  select array_agg(distinct m.aluno_id) into v_destinatarios
  from matriculas m
  where m.turma_id = new.turma_id and m.ativo = true and m.aluno_id <> new.autor_id;

  if v_destinatarios is not null then
    insert into notificacoes_enviadas (autor_id, tipo, titulo, corpo, destinatarios_count, destinatarios)
    values (new.autor_id, 'mensagem', coalesce(v_nome_turma, 'Turma'), new.mensagem, array_length(v_destinatarios, 1), v_destinatarios);
  end if;

  return new;
end;
$$;

create trigger chat_turma_mensagens_notifica
after insert on chat_turma_mensagens
for each row execute function notificar_mensagem_turma();

-- =========================================================
-- Mensagem direta nova -> notifica o outro participante
-- =========================================================
create or replace function notificar_mensagem_direta()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_destinatario uuid;
  v_nome_autor text;
begin
  select case when c.participante_a = new.autor_id then c.participante_b else c.participante_a end
    into v_destinatario
  from conversas_diretas c
  where c.id = new.conversa_id;

  select full_name into v_nome_autor from profiles where id = new.autor_id;

  if v_destinatario is not null then
    insert into notificacoes_enviadas (autor_id, tipo, titulo, corpo, destinatarios_count, destinatarios)
    values (new.autor_id, 'mensagem', coalesce(v_nome_autor, 'Mensagem'), new.mensagem, 1, array[v_destinatario]);
  end if;

  return new;
end;
$$;

create trigger mensagens_diretas_notifica
after insert on mensagens_diretas
for each row execute function notificar_mensagem_direta();

-- =========================================================
-- Aviso no mural -> notifica todo mundo (menos o autor)
-- =========================================================
create or replace function notificar_mural_aviso()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_destinatarios uuid[];
begin
  select array_agg(id) into v_destinatarios from profiles where id <> new.autor_id;

  if v_destinatarios is not null then
    insert into notificacoes_enviadas (autor_id, tipo, titulo, corpo, destinatarios_count, destinatarios)
    values (new.autor_id, 'mural', new.titulo, new.mensagem, array_length(v_destinatarios, 1), v_destinatarios);
  end if;

  return new;
end;
$$;

create trigger mural_avisos_notifica
after insert on mural_avisos
for each row execute function notificar_mural_aviso();

-- =========================================================
-- Cron diário: mensalidade vencendo (3 dias antes) ou atrasada
-- =========================================================
create or replace function enviar_lembretes_mensalidade()
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_destinatarios uuid[];
begin
  select array_agg(distinct aluno_id) into v_destinatarios
  from mensalidades
  where status <> 'pago' and data_vencimento = current_date + 3;

  if v_destinatarios is not null then
    insert into notificacoes_enviadas (tipo, titulo, corpo, destinatarios_count, destinatarios)
    values ('mensalidade', 'Mensalidade vencendo', 'Sua mensalidade vence em 3 dias.', array_length(v_destinatarios, 1), v_destinatarios);
  end if;

  select array_agg(distinct aluno_id) into v_destinatarios
  from mensalidades
  where status <> 'pago' and data_vencimento = current_date - 1;

  if v_destinatarios is not null then
    insert into notificacoes_enviadas (tipo, titulo, corpo, destinatarios_count, destinatarios)
    values ('mensalidade', 'Mensalidade atrasada', 'Sua mensalidade está atrasada.', array_length(v_destinatarios, 1), v_destinatarios);
  end if;
end;
$$;

select cron.schedule('lembretes-mensalidade-diario', '0 12 * * *', $$select enviar_lembretes_mensalidade()$$);

-- =========================================================
-- Cron a cada 15min: aula começando em ~30min hoje
-- =========================================================
create or replace function enviar_lembretes_aula()
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_turma record;
  v_destinatarios uuid[];
begin
  for v_turma in
    select id, nome
    from turmas
    where ativo = true
      and extract(dow from current_date)::int = any(dias_semana)
      and horario_inicio between (current_time + interval '25 minutes') and (current_time + interval '35 minutes')
  loop
    select array_agg(distinct aluno_id) into v_destinatarios
    from matriculas
    where turma_id = v_turma.id and ativo = true;

    if v_destinatarios is not null then
      insert into notificacoes_enviadas (tipo, titulo, corpo, destinatarios_count, destinatarios)
      values ('aula', v_turma.nome, 'Sua aula começa em 30 minutos.', array_length(v_destinatarios, 1), v_destinatarios);
    end if;
  end loop;
end;
$$;

select cron.schedule('lembretes-aula-15min', '*/15 * * * *', $$select enviar_lembretes_aula()$$);
