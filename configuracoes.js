// configuracoes.js (CORRIGIDO PARA CallMed - VERSÃO ATUALIZADA)
// Gerenciamento de configurações e perfil do usuário

document.addEventListener("DOMContentLoaded", () => {
  const user = Storage.getUsuarioLogado();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  // Carrega dados do usuário
  carregarPerfil(user);
  
  // Configurações de tema
  configurarTema();
  
  // Backup de dados
  configurarBackup();
  
  // Perfil do usuário
  configurarPerfil(user);
});

function carregarPerfil(user) {
  document.getElementById('userNameDisplay').textContent = user.nome || 'Usuário';
  document.getElementById('userEmailDisplay').textContent = user.email || '';
  document.getElementById('userNome').value = user.nome || '';
  document.getElementById('userEmail').value = user.email || '';
  document.getElementById('userTelefone').value = user.telefone || '';
  
  // SISTEMA DE FOTO CORRIGIDO - USA FOTO CUSTOMIZADA OU PLACEHOLDER COM INICIAIS
  const fotoCustomizada = Storage.getFotoUsuario(user.id);
  const fotoPreview = document.getElementById('fotoPreview');
  const fotoPlaceholder = document.getElementById('fotoPlaceholder');
  const fotoInicial = document.getElementById('fotoInicial');
  const btnRemoverFoto = document.getElementById('btnRemoverFoto');
  
  if (fotoCustomizada) {
    // Usa foto customizada do usuário
    fotoPreview.src = fotoCustomizada;
    fotoPreview.style.display = 'block';
    fotoPlaceholder.style.display = 'none';
    if (btnRemoverFoto) btnRemoverFoto.style.display = 'inline-block';
  } else {
    // Usa placeholder com iniciais
    fotoPreview.style.display = 'none';
    fotoPlaceholder.style.display = 'flex';
    if (btnRemoverFoto) btnRemoverFoto.style.display = 'none';
    
    // Define as iniciais do nome
    const iniciais = user.nome ? 
      user.nome.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 
      'U';
    if (fotoInicial) fotoInicial.textContent = iniciais;
  }
}

function configurarTema() {
  const config = Storage.getConfiguracoes();
  const themeSelect = document.getElementById("themeSelect");
  const temaOptions = document.querySelectorAll('.tema-option');
  
  console.log('Configuração atual do tema:', config.tema);
  
  // Define tema atual
  if (themeSelect) {
    themeSelect.value = config.tema;
  }
  
  // Marca opção ativa
  temaOptions.forEach(option => {
    if (option.dataset.tema === config.tema) {
      option.classList.add('active');
    }
    
    option.addEventListener('click', () => {
      const novoTema = option.dataset.tema;
      console.log('Tema selecionado via opção:', novoTema);
      if (themeSelect) themeSelect.value = novoTema;
      aplicarTema(novoTema);
      
      // Atualiza visual das opções
      temaOptions.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
    });
  });
  
  if (themeSelect) {
    themeSelect.addEventListener("change", (e) => {
      console.log('Tema selecionado via select:', e.target.value);
      aplicarTema(e.target.value);
      
      // Atualiza visual das opções
      temaOptions.forEach(opt => {
        opt.classList.remove('active');
        if (opt.dataset.tema === e.target.value) {
          opt.classList.add('active');
        }
      });
    });
  }
}

function aplicarTema(tema) {
  console.log('Aplicando tema:', tema);
  
  // 1. Aplica o tema no elemento html
  document.documentElement.setAttribute('data-theme', tema);
  
  // 2. Salva no storage
  const novaConfig = Storage.getConfiguracoes();
  novaConfig.tema = tema;
  Storage.salvarConfiguracoes(novaConfig);
  
  // 3. Dispara evento para outras páginas
  window.dispatchEvent(new CustomEvent('temaAlterado', { detail: tema }));
  
  // 4. Força atualização visual
  setTimeout(() => {
    document.body.style.backgroundColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--cor-fundo').trim();
    
    // Atualiza meta tag theme-color
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute('content', getComputedStyle(document.documentElement)
        .getPropertyValue('--cor-principal').trim());
    }
  }, 100);
  
  // Mostra feedback
  if (typeof Notificacao !== "undefined") {
    Notificacao.show(`Tema alterado para ${tema}`, "success");
  }
}

function configurarBackup() {
  const btnExport = document.getElementById("btnExport");
  const importInput = document.getElementById("importInput");
  
  if (btnExport) {
    btnExport.addEventListener("click", exportarBackup);
  }
  
  if (importInput) {
    importInput.addEventListener("change", importarBackup);
  }
}

