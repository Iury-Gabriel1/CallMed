/* ===========================================================
   CallMed - app.js
   Storage + Notificações + Main + Login + Configurações
   =========================================================== */

const Storage = {
  init() {
    if (!localStorage.getItem('CallMed_user_photos')) {
      localStorage.setItem('CallMed_user_photos', JSON.stringify({}));
    }
  },

  salvarFotoUsuario(userId, fotoData) {
    const fotos = JSON.parse(localStorage.getItem('CallMed_user_photos') || '{}');
    fotos[userId] = fotoData;
    localStorage.setItem('CallMed_user_photos', JSON.stringify(fotos));
    const usuarioLogado = this.getUsuarioLogado();
    if (usuarioLogado && usuarioLogado.id == userId) {
      usuarioLogado.foto = fotoData;
      localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
    }
  },

  getFotoUsuario(userId) {
    const fotos = JSON.parse(localStorage.getItem('CallMed_user_photos') || '{}');
    return fotos[userId] || null;
  },

  removerFotoUsuario(userId) {
    const fotos = JSON.parse(localStorage.getItem('CallMed_user_photos') || '{}');
    delete fotos[userId];
    localStorage.setItem('CallMed_user_photos', JSON.stringify(fotos));
  },

  temFotoCustomizada(userId) {
    return !!this.getFotoUsuario(userId);
  },

  getUsuarioLogado() {
    return JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
  },

  logout() {
    localStorage.removeItem('usuarioLogado');
  },

  getPacientePorUsuarioId(usuarioId) {
    return this.getPacientes().find(paciente => paciente.usuarioId == usuarioId || paciente.id == usuarioId);
  },

  criarPacienteParaUsuario(usuarioId, dadosPaciente) {
    const usuario = this.getUsuarios().find(u => u.id == usuarioId);
    if (!usuario) return null;
    return this.salvarPaciente({
      ...dadosPaciente,
      nome: dadosPaciente.nome || usuario.nome,
      email: dadosPaciente.email || usuario.email,
      usuarioId,
      status: 'ativo'
    });
  },

  getMedicoPorUsuarioId(usuarioId) {
    return this.getMedicos().find(medico => medico.usuarioId == usuarioId);
  },

  adicionarMedicoAutomaticamente(usuario) {
    return this.getMedicos().find(medico => medico.email === usuario.email) || null;
  },

  getMedicosPorClinica(clinicaId) {
    return this.getMedicos().filter(medico => medico.clinicaId == clinicaId);
  },

  getAgendamentosPorPaciente(pacienteId) {
    return this.getAgendamentos().filter(agendamento => agendamento.pacienteId == pacienteId);
  },

  salvarConfiguracaoUsuario(usuarioId, chave, dados) {
    const storageKey = `CallMed_config_${usuarioId}`;
    const configs = JSON.parse(localStorage.getItem(storageKey) || '{}');
    configs[chave] = dados;
    localStorage.setItem(storageKey, JSON.stringify(configs));
    return dados;
  },

  getConfiguracaoUsuario(usuarioId, chave) {
    const configs = JSON.parse(localStorage.getItem(`CallMed_config_${usuarioId}`) || '{}');
    return configs[chave] || null;
  },

  getInfoProfissionalMedico(usuarioId) {
    return this.getConfiguracaoUsuario(usuarioId, 'info_profissional');
  },

  getMatchmakingMedico(usuarioId) {
    return this.getConfiguracaoUsuario(usuarioId, 'matchmaking');
  },

  salvarInfoProfissionalMedico(usuarioId, dados) {
    return this.salvarConfiguracaoUsuario(usuarioId, 'info_profissional', dados);
  },

  salvarMatchmakingMedico(usuarioId, dados) {
    return this.salvarConfiguracaoUsuario(usuarioId, 'matchmaking', dados);
  },

  getMedicoCompletoParaChatbot(medicoId) {
    const medico = this.getMedicos().find(item => item.id == medicoId);
    return medico || null;
  },

  listarMedicosCompletosParaChatbot() {
    return this.getMedicos();
  },

  // ========== MÉDICOS ==========
  getMedicos() {
    return JSON.parse(localStorage.getItem('CallMed_medicos') || '[]');
  },

  salvarMedico(medico) {
    const medicos = this.getMedicos();
    if (medico.id) {
      const index = medicos.findIndex(m => m.id == medico.id);
      if (index !== -1) {
        const medicoExistente = medicos[index];
        medico = {
          ...medicoExistente,
          ...medico,
          id: medicoExistente.id,
          usuarioId: medicoExistente.usuarioId,
          dataCadastro: medicoExistente.dataCadastro
        };
        medicos[index] = medico;
      } else {
        return null;
      }
    } else {
      medico.id = Date.now();
      medico.dataCadastro = new Date().toISOString();
      medico.status = 'ativo';
      medicos.push(medico);
    }
    localStorage.setItem('CallMed_medicos', JSON.stringify(medicos));
    return medico;
  },

  excluirMedico(id) {
    const medicos = this.getMedicos().filter(m => m.id != id);
    localStorage.setItem('CallMed_medicos', JSON.stringify(medicos));
  },

  getMedicoPorUsuarioId(usuarioId) {
    return this.getMedicos().find(medico => medico.usuarioId == usuarioId);
  },

  adicionarMedicoAutomaticamente(usuario) {
    const medicos = this.getMedicos();
    const medicoExistente = medicos.find(m => m.email === usuario.email);
    if (medicoExistente) return medicoExistente;
    
    const novoMedico = {
      id: Date.now().toString(),
      nome: usuario.nome,
      email: usuario.email,
      telefone: '',
      especialidade: 'Clínico Geral',
      crm: '',
      usuarioId: usuario.id,
      clinicaId: null,
      dataCadastro: new Date().toISOString(),
      status: 'ativo'
    };
    
    medicos.push(novoMedico);
    localStorage.setItem('CallMed_medicos', JSON.stringify(medicos));
    return novoMedico;
  },

  // ========== CLÍNICAS ==========
  getClinicas() {
    return JSON.parse(localStorage.getItem('CallMed_clinicas') || '[]');
  },

  salvarClinica(clinica) {
    const clinicas = this.getClinicas();
    if (clinica.id) {
      const index = clinicas.findIndex(c => c.id == clinica.id);
      if (index !== -1) {
        const clinicaExistente = clinicas[index];
        clinica = {
          ...clinicaExistente,
          ...clinica,
          id: clinicaExistente.id,
          dataCadastro: clinicaExistente.dataCadastro
        };
        clinicas[index] = clinica;
      } else {
        return null;
      }
    } else {
      clinica.id = Date.now().toString();
      clinica.dataCadastro = new Date().toISOString();
      clinica.status = clinica.status || 'ativo';
      clinicas.push(clinica);
    }
    localStorage.setItem('CallMed_clinicas', JSON.stringify(clinicas));
    return clinica;
  },

  excluirClinica(id) {
    const clinicas = this.getClinicas().filter(c => c.id != id);
    localStorage.setItem('CallMed_clinicas', JSON.stringify(clinicas));
  },

  getClinicaPorId(id) {
    return this.getClinicas().find(c => c.id == id) || null;
  },

  getClinicasAtivas() {
    return this.getClinicas().filter(c => c.status === 'ativo');
  },

  getMedicosPorClinica(clinicaId) {
    return this.getMedicos().filter(m => m.clinicaId == clinicaId);
  },

  vincularMedicoClinica(medicoId, clinicaId) {
    const medicos = this.getMedicos();
    const index = medicos.findIndex(m => m.id == medicoId);
    if (index !== -1) {
      medicos[index].clinicaId = clinicaId;
      localStorage.setItem('CallMed_medicos', JSON.stringify(medicos));
      return true;
    }
    return false;
  },

  // ========== AGENDAMENTOS ==========
  getAgendamentos() {
    return JSON.parse(localStorage.getItem('CallMed_agendamentos') || '[]');
  },

  salvarAgendamento(agendamento) {
    const agendamentos = this.getAgendamentos();
    
    if (agendamento.pacienteId) agendamento.pacienteId = parseInt(agendamento.pacienteId);
    if (agendamento.medicoId) agendamento.medicoId = parseInt(agendamento.medicoId);
    
    if (agendamento.id) {
      const index = agendamentos.findIndex(a => a.id === agendamento.id);
      if (index !== -1) agendamentos[index] = agendamento;
    } else {
      agendamento.id = Date.now();
      
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
      
      agendamento.status = agendamento.status || 'agendado';
      agendamento.data = agendamento.data || new Date().toISOString().split('T')[0];
      agendamentos.push(agendamento);
    }
    
    localStorage.setItem('CallMed_agendamentos', JSON.stringify(agendamentos));
    return agendamento;
  },

  excluirAgendamento(id) {
    const agendamentos = this.getAgendamentos().filter(a => a.id !== id);
    localStorage.setItem('CallMed_agendamentos', JSON.stringify(agendamentos));
  },

  getAgendamentosPorPaciente(pacienteId) {
    return this.getAgendamentos().filter(a => a.pacienteId == pacienteId);
  },

  // ========== CONFIGURAÇÕES ==========
  getConfiguracoes() {
    return JSON.parse(localStorage.getItem('CallMed_config') || '{"tema":"light","notificacoes":true}');
  },

  salvarConfiguracoes(config) {
    localStorage.setItem('CallMed_config', JSON.stringify(config));
  },

  salvarConfiguracaoUsuario(usuarioId, chave, dados) {
    const chaveStorage = `CallMed_config_${usuarioId}`;
    const configs = JSON.parse(localStorage.getItem(chaveStorage) || '{}');
    configs[chave] = dados;
    localStorage.setItem(chaveStorage, JSON.stringify(configs));
    return dados;
  },

  getConfiguracaoUsuario(usuarioId, chave) {
    const chaveStorage = `CallMed_config_${usuarioId}`;
    const configs = JSON.parse(localStorage.getItem(chaveStorage) || '{}');
    return configs[chave] || null;
  },

  getTodasConfiguracoesUsuario(usuarioId) {
    const chaveStorage = `CallMed_config_${usuarioId}`;
    return JSON.parse(localStorage.getItem(chaveStorage) || '{}');
  },

  removerConfiguracaoUsuario(usuarioId, chave) {
    const chaveStorage = `CallMed_config_${usuarioId}`;
    const configs = JSON.parse(localStorage.getItem(chaveStorage) || '{}');
    delete configs[chave];
    localStorage.setItem(chaveStorage, JSON.stringify(configs));
  },

  salvarInfoProfissionalMedico(usuarioId, dados) {
    return this.salvarConfiguracaoUsuario(usuarioId, 'info_profissional', dados);
  },

  getInfoProfissionalMedico(usuarioId) {
    return this.getConfiguracaoUsuario(usuarioId, 'info_profissional');
  },

  salvarMatchmakingMedico(usuarioId, dados) {
    return this.salvarConfiguracaoUsuario(usuarioId, 'matchmaking', dados);
  },

  getMatchmakingMedico(usuarioId) {
    return this.getConfiguracaoUsuario(usuarioId, 'matchmaking');
  },

  // ========== CHATBOT ==========
  getMedicoCompletoParaChatbot(medicoId) {
    const medico = this.getMedicos().find(m => m.id == medicoId);
    if (!medico) return null;
    
    const usuarioMedico = this.getUsuarios().find(u => u.id == medico.usuarioId);
    const infoProfissional = this.getInfoProfissionalMedico(medico.usuarioId);
    const matchmaking = this.getMatchmakingMedico(medico.usuarioId);
    
    return {
      id: medico.id,
      nome: medico.nome,
      email: medico.email,
      telefone: medico.telefone,
      especialidade: medico.especialidade,
      crm: medico.crm,
      experiencia: medico.experiencia,
      avaliacao: medico.avaliacao,
      usuarioId: medico.usuarioId,
      usuarioNome: usuarioMedico?.nome,
      infoProfissional: infoProfissional || {},
      matchmaking: matchmaking || {}
    };
  },

  listarMedicosCompletosParaChatbot() {
    return this.getMedicos().map(m => this.getMedicoCompletoParaChatbot(m.id)).filter(Boolean);
  },

  // ========== CONTAS DEMO ==========
  criarContasDemo() {
    const usuarios = this.getUsuarios();
    
    if (!usuarios.find(u => u.email === 'admin@CallMed.com')) {
      const admin = this.criarUsuario('Administrador', 'admin@CallMed.com', 'admin123');
      if (admin) {
        const u = this.getUsuarios();
        const i = u.findIndex(x => x.id === admin.id);
        if (i !== -1) {
          u[i].tipo = 'clinica';
          u[i].tipoClinica = 'admin';
          localStorage.setItem('CallMed_usuarios', JSON.stringify(u));
        }
      }
    }

    if (!usuarios.find(u => u.email === 'clinica@CallMed.com')) {
      const clinica = this.criarUsuario('Clínica Saúde Total', 'clinica@CallMed.com', 'senha123');
      if (clinica) {
        const u = this.getUsuarios();
        const i = u.findIndex(x => x.id === clinica.id);
        if (i !== -1) {
          u[i].tipo = 'clinica';
          u[i].tipoClinica = 'admin';
          localStorage.setItem('CallMed_usuarios', JSON.stringify(u));
          
          this.salvarClinica({
            nome: 'Clínica Saúde Total',
            cnpj: '00.000.000/0001-00',
            telefone: '(11) 9999-8888',
            email: 'clinica@CallMed.com',
            endereco: 'Rua Exemplo, 123 - Centro',
            horario_inicio: '08:00',
            horario_fim: '18:00',
            especialidades: ['Clínica Médica', 'Cardiologia', 'Pediatria'],
            status: 'ativo'
          });
        }
      }
    }
    
    if (!usuarios.find(u => u.email === 'medico@CallMed.com')) {
      const medico = this.criarUsuario('Dr. Carlos Silva', 'medico@CallMed.com', 'senha123');
      if (medico) {
        const u = this.getUsuarios();
        const i = u.findIndex(x => x.id === medico.id);
        if (i !== -1) {
          u[i].tipo = 'clinica';
          u[i].tipoClinica = 'medico';
          localStorage.setItem('CallMed_usuarios', JSON.stringify(u));
          this.adicionarMedicoAutomaticamente(u[i]);
        }
      }
    }

    if (!usuarios.find(u => u.email === 'secretario@CallMed.com')) {
      const secretario = this.criarUsuario('Ana Secretária', 'secretario@CallMed.com', 'senha123');
      if (secretario) {
        const u = this.getUsuarios();
        const i = u.findIndex(x => x.id === secretario.id);
        if (i !== -1) {
          u[i].tipo = 'clinica';
          u[i].tipoClinica = 'secretario';
          localStorage.setItem('CallMed_usuarios', JSON.stringify(u));
        }
      }
    }
    
    if (!usuarios.find(u => u.email === 'paciente@CallMed.com')) {
      const paciente = this.criarUsuario('João Paciente', 'paciente@CallMed.com', 'senha123');
      if (paciente) {
        const u = this.getUsuarios();
        const i = u.findIndex(x => x.id === paciente.id);
        if (i !== -1) {
          u[i].tipo = 'paciente';
          localStorage.setItem('CallMed_usuarios', JSON.stringify(u));
          this.adicionarPacienteAutomaticamente(u[i]);
        }
      }
    }
  },

  adicionarPacienteAutomaticamente(usuario) {
    const pacientes = this.getPacientes();
    const pacienteExistente = pacientes.find(p => p.email === usuario.email);
    if (pacienteExistente) return pacienteExistente;
    
    const novoPaciente = {
      id: Date.now().toString(),
      nome: usuario.nome,
      email: usuario.email,
      telefone: '',
      dataNascimento: '',
      usuarioId: usuario.id,
      dataCadastro: new Date().toISOString(),
      status: 'ativo'
    };
    
    pacientes.push(novoPaciente);
    localStorage.setItem('CallMed_pacientes', JSON.stringify(pacientes));
    return novoPaciente;
  },

  buscarMedicosPorSintomas(sintomas) {
    const mapeamentoSintomas = {
      'Cardiologia': ['coracao', 'cardiaco', 'pressao', 'arterial', 'dor no peito', 'palpitacao', 'arritmia', 'taquicardia', 'falta de ar'],
      'Dermatologia': ['pele', 'mancha', 'coceira', 'erupcao', 'acne', 'eczema', 'psoriase'],
      'Pediatria': ['crianca', 'bebe', 'infantil', 'pediatrico'],
      'Ortopedia': ['osso', 'fratura', 'articulacao', 'joelho', 'coluna', 'ombro'],
      'Oftalmologia': ['olho', 'visao', 'miopia', 'astigmatismo', 'catarata'],
      'Psiquiatria': ['mental', 'ansiedade', 'depressao', 'estresse', 'insonia'],
      'Ginecologia': ['menstruacao', 'colica', 'corrimento', 'gestacao', 'gravidez'],
      'Otorrinolaringologia': ['garganta', 'ouvido', 'nariz', 'sinusite', 'rinite'],
      'Neurologia': ['dor de cabeca', 'cefaleia', 'enxaqueca', 'convulsao'],
      'Endocrinologia': ['diabetes', 'hormonal', 'tireoide', 'obesidade'],
      'Urologia': ['urina', 'urinario', 'rim', 'prostata'],
      'Alergologia': ['alergia', 'asma', 'dermatite'],
      'Nutrologia': ['alimentacao', 'nutricao', 'peso', 'dieta'],
      'Geriatria': ['idoso', 'envelhecimento', 'quedas'],
      'Clínico Geral': ['febre', 'gripe', 'resfriado', 'dor', 'mal estar', 'checkup']
    };

    const sintomasLower = sintomas.toLowerCase();
    const especialidadesEncontradas = new Set();

    for (const [sintoma, especialidade] of Object.entries(mapeamentoSintomas)) {
      if (sintomasLower.includes(sintoma)) {
        especialidadesEncontradas.add(especialidade);
      }
    }

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
  }
};

