/* ===========================================================
   CallMed - features.js
   Backup + Charts + PWA + Tutorial
   =========================================================== */

/* ===========================================================
   PARTE 1: BACKUP
   =========================================================== */

const Backup = {
  // Exportar todos os dados
  export: () => {
    console.log('📦 Iniciando exportação de backup...');
    
    const data = {
      // Dados principais
      pacientes: Storage.getPacientes(),
      medicos: Storage.getMedicos(),
      agendamentos: Storage.getAgendamentos(),
      clinicas: Storage.getClinicas(),
      usuarios: Storage.getUsuarios(),
      
      // Fotos de perfil
      fotos: JSON.parse(localStorage.getItem('CallMed_user_photos') || '{}'),
      
      // Configurações
      config: Storage.getConfiguracoes(),
      
      // Metadados
      exportadoEm: new Date().toISOString(),
      versao: '2.0',
      sistema: 'CallMed'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CallMed_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('✅ Backup exportado com sucesso');
    
    if (typeof Notificacao !== "undefined") {
      Notificacao.show("Backup exportado com sucesso!", "success");
    } else {
      alert("Backup exportado com sucesso!");
    }
  },

  // Importar backup
  import: (file) => {
    if (!file) return;
    
    console.log('📥 Iniciando importação de backup...');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Validação básica
        if (!data.sistema || data.sistema !== 'CallMed') {
          if (!confirm('⚠️ Este arquivo não parece ser um backup do CallMed. Deseja continuar?')) {
            return;
          }
        }
        
        if (!confirm('⚠️ Isso substituirá TODOS os dados atuais. Deseja continuar?')) {
          return;
        }
        
        // Importar dados
        if (data.pacientes) localStorage.setItem('CallMed_pacientes', JSON.stringify(data.pacientes));
        if (data.medicos) localStorage.setItem('CallMed_medicos', JSON.stringify(data.medicos));
        if (data.agendamentos) localStorage.setItem('CallMed_agendamentos', JSON.stringify(data.agendamentos));
        if (data.clinicas) localStorage.setItem('CallMed_clinicas', JSON.stringify(data.clinicas));
        if (data.usuarios) localStorage.setItem('CallMed_usuarios', JSON.stringify(data.usuarios));
        if (data.fotos) localStorage.setItem('CallMed_user_photos', JSON.stringify(data.fotos));
        if (data.config) localStorage.setItem('CallMed_config', JSON.stringify(data.config));
        
        console.log('✅ Backup importado com sucesso');
        
        if (typeof Notificacao !== "undefined") {
          Notificacao.show("Backup importado com sucesso! Recarregando...", "success");
        } else {
          alert("Backup importado com sucesso! Recarregando...");
        }
        
        setTimeout(() => location.reload(), 1500);
        
      } catch (error) {
        console.error('❌ Erro ao importar backup:', error);
        
        if (typeof Notificacao !== "undefined") {
          Notificacao.show("Erro ao importar backup! Verifique o arquivo.", "error");
        } else {
          alert("Erro ao importar backup! Verifique o arquivo.");
        }
      }
    };
    reader.readAsText(file);
  },

  // Limpar todos os dados
  limparTudo: () => {
    if (!confirm('⚠️ ATENÇÃO: Isso apagará TODOS os dados do sistema!\n\nTem certeza?')) return;
    if (!confirm('❌ CONFIRMAÇÃO FINAL\n\nDigite OK para confirmar:')) return;
    
    const chaves = [
      'CallMed_pacientes',
      'CallMed_medicos',
      'CallMed_agendamentos',
      'CallMed_clinicas',
      'CallMed_usuarios',
      'CallMed_user_photos',
      'CallMed_config',
      'usuarioLogado'
    ];
    
    chaves.forEach(chave => localStorage.removeItem(chave));
    
    // Re-inicializa com dados padrão
    Storage.init();
    Storage.criarContasDemo();
    
    alert('✅ Todos os dados foram resetados! A página será recarregada.');
    setTimeout(() => location.reload(), 1000);
  }
};

/* ===========================================================
   PARTE 2: CHARTS (Estatísticas)
   =========================================================== */

