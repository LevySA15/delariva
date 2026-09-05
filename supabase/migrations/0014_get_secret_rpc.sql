-- RPC restrita a service_role pra ler um segredo do Vault via PostgREST —
-- usada pela edge function send-push (que só tem acesso HTTP ao banco, não
-- uma conexão direta em SQL) pra pegar as credenciais do Firebase e o
-- segredo interno de autenticação.

create or replace function get_secret(secret_name text)
returns text
language sql security definer stable set search_path = public, vault
as $$
  select decrypted_secret from vault.decrypted_secrets where name = secret_name limit 1;
$$;

revoke execute on function get_secret(text) from public;
revoke execute on function get_secret(text) from anon;
revoke execute on function get_secret(text) from authenticated;
grant execute on function get_secret(text) to service_role;
