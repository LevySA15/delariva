-- Bucket público de avatares — as fotos em si não são sigilosas,
-- só a escrita é restrita a cada usuário editar a própria foto.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Convenção de path: <user_id>/<arquivo>, então usamos o primeiro
-- segmento do path pra checar que é o dono do arquivo.
create policy avatars_public_read on storage.objects for select
  using (bucket_id = 'avatars');

create policy avatars_owner_insert on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy avatars_owner_update on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy avatars_owner_delete on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