function exportarBackup() {
  const data = {
    pacientes: Storage.getPacientes(),
    medicos: Storage.getMedicos(),
    agendamentos: Storage.getAgendamentos(),
    usuarios: Storage.getUsuarios(),
    fotos: JSON.parse(localStorage.getItem('CallMed_user_photos') || '{}'), // CORRIGIDO: CallMed
    config: Storage.getConfiguracoes(),
    exportadoEm: new Date().toISOString(),
    versao: '1.0'
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `CallMed-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  if (typeof Notificacao !== "undefined") {
    Notificacao.show("Backup exportado com sucesso!", "success");
  } else {
    alert("Backup exportado com sucesso!");
  }
}

function importarBackup(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      
      // CORREÇÃO: Usando chaves CallMed
      if (data.pacientes) localStorage.setItem('CallMed_pacientes', JSON.stringify(data.pacientes));
      if (data.medicos) localStorage.setItem('CallMed_medicos', JSON.stringify(data.medicos));
      if (data.agendamentos) localStorage.setItem('CallMed_agendamentos', JSON.stringify(data.agendamentos));
      if (data.usuarios) localStorage.setItem('CallMed_usuarios', JSON.stringify(data.usuarios));
      if (data.fotos) localStorage.setItem('CallMed_user_photos', JSON.stringify(data.fotos));
      if (data.config) localStorage.setItem('CallMed_config', JSON.stringify(data.config));
      
      if (typeof Notificacao !== "undefined") {
        Notificacao.show("Backup importado com sucesso!", "success");
      } else {
        alert("Backup importado com sucesso!");
      }
      
      setTimeout(() => location.reload(), 1000);
    } catch (error) {
      console.error('Erro ao importar backup:', error);
      if (typeof Notificacao !== "undefined") {
        Notificacao.show("Erro ao importar backup!", "error");
      } else {
        alert("Erro ao importar backup!");
      }
    }
  };
  reader.readAsText(file);
  e.target.value = ''; // Limpa o input
}

function configurarPerfil(user) {
  const fotoInput = document.getElementById('fotoInput');
  const fotoPerfil = document.getElementById('fotoPerfil');
  const perfilForm = document.getElementById('perfilForm');
  const btnRemoverFoto = document.getElementById('btnRemoverFoto');
  
  // Upload de foto - CORRIGIDO
  if (fotoInput) {
    fotoInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        // Verifica se é uma imagem
        if (!file.type.startsWith('image/')) {
          alert('Por favor, selecione uma imagem válida!');
          return;
        }
        
        // Verifica tamanho (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('A imagem deve ter no máximo 5MB!');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
          const fotoUrl = e.target.result;
          const fotoPreview = document.getElementById('fotoPreview');
          const fotoPlaceholder = document.getElementById('fotoPlaceholder');
          
          // Atualiza a exibição
          fotoPreview.src = fotoUrl;
          fotoPreview.style.display = 'block';
          fotoPlaceholder.style.display = 'none';
          
          // Salva foto ESPECÍFICA do usuário
          Storage.salvarFotoUsuario(user.id, fotoUrl);
          
          // Mostra botão de remover foto
          if (btnRemoverFoto) {
            btnRemoverFoto.style.display = 'inline-block';
          }
          
          if (typeof Notificacao !== "undefined") {
            Notificacao.show("Foto de perfil atualizada!", "success");
          } else {
            alert("Foto de perfil atualizada com sucesso!");
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  // Botão para remover foto (voltar para placeholder com iniciais) - CORRIGIDO
  if (btnRemoverFoto) {
    // Só mostra o botão se tiver foto customizada
    const fotoCustomizada = Storage.getFotoUsuario(user.id);
    if (fotoCustomizada) {
      btnRemoverFoto.style.display = 'inline-block';
    } else {
      btnRemoverFoto.style.display = 'none';
    }
    
    btnRemoverFoto.addEventListener('click', function() {
      if (confirm('Deseja remover sua foto?')) {
        const fotoPreview = document.getElementById('fotoPreview');
        const fotoPlaceholder = document.getElementById('fotoPlaceholder');
        const fotoInicial = document.getElementById('fotoInicial');
        
        // Volta para o placeholder com iniciais
        fotoPreview.style.display = 'none';
        fotoPlaceholder.style.display = 'flex';
        
        // Define iniciais
        const iniciais = user.nome ? 
          user.nome.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 
          'U';
        if (fotoInicial) fotoInicial.textContent = iniciais;
        
        // Remove a foto customizada
        Storage.removerFotoUsuario(user.id);
        
        // Esconde o botão de remover
        btnRemoverFoto.style.display = 'none';
        
        if (typeof Notificacao !== "undefined") {
          Notificacao.show("Foto removida!", "success");
        } else {
          alert("Foto removida com sucesso!");
        }
      }
    });
  }

  // Funções auxiliares para o chatbot acessar informações do médico
function getInfoMedicoParaChatbot(medicoId) {
  const user = Storage.getUsuarios().find(u => u.id == medicoId);
  if (!user || user.tipo !== 'clinica' || user.tipoClinica !== 'medico') {
    return null;
  }
  
  const infoProfissional = Storage.getInfoProfissionalMedico(medicoId);
  const matchmaking = Storage.getMatchmakingMedico(medicoId);
  
  return {
    id: medicoId,
    nome: user.nome,
    email: user.email,
    telefone: user.telefone,
    // Informações profissionais
    crm: infoProfissional?.crm,
    especialidade: infoProfissional?.especialidade,
    subespecialidades: infoProfissional?.subespecialidades,
    formacao: infoProfissional?.formacao,
    // Informações de matchmaking
    localizacao: matchmaking?.localizacao,
    valorConsulta: matchmaking?.valorConsulta,
    planos: matchmaking?.planos,
    descricao: matchmaking?.descricao,
    horarios: matchmaking?.horarios
  };
}

// Função para listar todos os médicos com informações completas (para o chatbot)
function listarMedicosParaChatbot() {
  const usuarios = Storage.getUsuarios();
  const medicos = usuarios.filter(u => u.tipo === 'clinica' && u.tipoClinica === 'medico');
  
  return medicos.map(medico => getInfoMedicoParaChatbot(medico.id)).filter(Boolean);
}

// Função para buscar médicos por especialidade (para o chatbot)
function buscarMedicosPorEspecialidade(especialidade) {
  const todosMedicos = listarMedicosParaChatbot();
  return todosMedicos.filter(medico => 
    medico.especialidade?.toLowerCase().includes(especialidade.toLowerCase())
  );
}

// Função para buscar médicos por localização (para o chatbot)
function buscarMedicosPorLocalizacao(localizacao) {
  const todosMedicos = listarMedicosParaChatbot();
  return todosMedicos.filter(medico => 
    medico.localizacao?.toLowerCase().includes(localizacao.toLowerCase())
  );
}

// Função para buscar médicos por plano de saúde (para o chatbot)
function buscarMedicosPorPlano(plano) {
  const todosMedicos = listarMedicosParaChatbot();
  return todosMedicos.filter(medico => 
    medico.planos?.some(p => p.toLowerCase().includes(plano.toLowerCase()))
  );
}
  
  // Formulário de perfil - CORRIGIDO
  if (perfilForm) {
    perfilForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const usuarios = Storage.getUsuarios();
      const usuarioIndex = usuarios.findIndex(u => u.id === user.id);
      
      if (usuarioIndex !== -1) {
        usuarios[usuarioIndex].nome = document.getElementById('userNome').value;
        usuarios[usuarioIndex].email = document.getElementById('userEmail').value;
        usuarios[usuarioIndex].telefone = document.getElementById('userTelefone').value;
        
        localStorage.setItem('CallMed_usuarios', JSON.stringify(usuarios)); // CORRIGIDO: CallMed
        
        // Atualiza usuário logado
        const usuarioAtualizado = usuarios[usuarioIndex];
        localStorage.setItem('usuarioLogado', JSON.stringify(usuarioAtualizado));
        
        // Atualiza display
        document.getElementById('userNameDisplay').textContent = usuarioAtualizado.nome;
        document.getElementById('userEmailDisplay').textContent = usuarioAtualizado.email;
        
        // Atualiza iniciais na foto se necessário
        const fotoCustomizada = Storage.getFotoUsuario(user.id);
        if (!fotoCustomizada) {
          const fotoInicial = document.getElementById('fotoInicial');
          const iniciais = usuarioAtualizado.nome ? 
            usuarioAtualizado.nome.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 
            'U';
          if (fotoInicial) fotoInicial.textContent = iniciais;
        }
        
        if (typeof Notificacao !== "undefined") {
          Notificacao.show("Perfil atualizado com sucesso!", "success");
        } else {
          alert("Perfil atualizado com sucesso!");
        }
      }
    });
  }
}