const Charts = {
  init: () => {
    const canvas = document.getElementById("chartConsultas");
    if (!canvas) return;
    
    // Verifica se Chart.js está disponível
    if (typeof Chart === 'undefined') {
      console.warn('⚠️ Chart.js não carregado. Gráficos não serão exibidos.');
      return;
    }
    
    const ctx = canvas.getContext("2d");
    const agendamentos = Storage.getAgendamentos();
    
    // Preparar dados dos últimos 7 dias
    const dias = [];
    const contagem = [];
    
    for (let i = 6; i >= 0; i--) {
      const data = new Date();
      data.setDate(data.getDate() - i);
      const dia = data.toISOString().split("T")[0];
      
      // Rótulo formatado (ex: "Seg", "Ter")
      const rotulo = data.toLocaleDateString('pt-BR', { weekday: 'short' });
      dias.push(rotulo);
      
      const total = agendamentos.filter(a => a.data === dia).length;
      contagem.push(total);
    }
    
    // Criar gráfico
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dias,
        datasets: [{
          label: 'Consultas',
          data: contagem,
          backgroundColor: 'rgba(0, 123, 255, 0.6)',
          borderColor: 'rgba(0, 123, 255, 1)',
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `${context.parsed.y} consulta(s)`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        }
      }
    });
    
    console.log('📊 Gráfico de consultas criado');
  },

  // Gráfico de pizza por status
  initStatusChart: () => {
    const canvas = document.getElementById("chartStatus");
    if (!canvas || typeof Chart === 'undefined') return;
    
    const ctx = canvas.getContext("2d");
    const agendamentos = Storage.getAgendamentos();
    
    const statusCounts = {
      'agendado': 0,
      'confirmado': 0,
      'pendente': 0,
      'cancelado': 0
    };
    
    agendamentos.forEach(a => {
      const status = a.status || 'agendado';
      if (statusCounts[status] !== undefined) {
        statusCounts[status]++;
      }
    });
    
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Agendados', 'Confirmados', 'Pendentes', 'Cancelados'],
        datasets: [{
          data: [
            statusCounts.agendado,
            statusCounts.confirmado,
            statusCounts.pendente,
            statusCounts.cancelado
          ],
          backgroundColor: [
            'rgba(0, 123, 255, 0.7)',
            'rgba(40, 167, 69, 0.7)',
            'rgba(255, 193, 7, 0.7)',
            'rgba(220, 53, 69, 0.7)'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  },

  // Gráfico de consultas por médico
  initMedicoChart: () => {
    const canvas = document.getElementById("chartMedicos");
    if (!canvas || typeof Chart === 'undefined') return;
    
    const ctx = canvas.getContext("2d");
    const agendamentos = Storage.getAgendamentos();
    const medicos = Storage.getMedicos();
    
    // Contar agendamentos por médico
    const contagem = {};
    agendamentos.forEach(a => {
      const medico = medicos.find(m => m.id == a.medicoId);
      const nome = medico ? medico.nome : `Médico ${a.medicoId}`;
      contagem[nome] = (contagem[nome] || 0) + 1;
    });
    
    const nomes = Object.keys(contagem).slice(0, 5);
    const valores = nomes.map(n => contagem[n]);
    
    new Chart(ctx, {
      type: 'horizontalBar',
      data: {
        labels: nomes,
        datasets: [{
          label: 'Consultas',
          data: valores,
          backgroundColor: 'rgba(0, 123, 255, 0.6)'
        }]
      },
      options: {
        responsive: true,
        indexAxis: 'y',
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
};

// Inicializa gráficos se estiver na página correta
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("chartConsultas")) {
    Charts.init();
  }
  if (document.getElementById("chartStatus")) {
    Charts.initStatusChart();
  }
  if (document.getElementById("chartMedicos")) {
    Charts.initMedicoChart();
  }
});

/* ===========================================================
   PARTE 3: PWA (Service Worker)
   =========================================================== */

const PWA = {
  init: () => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js")
          .then(reg => {
            console.log("✅ Service Worker registrado:", reg.scope);
          })
          .catch(err => {
            console.warn("⚠️ Erro ao registrar Service Worker:", err);
          });
      });
    } else {
      console.warn("⚠️ Service Worker não suportado neste navegador");
    }
  },

  // Verifica se está instalado
  isInstalled: () => {
    return window.matchMedia('(display-mode: standalone)').matches;
  },

  // Prompt de instalação
  promptInstall: () => {
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      window.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('✅ Usuário aceitou instalar o PWA');
        }
        window.deferredPrompt = null;
      });
    }
  }
};

// Captura o evento de instalação do PWA
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPrompt = e;
  console.log('💡 PWA pronto para instalação');
  
  // Mostra botão de instalação se existir
  const installBtn = document.getElementById('installPWA');
  if (installBtn) {
    installBtn.style.display = 'inline-block';
    installBtn.addEventListener('click', () => PWA.promptInstall());
  }
});

// Registra Service Worker
document.addEventListener("DOMContentLoaded", () => {
  PWA.init();
});

/* ===========================================================
   PARTE 4: TUTORIAL
   =========================================================== */

