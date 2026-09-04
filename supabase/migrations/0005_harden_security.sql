-- Hardening apontado pelo Security Advisor do Supabase depois do deploy inicial:
-- 1) search_path mutável em set_updated_at (não é SECURITY DEFINER, mas é boa prática).
-- 2) As funções auxiliares de RLS (SECURITY DEFINER, necessárias pra evitar recursão
--    nas policies) ficavam expostas via /rest/v1/rpc/ para qualquer usuário, inclusive
--    anônimo. Elas só devem ser chamadas pelo Postgres durante a avaliação das
--    policies — nunca diretamente pela API.

create or replace function set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Postgres concede EXECUTE a PUBLIC automaticamente na criação da função, e o
-- Supabase também concede a anon/authenticated diretamente — por isso é preciso
-- revogar dos dois (PUBLIC e do papel específico) para bloquear de verdade.
revoke execute on function get_my_role() from public;
revoke execute on function is_dono() from public;
revoke execute on function is_responsavel_de(uuid) from public;
revoke execute on function leciona_turma(uuid) from public;
revoke execute on function matriculado_turma(uuid) from public;
revoke execute on function leciona_aluno(uuid) from public;
revoke execute on function responsavel_na_turma(uuid) from public;

revoke execute on function get_my_role() from anon;
revoke execute on function is_dono() from anon;
revoke execute on function is_responsavel_de(uuid) from anon;
revoke execute on function leciona_turma(uuid) from anon;
revoke execute on function matriculado_turma(uuid) from anon;
revoke execute on function leciona_aluno(uuid) from anon;
revoke execute on function responsavel_na_turma(uuid) from anon;

-- authenticated precisa continuar podendo chamá-las: são usadas dentro das
-- policies de RLS, que rodam com o papel de quem está logado.
grant execute on function get_my_role() to authenticated;
grant execute on function is_dono() to authenticated;
grant execute on function is_responsavel_de(uuid) to authenticated;
grant execute on function leciona_turma(uuid) to authenticated;
grant execute on function matriculado_turma(uuid) to authenticated;
grant execute on function leciona_aluno(uuid) to authenticated;
grant execute on function responsavel_na_turma(uuid) to authenticated;

-- handle_new_user só deve rodar como trigger de auth.users (após um signUp),
-- nunca chamada diretamente via API.
revoke execute on function handle_new_user() from public;
revoke execute on function handle_new_user() from anon;
revoke execute on function handle_new_user() from authenticated;
