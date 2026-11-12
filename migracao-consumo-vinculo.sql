-- Consumo de sal/ração: vínculo opcional com a fazenda e a manga cadastradas.
-- Os registros antigos (importados da planilha) continuam só com o nome em texto.
alter table sal_consumo
  add column if not exists fazenda_id uuid references fazendas(id) on delete set null,
  add column if not exists manga_id uuid references mangas(id) on delete set null;
create index if not exists sal_consumo_manga_id_idx on sal_consumo (manga_id);
create index if not exists sal_consumo_data_idx on sal_consumo (data);
