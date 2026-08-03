-- Rodar no SQL Editor do Supabase do Curral Digital.
-- Verifica duplicados (mesmo com constraint no banco, é bom conferir).

-- 1) Brincos duplicados em animais (deveria vir vazio — brinco é único)
select brinco, count(*) as qtd
from animais
group by brinco
having count(*) > 1
order by qtd desc;

-- 2) Pesagens duplicadas (mesmo animal + mesma data — deveria vir vazio)
select animal_id, data_pesagem, count(*) as qtd
from pesagens
group by animal_id, data_pesagem
having count(*) > 1
order by qtd desc;

-- 3) Totais gerais, pra conferir com o esperado (1090 animais, ~3989 pesagens)
select
  (select count(*) from animais) as total_animais,
  (select count(*) from pesagens) as total_pesagens,
  (select count(*) from animais where fazenda_id = (select id from fazendas where nome = 'Canaã')) as total_canaa,
  (select count(*) from animais where fazenda_id = (select id from fazendas where nome = 'Cipó')) as total_cipo;
