/* ===========================================================
   CallMed - agendamento.js
   Agendamento + Historico
   =========================================================== */

/* ===========================================================
   PARTE 1: AGENDAMENTO
   =========================================================== */

const Agendamento = {
  // =============================================
  // INICIALIZAÇÃO
  // =============================================
  init() {
    console.log('🚀 Inicializando sistema de agendamentos...');
    this.carregarSelects();
    this.renderTable();
    this.configurarFormulario();
    this.configurarMedicoSelecionado();
  },

  // =============================================
  // MÉDICO PRÉ-SELECIONADO
  // =============================================
  configurarMedicoSelecionado() {
    const medicoSelecionado = localStorage.getItem('medicoSelecionadoAgendamento');
    const medicoSelect = document.getElementById('medicoSelect');
    
    if (medicoSelecionado && medicoSelect) {
      console.log('🎯 Configurando médico pré-selecionado:', medicoSelecionado);
      setTimeout(() => {
        medicoSelect.value = medicoSelecionado;
        localStorage.removeItem('medicoSelecionadoAgendamento');
      }, 100);
    }
  },

  // =============================================
  // CARREGAR SELECTS
  // =============================================
  carregarSelects() {
    console.log('📋 Carregando selects...');
    
    const pacienteSelect = document.getElementById('pacienteSelect');
    const medicoSelect = document.getElementById('medicoSelect');
    
    // Pacientes
    if (pacienteSelect) {
      pacienteSelect.innerHTML = '<option value="">Selecione um paciente</option>';
      const pacientes = Storage.getPacientes();
      console.log('👥 Pacientes carregados:', pacientes.length);
      
      pacientes.forEach(paciente => {
        const option = document.createElement('option');
        option.value = paciente.id;
        option.textContent = `${paciente.nome} - ${paciente.telefone || 'Sem telefone'}`;
        pacienteSelect.appendChild(option);
      });
    }
    
    // Médicos
    if (medicoSelect) {
      medicoSelect.innerHTML = '<option value="">Selecione um médico</option>';
      const medicos = Storage.getMedicos();
      console.log('🩺 Médicos carregados:', medicos.length);
      
      medicos.forEach(medico => {
        const option = document.createElement('option');
        option.value = medico.id;
        option.textContent = `${medico.nome} - ${medico.especialidade || 'Sem especialidade'}`;
        medicoSelect.appendChild(option);
      });
    }
  },

  // =============================================
  // RENDERIZAR TABELA
  // =============================================
  renderTable() {
    const tbody = document.querySelector("#agendamentosTable tbody");
    if (!tbody) {
      console.error('❌ Tabela de agendamentos não encontrada');
      return;
    }

    const agendamentos = Storage.getAgendamentos();
    const pacientes = Storage.getPacientes();
    const medicos = Storage.getMedicos();
    
    console.log('📊 Renderizando tabela:', {
      agendamentos: agendamentos.length,
      pacientes: pacientes.length,
      medicos: medicos.length
    });
    
    tbody.innerHTML = '';
    
    if (agendamentos.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2rem; color: var(--cor-secundaria);">
            📭 Nenhum agendamento encontrado. Clique em "+ Nova Consulta" para agendar.
          </td>
        </tr>
      `;
      return;
    }

    // Ordenar por data (mais recentes primeiro)
    agendamentos.sort((a, b) => {
      try {
        const dataA = new Date(a.data + ' ' + (a.hora || a.horario || '00:00'));
        const dataB = new Date(b.data + ' ' + (b.hora || b.horario || '00:00'));
        return dataB - dataA;
      } catch (e) {
        return 0;
      }
    });

    agendamentos.forEach(agendamento => {
      const paciente = pacientes.find(p => p.id == agendamento.pacienteId);
      const medico = medicos.find(m => m.id == agendamento.medicoId);
      
      if (!paciente || !medico) {
        console.warn('⚠️ Agendamento com dados inconsistentes:', agendamento);
      }
      
      const statusClass = this.getStatusClass(agendamento.status);
      const statusText = this.getStatusText(agendamento.status);
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${paciente ? paciente.nome : 'Paciente não encontrado'}</td>
        <td>${medico ? `${medico.nome} - ${medico.especialidade}` : 'Médico não encontrado'}</td>
        <td>${new Date(agendamento.data).toLocaleDateString('pt-BR')}</td>
        <td>${agendamento.hora || agendamento.horario || 'Não informado'}</td>
        <td><span class="badge ${statusClass}">${statusText}</span></td>
        <td>
          <button onclick="Agendamento.cancelarAgendamento(${agendamento.id})" class="btn-delete">
            ❌ Cancelar
          </button>
          <button onclick="Agendamento.verDetalhesAgendamento(${agendamento.id})" class="btn-edit" style="margin-left: 5px;">
            📋 Detalhes
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
    
    console.log('✅ Tabela renderizada com', agendamentos.length, 'agendamentos');
  },

  // =============================================
  // HELPERS DE STATUS
  // =============================================
  getStatusClass(status) {
    const classes = {
      'agendado': 'agendado',
      'confirmado': 'agendado',
      'pendente': 'pendente',
      'cancelado': 'cancelado',
      'concluido': 'concluido'
    };
    return classes[status] || 'agendado';
  },

  getStatusText(status) {
    const textos = {
      'agendado': 'Agendado',
      'confirmado': 'Confirmado',
      'pendente': 'Pendente',
      'cancelado': 'Cancelado',
      'concluido': 'Concluído'
    };
    return textos[status] || 'Agendado';
  },

  // =============================================
  // FORMULÁRIO
  // =============================================
  configurarFormulario() {
    const form = document.getElementById('agendamentoForm');
    if (!form) {
      console.error('❌ Formulário de agendamento não encontrado');
      return;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      console.log('📝 Submetendo formulário de agendamento...');
      
      const pacienteSelect = document.getElementById('pacienteSelect');
      const medicoSelect = document.getElementById('medicoSelect');
      const dataInput = document.getElementById('dataConsulta');
      const horaInput = document.getElementById('horaConsulta');
      
      // Validação
      if (!pacienteSelect || !medicoSelect || !dataInput || !horaInput) {
        alert('❌ Erro: Elementos do formulário não encontrados');
        return;
      }
      
      if (!pacienteSelect.value || !medicoSelect.value || !dataInput.value || !horaInput.value) {
        alert('⚠️ Por favor, preencha todos os campos!');
        return;
      }

      // Criar agendamento
      const agendamento = {
        pacienteId: parseInt(pacienteSelect.value),
        medicoId: parseInt(medicoSelect.value),
        data: dataInput.value,
        hora: horaInput.value,
        status: 'agendado',
        criadoEm: new Date().toISOString()
      };

      console.log('💾 Tentando salvar agendamento:', agendamento);
      
      try {
        const resultado = Storage.salvarAgendamento(agendamento);
        console.log('✅ Agendamento salvo com sucesso:', resultado);
        
        // Atualizar interface
        this.renderTable();
        
        // Fechar modal e limpar formulário
        const modal = document.getElementById('modalAgendamento');
        if (modal) modal.classList.remove('active');
        form.reset();
        
        alert('✅ Consulta agendada com sucesso!');
        
      } catch (error) {
        console.error('❌ Erro ao salvar agendamento:', error);
        alert('❌ Erro ao agendar consulta. Verifique o console.');
      }
    });
  },

  // =============================================
  // CANCELAR AGENDAMENTO
  // =============================================
  cancelarAgendamento(id) {
    if (confirm('Tem certeza que deseja cancelar esta consulta?')) {
      console.log('🗑️ Cancelando agendamento ID:', id);
      Storage.excluirAgendamento(id);
      this.renderTable();
      alert('✅ Consulta cancelada com sucesso!');
    }
  },

  // =============================================
  // VER DETALHES
  // =============================================
  verDetalhesAgendamento(id) {
    const agendamento = Storage.getAgendamentos().find(a => a.id == id);
    if (!agendamento) {
      alert('❌ Agendamento não encontrado!');
      return;
    }

    const paciente = Storage.getPacientes().find(p => p.id == agendamento.pacienteId);
    const medico = Storage.getMedicos().find(m => m.id == agendamento.medicoId);

    const detalhes = `
📋 DETALHES DA CONSULTA

👤 Paciente: ${paciente ? paciente.nome : 'Não encontrado'}
📞 Telefone: ${paciente ? paciente.telefone : 'Não informado'}

🩺 Médico: ${medico ? medico.nome : 'Não encontrado'}
📚 Especialidade: ${medico ? medico.especialidade : 'Não informada'}

📅 Data: ${new Date(agendamento.data).toLocaleDateString('pt-BR')}
⏰ Hora: ${agendamento.hora || agendamento.horario || 'Não informado'}

📊 Status: ${this.getStatusText(agendamento.status)}
    `;

    alert(detalhes);
  },

  // =============================================
  // DEBUG
  // =============================================
  debugAgendamentos() {
    console.group('🐛 DEBUG AGENDAMENTOS');
    
    const agendamentos = Storage.getAgendamentos();
    const pacientes = Storage.getPacientes();
    const medicos = Storage.getMedicos();
    
    console.log('📊 ESTATÍSTICAS:');
    console.log('Agendamentos:', agendamentos.length);
    console.log('Pacientes:', pacientes.length);
    console.log('Médicos:', medicos.length);
    
    console.log('📋 AGENDAMENTOS:');
    agendamentos.forEach((ag, index) => {
      const paciente = pacientes.find(p => p.id == ag.pacienteId);
      const medico = medicos.find(m => m.id == ag.medicoId);
      
      console.log(`${index + 1}.`, {
        id: ag.id,
        paciente: paciente ? paciente.nome : 'NÃO ENCONTRADO',
        medico: medico ? medico.nome : 'NÃO ENCONTRADO',
        data: ag.data,
        hora: ag.hora,
        status: ag.status,
        pacienteId: ag.pacienteId,
        medicoId: ag.medicoId
      });
    });
    
    console.log('👥 PACIENTES DISPONÍVEIS:');
    pacientes.forEach(p => console.log(`- ${p.id}: ${p.nome}`));
    
    console.log('🩺 MÉDICOS DISPONÍVEIS:');
    medicos.forEach(m => console.log(`- ${m.id}: ${m.nome}`));
    
    console.groupEnd();
    
    alert(`🔍 Debug completo! Verifique o console.\nAgendamentos: ${agendamentos.length}\nPacientes: ${pacientes.length}\nMédicos: ${medicos.length}`);
  }
};

// =============================================
// INICIALIZAÇÃO - AGENDAMENTO
// =============================================
document.addEventListener("DOMContentLoaded", () => {
  console.log('📅 Página de agendamentos carregada');
  
  // Só inicializa se estiver na página de agendamento
  if (window.location.pathname.includes('agendar.html') || 
      document.getElementById('agendamentosTable')) {
    
    Agendamento.init();
    
    // Configurar modal
    const modal = document.getElementById('modalAgendamento');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    
    if (modal && openModalBtn) {
      openModalBtn.addEventListener('click', () => {
        console.log('📅 Abrindo modal de agendamento...');
        Agendamento.carregarSelects();
        Agendamento.configurarMedicoSelecionado();
        modal.classList.add('active');
      });
    }
    
    if (modal && closeModalBtn) {
      closeModalBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        console.log('❌ Modal fechado');
      });
    }
    
    if (modal) {
      window.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
          console.log('❌ Modal fechado pelo overlay');
        }
      });
    }
    
    console.log('✅ Sistema de agendamentos inicializado com sucesso');
  }
});


/* ===========================================================
   PARTE 2: HISTÓRICO
   =========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // Só executa se estiver na página de histórico
  if (!window.location.pathname.includes('historico.html') && 
      !document.getElementById("historicoTableBody")) {
    return;
  }
  
  console.log('📊 Página de histórico carregada');
  
  const tbody = document.querySelector("#historicoTableBody");
  const semDados = document.getElementById("semDados");
  const filtroForm = document.getElementById("filtroForm");
  const btnLimpar = document.getElementById("btnLimparFiltros");

  // =============================================
  // RENDERIZAR TABELA
  // =============================================
  function renderTable(filtros = {}) {
    if (!tbody) return;
    
    let agendamentos = Storage.getAgendamentos();
    const pacientes = Storage.getPacientes();
    const medicos = Storage.getMedicos();
    
    // Aplicar filtros
    if (filtros.paciente) {
      const termo = filtros.paciente.toLowerCase();
      agendamentos = agendamentos.filter(a => {
        const paciente = pacientes.find(p => p.id == a.pacienteId);
        return (paciente && paciente.nome.toLowerCase().includes(termo)) ||
               (a.pacienteNome && a.pacienteNome.toLowerCase().includes(termo)) ||
               (a.pacienteId && a.pacienteId.toString().includes(termo));
      });
    }
    
    if (filtros.medico) {
      const termo = filtros.medico.toLowerCase();
      agendamentos = agendamentos.filter(a => {
        const medico = medicos.find(m => m.id == a.medicoId);
        return (medico && medico.nome.toLowerCase().includes(termo)) ||
               (a.medicoNome && a.medicoNome.toLowerCase().includes(termo)) ||
               (a.medicoId && a.medicoId.toString().includes(termo));
      });
    }
    
    if (filtros.data) {
      agendamentos = agendamentos.filter(a => a.data === filtros.data);
    }

    tbody.innerHTML = "";

    if (agendamentos.length === 0) {
      if (semDados) semDados.style.display = 'block';
      return;
    }
    
    if (semDados) semDados.style.display = 'none';

    // Ordenar por data (mais recentes primeiro)
    agendamentos.sort((a, b) => {
      try {
        const dataA = new Date(a.data + ' ' + (a.hora || a.horario || '00:00'));
        const dataB = new Date(b.data + ' ' + (b.hora || b.horario || '00:00'));
        return dataB - dataA;
      } catch (e) {
        return 0;
      }
    });

    agendamentos.forEach(a => {
      const paciente = pacientes.find(p => p.id == a.pacienteId);
      const medico = medicos.find(m => m.id == a.medicoId);
      
      const statusClass = Agendamento.getStatusClass(a.status);
      const statusText = Agendamento.getStatusText(a.status);
      
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${paciente ? paciente.nome : (a.pacienteNome || 'Paciente ' + a.pacienteId)}</td>
        <td>${medico ? `${medico.nome} - ${medico.especialidade}` : (a.medicoNome || 'Médico ' + a.medicoId)}</td>
        <td>${new Date(a.data).toLocaleDateString('pt-BR')}</td>
        <td>${a.hora || a.horario || '--:--'}</td>
        <td><span class="badge ${statusClass}">${statusText}</span></td>
        <td>${a.diagnostico || a.observacoes || 'Consulta realizada'}</td>
      `;
      tbody.appendChild(tr);
    });
    
    console.log('✅ Histórico renderizado com', agendamentos.length, 'registros');
  }

  // =============================================
  // INICIALIZAÇÃO
  // =============================================
  renderTable();

  // Filtros
  if (filtroForm) {
    filtroForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const filtros = {
        paciente: document.getElementById("filtroPaciente").value,
        medico: document.getElementById("filtroMedico").value,
        data: document.getElementById("filtroData").value
      };
      renderTable(filtros);
    });
  }

  // Limpar filtros
  if (btnLimpar) {
    btnLimpar.addEventListener("click", () => {
      if (filtroForm) filtroForm.reset();
      renderTable();
    });
  }
  
  console.log('✅ Sistema de histórico inicializado');
});