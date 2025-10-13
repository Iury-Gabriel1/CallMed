// main.js (CORRIGIDO PARA AGENDAMED)
// Sistema de temas global e inicialização

// Função para aplicar tema em TODAS as páginas
function aplicarTemaGlobal() {
  const config = Storage.getConfiguracoes();
  console.log('Aplicando tema global:', config.tema);
  
  // Aplica o tema no elemento html
  document.documentElement.setAttribute('data-theme', config.tema);
  
  // Força a aplicação em elementos específicos
  setTimeout(() => {
    const elementos = document.querySelectorAll('body, .card, .modal-content, table, .header, .nav, .container');
    elementos.forEach(el => {
      if (el) {
        el.style.transition = 'background-color 0.3s ease, color 0.3s ease';
      }
    });
  }, 100);
}

// Função para carregar foto do usuário
function carregarFotoUsuario(user) {
  // Procura por elementos de foto em diferentes páginas
  const welcomePhoto = document.getElementById('welcomePhoto');
  const welcomePlaceholder = document.getElementById('welcomePlaceholder');
  
  // Carrega foto específica do usuário ou usa avatar padrão
  const fotoCustomizada = Storage.getFotoUsuario(user.id);
  
  // Dashboard - Welcome section
  if (welcomePhoto) {
    if (fotoCustomizada) {
      welcomePhoto.src = fotoCustomizada;
      welcomePhoto.style.display = 'block';
      if (welcomePlaceholder) welcomePlaceholder.style.display = 'none';
    } else {
      welcomePhoto.src = 'avatar.png';
      welcomePhoto.style.display = 'block';
      if (welcomePlaceholder) welcomePlaceholder.style.display = 'none';
    }
  }
  
  // Configurações - Perfil section
  const fotoPreview = document.getElementById('fotoPreview');
  const fotoPlaceholder = document.getElementById('fotoPlaceholder');
  const fotoInicial = document.getElementById('fotoInicial');
  
  if (fotoPreview && fotoPlaceholder) {
    if (fotoCustomizada) {
      fotoPreview.src = fotoCustomizada;
      fotoPreview.style.display = 'block';
      fotoPlaceholder.style.display = 'none';
    } else {
      fotoPreview.src = 'avatar.png';
      fotoPreview.style.display = 'block';
      fotoPlaceholder.style.display = 'none';
      
      // Mostra iniciais se necessário
      if (fotoInicial) {
        const initials = user.nome ? user.nome.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
        fotoInicial.textContent = initials.substring(0, 2);
      }
    }
  }
}

// Registrar Service Worker para PWA
function registrarServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registrado: ', registration);
        })
        .catch(registrationError => {
          console.log('Falha no registro do Service Worker: ', registrationError);
        });
    });
  }
}

// INICIALIZAÇÃO PRINCIPAL
document.addEventListener("DOMContentLoaded", () => {
  console.log('=== AGENDAMED INICIANDO ===');
  
  // 1. Aplica tema global IMEDIATAMENTE
  aplicarTemaGlobal();
  
  // 2. Verifica se usuário está logado (exceto na página de login)
  if (!window.location.href.includes('login.html')) {
    const user = Storage.getUsuarioLogado();
    if (!user) {
      console.log('Usuário não logado, redirecionando...');
      window.location.href = 'login.html';
      return;
    }
    
    console.log('Usuário logado:', user.nome);
    
    // 3. Carrega foto específica do usuário logado
    carregarFotoUsuario(user);
  }

  // 4. Controle de logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      console.log('Logout realizado');
      Storage.logout();
      window.location.href = "login.html";
    });
  }

  // 5. Inicializa notificações
  if (typeof Notificacao !== "undefined") {
    Notificacao.init();
  }

  // 6. Registra Service Worker
  registrarServiceWorker();
  
  console.log('=== AGENDAMED INICIALIZADO ===');
});

// CORREÇÃO: Escuta mudanças de tema de outras páginas (AGENDAMED)
window.addEventListener('storage', function(e) {
  if (e.key === 'AgendaMed_config') {
    console.log('Configurações do AgendaMed alteradas, aplicando novo tema...');
    aplicarTemaGlobal();
  }
});

// Evento customizado para mudanças de tema
window.addEventListener('temaAlterado', function(e) {
  console.log('Tema alterado via evento:', e.detail);
  aplicarTemaGlobal();
});