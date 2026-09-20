-- Perfil "estilo rede social" (sem posts): bio, capa, contato extra e data
-- de entrada na academia (usada na linha do tempo de marcos). Nenhuma
-- mudança de RLS é necessária — profiles_select/update já são row-level e
-- cobrem qualquer coluna nova automaticamente.

alter table profiles
  add column bio text,
  add column cover_url text,
  add column instagram text,
  add column cidade text,
  add column data_entrada date;

comment on column profiles.bio is 'Texto livre "sobre mim", exibido no perfil.';
comment on column profiles.cover_url is 'Imagem de capa/banner do perfil (mesmo bucket "avatars", pasta do usuário).';
comment on column profiles.instagram is '@ do Instagram, sem o @.';
comment on column profiles.data_entrada is 'Data em que a pessoa começou na academia, usada na linha do tempo do perfil. Cai de volta pra created_at quando nula.';