/* ===========================================================
   API PRINCIPAL
   =========================================================== */

const API_URL = 'http://localhost:5000/api';

async function apiRequest(endpoint, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
  } catch (error) {
    throw new Error('Backend indisponível. Verifique se a API está em execução.');
  }

  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (response.status === 401) {
    Storage.logout();
    throw new Error('Sessão expirada. Faça login novamente.');
  }
  if (!response.ok) throw new Error(data?.erro || 'Erro na requisição');
  return data;
}

const apiList = data => Array.isArray(data) ? data : data?.data || [];

Storage._cache = { usuarios: [], pacientes: [], medicos: [], agendamentos: [], clinicas: [] };
Storage._config = { tema: 'light', notificacoes: true };

Storage.init = async function() {
  const responses = await Promise.allSettled([
    apiRequest('/usuarios'),
    apiRequest('/pacientes'),
    apiRequest('/medicos'),
    apiRequest('/agendamentos'),
    apiRequest('/clinicas'),
    apiRequest('/config')
  ]);
  const [usuarios, pacientes, medicos, agendamentos, clinicas, config] = responses;
  if (usuarios.status === 'fulfilled') this._cache.usuarios = apiList(usuarios.value);
  if (pacientes.status === 'fulfilled') this._cache.pacientes = apiList(pacientes.value);
  if (medicos.status === 'fulfilled') this._cache.medicos = apiList(medicos.value);
  if (agendamentos.status === 'fulfilled') this._cache.agendamentos = apiList(agendamentos.value);
  if (clinicas.status === 'fulfilled') this._cache.clinicas = apiList(clinicas.value);
  if (config.status === 'fulfilled') this._config = config.value;
  window.dispatchEvent(new CustomEvent('storageReady'));
  return this._cache;
};

