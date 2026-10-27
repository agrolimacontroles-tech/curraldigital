// ============================================================
// TopBoi — Sidebar / navegação compartilhada
// ============================================================

(function aplicarTemaSalvo() {
  const temaSalvo = localStorage.getItem('curraldigital-tema') || 'dark';
  document.documentElement.setAttribute('data-theme', temaSalvo);
})();

const MENU_ITEMS = [
  { page: 'painel',     label: 'Painel',     icon: 'ti-layout-dashboard' },
  { page: 'fazendas',   label: 'Fazendas',   icon: 'ti-building-warehouse' },
  { page: 'animais',    label: 'Animais',    img: 'boi-icon.png' },
  { page: 'lotes',      label: 'Lotes',      icon: 'ti-stack-2' },
  { page: 'mangas',     label: 'Mangas',     icon: 'ti-fence' },
  { page: 'compras',    label: 'Compras',    icon: 'ti-shopping-cart' },
  { page: 'vendas',     label: 'Vendas',     icon: 'ti-currency-dollar' },
  { page: 'indicadores', label: 'Indicadores', icon: 'ti-chart-line' },
  { page: 'fluxocaixa', label: 'Fluxo de caixa', icon: 'ti-cash' },
  { page: 'relatorios', label: 'Relatórios', icon: 'ti-chart-bar' },
];

function renderTopbarSidebar(activePage) {
  const itemsHtml = MENU_ITEMS.map(item => `
    <button class="sitem ${item.page === activePage ? 'active' : ''}" title="${item.label}" onclick="location.href='${item.page}.html'">
      ${item.img ? `<img src="${item.img}" class="sitem-icon-img" width="18" height="15">` : `<i class="ti ${item.icon}"></i>`}<span>${item.label}</span>
    </button>
  `).join('');

  const temaAtual = document.documentElement.getAttribute('data-theme') || 'dark';
  const sidebarColapsado = localStorage.getItem('curraldigital-sidebar') === 'collapsed';

  document.body.insertAdjacentHTML('afterbegin', `
    <div class="topbar">
      <button class="menubtn" onclick="toggleSidebar()" title="Minimizar/expandir menu"><i class="ti ti-menu-2"></i></button>
      <img src="logo-agrolima.png" alt="Agrolima" class="brand-logo">
      <div class="brand"><img src="boi-icon.png" class="brand-icon" width="22" height="18"> TopBoi</div>
      <div class="spacer"></div>
      <button class="theme-toggle" id="themeToggleBtn" onclick="alternarTema()" title="Alternar tema claro/escuro">
        <i class="ti ${temaAtual === 'light' ? 'ti-moon' : 'ti-sun'}" id="themeToggleIcon"></i>
      </button>
      <div class="user-info">
        <span id="userEmail"></span>
        <button class="logout-btn" onclick="logout()">Sair</button>
      </div>
    </div>
    <div class="body-layout">
      <div class="sidebar ${sidebarColapsado ? 'collapsed' : ''}" id="sidebar">
        <div class="snav">${itemsHtml}</div>
      </div>
      <div class="main" id="mainContent"></div>
    </div>
  `);
}

function alternarTema() {
  const atual = document.documentElement.getAttribute('data-theme') || 'dark';
  const novo = atual === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', novo);
  localStorage.setItem('curraldigital-tema', novo);
  const icone = document.getElementById('themeToggleIcon');
  if (icone) icone.className = `ti ${novo === 'light' ? 'ti-moon' : 'ti-sun'}`;
}

function toggleSidebar() {
  const colapsado = document.getElementById('sidebar').classList.toggle('collapsed');
  localStorage.setItem('curraldigital-sidebar', colapsado ? 'collapsed' : 'expanded');
}

async function showUserEmail() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    document.getElementById('userEmail').textContent = session.user.email;
  }
}

// ============================================================
// Busca paginada — o Supabase limita cada consulta a 1000 linhas
// por padrão. `criarQuery` deve retornar um builder novo (com os
// filtros/ordenação já aplicados) a cada chamada, sem `.range()`.
// ============================================================
async function buscarPaginado(criarQuery) {
  const LOTE = 1000;
  let pagina = 0, todos = [];
  while (true) {
    const { data, error } = await criarQuery().range(pagina * LOTE, pagina * LOTE + LOTE - 1);
    if (error) throw error;
    todos = todos.concat(data || []);
    if (!data || data.length < LOTE) break;
    pagina++;
  }
  return todos;
}

