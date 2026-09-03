/* ===========================================================
   AgendaMed - storage.js (VERSÃO COMPLETAMENTE CORRIGIDA)
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
    if (!localStorage.getItem('AgendaMed_clinicas')) {
      localStorage.setItem('AgendaMed_clinicas', JSON.stringify([]));
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

  salvarFotoUsuario(userId, fotoData) {
    const fotos = JSON.parse(localStorage.getItem('AgendaMed_user_photos') || '{}');
    fotos[userId] = fotoData;
    localStorage.setItem('AgendaMed_user_photos', JSON.stringify(fotos));
    
    const usuarios = this.getUsuarios();
    const usuarioIndex = usuarios.findIndex(u => u.id == userId);
    if (usuarioIndex !== -1) {
        usuarios[usuarioIndex].foto = fotoData;
        localStorage.setItem('AgendaMed_usuarios', JSON.stringify(usuarios));
        
        const usuarioLogado = this.getUsuarioLogado();
        if (usuarioLogado && usuarioLogado.id == userId) {
            usuarioLogado.foto = fotoData;
            localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
        }
    }
  },

  getFotoUsuario(userId) {
    const fotos = JSON.parse(localStorage.getItem('AgendaMed_user_photos') || '{}');
    return fotos[userId] || null;
  },

  removerFotoUsuario(userId) {
    const fotos = JSON.parse(localStorage.getItem('AgendaMed_user_photos') || '{}');
    delete fotos[userId];
    localStorage.setItem('AgendaMed_user_photos', JSON.stringify(fotos));
  },

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

  getPacientePorUsuarioId(usuarioId) {
    const pacientes = this.getPacientes();
    return pacientes.find(paciente => paciente.usuarioId == usuarioId);
  },

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
     MÉDICOS
     =========================================================== */
  getMedicos() {
    return JSON.parse(localStorage.getItem('AgendaMed_medicos') || '[]');
  },

  salvarMedico(medico) {
    const medicos = this.getMedicos();
    console.log('💾 Salvando médico:', medico);
    
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
        console.log('✅ Médico editado:', medico);
      } else {
        console.error('❌ Médico não encontrado para edição ID:', medico.id);
        return null;
      }
    } else {
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

  getMedicoPorUsuarioId(usuarioId) {
    const medicos = this.getMedicos();
    return medicos.find(medico => medico.usuarioId == usuarioId);
  },

  adicionarMedicoAutomaticamente(usuario) {
    const medicos = this.getMedicos();
    const medicoExistente = medicos.find(m => m.email === usuario.email);
    if (medicoExistente) {
      console.log('⚠️ Médico já existe:', medicoExistente.nome);
      return medicoExistente;
    }
    
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
    localStorage.setItem('AgendaMed_medicos', JSON.stringify(medicos));
    console.log('✅ Médico adicionado automaticamente:', novoMedico.nome);
    return novoMedico;
  },

  /* ===========================================================
     CLÍNICAS
     =========================================================== */
  getClinicas() {
    return JSON.parse(localStorage.getItem('AgendaMed_clinicas') || '[]');
  },

  salvarClinica(clinica) {
    const clinicas = this.getClinicas();
    console.log('💾 Salvando clínica:', clinica);
    
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
        console.log('✅ Clínica editada:', clinica);
      } else {
        console.error('❌ Clínica não encontrada para edição ID:', clinica.id);
        return null;
      }
    } else {
      clinica.id = Date.now().toString();
      clinica.dataCadastro = new Date().toISOString();
      clinica.status = clinica.status || 'ativo';
      clinicas.push(clinica);
      console.log('✅ Nova clínica criada:', clinica);
    }
    
    localStorage.setItem('AgendaMed_clinicas', JSON.stringify(clinicas));
    return clinica;
  },

  excluirClinica(id) {
    console.log('🗑️ Excluindo clínica ID:', id);
    const clinicas = this.getClinicas().filter(c => c.id != id);
    localStorage.setItem('AgendaMed_clinicas', JSON.stringify(clinicas));
    console.log('✅ Clínica excluída. Total restante:', clinicas.length);
  },

  getClinicaPorId(id) {
    const clinicas = this.getClinicas();
    return clinicas.find(c => c.id == id) || null;
  },

  getClinicasAtivas() {
    const clinicas = this.getClinicas();
    return clinicas.filter(c => c.status === 'ativo');
  },

  getMedicosPorClinica(clinicaId) {
    const medicos = this.getMedicos();
    return medicos.filter(m => m.clinicaId == clinicaId);
  },

  vincularMedicoClinica(medicoId, clinicaId) {
    const medicos = this.getMedicos();
    const index = medicos.findIndex(m => m.id == medicoId);
    if (index !== -1) {
      medicos[index].clinicaId = clinicaId;
      localStorage.setItem('AgendaMed_medicos', JSON.stringify(medicos));
      return true;
    }
    return false;
  },

  /* ===========================================================
     AGENDAMENTOS
     =========================================================== */
  getAgendamentos() {
    return JSON.parse(localStorage.getItem('AgendaMed_agendamentos') || '[]');
  },

  salvarAgendamento(agendamento) {
    const agendamentos = this.getAgendamentos();
    console.log('💾 Salvando agendamento:', agendamento);
    
    if (agendamento.pacienteId) agendamento.pacienteId = parseInt(agendamento.pacienteId);
    if (agendamento.medicoId) agendamento.medicoId = parseInt(agendamento.medicoId);
    
    if (agendamento.id) {
      const index = agendamentos.findIndex(a => a.id === agendamento.id);
      if (index !== -1) {
        agendamentos[index] = agendamento;
      }
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
    
    localStorage.setItem('AgendaMed_agendamentos', JSON.stringify(agendamentos));
    console.log('✅ Agendamento salvo:', agendamento);
    return agendamento;
  },

  excluirAgendamento(id) {
    const agendamentos = this.getAgendamentos().filter(a => a.id !== id);
    localStorage.setItem('AgendaMed_agendamentos', JSON.stringify(agendamentos));
    console.log('🗑️ Agendamento excluído ID:', id);
  },

  getAgendamentosPorPaciente(pacienteId) {
    const agendamentos = this.getAgendamentos();
    return agendamentos.filter(a => a.pacienteId == pacienteId);
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
     CONFIGURAÇÕES POR USUÁRIO
     =========================================================== */
  salvarConfiguracaoUsuario(usuarioId, chave, dados) {
    const chaveStorage = `AgendaMed_config_${usuarioId}`;
    const configs = JSON.parse(localStorage.getItem(chaveStorage) || '{}');
    configs[chave] = dados;
    localStorage.setItem(chaveStorage, JSON.stringify(configs));
    console.log(`💾 Configuração salva para usuário ${usuarioId}:`, chave, dados);
    return dados;
  },

  getConfiguracaoUsuario(usuarioId, chave) {
    const chaveStorage = `AgendaMed_config_${usuarioId}`;
    const configs = JSON.parse(localStorage.getItem(chaveStorage) || '{}');
    return configs[chave] || null;
  },

  getTodasConfiguracoesUsuario(usuarioId) {
    const chaveStorage = `AgendaMed_config_${usuarioId}`;
    return JSON.parse(localStorage.getItem(chaveStorage) || '{}');
  },

  removerConfiguracaoUsuario(usuarioId, chave) {
    const chaveStorage = `AgendaMed_config_${usuarioId}`;
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

  /* ===========================================================
     FUNÇÕES PARA O CHATBOT
     =========================================================== */
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
    const medicos = this.getMedicos();
    return medicos.map(medico => this.getMedicoCompletoParaChatbot(medico.id)).filter(Boolean);
  },

  /* ===========================================================
     CONTAS DE DEMONSTRAÇÃO
     =========================================================== */
  criarContasDemo() {
    const usuarios = this.getUsuarios();
    
    // Conta demo admin
    if (!usuarios.find(u => u.email === 'admin@AgendaMed.com')) {
      const admin = this.criarUsuario('Administrador', 'admin@AgendaMed.com', 'admin123');
      if (admin) {
        const usuariosAtualizados = this.getUsuarios();
        const index = usuariosAtualizados.findIndex(u => u.id === admin.id);
        if (index !== -1) {
          usuariosAtualizados[index].tipo = 'clinica';
          usuariosAtualizados[index].tipoClinica = 'admin';
          localStorage.setItem('AgendaMed_usuarios', JSON.stringify(usuariosAtualizados));
        }
      }
    }

    // Conta demo clínica
    if (!usuarios.find(u => u.email === 'clinica@AgendaMed.com')) {
      const clinica = this.criarUsuario('Clínica Saúde Total', 'clinica@AgendaMed.com', 'senha123');
      if (clinica) {
        const usuariosAtualizados = this.getUsuarios();
        const index = usuariosAtualizados.findIndex(u => u.id === clinica.id);
        if (index !== -1) {
          usuariosAtualizados[index].tipo = 'clinica';
          usuariosAtualizados[index].tipoClinica = 'admin';
          localStorage.setItem('AgendaMed_usuarios', JSON.stringify(usuariosAtualizados));
          
          // Cria uma clínica demo
          const clinicaDemo = {
            nome: 'Clínica Saúde Total',
            cnpj: '00.000.000/0001-00',
            telefone: '(11) 9999-8888',
            email: 'clinica@AgendaMed.com',
            endereco: 'Rua Exemplo, 123 - Centro',
            horario_inicio: '08:00',
            horario_fim: '18:00',
            especialidades: ['Clínica Médica', 'Cardiologia', 'Pediatria'],
            status: 'ativo'
          };
          this.salvarClinica(clinicaDemo);
        }
      }
    }
    
    // Conta demo médico
    if (!usuarios.find(u => u.email === 'medico@AgendaMed.com')) {
      const medico = this.criarUsuario('Dr. Carlos Silva', 'medico@AgendaMed.com', 'senha123');
      if (medico) {
        const usuariosAtualizados = this.getUsuarios();
        const index = usuariosAtualizados.findIndex(u => u.id === medico.id);
        if (index !== -1) {
          usuariosAtualizados[index].tipo = 'clinica';
          usuariosAtualizados[index].tipoClinica = 'medico';
          localStorage.setItem('AgendaMed_usuarios', JSON.stringify(usuariosAtualizados));
          this.adicionarMedicoAutomaticamente(usuariosAtualizados[index]);
        }
      }
    }

    // Conta demo secretário
    if (!usuarios.find(u => u.email === 'secretario@AgendaMed.com')) {
      const secretario = this.criarUsuario('Ana Secretária', 'secretario@AgendaMed.com', 'senha123');
      if (secretario) {
        const usuariosAtualizados = this.getUsuarios();
        const index = usuariosAtualizados.findIndex(u => u.id === secretario.id);
        if (index !== -1) {
          usuariosAtualizados[index].tipo = 'clinica';
          usuariosAtualizados[index].tipoClinica = 'secretario';
          localStorage.setItem('AgendaMed_usuarios', JSON.stringify(usuariosAtualizados));
        }
      }
    }
    
    // Conta demo paciente
    if (!usuarios.find(u => u.email === 'paciente@AgendaMed.com')) {
      const paciente = this.criarUsuario('João Paciente', 'paciente@AgendaMed.com', 'senha123');
      if (paciente) {
        const usuariosAtualizados = this.getUsuarios();
        const index = usuariosAtualizados.findIndex(u => u.id === paciente.id);
        if (index !== -1) {
          usuariosAtualizados[index].tipo = 'paciente';
          localStorage.setItem('AgendaMed_usuarios', JSON.stringify(usuariosAtualizados));
          this.adicionarPacienteAutomaticamente(usuariosAtualizados[index]);
        }
      }
    }

    console.log('✅ Contas demo criadas com sucesso!');
  },

  /* ===========================================================
     FUNÇÕES PARA PACIENTES (AUTOMÁTICO)
     =========================================================== */
  adicionarPacienteAutomaticamente(usuario) {
    const pacientes = this.getPacientes();
    const pacienteExistente = pacientes.find(p => p.email === usuario.email);
    if (pacienteExistente) {
      console.log('⚠️ Paciente já existe:', pacienteExistente.nome);
      return pacienteExistente;
    }
    
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
    localStorage.setItem('AgendaMed_pacientes', JSON.stringify(pacientes));
    console.log('✅ Paciente adicionado automaticamente:', novoPaciente.nome);
    return novoPaciente;
  },

  // ===========================================================
  // FUNÇÕES PARA BUSCA DE MÉDICOS POR SINTOMAS
  // ===========================================================
  buscarMedicosPorSintomas(sintomas) {
    const mapeamentoSintomas = {
      'Cardiologia': ['coracao', 'cardiaco', 'pressao', 'arterial', 'dor no peito', 'palpitacao', 'palpitacoes', 'arritmia', 'taquicardia', 'falta de ar'],
      'Dermatologia': ['pele', 'mancha', 'coceira', 'erupcao', 'acne', 'eczema', 'psoriase', 'alergia de pele', 'descamacao', 'urticaria'],
      'Pediatria': ['crianca', 'bebe', 'infantil', 'pediatrico', 'recem nascido', 'febre infantil'],
      'Ortopedia': ['osso', 'fratura', 'fraturado', 'articulacao', 'joelho', 'coluna', 'lombar', 'ombro', 'tornozelo', 'entorse', 'dor muscular'],
      'Oftalmologia': ['olho', 'visao', 'miopia', 'astigmatismo', 'catarata', 'vista', 'irritacao ocular', 'conjuntivite'],
      'Psiquiatria': ['mental', 'ansiedade', 'depressao', 'estresse', 'insonia', 'panico', 'humor', 'transtorno', 'crise nervosa'],
      'Ginecologia': ['menstruacao', 'colica', 'corrimento', 'saude da mulher', 'gestacao', 'gravidez', 'planejamento familiar'],
      'Otorrinolaringologia': ['garganta', 'ouvido', 'nariz', 'sinusite', 'rinite', 'otite', 'obstrucao nasal', 'dor de ouvido'],
      'Neurologia': ['dor de cabeca', 'cefaleia', 'enxaqueca', 'convulsao', 'formigamento', 'paralisia', 'tontura', 'avc'],
      'Endocrinologia': ['diabetes', 'hormonal', 'tireoide', 'obesidade', 'colesterol', 'metabolismo'],
      'Urologia': ['urina', 'urinario', 'incontinencia', 'rim', 'prostata', 'calculo renal'],
      'Alergologia': ['alergia', 'asma', 'rinite alergica', 'alergia alimentar', 'dermatite'],
      'Nutrologia': ['alimentacao', 'nutricao', 'peso', 'obesidade', 'dieta', 'metabolismo'],
      'Geriatria': ['idoso', 'envelhecimento', 'quedas', 'doencas cronicas', 'memoria'],
      'Clínico Geral': ['febre', 'gripe', 'resfriado', 'dor', 'mal estar', 'cansaco', 'checkup', 'rotina']
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

// ===========================================================
// INICIALIZAÇÃO
// ===========================================================

// Inicializa dados
Storage.init();

// Cria contas demo automaticamente (AGORA FUNCIONA!)
Storage.criarContasDemo();

console.log('✅ Storage inicializado com sucesso!');
console.log('📊 Dados disponíveis:');
console.log('  - Usuários:', Storage.getUsuarios().length);
console.log('  - Pacientes:', Storage.getPacientes().length);
console.log('  - Médicos:', Storage.getMedicos().length);
console.log('  - Clínicas:', Storage.getClinicas().length);
console.log('  - Agendamentos:', Storage.getAgendamentos().length);