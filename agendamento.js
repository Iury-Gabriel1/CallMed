// agendamento.js (VERSÃO COMPLETA E CORRIGIDA)
const Agendamento = {
  init() {
    console.log('🚀 Inicializando sistema de agendamentos...');
    this.carregarSelects();
    this.renderTable();
    this.configurarFormulario();
    this.configurarMedicoSelecionado();
  },

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

  carregarSelects() {
    console.log('📋 Carregando selects...');
    
    const pacienteSelect = document.getElementById('pacienteSelect');
    const medicoSelect = document.getElementById('medicoSelect');
    
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

    agendamentos.forEach(agendamento => {
      const paciente = pacientes.find(p => p.id == agendamento.pacienteId);
      const medico = medicos.find(m => m.id == agendamento.medicoId);
      
      if (!paciente || !medico) {
        console.warn('⚠️ Agendamento com dados inconsistentes:', agendamento);
      }
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${paciente ? paciente.nome : 'Paciente não encontrado'}</td>
        <td>${medico ? `${medico.nome} - ${medico.especialidade}` : 'Médico não encontrado'}</td>
        <td>${new Date(agendamento.data).toLocaleDateString('pt-BR')}</td>
        <td>${agendamento.hora || agendamento.horario || 'Não informado'}</td>
        <td><span class="badge ${agendamento.status || 'agendado'}">${agendamento.status || 'Agendado'}</span></td>
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
        // Salvar no storage
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

  cancelarAgendamento(id) {
    if (confirm('Tem certeza que deseja cancelar esta consulta?')) {
      console.log('🗑️ Cancelando agendamento ID:', id);
      Storage.excluirAgendamento(id);
      this.renderTable();
      alert('✅ Consulta cancelada com sucesso!');
    }
  },

  verDetalhesAgendamento(id) {
    const agendamento = Storage.getAgendamentos().find(a => a.id === id);
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

📊 Status: ${agendamento.status || 'Agendado'}
    `;

    alert(detalhes);
  },

  // FUNÇÃO DE DEBUG
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
    
    // Teste de criação
    if (pacientes.length > 0 && medicos.length > 0) {
      const testeAgendamento = {
        pacienteId: pacientes[0].id,
        medicoId: medicos[0].id,
        data: new Date().toISOString().split('T')[0],
        hora: '14:00',
        status: 'agendado'
      };
      console.log('🧪 DADOS DE TESTE:', testeAgendamento);
    }
    
    alert(`🔍 Debug completo! Verifique o console.\nAgendamentos: ${agendamentos.length}\nPacientes: ${pacientes.length}\nMédicos: ${medicos.length}`);
  }
};

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  console.log('📅 Página de agendamentos carregada');
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
});