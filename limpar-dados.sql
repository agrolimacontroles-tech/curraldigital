-- Rodar no SQL Editor do Supabase do Curral Digital.
-- APAGA TUDO das tabelas abaixo (irreversível). Login/usuários não são afetados
-- (o sistema usa só o Auth do Supabase, sem tabela própria de usuário).

truncate table
  pesagens,
  vendas_parcelas,
  vendas,
  animais,
  compras,
  lotes,
  mangas,
  fazendas
restart identity cascade;
