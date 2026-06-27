// ============================================================
// CurralDigital — Configuração do Supabase
// Inclua este arquivo em todas as páginas, antes dos demais scripts
// ============================================================

const SUPABASE_URL = 'https://vwyexfephvlwobxscsbu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3eWV4ZmVwaHZsd29ieHNjc2J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NTUxODUsImV4cCI6MjA5ODEzMTE4NX0.StbFD-g6n_g2utNavcOWiiZDZjQXkGowJOtZftEjE4Y';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ------------------------------------------------------------
// Proteção de página: redireciona para login se não autenticado
// Chame checkAuth() no topo de toda página exceto login.html
// ------------------------------------------------------------
async function checkAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  return session;
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = 'login.html';
}
