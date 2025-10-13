/* ===========================================================
   AgendaMed - storage.js (VERSÃO CORRIGIDA)
   Sistema unificado de persistência
   =========================================================== */

const Storage = {
  // Chaves individuais para compatibilidade
  init() {
    // Inicializa dados se não existirem
    if (!localStorage.getItem('AgendaMed_pacientes')) {
      localStorage.setItem('AgendaMed_pacientes', JSON.stringify([]));
    }
    if (!localStorage.getItem('AgendaMed_medicos')) {
      localStorage.setItem('AgendaMed_medicos', JSON.stringify([]));
    }
    if (!localStorage.getItem('AgendaMed_agendamentos')) {
      localStorage.setItem('AgendaMed_agendamentos', JSON.stringify([]));
    }
    if (!localStorage.getItem('AgendaMed_usuarios')) {
      const usuariosDemo = [
        { 
          id: 1, 
          nome: "Admin", 
          email: "admin@AgendaMed.com", 
          senha: "123456",
          tipo: "clinica",
          tipoClinica: "admin"
        },
        { 
          id: 2, 
          nome: "Dr. Altemar", 
          email: "altemar@clinica.com", 
          senha: "123456",
          tipo: "clinica",
          tipoClinica: "medico"
        }
      ];
      localStorage.setItem('AgendaMed_usuarios', JSON.stringify(usuariosDemo));
    }
    // Inicializa storage de fotos se não existir
    if (!localStorage.getItem('AgendaMed_user_photos')) {
      localStorage.setItem('AgendaMed_user_photos', JSON.stringify({}));
    }
  },

  /* ===========================================================
     FOTOS DE PERFIL - POR USUÁRIO
     =========================================================== */

  // Salva foto associada ao ID do usuário
  salvarFotoUsuario(userId, fotoData) {
    const fotos = JSON.parse(localStorage.getItem('AgendaMed_user_photos') || '{}');
    fotos[userId] = fotoData;
    localStorage.setItem('AgendaMed_user_photos', JSON.stringify(fotos));
    
    // ATUALIZAÇÃO CORRIGIDA: Também atualiza no usuário
    const usuarios = this.getUsuarios();
    const usuarioIndex = usuarios.findIndex(u => u.id == userId);
    if (usuarioIndex !== -1) {
        usuarios[usuarioIndex].foto = fotoData;
        localStorage.setItem('AgendaMed_usuarios', JSON.stringify(usuarios));
        
        // Atualiza usuário logado se for o mesmo
        const usuarioLogado = this.getUsuarioLogado();
        if (usuarioLogado && usuarioLogado.id == userId) {
            usuarioLogado.foto = fotoData;
            localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
        }
    }
  },

  // Recupera foto do usuário específico
  getFotoUsuario(userId) {
    const fotos = JSON.parse(localStorage.getItem('AgendaMed_user_photos') || '{}');
    return fotos[userId] || null;
  },

  // Remove foto do usuário (volta para avatar padrão)
  removerFotoUsuario(userId) {
    const fotos = JSON.parse(localStorage.getItem('AgendaMed_user_photos') || '{}');
    delete fotos[userId];
    localStorage.setItem('AgendaMed_user_photos', JSON.stringify(fotos));
  },

  // Verifica se usuário tem foto customizada
  temFotoCustomizada(userId) {
    const fotos = JSON.parse(localStorage.getItem('AgendaMed_user_photos') || '{}');
    return !!fotos[userId];
  },

  /* ===========================================================
     USUÁRIOS
     =========================================================== */
  getUsuarios() {
    return JSON.parse(localStorage.getItem('AgendaMed_usuarios') || '[]');
  },

  criarUsuario(nome, email, senha) {
    const usuarios = this.getUsuarios();
    if (usuarios.find(u => u.email === email)) return null;
    
    const novoUsuario = {
      id: Date.now(),
      nome,
      email,
      senha
    };
    
    usuarios.push(novoUsuario);
    localStorage.setItem('AgendaMed_usuarios', JSON.stringify(usuarios));
    return novoUsuario;
  },

  login(email, senha) {
    const usuarios = this.getUsuarios();
    const usuario = usuarios.find(u => u.email === email && u.senha === senha);
    
    if (usuario) {
      localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
      return usuario;
    }
    return null;
  },

  getUsuarioLogado() {
    return JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
  },

  logout() {
    const usuario = this.getUsuarioLogado();
    if (usuario) {
      localStorage.removeItem('AgendaMed_user_photo');
    }
    localStorage.removeItem('usuarioLogado');
  },

/* ===========================================================
   PACIENTES
   =========================================================== */
getPacientes() {
  return JSON.parse(localStorage.getItem('AgendaMed_pacientes') || '[]');
},

salvarPaciente(paciente) {
  const pacientes = this.getPacientes();
  if (paciente.id) {
    const index = pacientes.findIndex(p => p.id === paciente.id);
    if (index !== -1) pacientes[index] = paciente;
  } else {
    paciente.id = Date.now();
    pacientes.push(paciente);
  }
  localStorage.setItem('AgendaMed_pacientes', JSON.stringify(pacientes));
  return paciente;
},

excluirPaciente(id) {
  const pacientes = this.getPacientes().filter(p => p.id !== id);
  localStorage.setItem('AgendaMed_pacientes', JSON.stringify(pacientes));
},

// Buscar paciente por ID do usuário
getPacientePorUsuarioId(usuarioId) {
  const pacientes = this.getPacientes();
  return pacientes.find(paciente => paciente.usuarioId == usuarioId);
},

// Criar paciente automaticamente para um usuário
criarPacienteParaUsuario(usuarioId, dadosPaciente) {
  const pacientes = this.getPacientes();
  const usuario = this.getUsuarios().find(u => u.id == usuarioId);
  
  if (!usuario) return null;
  
  const novoPaciente = {
    id: Date.now().toString(),
    nome: dadosPaciente.nome || usuario.nome,
    email: dadosPaciente.email || usuario.email,
    telefone: dadosPaciente.telefone || '',
    dataNascimento: dadosPaciente.dataNascimento || '',
    usuarioId: usuarioId,
    dataCadastro: new Date().toISOString(),
    status: 'ativo'
  };
  
  pacientes.push(novoPaciente);
  localStorage.setItem('AgendaMed_pacientes', JSON.stringify(pacientes));
  console.log('✅ Paciente criado automaticamente:', novoPaciente.nome);
  return novoPaciente;
},

  /* ===========================================================
     MÉDICOS - FUNÇÕES CORRIGIDAS
     =========================================================== */
  getMedicos() {
    return JSON.parse(localStorage.getItem('AgendaMed_medicos') || '[]');
  },

  salvarMedico(medico) {
    const medicos = this.getMedicos();
    
    console.log('💾 Salvando médico:', medico);
    
    if (medico.id) {
      // EDIÇÃO - CORRIGIDA
      const index = medicos.findIndex(m => m.id == medico.id);
      console.log('Índice encontrado para edição:', index);
      
      if (index !== -1) {
        // Mantém dados importantes que podem não vir do formulário
        const medicoExistente = medicos[index];
        medico = {
          ...medicoExistente, // Mantém dados existentes
          ...medico,          // Aplica novas alterações
          id: medicoExistente.id, // Garante que o ID não mude
          usuarioId: medicoExistente.usuarioId, // Mantém o vínculo com usuário se existir
          dataCadastro: medicoExistente.dataCadastro // Mantém data original
        };
        medicos[index] = medico;
        console.log('✅ Médico editado:', medico);
      } else {
        console.error('❌ Médico não encontrado para edição ID:', medico.id);
        return null;
      }
    } else {
      // NOVO MÉDICO - CORRIGIDO
      medico.id = Date.now();
      medico.dataCadastro = new Date().toISOString();
      medico.status = 'ativo';
      medicos.push(medico);
      console.log('✅ Novo médico criado:', medico);
    }
    
    localStorage.setItem('AgendaMed_medicos', JSON.stringify(medicos));
    return medico;
  },

  excluirMedico(id) {
    console.log('🗑️ Excluindo médico ID:', id);
    const medicos = this.getMedicos().filter(m => m.id != id);
    localStorage.setItem('AgendaMed_medicos', JSON.stringify(medicos));
    console.log('✅ Médico excluído. Total restante:', medicos.length);
  },

  /* ===========================================================
   AGENDAMENTOS - FUNÇÕES COMPLETAS
   =========================================================== */

// ADICIONE ESTA FUNÇÃO - ELA ESTAVA FALTANDO
getAgendamentos: function() {
  return JSON.parse(localStorage.getItem('AgendaMed_agendamentos') || '[]');
},

salvarAgendamento: function(agendamento) {
  const agendamentos = this.getAgendamentos();
  
  console.log('💾 Salvando agendamento:', agendamento);
  
  // CORREÇÃO: Garantir que os IDs sejam números
  if (agendamento.pacienteId) agendamento.pacienteId = parseInt(agendamento.pacienteId);
  if (agendamento.medicoId) agendamento.medicoId = parseInt(agendamento.medicoId);
  
  if (agendamento.id) {
    const index = agendamentos.findIndex(a => a.id === agendamento.id);
    if (index !== -1) {
      agendamentos[index] = agendamento;
    }
  } else {
    agendamento.id = Date.now();
    
    // CORREÇÃO: Adicionar informações completas para evitar "não encontrado"
    const paciente = this.getPacientes().find(p => p.id == agendamento.pacienteId);
    const medico = this.getMedicos().find(m => m.id == agendamento.medicoId);
    
    if (paciente) {
      agendamento.pacienteNome = paciente.nome;
      agendamento.pacienteTelefone = paciente.telefone;
    }
    
    if (medico) {
      agendamento.medicoNome = medico.nome;
      agendamento.medicoEspecialidade = medico.especialidade;
    }
    
    // Garantir campos essenciais
    agendamento.status = agendamento.status || 'agendado';
    agendamento.data = agendamento.data || new Date().toISOString().split('T')[0];
    
    agendamentos.push(agendamento);
  }
  
  localStorage.setItem('AgendaMed_agendamentos', JSON.stringify(agendamentos));
  console.log('✅ Agendamento salvo:', agendamento);
  return agendamento;
},

excluirAgendamento: function(id) {
  const agendamentos = this.getAgendamentos().filter(a => a.id !== id);
  localStorage.setItem('AgendaMed_agendamentos', JSON.stringify(agendamentos));
  console.log('🗑️ Agendamento excluído ID:', id);
},

  /* ===========================================================
   AGENDAMENTOS - FUNÇÃO ÚNICA CORRIGIDA
   =========================================================== */
salvarAgendamento: function(agendamento) {
  const agendamentos = this.getAgendamentos();
  
  console.log('💾 Salvando agendamento:', agendamento);
  
  // CORREÇÃO: Garantir que os IDs sejam números
  if (agendamento.pacienteId) agendamento.pacienteId = parseInt(agendamento.pacienteId);
  if (agendamento.medicoId) agendamento.medicoId = parseInt(agendamento.medicoId);
  
  if (agendamento.id) {
    const index = agendamentos.findIndex(a => a.id === agendamento.id);
    if (index !== -1) {
      agendamentos[index] = agendamento;
    }
  } else {
    agendamento.id = Date.now();
    
    // CORREÇÃO: Adicionar informações completas para evitar "não encontrado"
    const paciente = this.getPacientes().find(p => p.id == agendamento.pacienteId);
    const medico = this.getMedicos().find(m => m.id == agendamento.medicoId);
    
    if (paciente) {
      agendamento.pacienteNome = paciente.nome;
      agendamento.pacienteTelefone = paciente.telefone;
    }
    
    if (medico) {
      agendamento.medicoNome = medico.nome;
      agendamento.medicoEspecialidade = medico.especialidade;
    }
    
    // Garantir campos essenciais
    agendamento.status = agendamento.status || 'agendado';
    agendamento.data = agendamento.data || new Date().toISOString().split('T')[0];
    
    agendamentos.push(agendamento);
  }
  
  localStorage.setItem('AgendaMed_agendamentos', JSON.stringify(agendamentos));
  console.log('✅ Agendamento salvo:', agendamento);
  return agendamento;
},

excluirAgendamento: function(id) {
  const agendamentos = this.getAgendamentos().filter(a => a.id !== id);
  localStorage.setItem('AgendaMed_agendamentos', JSON.stringify(agendamentos));
  console.log('🗑️ Agendamento excluído ID:', id);
},
  /* ===========================================================
     CONFIGURAÇÕES
     =========================================================== */
  getConfiguracoes() {
    return JSON.parse(localStorage.getItem('AgendaMed_config') || '{"tema":"light","notificacoes":true}');
  },

  salvarConfiguracoes(config) {
    localStorage.setItem('AgendaMed_config', JSON.stringify(config));
  },

  /* ===========================================================
   CONFIGURAÇÕES POR USUÁRIO - SISTEMA CORRIGIDO
   =========================================================== */

// Salvar configurações específicas do usuário
salvarConfiguracaoUsuario: function(usuarioId, chave, dados) {
  const chaveStorage = `AgendaMed_config_${usuarioId}`;
  const configs = JSON.parse(localStorage.getItem(chaveStorage) || '{}');
  configs[chave] = dados;
  localStorage.setItem(chaveStorage, JSON.stringify(configs));
  console.log(`💾 Configuração salva para usuário ${usuarioId}:`, chave, dados);
  return dados;
},

// Recuperar configurações específicas do usuário
getConfiguracaoUsuario: function(usuarioId, chave) {
  const chaveStorage = `AgendaMed_config_${usuarioId}`;
  const configs = JSON.parse(localStorage.getItem(chaveStorage) || '{}');
  return configs[chave] || null;
},

// Recuperar todas as configurações do usuário
getTodasConfiguracoesUsuario: function(usuarioId) {
  const chaveStorage = `AgendaMed_config_${usuarioId}`;
  return JSON.parse(localStorage.getItem(chaveStorage) || '{}');
},

// Remover configuração específica
removerConfiguracaoUsuario: function(usuarioId, chave) {
  const chaveStorage = `AgendaMed_config_${usuarioId}`;
  const configs = JSON.parse(localStorage.getItem(chaveStorage) || '{}');
  delete configs[chave];
  localStorage.setItem(chaveStorage, JSON.stringify(configs));
},

/* ===========================================================
   CONFIGURAÇÕES ESPECÍFICAS PARA MÉDICOS
   =========================================================== */

// Salvar informações profissionais do médico
salvarInfoProfissionalMedico: function(usuarioId, dados) {
  return this.salvarConfiguracaoUsuario(usuarioId, 'info_profissional', dados);
},

// Recuperar informações profissionais do médico
getInfoProfissionalMedico: function(usuarioId) {
  return this.getConfiguracaoUsuario(usuarioId, 'info_profissional');
},

// Salvar configurações de matchmaking do médico
salvarMatchmakingMedico: function(usuarioId, dados) {
  return this.salvarConfiguracaoUsuario(usuarioId, 'matchmaking', dados);
},

// Recuperar configurações de matchmaking do médico
getMatchmakingMedico: function(usuarioId) {
  return this.getConfiguracaoUsuario(usuarioId, 'matchmaking');
},

// Verificar se usuário é médico e tem configurações
isMedicoComConfiguracoes: function(usuarioId) {
  const user = this.getUsuarios().find(u => u.id == usuarioId);
  return user && user.tipo === 'clinica' && user.tipoClinica === 'medico';
},

  /* ===========================================================
     FUNÇÕES PARA AGENDAMENTOS POR PACIENTE
     =========================================================== */
  getAgendamentosPorPaciente(pacienteId) {
    const agendamentos = this.getAgendamentos();
    return agendamentos.filter(a => a.pacienteId == pacienteId);
  },

  /* ===========================================================
   FUNÇÕES PARA O CHATBOT ACESSAR INFORMAÇÕES DE MÉDICOS
   =========================================================== */

// Buscar informações completas do médico para o chatbot
getMedicoCompletoParaChatbot: function(medicoId) {
  const medico = this.getMedicos().find(m => m.id == medicoId);
  if (!medico) return null;
  
  // Busca informações do usuário médico
  const usuarioMedico = this.getUsuarios().find(u => u.id == medico.usuarioId);
  
  // Busca informações profissionais salvas nas configurações
  const infoProfissional = this.getInfoProfissionalMedico(medico.usuarioId);
  
  // Busca informações de matchmaking salvas nas configurações
  const matchmaking = this.getMatchmakingMedico(medico.usuarioId);
  
  return {
    // Informações básicas do médico
    id: medico.id,
    nome: medico.nome,
    email: medico.email,
    telefone: medico.telefone,
    especialidade: medico.especialidade,
    crm: medico.crm,
    experiencia: medico.experiencia,
    avaliacao: medico.avaliacao,
    
    // Informações do usuário
    usuarioId: medico.usuarioId,
    usuarioNome: usuarioMedico?.nome,
    
    // Informações profissionais das configurações
    infoProfissional: infoProfissional || {},
    
    // Informações de matchmaking das configurações
    matchmaking: matchmaking || {}
  };
},

// Listar todos os médicos com informações completas para o chatbot
listarMedicosCompletosParaChatbot: function() {
  const medicos = this.getMedicos();
  return medicos.map(medico => this.getMedicoCompletoParaChatbot(medico.id)).filter(Boolean);
},

// Buscar médicos por critérios de matchmaking
buscarMedicosPorMatchmaking: function(criterios) {
  const todosMedicos = this.listarMedicosCompletosParaChatbot();
  
  return todosMedicos.filter(medico => {
    let match = true;
    
    // Filtro por especialidade
    if (criterios.especialidade && medico.especialidade) {
      const espMedico = medico.especialidade.toLowerCase();
      const espBusca = criterios.especialidade.toLowerCase();
      match = match && espMedico.includes(espBusca);
    }
    
    // Filtro por localização
    if (criterios.localizacao && medico.matchmaking.localizacao) {
      const locMedico = medico.matchmaking.localizacao.toLowerCase();
      const locBusca = criterios.localizacao.toLowerCase();
      match = match && locMedico.includes(locBusca);
    }
    
    // Filtro por planos de saúde
    if (criterios.planoSaude && medico.matchmaking.planos) {
      match = match && medico.matchmaking.planos.some(plano => 
        plano.toLowerCase().includes(criterios.planoSaude.toLowerCase())
      );
    }
    
    // Filtro por valor máximo
    if (criterios.valorMaximo && medico.matchmaking.valorConsulta) {
      match = match && medico.matchmaking.valorConsulta <= criterios.valorMaximo;
    }
    
    return match;
  });
},

// Buscar médicos por sintomas (mapeamento inteligente)
buscarMedicosPorSintomas: function(sintomas) {
 const mapeamentoSintomas = {
    'Cardiologia': [
      'coracao', 'cardiaco', 'pressao', 'arterial', 'dor no peito', 'palpitacao', 
      'palpitacoes', 'arritmia', 'taquicardia', 'falta de ar'
    ],
    'Dermatologia': [
      'pele', 'mancha', 'coceira', 'erupcao', 'acne', 'eczema', 'psoriase', 
      'alergia de pele', 'descamacao', 'urticaria'
    ],
    'Pediatria': [
      'crianca', 'bebe', 'infantil', 'pediatrico', 'recem nascido', 'febre infantil'
    ],
    'Ortopedia': [
      'osso', 'fratura', 'fraturado', 'articulacao', 'joelho', 'coluna', 
      'lombar', 'ombro', 'tornozelo', 'entorse', 'dor muscular'
    ],
    'Oftalmologia': [
      'olho', 'visao', 'miopia', 'astigmatismo', 'catarata', 'vista', 
      'irritacao ocular', 'conjuntivite'
    ],
    'Psiquiatria': [
      'mental', 'ansiedade', 'depressao', 'estresse', 'insonia', 'panico', 
      'humor', 'transtorno', 'crise nervosa'
    ],
    'Ginecologia': [
      'menstruacao', 'colica', 'corrimento', 'saude da mulher', 'gestacao', 
      'gravidez', 'planejamento familiar'
    ],
    'Otorrinolaringologia': [
      'garganta', 'ouvido', 'nariz', 'sinusite', 'rinite', 'otite', 
      'obstrucao nasal', 'dor de ouvido'
    ],
    'Neurologia': [
      'dor de cabeca', 'cefaleia', 'enxaqueca', 'convulsao', 'formigamento', 
      'paralisia', 'tontura', 'avc'
    ],
    'Endocrinologia': [
      'diabetes', 'hormonal', 'tireoide', 'obesidade', 'colesterol', 'metabolismo'
    ],
    'Urologia': [
      'urina', 'urinario', 'incontinencia', 'rim', 'prostata', 'calculo renal'
    ],
    'Alergologia': [
      'alergia', 'asma', 'rinite alergica', 'alergia alimentar', 'dermatite'
    ],
    'Nutrologia': [
      'alimentacao', 'nutricao', 'peso', 'obesidade', 'dieta', 'metabolismo'
    ],
    'Geriatria': [
      'idoso', 'envelhecimento', 'quedas', 'doencas cronicas', 'memoria'
    ],
    'Clínico Geral': [
      'febre', 'gripe', 'resfriado', 'dor', 'mal estar', 'cansaco', 'checkup', 'rotina'
    ]
  };

  const sintomasLower = sintomas.toLowerCase();
  const especialidadesEncontradas = new Set();

  // Mapear sintomas para especialidades
  for (const [sintoma, especialidade] of Object.entries(mapeamentoSintomas)) {
    if (sintomasLower.includes(sintoma)) {
      especialidadesEncontradas.add(especialidade);
    }
  }

  // Se não encontrou especialidade específica, usar Clínico Geral
  if (especialidadesEncontradas.size === 0) {
    especialidadesEncontradas.add('Clínico Geral');
  }

  const todosMedicos = this.listarMedicosCompletosParaChatbot();
  const especialidadesArray = Array.from(especialidadesEncontradas);
  
  return todosMedicos.filter(medico => 
    especialidadesArray.some(esp => 
      medico.especialidade && medico.especialidade.toLowerCase().includes(esp.toLowerCase())
    )
  );
},

  /* ===========================================================
     NOVAS FUNÇÕES PARA SISTEMA AUTOMÁTICO DE MÉDICOS
     =========================================================== */

  // Adicionar médico automaticamente quando usuário se cadastra como médico
  adicionarMedicoAutomaticamente(usuario) {
    const medicos = this.getMedicos();
    
    // Verifica se o médico já existe pelo email
    const medicoExistente = medicos.find(m => m.email === usuario.email);
    if (medicoExistente) {
      console.log('⚠️ Médico já existe:', medicoExistente.nome);
      return medicoExistente;
    }
    
    // Cria novo médico
    const novoMedico = {
      id: Date.now().toString(),
      nome: usuario.nome,
      email: usuario.email,
      telefone: '', // Pode ser preenchido depois
      especialidade: 'Clínico Geral', // Especialidade padrão
      crm: '', // CRM pode ser preenchido depois
      usuarioId: usuario.id, // Link com o usuário
      dataCadastro: new Date().toISOString(),
      status: 'ativo'
    };
    
    medicos.push(novoMedico);
    localStorage.setItem('AgendaMed_medicos', JSON.stringify(medicos));
    console.log('✅ Médico adicionado automaticamente:', novoMedico.nome);
    return novoMedico;
  },

  // Buscar médico por ID do usuário
  getMedicoPorUsuarioId(usuarioId) {
    const medicos = this.getMedicos();
    return medicos.find(medico => medico.usuarioId == usuarioId);
  },

  // Atualizar informações do médico (quando ele edita no configuracoes.html)
  atualizarMedicoAutomatico(usuarioId, dadosMedico) {
    const medicos = this.getMedicos();
    const medicoIndex = medicos.findIndex(m => m.usuarioId == usuarioId);
    
    if (medicoIndex !== -1) {
      // Atualiza apenas os campos fornecidos
      medicos[medicoIndex] = {
        ...medicos[medicoIndex],
        ...dadosMedico,
        usuarioId: medicos[medicoIndex].usuarioId, // Mantém o vínculo
        id: medicos[medicoIndex].id, // Mantém o ID
        dataCadastro: medicos[medicoIndex].dataCadastro // Mantém data original
      };
      
      localStorage.setItem('AgendaMed_medicos', JSON.stringify(medicos));
      console.log('✅ Médico atualizado automaticamente:', medicos[medicoIndex].nome);
      return medicos[medicoIndex];
    }
    return null;
  },

  // Verificar se um usuário médico já está na lista de médicos
  verificarMedicoAutomatico(usuario) {
    if (usuario.tipo === 'clinica' && usuario.tipoClinica === 'medico') {
      const medicoExistente = this.getMedicoPorUsuarioId(usuario.id);
      if (!medicoExistente) {
        // Se é médico mas não está na lista, adiciona automaticamente
        return this.adicionarMedicoAutomaticamente(usuario);
      }
      return medicoExistente;
    }
    return null;
  },

  /* ===========================================================
     FUNÇÕES PARA SISTEMA AUTOMÁTICO DE PACIENTES
     =========================================================== */

  // Adicionar paciente automaticamente quando usuário se cadastra como paciente
  adicionarPacienteAutomaticamente(usuario) {
    const pacientes = this.getPacientes();
    
    // Verifica se o paciente já existe pelo email
    const pacienteExistente = pacientes.find(p => p.email === usuario.email);
    if (pacienteExistente) {
      console.log('⚠️ Paciente já existe:', pacienteExistente.nome);
      return pacienteExistente;
    }
    
    // Cria novo paciente
    const novoPaciente = {
      id: Date.now().toString(),
      nome: usuario.nome,
      email: usuario.email,
      telefone: '', // Pode ser preenchido depois
      dataNascimento: '',
      usuarioId: usuario.id, // Link com o usuário
      dataCadastro: new Date().toISOString(),
      status: 'ativo'
    };
    
    pacientes.push(novoPaciente);
    localStorage.setItem('AgendaMed_pacientes', JSON.stringify(pacientes));
    console.log('✅ Paciente adicionado automaticamente:', novoPaciente.nome);
    return novoPaciente;
  },

  /* ===========================================================
     FUNÇÕES PARA CONTAS DEMO (ATUALIZADAS)
     =========================================================== */

  // Criar contas de demonstração
  criarContasDemo() {
    const usuarios = this.getUsuarios();
    
    // Conta demo clínica (admin)
    if (!usuarios.find(u => u.email === 'clinica@AgendaMed.com')) {
      const clinicaDemo = this.criarUsuario('Clínica Saúde Total', 'clinica@AgendaMed.com', 'senha123');
      if (clinicaDemo) {
        const usuariosAtualizados = this.getUsuarios();
        const usuarioIndex = usuariosAtualizados.findIndex(u => u.id === clinicaDemo.id);
        if (usuarioIndex !== -1) {
          usuariosAtualizados[usuarioIndex].tipo = 'clinica';
          usuariosAtualizados[usuarioIndex].tipoClinica = 'admin';
          localStorage.setItem('AgendaMed_usuarios', JSON.stringify(usuariosAtualizados));
        }
      }
    }
    
    // Conta demo médico
    if (!usuarios.find(u => u.email === 'medico@AgendaMed.com')) {
      const medicoDemo = this.criarUsuario('Dr. Carlos Silva', 'medico@AgendaMed.com', 'senha123');
      if (medicoDemo) {
        const usuariosAtualizados = this.getUsuarios();
        const usuarioIndex = usuariosAtualizados.findIndex(u => u.id === medicoDemo.id);
        if (usuarioIndex !== -1) {
          usuariosAtualizados[usuarioIndex].tipo = 'clinica';
          usuariosAtualizados[usuarioIndex].tipoClinica = 'medico';
          localStorage.setItem('AgendaMed_usuarios', JSON.stringify(usuariosAtualizados));
          
          // Adiciona automaticamente como médico
          this.adicionarMedicoAutomaticamente(usuariosAtualizados[usuarioIndex]);
        }
      }
    }

    // Conta demo secretário
    if (!usuarios.find(u => u.email === 'secretario@AgendaMed.com')) {
      const secretarioDemo = this.criarUsuario('Ana Secretária', 'secretario@AgendaMed.com', 'senha123');
      if (secretarioDemo) {
        const usuariosAtualizados = this.getUsuarios();
        const usuarioIndex = usuariosAtualizados.findIndex(u => u.id === secretarioDemo.id);
        if (usuarioIndex !== -1) {
          usuariosAtualizados[usuarioIndex].tipo = 'clinica';
          usuariosAtualizados[usuarioIndex].tipoClinica = 'secretario';
          localStorage.setItem('AgendaMed_usuarios', JSON.stringify(usuariosAtualizados));
        }
      }
    }
    
    // Conta demo paciente
    if (!usuarios.find(u => u.email === 'paciente@AgendaMed.com')) {
      const pacienteDemo = this.criarUsuario('João Paciente', 'paciente@AgendaMed.com', 'senha123');
      if (pacienteDemo) {
        const usuariosAtualizados = this.getUsuarios();
        const usuarioIndex = usuariosAtualizados.findIndex(u => u.id === pacienteDemo.id);
        if (usuarioIndex !== -1) {
          usuariosAtualizados[usuarioIndex].tipo = 'paciente';
          localStorage.setItem('AgendaMed_usuarios', JSON.stringify(usuariosAtualizados));
          
          // Adiciona também como paciente automaticamente
          this.adicionarPacienteAutomaticamente(usuariosAtualizados[usuarioIndex]);
        }
      }
    }
  }
};

// Inicializa dados
Storage.init();

// Cria contas demo automaticamente
Storage.criarContasDemo();