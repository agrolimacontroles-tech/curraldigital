-- ============================================================
-- TopBoi — Código sequencial de compra
-- Rodar UMA VEZ no SQL Editor do Supabase do Curral Digital.
-- Objetivo: cada compra passa a ter um número sequencial (1, 2, 3...)
-- gerado pelo banco, pra vincular animais a compras sem depender de
-- digitar nome de vendedor (planilha de importação e formulário manual).
-- ============================================================

-- 1) coluna nova
alter table compras add column if not exists codigo integer;

-- 2) numera as compras que já existem (mais antiga = menor código)
with numeradas as (
  select id, row_number() over (order by data_compra, id) as rn
  from compras
)
update compras c
set codigo = n.rn
from numeradas n
where c.id = n.id;

-- 3) sequence pra gerar o código das próximas compras automaticamente
create sequence if not exists compras_codigo_seq;
select setval('compras_codigo_seq', coalesce((select max(codigo) from compras), 0) + 1, false);

alter table compras alter column codigo set default nextval('compras_codigo_seq');
alter table compras alter column codigo set not null;
alter table compras add constraint compras_codigo_key unique (codigo);
alter sequence compras_codigo_seq owned by compras.codigo;

-- Conferir o resultado:
-- select codigo, data_compra, vendedor from compras order by codigo;