Storage.getUsuarios = () => Storage._cache.usuarios;
Storage.getPacientes = () => Storage._cache.pacientes;
Storage.getMedicos = () => Storage._cache.medicos;
Storage.getAgendamentos = () => Storage._cache.agendamentos;
Storage.getClinicas = () => Storage._cache.clinicas;
Storage.getConfiguracoes = () => Storage._config;
Storage.getPacientePorUsuarioId = usuarioId => Storage._cache.pacientes.find(
  paciente => paciente.usuarioId == usuarioId || paciente.id == usuarioId
);
Storage.criarPacienteParaUsuario = async function(usuarioId, dadosPaciente) {
  const usuario = this._cache.usuarios.find(item => item.id == usuarioId);
  if (!usuario) return null;
  return this.salvarPaciente({
    ...dadosPaciente,
    nome: dadosPaciente.nome || usuario.nome,
    email: dadosPaciente.email || usuario.email,
    usuarioId,
    status: 'ativo'
  });
};

Storage.login = async function(email, senha) {
  const result = await apiRequest('/login', { method: 'POST', body: JSON.stringify({ email, senha }) });
  const user = result.usuario || result;
  localStorage.setItem('usuarioLogado', JSON.stringify(user));
  return user;
};

Storage.criarUsuario = async function(nome, email, senha, tipo = 'paciente') {
  const result = await apiRequest('/cadastro', {
    method: 'POST',
    body: JSON.stringify({ nome, email, senha, tipo })
  });
  const user = result.usuario || result;
  this._cache.usuarios.push(user);
  return user;
};

