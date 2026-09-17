/* ===========================================================
components.js   Injeta header e footer em todas as páginas
   =========================================================== */

const Components = {
  // ============================================
  // HEADER - Sem emojis
  // ============================================
  header(tipo = 'admin') {
    // ==========================================
    // LINKS DO ADMIN (Clínica/Médico/Secretário)
    // ==========================================
    const linksAdmin = [
      { tab: 'dashboard', texto: 'Dashboard' },
      { tab: 'pacientes', texto: 'Pacientes' },
      { tab: 'medicos', texto: 'Médicos' },
      { tab: 'clinicas', texto: 'Clínicas' },
      { tab: 'especialidades', texto: 'Especialidades' },
      { tab: 'agendar', texto: 'Agendar' },
      { tab: 'historico', texto: 'Histórico' },
      { tab: 'configuracoes', texto: 'Configurações' },
      { tab: 'ajuda', texto: 'Ajuda' },
      { tab: 'chatbot', texto: 'Chatbot' }
    ];
    
    // ==========================================
    // LINKS DO PACIENTE (Só o que ele pode ver)
    // ==========================================
    const linksPaciente = [
      { tab: 'dashboard', texto: 'Início' },
      { tab: 'consultas', texto: 'Minhas Consultas' },
      { tab: 'medicos', texto: 'Médicos' },
      { tab: 'agendar', texto: 'Agendar' },
      { tab: 'chatbot', texto: 'Assistente' },
      { tab: 'perfil', texto: 'Meu Perfil' },
      { tab: 'configuracoes', texto: 'Configurações' },
      { tab: 'ajuda', texto: 'Ajuda' }
    ];
    
    const links = tipo === 'admin' ? linksAdmin : linksPaciente;
    
    return `
      <header class="header">
        <div class="logo">
          <img src="assets/images/logo.png" alt="CallMed Logo">
          <span>CallMed</span>
        </div>
        <nav class="nav">
          <ul>
            ${links.map(l => `
              <li>
                <a href="#${l.tab}" 
                   data-tab-link="${l.tab}">
                  ${l.texto}
                </a>
              </li>
            `).join('')}
            <li><a href="#" id="logoutBtn">Sair</a></li>
          </ul>
        </nav>
      </header>
    `;
  },
  
  // ============================================
  // FOOTER
  // ============================================
  footer() {
    return `
      <footer class="footer">
        <div class="footer-content">
          <span class="footer-creator">Criado por Iury Gabriel Barreto</span>
          <span class="footer-version">v1.0</span>
        </div>
      </footer>
    `;
  },
  
  // ============================================
  // INICIALIZAÇÃO
  // ============================================
  init(tipo = 'admin') {
    // Injeta header
    const headerEl = document.getElementById('header-placeholder');
    if (headerEl) {
      headerEl.innerHTML = this.header(tipo);
      this.configurarLinksTabs();
      this.configurarLogout();
    }
    
    // Injeta footer
    const footerEl = document.getElementById('footer-placeholder');
    if (footerEl) {
      footerEl.innerHTML = this.footer();
    }
    
    // Escuta mudanças de tab para atualizar o header
    document.addEventListener('tabChanged', (e) => {
      this.atualizarLinksAtivos(e.detail.tab);
    });
  },
  
  // ============================================
  // CONFIGURAR CLIQUES NOS LINKS DAS TABS
  // ============================================
  configurarLinksTabs() {
    document.querySelectorAll('[data-tab-link]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = link.dataset.tabLink;
        
        if (typeof Tabs !== 'undefined' && Tabs.irPara) {
          Tabs.irPara(tab);
        } else {
          console.warn('Sistema de Tabs não carregado');
        }
      });
    });
  },
  
  configurarLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn && !logoutBtn.hasAttribute('data-listener')) {
      logoutBtn.setAttribute('data-listener', 'true');
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof Storage !== 'undefined') {
          Storage.logout();
        } else {
          localStorage.removeItem('usuarioLogado');
        }
        window.location.href = 'login.html';
      });
    }
  },
  
  atualizarLinksAtivos(tab) {
    document.querySelectorAll('[data-tab-link]').forEach(link => {
      if (link.dataset.tabLink === tab) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  },
  
  // ============================================
  // ATUALIZAR HEADER (quando muda de tipo)
  // ============================================
  atualizarHeader(tipo) {
    const headerEl = document.getElementById('header-placeholder');
    if (headerEl) {
      headerEl.innerHTML = this.header(tipo);
      this.configurarLinksTabs();
      this.configurarLogout();
    }
  }
};

// ============================================
// AUTO-INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const tipo = document.body.dataset.tipo || 'admin';
  Components.init(tipo);
});

// Torna global
window.Components = Components;