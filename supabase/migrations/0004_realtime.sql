-- Habilita Realtime (INSERTs em tempo real) para o chat e o mural
alter publication supabase_realtime add table chat_turma_mensagens;
alter publication supabase_realtime add table mural_avisos;
