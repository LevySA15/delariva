-- Corrige bug real: a política de profiles_select não deixava um aluno ler
-- o próprio perfil do dono/professor com quem ele tem uma conversa direta
-- (só cobria dono/professor enxergando aluno, nunca o contrário). Isso
-- quebrava tanto a lista de conversas quanto a página da conversa: o join
-- embutido com profiles vinha nulo pra "outro" participante e a página
-- caía em notFound().

create or replace function tem_conversa_com(other_id uuid)
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from conversas_diretas c
    where (c.participante_a = auth.uid() and c.participante_b = other_id)
       or (c.participante_b = auth.uid() and c.participante_a = other_id)
  );
$$;

revoke execute on function tem_conversa_com(uuid) from public;
revoke execute on function tem_conversa_com(uuid) from anon;
grant execute on function tem_conversa_com(uuid) to authenticated;

drop policy profiles_select on profiles;
create policy profiles_select on profiles for select
  using (
    id = auth.uid()
    or is_dono()
    or is_responsavel_de(id)
    or leciona_aluno(id)
    or tem_conversa_com(id)
  );
