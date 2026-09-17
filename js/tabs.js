/* ===========================================================
   CallMed - tabs.js
   Gerencia navegação entre abas sem recarregar a página
   =========================================================== */

const Tabs = {
  currentTab: 'dashboard',
  tabsDisponiveis: [],
  
  // ============================================
  // INICIALIZAÇÃO
  // ============================================
  init() {
    console.log('Inicializando sistema de tabs...');
    
    // ✅ Detecta tabs pelos .tab-content (não depende de .tab-btn)
    this.tabsDisponiveis = Array.from(document.querySelectorAll('.tab-content'))
      .map(el => el.id.replace('tab-', ''))
      .filter(Boolean);
    
    console.log(`Tabs disponíveis: ${this.tabsDisponiveis.join(', ')}`);
    
    // Restaurar última aba ou usar hash da URL
    const savedTab = localStorage.getItem('CallMed_currentTab');
    const hashTab = window.location.hash.replace('#', '');
    
    let tabInicial = this.tabsDisponiveis[0] || 'dashboard';
    if (hashTab && this.tabsDisponiveis.includes(hashTab)) {
      tabInicial = hashTab;
    } else if (savedTab && this.tabsDisponiveis.includes(savedTab)) {
      tabInicial = savedTab;
    }
    
    // Ativar aba inicial
    this.ativarTab(tabInicial, false);
    
    // Escutar mudanças no hash (back/forward)
    window.addEventListener('hashchange', () => {
      const newTab = window.location.hash.replace('#', '');
      if (newTab && newTab !== this.currentTab && this.tabsDisponiveis.includes(newTab)) {
        this.ativarTab(newTab, false);
      }
    });
    
    console.log('Sistema de tabs pronto. Aba atual:', this.currentTab);
  },
  
  // ============================================
  // ATIVAR TAB
  // ============================================
  ativarTab(tabName, updateHash = true) {
    console.log(`Ativando tab: ${tabName}`);
    
    // Validação
    const tabContent = document.getElementById(`tab-${tabName}`);
    if (!tabContent) {
      console.error(`Tab não encontrada: tab-${tabName}`);
      return;
    }
    
    // Desativar todas as tabs (conteúdo)
    document.querySelectorAll('.tab-content').forEach(el => {
      el.classList.remove('active');
    });
    
    // Desativar todos os botões (se existirem)
    document.querySelectorAll('.tab-btn').forEach(el => {
      el.classList.remove('active');
    });
    
    // Desativar todos os links do header
    document.querySelectorAll('[data-tab-link]').forEach(link => {
      link.classList.remove('active');
    });
    
    // Ativar a tab selecionada
    tabContent.classList.add('active');
    
    // Ativar botão (se existir)
    const btn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    if (btn) {
      btn.classList.add('active');
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    
    // Ativar link no header
    const headerLink = document.querySelector(`[data-tab-link="${tabName}"]`);
    if (headerLink) {
      headerLink.classList.add('active');
    }
    
    // Atualizar hash
    if (updateHash) {
      history.pushState(null, '', `#${tabName}`);
    }
    
    // Salvar preferência
    localStorage.setItem('CallMed_currentTab', tabName);
    
    // Atualizar estado
    this.currentTab = tabName;
    
    // Inicializar módulo da tab
    this.inicializarModuloTab(tabName);
    
    // Notificar componentes
    document.dispatchEvent(new CustomEvent('tabChanged', { 
      detail: { tab: tabName } 
    }));
    
    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
  
  // ============================================
  // INICIALIZAR MÓDULO DA TAB
  // ============================================
  inicializarModuloTab(tabName) {
    console.log(`Inicializando módulo: ${tabName}`);
    
    setTimeout(() => {
      switch (tabName) {
        case 'dashboard':
          if (typeof carregarDashboard === 'function') carregarDashboard();
          break;
          
        case 'pacientes':
          if (typeof Paciente !== 'undefined' && Paciente.renderTable) {
            Paciente.renderTable();
          }
          break;
          
        case 'medicos':
          if (typeof Medico !== 'undefined') {
            if (Medico.carregarEspecialidadesNoSelect) Medico.carregarEspecialidadesNoSelect();
            if (Medico.carregarClinicasNoSelect) Medico.carregarClinicasNoSelect();
            if (Medico.carregarClinicasNoFiltro) Medico.carregarClinicasNoFiltro();
            if (Medico.renderTable) Medico.renderTable();
          }
          if (typeof carregarMedicosPaciente === 'function') carregarMedicosPaciente();
          break;
          
        case 'clinicas':
          if (typeof Clinica !== 'undefined' && Clinica.renderTable) {
            Clinica.renderTable();
          }
          break;
          
        case 'especialidades':
          if (typeof Especialidade !== 'undefined' && Especialidade.renderTable) {
            Especialidade.renderTable();
          }
          break;
          
        case 'agendar':
          if (typeof Agendamento !== 'undefined') {
            if (Agendamento.carregarSelects) Agendamento.carregarSelects();
            if (Agendamento.renderTable) Agendamento.renderTable();
          }
          break;
          
        case 'historico':
          if (typeof renderHistorico === 'function') {
            renderHistorico();
          }
          break;
          
        case 'consultas':
          if (typeof carregarConsultasPaciente === 'function') {
            carregarConsultasPaciente();
          }
          break;
          
        case 'perfil':
          // Já foi carregado na inicialização
          break;
          
        case 'configuracoes':
          if (typeof configurarTema === 'function') {
            configurarTema();
          }
          break;
          
        case 'chatbot':
          // Chatbot se auto-inicializa
          break;
          
        default:
          console.log(`Nenhum módulo específico para: ${tabName}`);
      }
    }, 50);
  },
  
  // ============================================
  // NAVEGAÇÃO PROGRAMÁTICA
  // ============================================
  irPara(tabName) {
    if (!this.tabsDisponiveis.includes(tabName)) {
      console.warn(`Tab "${tabName}" não disponível nesta página`);
      return;
    }
    this.ativarTab(tabName, true);
  },
  
  // ============================================
  // UTILITÁRIOS
  // ============================================
  getCurrentTab() {
    return this.currentTab;
  },
  
  isActive(tabName) {
    return this.currentTab === tabName;
  }
};

// ============================================
// AUTO-INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Aguarda o components.js injetar o header primeiro
  setTimeout(() => {
    if (document.querySelector('.tab-content')) {
      Tabs.init();
    }
  }, 100);
});

// Torna global
window.Tabs = Tabs;