Storage.salvarPaciente = async function(paciente) {
  const result = await apiRequest('/pacientes', { method: 'POST', body: JSON.stringify(paciente) });
  const saved = result.paciente || result;
  this._cache.pacientes = paciente.id
    ? this._cache.pacientes.map(item => item.id == paciente.id ? saved : item)
    : [...this._cache.pacientes, saved];
  return saved;
};
Storage.excluirPaciente = async function(id) {
  await apiRequest(`/pacientes/${id}`, { method: 'DELETE' });
  this._cache.pacientes = this._cache.pacientes.filter(item => item.id != id);
};
Storage.salvarMedico = async function(medico) {
  const result = await apiRequest('/medicos', { method: 'POST', body: JSON.stringify(medico) });
  const saved = result.medico || result;
  this._cache.medicos = medico.id
    ? this._cache.medicos.map(item => item.id == medico.id ? saved : item)
    : [...this._cache.medicos, saved];
  return saved;
};
Storage.excluirMedico = async function(id) {
  await apiRequest(`/medicos/${id}`, { method: 'DELETE' });
  this._cache.medicos = this._cache.medicos.filter(item => item.id != id);
};
Storage.salvarClinica = async function(clinica) {
  const result = await apiRequest('/clinicas', { method: 'POST', body: JSON.stringify(clinica) });
  const saved = result.clinica || result;
  this._cache.clinicas = clinica.id
    ? this._cache.clinicas.map(item => item.id == clinica.id ? saved : item)
    : [...this._cache.clinicas, saved];
  return saved;
};
Storage.excluirClinica = async function(id) {
  await apiRequest(`/clinicas/${id}`, { method: 'DELETE' });
  this._cache.clinicas = this._cache.clinicas.filter(item => item.id != id);
};
Storage.salvarAgendamento = async function(agendamento) {
  const paciente = this._cache.pacientes.find(item => item.id == agendamento.pacienteId);
  const medico = this._cache.medicos.find(item => item.id == agendamento.medicoId);
  const payload = {
    ...agendamento,
    pacienteId: Number(agendamento.pacienteId),
    medicoId: Number(agendamento.medicoId),
    pacienteNome: agendamento.pacienteNome || paciente?.nome,
    pacienteTelefone: agendamento.pacienteTelefone || paciente?.telefone,
    medicoNome: agendamento.medicoNome || medico?.nome,
    medicoEspecialidade: agendamento.medicoEspecialidade || medico?.especialidade
  };
  const result = await apiRequest(payload.id ? '/agendamentos' : '/agenda', {
    method: 'POST', body: JSON.stringify(payload)
  });
  const saved = result.agendamento || result;
  this._cache.agendamentos = payload.id
    ? this._cache.agendamentos.map(item => item.id == payload.id ? saved : item)
    : [...this._cache.agendamentos, saved];
  return saved;
};
Storage.excluirAgendamento = async function(id) {
  await apiRequest(`/agenda/${id}`, { method: 'DELETE' });
  this._cache.agendamentos = this._cache.agendamentos.filter(item => item.id != id);
};
Storage.salvarConfiguracoes = async function(config) {
  this._config = await apiRequest('/config', { method: 'POST', body: JSON.stringify(config) });
  return this._config;
};
Storage.getPerfil = usuarioId => apiRequest(`/perfil/${usuarioId}`);
Storage.salvarPerfil = (usuarioId, dados) => apiRequest(`/perfil/${usuarioId}`, {
  method: 'PUT', body: JSON.stringify(dados)
});
Storage.buscarMatchmaking = dados => apiRequest('/matchmaking', {
  method: 'POST', body: JSON.stringify(dados)
});
Storage.buscarMatchmakingPrioritario = dados => apiRequest('/matchmaking', {
  method: 'POST',
  body: JSON.stringify({
    pacienteId: dados.pacienteId,
    necessidade: dados.necessidade,
    sintomas: dados.sintomas || [],
    data: dados.data,
    hora: dados.hora
  })
});
Storage.buscarTriagem = dados => apiRequest('/triagem', {
  method: 'POST',
  body: JSON.stringify({
    pacienteId: dados.pacienteId,
    necessidade: dados.necessidade,
    sintomas: dados.sintomas || []
  })
});
Storage.ready = Storage.init();