// ============================================================
// Ficha do animal — clique no brinco: entrada, todas as pesagens
// (ganho, GMD do período e acumulado) e dados de venda/óbito.
// Cria o próprio modal, então funciona em qualquer página.
// ============================================================
async function abrirFichaAnimal(animalId) {
  const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const dataBR = d => d ? new Date(String(d).slice(0, 10) + 'T00:00:00').toLocaleDateString('pt-BR') : '—';
  const kg = v => (v === null || v === undefined || v === '') ? '—' : Number(v).toLocaleString('pt-BR') + ' kg';
  const dec = (v, c) => (v === null || v === undefined || v === '') ? '—' : Number(v).toFixed(c);

  let overlay = document.getElementById('modalFichaAnimal');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modalFichaAnimal';
    overlay.style.display = 'none';
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.style.display = 'none'; });
    document.body.appendChild(overlay);
  }
  overlay.style.display = 'flex';
  overlay.innerHTML = `<div class="modal-box" style="max-width:640px"><div class="modal-head"><span>Carregando...</span><button class="modal-close" onclick="document.getElementById('modalFichaAnimal').style.display='none'">&times;</button></div><div class="modal-body"><span class="spinner"></span></div></div>`;

  const [{ data: r }, { data: a }, { data: pes }] = await Promise.all([
    supabaseClient.from('vw_animais_resumo').select('*').eq('id', animalId).maybeSingle(),
    supabaseClient.from('animais').select('*').eq('id', animalId).maybeSingle(),
    supabaseClient.from('pesagens').select('data_pesagem, peso, gmd_periodo, gmd_acumulado').eq('animal_id', animalId).order('data_pesagem', { ascending: true }),
  ]);
  if (!a) {
    overlay.querySelector('.modal-body').innerHTML = 'Animal não encontrado.';
    return;
  }

  // linha do tempo: entrada + pesagens (se houver pesagem na data da entrada, ela substitui a linha de entrada)
  const lista = pes || [];
  const dataEntrada = String(a.data_entrada).slice(0, 10);
  const pesagemNaEntrada = lista.some(p => String(p.data_pesagem).slice(0, 10) === dataEntrada);
  const linhas = [];
  if (!pesagemNaEntrada) linhas.push({ data: dataEntrada, peso: Number(a.peso_entrada), rotulo: 'Entrada' });
  lista.forEach(p => linhas.push({
    data: String(p.data_pesagem).slice(0, 10), peso: Number(p.peso),
    rotulo: String(p.data_pesagem).slice(0, 10) === dataEntrada ? 'Entrada' : 'Pesagem',
    gmdP: p.gmd_periodo, gmdA: p.gmd_acumulado,
  }));

  // ordena por data (a entrada cadastrada pode ter data posterior às pesagens)
  linhas.sort((x, y) => x.data.localeCompare(y.data));
  const primeiraPesagem = lista.length ? String(lista[0].data_pesagem).slice(0, 10) : null;
  const entradaPosterior = !pesagemNaEntrada && primeiraPesagem && dataEntrada > primeiraPesagem;
  linhas.forEach(l => { if (l.rotulo === 'Entrada' && entradaPosterior) l.rotulo = 'Entrada (cadastrada)'; });

  let anterior = null;
  const corpo = linhas.map(l => {
    const dias = anterior ? Math.round((new Date(l.data) - new Date(anterior.data)) / 86400000) : null;
    const ganho = anterior ? l.peso - anterior.peso : null;
    anterior = l;
    const corGanho = ganho === null ? '' : (ganho < 0 ? 'color:var(--danger)' : 'color:var(--success)');
    return `<tr>
      <td>${dataBR(l.data)}</td><td>${esc(l.rotulo)}</td><td><b style="color:var(--text)">${kg(l.peso)}</b></td>
      <td style="${corGanho}">${ganho === null ? '—' : (ganho > 0 ? '+' : '') + ganho.toLocaleString('pt-BR') + ' kg'}</td>
      <td>${dias === null ? '—' : dias + ' d'}</td>
      <td>${dec(l.gmdP, 2)}</td><td>${dec(l.gmdA, 2)}</td></tr>`;
  }).join('');

  const baseResumo = entradaPosterior ? linhas.filter(l => l.rotulo !== 'Entrada (cadastrada)') : linhas;
  const primeiro = baseResumo[0], ultimo = baseResumo[baseResumo.length - 1];
  const totalGanho = ultimo.peso - primeiro.peso;
  const totalDias = Math.round((new Date(ultimo.data) - new Date(primeiro.data)) / 86400000);
  const gmdGeral = totalDias > 0 ? (totalGanho / totalDias).toFixed(2) : '—';

  const local = r ? [r.fazenda_nome, r.lote_nome, r.manga_numero ? 'Manga ' + r.manga_numero : null].filter(Boolean).join(' / ') : '';
  const statusTxt = { ativo: 'Ativo', vendido: 'Vendido', morto: 'Morto' }[a.status] || a.status;
  const extras = [];
  if (a.status === 'vendido') extras.push(`Vendido em ${dataBR(a.data_venda)} para ${esc(a.comprador || '—')} — saída ${kg(a.peso_saida)}${a.preco_venda ? ', R$ ' + Number(a.preco_venda).toLocaleString('pt-BR') : ''}`);
  if (a.status === 'morto') extras.push(`Óbito em ${dataBR(a.data_morte)}${a.causa_morte ? ' — ' + esc(a.causa_morte) : ''}`);
  if (a.produtor_origem) extras.push('Produtor de origem: ' + esc(a.produtor_origem));
  if (a.observacoes) extras.push('Obs.: ' + esc(a.observacoes));

  overlay.innerHTML = `
    <div class="modal-box" style="max-width:640px">
      <div class="modal-head"><span>Animal #${esc(a.brinco)} — ${esc(statusTxt)}</span>
        <button class="modal-close" onclick="document.getElementById('modalFichaAnimal').style.display='none'">&times;</button></div>
      <div class="modal-body">
        <div style="font-size:12px;color:var(--text-soft);line-height:1.6;margin-bottom:10px">
          ${esc([a.sexo, a.categoria, a.raca].filter(Boolean).join(' · ') || 'Sem sexo/categoria informados')}<br>
          ${esc(local || 'Sem localização')}<br>
          ${extras.join('<br>')}
        </div>
        ${entradaPosterior ? `<div style="font-size:12px;margin-bottom:8px;color:var(--warning, #e0a030)">&#9888; A data de entrada cadastrada (${dataBR(dataEntrada)}) é posterior à primeira pesagem (${dataBR(primeiraPesagem)}). Confira a data de entrada do animal.</div>` : ''}
        <div style="font-size:13px;margin-bottom:8px;color:var(--text)"><b>${linhas.length}</b> registro${linhas.length === 1 ? '' : 's'} de peso —
          ${totalDias > 0 ? `ganho de <b>${totalGanho.toLocaleString('pt-BR')} kg</b> em <b>${totalDias} dias</b> (GMD geral <b>${gmdGeral} kg/d</b>)` : 'só um registro até agora'}</div>
        <div class="table-wrap">
          <table class="mini-table">
            <thead><tr><th>Data</th><th>Tipo</th><th>Peso</th><th>Ganho</th><th>Dias</th><th>GMD período</th><th>GMD acum.</th></tr></thead>
            <tbody>${corpo}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-foot"><button class="btn btn-secondary" onclick="document.getElementById('modalFichaAnimal').style.display='none'">Fechar</button></div>
    </div>`;
}

// ============================================================
// Confinamento: botão "Incluir / Não incluir / Só confinamento"
// Fazendas marcadas como confinamento (fazendas.confinamento = true)
// entram ou saem da evolução e dos relatórios conforme a escolha.
// ============================================================
const CONFINAMENTO_KEY = 'curraldigital-confinamento';
let FAZENDAS_CONFINAMENTO = new Set();

function modoConfinamento() {
  try { return localStorage.getItem(CONFINAMENTO_KEY) || 'incluir'; } catch (e) { return 'incluir'; }
}
function salvarModoConfinamento(valor) {
  try { localStorage.setItem(CONFINAMENTO_KEY, valor); } catch (e) { /* ignora */ }
}
function passaFiltroConfinamento(fazendaId, modo) {
  const ehConf = FAZENDAS_CONFINAMENTO.has(fazendaId);
  if (modo === 'so') return ehConf;
  if (modo === 'excluir') return !ehConf;
  return true;
}
function selectConfinamentoHtml(id, onchange) {
  const m = modoConfinamento();
  return `<select id="${id}" title="Controla se os animais do confinamento (Buriti Confinamento) entram na evolução e nos números" onchange="salvarModoConfinamento(this.value); ${onchange}">
    <option value="incluir" ${m === 'incluir' ? 'selected' : ''}>Confinamento: incluir</option>
    <option value="excluir" ${m === 'excluir' ? 'selected' : ''}>Confinamento: não incluir</option>
    <option value="so" ${m === 'so' ? 'selected' : ''}>Só confinamento</option>
  </select>`;
}
