-- Índices pras foreign keys que o advisor de performance apontou sem
-- cobertura — a maioria são colunas usadas nas próprias políticas de RLS
-- (professor_id, aluno_id, autor_id), então isso ajuda tanto consultas
-- normais quanto os EXISTS/JOIN das políticas.

create index if not exists aulas_professor_id_idx on aulas (professor_id);
create index if not exists avaliacoes_graduacao_id_idx on avaliacoes (graduacao_id);
create index if not exists avaliacoes_professor_id_idx on avaliacoes (professor_id);
create index if not exists chat_turma_mensagens_autor_id_idx on chat_turma_mensagens (autor_id);
create index if not exists graduacoes_professor_id_idx on graduacoes (professor_id);
create index if not exists lista_espera_aluno_id_idx on lista_espera (aluno_id);
create index if not exists mensagens_diretas_autor_id_idx on mensagens_diretas (autor_id);
create index if not exists mensalidades_plano_id_idx on mensalidades (plano_id);
create index if not exists mural_avisos_autor_id_idx on mural_avisos (autor_id);
create index if not exists notificacoes_enviadas_autor_id_idx on notificacoes_enviadas (autor_id);
create index if not exists presencas_registrado_por_idx on presencas (registrado_por);
create index if not exists turma_professores_professor_id_idx on turma_professores (professor_id);