/* ===========================================================
   PARTE 2: NOTIFICAÇÕES
   =========================================================== */

const Notificacao = {
  container: null,

  init: () => {
    if (!Notificacao.container) {
      Notificacao.container = document.createElement("div");
      Notificacao.container.id = "notificacaoContainer";
      Notificacao.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 300px;
      `;
      document.body.appendChild(Notificacao.container);
      
      const style = document.createElement('style');
      style.textContent = `
        .notificacao {
          background: white;
          padding: 12px 16px;
          margin-bottom: 10px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          border-left: 4px solid #007bff;
          transform: translateX(100%);
          transition: transform 0.3s ease;
        }
        .notificacao.show { transform: translateX(0); }
        .notificacao.success { border-left-color: #28a745; }
        .notificacao.warning { border-left-color: #ffc107; }
        .notificacao.error { border-left-color: #dc3545; }
      `;
      document.head.appendChild(style);
    }
  },

  show: (mensagem, tipo = "info", duracao = 3000) => {
    Notificacao.init();

    const popup = document.createElement("div");
    popup.className = `notificacao ${tipo}`;
    popup.textContent = mensagem;
    Notificacao.container.appendChild(popup);

    setTimeout(() => popup.classList.add("show"), 10);

    setTimeout(() => {
      popup.classList.remove("show");
      setTimeout(() => {
        if (popup.parentNode) popup.parentNode.removeChild(popup);
      }, 300);
    }, duracao);
  }
};

/* ===========================================================
   PARTE 3: MAIN + TEMA GLOBAL
   =========================================================== */

function aplicarTemaGlobal() {
  const config = Storage.getConfiguracoes();
  document.documentElement.setAttribute('data-theme', config.tema);
  
  setTimeout(() => {
    const elementos = document.querySelectorAll('body, .card, .modal-content, table, .header, .nav, .container');
    elementos.forEach(el => {
      if (el) el.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    });
  }, 100);
}

function carregarFotoUsuario(user) {
  const welcomePhoto = document.getElementById('welcomePhoto');
  const welcomePlaceholder = document.getElementById('welcomePlaceholder');
  const fotoCustomizada = Storage.getFotoUsuario(user.id);
  
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
      
      if (fotoInicial) {
        const initials = user.nome ? user.nome.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
        fotoInicial.textContent = initials.substring(0, 2);
      }
    }
  }
}

function registrarServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => console.log('Service Worker registrado: ', registration))
        .catch(err => console.log('Falha no Service Worker: ', err));
    });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log('=== CallMed INICIANDO ===');

  await Storage.ready;
  
  aplicarTemaGlobal();
  
  if (!window.location.href.includes('login.html')) {
    const user = Storage.getUsuarioLogado();
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    carregarFotoUsuario(user);
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      Storage.logout();
      window.location.href = "login.html";
    });
  }

  if (typeof Notificacao !== "undefined") {
    Notificacao.init();
  }

  registrarServiceWorker();
  
  console.log('=== CallMed INICIALIZADO ===');
});

window.addEventListener('storage', function(e) {
  if (e.key === 'CallMed_config') {
    aplicarTemaGlobal();
  }
});

window.addEventListener('temaAlterado', function(e) {
  aplicarTemaGlobal();
});

/* ===========================================================
   PARTE 5: CONFIGURAÇÕES
   =========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  if (!window.location.pathname.includes('configuracoes.html') && 
      !window.location.pathname.includes('paciente-configuracoes.html')) {
    return;
  }

  const user = Storage.getUsuarioLogado();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  carregarPerfilConfig(user);
  configurarTema();
  configurarBackupConfig();
  configurarPerfilConfig(user);
});

function carregarPerfilConfig(user) {
  const userNameDisplay = document.getElementById('userNameDisplay');
  const userEmailDisplay = document.getElementById('userEmailDisplay');
  const userNome = document.getElementById('userNome');
  const userEmail = document.getElementById('userEmail');
  const userTelefone = document.getElementById('userTelefone');
  
  if (userNameDisplay) userNameDisplay.textContent = user.nome || 'Usuário';
  if (userEmailDisplay) userEmailDisplay.textContent = user.email || '';
  if (userNome) userNome.value = user.nome || '';
  if (userEmail) userEmail.value = user.email || '';
  if (userTelefone) userTelefone.value = user.telefone || '';
  
  const fotoCustomizada = Storage.getFotoUsuario(user.id);
  const fotoPreview = document.getElementById('fotoPreview');
  const fotoPlaceholder = document.getElementById('fotoPlaceholder');
  const fotoInicial = document.getElementById('fotoInicial');
  const btnRemoverFoto = document.getElementById('btnRemoverFoto');
  
  if (fotoPreview && fotoPlaceholder) {
    if (fotoCustomizada) {
      fotoPreview.src = fotoCustomizada;
      fotoPreview.style.display = 'block';
      fotoPlaceholder.style.display = 'none';
      if (btnRemoverFoto) btnRemoverFoto.style.display = 'inline-block';
    } else {
      fotoPreview.style.display = 'none';
      fotoPlaceholder.style.display = 'flex';
      if (btnRemoverFoto) btnRemoverFoto.style.display = 'none';
      
      const iniciais = user.nome ? 
        user.nome.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';
      if (fotoInicial) fotoInicial.textContent = iniciais;
    }
  }
}

function configurarTema() {
  const config = Storage.getConfiguracoes();
  const themeSelect = document.getElementById("themeSelect");
  const temaOptions = document.querySelectorAll('.tema-option');
  
  if (themeSelect) themeSelect.value = config.tema;
  
  temaOptions.forEach(option => {
    if (option.dataset.tema === config.tema) option.classList.add('active');
    
    option.addEventListener('click', () => {
      const novoTema = option.dataset.tema;
      if (themeSelect) themeSelect.value = novoTema;
      aplicarTema(novoTema);
      temaOptions.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
    });
  });
  
  if (themeSelect) {
    themeSelect.addEventListener("change", (e) => {
      aplicarTema(e.target.value);
      temaOptions.forEach(opt => {
        opt.classList.remove('active');
        if (opt.dataset.tema === e.target.value) opt.classList.add('active');
      });
    });
  }
}

function aplicarTema(tema) {
  document.documentElement.setAttribute('data-theme', tema);
  const novaConfig = Storage.getConfiguracoes();
  novaConfig.tema = tema;
  Storage.salvarConfiguracoes(novaConfig);
  window.dispatchEvent(new CustomEvent('temaAlterado', { detail: tema }));
  
  if (typeof Notificacao !== "undefined") {
    Notificacao.show(`Tema alterado para ${tema}`, "success");
  }
}

function configurarBackupConfig() {
  const btnExport = document.getElementById("btnExport");
  const importInput = document.getElementById("importInput");
  
  if (btnExport) btnExport.addEventListener("click", exportarBackup);
  if (importInput) importInput.addEventListener("change", importarBackup);
}

function exportarBackup() {
  const data = {
    pacientes: Storage.getPacientes(),
    medicos: Storage.getMedicos(),
    agendamentos: Storage.getAgendamentos(),
    usuarios: Storage.getUsuarios(),
    fotos: JSON.parse(localStorage.getItem('CallMed_user_photos') || '{}'),
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
  e.target.value = '';
}

function configurarPerfilConfig(user) {
  const fotoInput = document.getElementById('fotoInput');
  const perfilForm = document.getElementById('perfilForm');
  const btnRemoverFoto = document.getElementById('btnRemoverFoto');
  
  if (fotoInput) {
    fotoInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (!file) return;
      
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione uma imagem válida!');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB!');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = function(e) {
        const fotoUrl = e.target.result;
        const fotoPreview = document.getElementById('fotoPreview');
        const fotoPlaceholder = document.getElementById('fotoPlaceholder');
        
        if (fotoPreview) {
          fotoPreview.src = fotoUrl;
          fotoPreview.style.display = 'block';
        }
        if (fotoPlaceholder) fotoPlaceholder.style.display = 'none';
        
        Storage.salvarFotoUsuario(user.id, fotoUrl);
        
        if (btnRemoverFoto) btnRemoverFoto.style.display = 'inline-block';
        
        if (typeof Notificacao !== "undefined") {
          Notificacao.show("Foto de perfil atualizada!", "success");
        }
      };
      reader.readAsDataURL(file);
    });
  }
  
  if (btnRemoverFoto) {
    const fotoCustomizada = Storage.getFotoUsuario(user.id);
    btnRemoverFoto.style.display = fotoCustomizada ? 'inline-block' : 'none';
    
    btnRemoverFoto.addEventListener('click', function() {
      if (confirm('Deseja remover sua foto?')) {
        const fotoPreview = document.getElementById('fotoPreview');
        const fotoPlaceholder = document.getElementById('fotoPlaceholder');
        const fotoInicial = document.getElementById('fotoInicial');
        
        if (fotoPreview) fotoPreview.style.display = 'none';
        if (fotoPlaceholder) fotoPlaceholder.style.display = 'flex';
        
        const iniciais = user.nome ? 
          user.nome.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';
        if (fotoInicial) fotoInicial.textContent = iniciais;
        
        Storage.removerFotoUsuario(user.id);
        btnRemoverFoto.style.display = 'none';
        
        if (typeof Notificacao !== "undefined") {
          Notificacao.show("Foto removida!", "success");
        }
      }
    });
  }
  
  if (perfilForm) {
    perfilForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const usuarios = Storage.getUsuarios();
      const usuarioIndex = usuarios.findIndex(u => u.id === user.id);
      
      if (usuarioIndex !== -1) {
        usuarios[usuarioIndex].nome = document.getElementById('userNome').value;
        usuarios[usuarioIndex].email = document.getElementById('userEmail').value;
        usuarios[usuarioIndex].telefone = document.getElementById('userTelefone').value;
        
        localStorage.setItem('CallMed_usuarios', JSON.stringify(usuarios));
        
        const usuarioAtualizado = usuarios[usuarioIndex];
        localStorage.setItem('usuarioLogado', JSON.stringify(usuarioAtualizado));
        
        const userNameDisplay = document.getElementById('userNameDisplay');
        const userEmailDisplay = document.getElementById('userEmailDisplay');
        if (userNameDisplay) userNameDisplay.textContent = usuarioAtualizado.nome;
        if (userEmailDisplay) userEmailDisplay.textContent = usuarioAtualizado.email;
        
        if (typeof Notificacao !== "undefined") {
          Notificacao.show("Perfil atualizado com sucesso!", "success");
        } else {
          alert("Perfil atualizado com sucesso!");
        }
      }
    });
  }
}

/* ===========================================================
   INICIALIZAÇÃO FINAL
   =========================================================== */

console.log('✅ App Core inicializado com API');