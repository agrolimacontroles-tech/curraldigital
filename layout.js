// ============================================================
// CurralDigital — Sidebar / navegação compartilhada
// ============================================================

const MENU_ITEMS = [
  { page: 'painel',     label: 'Painel',     icon: 'ti-layout-dashboard' },
  { page: 'fazendas',   label: 'Fazendas',   icon: 'ti-building-warehouse' },
  { page: 'animais',    label: 'Animais',    icon: 'ti-cow' },
  { page: 'lotes',      label: 'Lotes',      icon: 'ti-stack-2' },
  { page: 'mangas',     label: 'Mangas',     icon: 'ti-fence' },
  { page: 'compras',    label: 'Compras',    icon: 'ti-shopping-cart' },
  { page: 'vendas',     label: 'Vendas',     icon: 'ti-currency-dollar' },
  { page: 'relatorios', label: 'Relatórios', icon: 'ti-chart-bar' },
];

function renderTopbarSidebar(activePage) {
  const itemsHtml = MENU_ITEMS.map(item => `
    <button class="sitem ${item.page === activePage ? 'active' : ''}" onclick="location.href='${item.page}.html'">
      <i class="ti ${item.icon}"></i><span>${item.label}</span>
    </button>
  `).join('');

  document.body.insertAdjacentHTML('afterbegin', `
    <div class="topbar">
      <button class="menubtn" onclick="toggleSidebar()"><i class="ti ti-menu-2"></i></button>
      <div class="brand"><i class="ti ti-cow"></i> CurralDigital</div>
      <div class="spacer"></div>
      <div class="user-info">
        <span id="userEmail"></span>
        <button class="logout-btn" onclick="logout()">Sair</button>
      </div>
    </div>
    <div class="body-layout">
      <div class="sidebar" id="sidebar">
        <div class="snav">${itemsHtml}</div>
      </div>
      <div class="main" id="mainContent"></div>
    </div>
  `);
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
}

async function showUserEmail() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    document.getElementById('userEmail').textContent = session.user.email;
  }
}