const Tutorial = {
  steps: [
    "Bem-vindo ao CallMed! Aqui você pode gerenciar pacientes, médicos, clínicas e agendamentos.",
    "Use a aba 'Agendar' para marcar consultas rapidamente.",
    "Visualize o histórico completo no menu 'Histórico'.",
    "Não esqueça de explorar as configurações e temas personalizados!",
    "Tudo pronto! Aproveite o CallMed."
  ],
  
  currentStep: 0,
  container: null,

  // Inicia o tutorial
  start: () => {
    Tutorial.currentStep = 0;
    
    Tutorial.container = document.createElement("div");
    Tutorial.container.classList.add("modal", "active");
    Tutorial.container.id = "tutorialModal";
    
    Tutorial.container.innerHTML = `
      <div class="modal-content" style="max-width: 500px; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: var(--espaco-md);">
          ${Tutorial.getStepIcon(Tutorial.currentStep)}
        </div>
        <h3 style="color: var(--cor-principal); margin-bottom: var(--espaco-md);">
          Tutorial CallMed
        </h3>
        <p id="tutorialText" style="font-size: 1rem; line-height: 1.6; margin-bottom: var(--espaco-lg);">
          ${Tutorial.steps[Tutorial.currentStep]}
        </p>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: var(--cor-secundaria); font-size: 0.9rem;">
            ${Tutorial.currentStep + 1} / ${Tutorial.steps.length}
          </span>
          <div style="display: flex; gap: var(--espaco-sm);">
            <button id="tutorialSkip" class="btn-edit" style="background: var(--cor-secundaria);">
              Pular
            </button>
            <button id="tutorialNext" class="btn-primary">
              ${Tutorial.currentStep === Tutorial.steps.length - 1 ? 'Concluir' : 'Próximo'}
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(Tutorial.container);

    // Event listeners
    document.getElementById("tutorialNext").addEventListener("click", Tutorial.next);
    document.getElementById("tutorialSkip").addEventListener("click", Tutorial.close);
  },

  // Próximo passo
  next: () => {
    Tutorial.currentStep++;
    
    if (Tutorial.currentStep >= Tutorial.steps.length) {
      Tutorial.close();
      return;
    }
    
    // Atualizar conteúdo
    const textoEl = document.getElementById("tutorialText");
    if (textoEl) textoEl.innerText = Tutorial.steps[Tutorial.currentStep];
    
    // Atualizar ícone
    const iconEl = Tutorial.container.querySelector('div[style*="font-size: 3rem"]');
    if (iconEl) iconEl.textContent = Tutorial.getStepIcon(Tutorial.currentStep);
    
    // Atualizar contador
    const counterEl = Tutorial.container.querySelector('span[style*="color"]');
    if (counterEl) counterEl.textContent = `${Tutorial.currentStep + 1} / ${Tutorial.steps.length}`;
    
    // Atualizar texto do botão
    const nextBtn = document.getElementById("tutorialNext");
    if (nextBtn) {
      nextBtn.textContent = Tutorial.currentStep === Tutorial.steps.length - 1 ? 'Concluir' : 'Próximo';
    }
  },

  // Fecha o tutorial
  close: () => {
    if (Tutorial.container) {
      Tutorial.container.classList.remove("active");
      setTimeout(() => {
        if (Tutorial.container && Tutorial.container.parentNode) {
          Tutorial.container.parentNode.removeChild(Tutorial.container);
        }
      }, 300);
    }
    
    // Marca como visto
    localStorage.setItem('CallMed_tutorialVisto', 'true');
    console.log('✅ Tutorial concluído');
  },

  // Ícones por passo
  getStepIcon: (step) => {
    const icons = ['👋', '📅', '📊', '⚙️', '🎉'];
    return icons[step] || '📌';
  },

  // Verifica se já foi visto
  foiVisto: () => {
    return localStorage.getItem('CallMed_tutorialVisto') === 'true';
  },

  // Inicia automaticamente se não foi visto
  autoStart: () => {
    if (!Tutorial.foiVisto()) {
      setTimeout(() => {
        Tutorial.start();
      }, 1500);
    }
  }
};

// Auto-iniciar tutorial na primeira visita (apenas no dashboard)
document.addEventListener("DOMContentLoaded", () => {
  const isDashboard = window.location.pathname.includes('index.html') || 
                     window.location.pathname.endsWith('/') ||
                     window.location.pathname.includes('dashboard');
  
  if (isDashboard && !Tutorial.foiVisto()) {
    Tutorial.autoStart();
  }
});

/* ===========================================================
   INICIALIZAÇÃO GERAL DAS FEATURES
   =========================================================== */

console.log('✅ Features inicializadas: Backup, Charts, PWA, Tutorial');