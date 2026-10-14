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
    
    const perfil = tipo === 'admin' && typeof Storage !== 'undefined'
      ? Storage.getPerfilAcesso()
      : tipo;
    const linksMedico = [
      { tab: 'dashboard', texto: 'Início' },
      { tab: 'medicos', texto: 'Minha agenda' },
      { tab: 'agendar', texto: 'Consultas' },
      { tab: 'historico', texto: 'Histórico' },
      { tab: 'configuracoes', texto: 'Meu perfil' },
      { tab: 'ajuda', texto: 'Ajuda' },
      { tab: 'chatbot', texto: 'Assistente' }
    ];
    const links = perfil === 'medico'
      ? linksMedico
      : tipo === 'admin' ? linksAdmin : linksPaciente;
    
    return `
      <header class="header" aria-label="Navegação principal">
        <div class="logo">
          <img src="assets/images/logo.png" alt="CallMed Logo">
          <span>CallMed</span>
        </div>
        ${tipo === 'paciente' || tipo === 'admin' ? `
          <button class="${tipo}-menu-toggle" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="${tipo}-nav">
            <span></span><span></span><span></span>
          </button>
        ` : ''}
        <nav class="nav" aria-label="Menu principal" ${tipo === 'paciente' || tipo === 'admin' ? `id="${tipo}-nav"` : ''}>
          <ul>
            ${links.map(l => `
              <li>
                <a href="#${l.tab}" 
                   data-tab-link="${l.tab}"
                   aria-label="Abrir seção ${l.texto}"
                   aria-current="page">
                  ${l.texto}
                </a>
              </li>
            `).join('')}
            <li><a href="#" id="logoutBtn" aria-label="Encerrar sessão">Sair</a></li>
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
      if (tipo === 'admin' && typeof Storage !== 'undefined') {
        document.body.dataset.perfil = Storage.getPerfilAcesso();
      }
      headerEl.innerHTML = this.header(tipo);
      this.configurarLinksTabs();
      this.configurarLogout();
      this.configurarMenuPaciente();
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
        this.fecharMenuPaciente();
      });
    });
  },

  configurarMenuPaciente() {
    const toggle = document.querySelector('.patient-menu-toggle, .admin-menu-toggle');
    const nav = document.getElementById('patient-nav') || document.getElementById('admin-nav');
    if (!toggle || !nav || toggle.hasAttribute('data-listener')) return;

    toggle.setAttribute('data-listener', 'true');
    toggle.addEventListener('click', () => {
      const aberto = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(aberto));
      toggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
      nav.classList.toggle('is-open', aberto);
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        this.fecharMenuPaciente();
        toggle.focus();
      }
    });
  },

  fecharMenuPaciente() {
    const toggle = document.querySelector('.patient-menu-toggle, .admin-menu-toggle');
    const nav = document.getElementById('patient-nav') || document.getElementById('admin-nav');
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
    nav.classList.remove('is-open');
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
      const isActive = link.dataset.tabLink === tab;
      link.classList.toggle('active', isActive);
      link.setAttribute('aria-current', isActive ? 'page' : 'false');
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
      this.configurarMenuPaciente();
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