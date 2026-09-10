// medico.js (SISTEMA COMPLETO COM MINHA AGENDA E VÍNCULO COM CLÍNICAS)
// Gerenciamento de médicos usando Storage unificado

const Medico = {
  // =============================================
  // INICIALIZAÇÃO E CRUD
  // =============================================
  getAll: () => {
    const medicos = Storage.getMedicos();
    console.log('📋 Médicos carregados:', medicos);
    return medicos;
  },

  add: (medico) => {
    console.log('➕ Adicionando médico:', medico);
    const resultado = Storage.salvarMedico(medico);
    Medico.renderTable();
    
    if (resultado) {
      alert("✅ Médico adicionado com sucesso!");
    } else {
      alert("❌ Erro ao adicionar médico!");
    }
    return resultado;
  },

  remove: (id) => {
    console.log('🗑️ Tentando excluir médico ID:', id);
    
    const usuarioLogado = Storage.getUsuarioLogado();
    const medico = Medico.getAll().find(m => m.id == id);
    
    if (!medico) {
      alert("❌ Médico não encontrado!");
      return;
    }

    // Verifica se está tentando excluir a si mesmo
    if (usuarioLogado && medico.usuarioId && medico.usuarioId.toString() === usuarioLogado.id.toString()) {
      alert("❌ Você não pode excluir seu próprio perfil.");
      return;
    }

    // Verifica se é um médico vinculado a um usuário
    if (medico.usuarioId) {
      if (!confirm('⚠️ Este médico está vinculado a um usuário do sistema. Tem certeza que deseja excluir?')) {
        return;
      }
    } else {
      if (!confirm('Tem certeza que deseja excluir este médico?')) {
        return;
      }
    }

    Storage.excluirMedico(id);
    Medico.renderTable();
    alert("✅ Médico excluído com sucesso!");
  },

  update: (id, dados) => {
    console.log('✏️ Atualizando médico ID:', id, 'Dados:', dados);
    
    const medicoExistente = Medico.getAll().find(m => m.id == id);
    if (!medicoExistente) {
      alert("❌ Médico não encontrado!");
      return null;
    }

    // Preserva dados importantes
    const medicoAtualizado = {
      ...medicoExistente,
      ...dados,
      id: medicoExistente.id,
      usuarioId: medicoExistente.usuarioId,
      dataCadastro: medicoExistente.dataCadastro
    };

    const resultado = Storage.salvarMedico(medicoAtualizado);
    Medico.renderTable();
    
    if (resultado) {
      alert("✅ Médico atualizado com sucesso!");
    } else {
      alert("❌ Erro ao atualizar médico!");
    }
    return resultado;
  },

  // =============================================
  // VERIFICAÇÃO DE MÉDICO LOGADO
  // =============================================
  isMedicoLogado: (medico) => {
    const usuarioLogado = Storage.getUsuarioLogado();
    return usuarioLogado && medico.usuarioId && medico.usuarioId.toString() === usuarioLogado.id.toString();
  },

  // =============================================
  // CARREGAR CLÍNICAS NO SELECT
  // =============================================
  carregarClinicasNoSelect: () => {
    const select = document.getElementById('clinica');
    if (!select) return;
    
    const clinicas = Storage.getClinicas() || [];
    select.innerHTML = '<option value="">Selecione uma clínica</option>';
    
    clinicas.forEach(clinica => {
      const option = document.createElement('option');
      option.value = clinica.id;
      option.textContent = `${clinica.nome} ${clinica.status === 'inativo' ? '(Inativa)' : ''}`;
      select.appendChild(option);
    });
    
    console.log('🏥 Clínicas carregadas no select:', clinicas.length);
  },

  // =============================================
  // CARREGAR ESPECIALIDADES NO SELECT
  // =============================================
  carregarEspecialidadesNoSelect: () => {
    const especialidades = Medico.getEspecialidades();
    
    // Select do formulário
    const selectForm = document.getElementById('especialidade');
    if (selectForm) {
      selectForm.innerHTML = '<option value="">Selecione uma especialidade</option>';
      especialidades.forEach(esp => {
        const option = document.createElement('option');
        option.value = esp;
        option.textContent = esp;
        selectForm.appendChild(option);
      });
    }
    
    // Select do filtro
    const selectFilter = document.getElementById('especialidadeFilter');
    if (selectFilter) {
      selectFilter.innerHTML = '<option value="">Todas especialidades</option>';
      especialidades.forEach(esp => {
        const option = document.createElement('option');
        option.value = esp;
        option.textContent = esp;
        selectFilter.appendChild(option);
      });
    }
    
    console.log('📋 Especialidades carregadas:', especialidades.length);
  },

  // =============================================
  // CARREGAR CLÍNICAS NO FILTRO
  // =============================================
  carregarClinicasNoFiltro: () => {
    const select = document.getElementById('clinicaFilter');
    if (!select) return;
    
    const clinicas = Storage.getClinicas() || [];
    select.innerHTML = '<option value="">Todas clínicas</option>';
    
    clinicas.forEach(clinica => {
      const option = document.createElement('option');
      option.value = clinica.id;
      option.textContent = clinica.nome;
      select.appendChild(option);
    });
    
    console.log('🏥 Clínicas carregadas no filtro:', clinicas.length);
  },

  // =============================================
  // LISTA DE ESPECIALIDADES
  // =============================================
  getEspecialidades: () => {
    return [
      "Acupuntura",
      "Alergologia e Imunologia", 
      "Anestesiologia",
      "Angiologia",
      "Cancerologia",
      "Cardiologia",
      "Cirurgia Cardiovascular",
      "Cirurgia da Mão",
      "Cirurgia de Cabeça e Pescoço",
      "Cirurgia do Aparelho Digestivo",
      "Cirurgia Geral",
      "Cirurgia Pediátrica",
      "Cirurgia Plástica",
      "Cirurgia Torácica",
      "Cirurgia Vascular",
      "Clínica Médica",
      "Coloproctologia",
      "Dermatologia",
      "Endocrinologia e Metabologia",
      "Endoscopia",
      "Gastroenterologia",
      "Genética Médica",
      "Geriatria",
      "Ginecologia e Obstetrícia",
      "Hematologia e Hemoterapia",
      "Homeopatia",
      "Infectologia",
      "Mastologia",
      "Medicina de Emergência",
      "Medicina do Trabalho",
      "Medicina de Família e Comunidade",
      "Medicina Esportiva",
      "Medicina Física e Reabilitação",
      "Medicina Intensiva",
      "Medicina Legal e Perícia Médica",
      "Medicina Nuclear",
      "Medicina Preventiva e Social",
      "Nefrologia",
      "Neurocirurgia",
      "Neurologia",
      "Nutrologia",
      "Oftalmologia",
      "Oncologia Clínica",
      "Ortopedia e Traumatologia",
      "Otorrinolaringologia",
      "Patologia",
      "Patologia Clínica/Medicina Laboratorial",
      "Pediatria",
      "Pneumologia",
      "Psiquiatria",
      "Radiologia e Diagnóstico por Imagem",
      "Radioterapia",
      "Reumatologia",
      "Urologia",
      "Outra"
    ];
  },

  // =============================================
  // RENDERIZAÇÃO DA TABELA
  // =============================================
  renderTable: () => {
    const tbody = document.querySelector("#medicosTable tbody");
    const cardsContainer = document.getElementById("medicosCards");
    const emptyState = document.getElementById("emptyState");
    
    if (!tbody) {
      console.error('❌ Tabela de médicos não encontrada');
      return;
    }

    console.log('🔄 Renderizando tabela de médicos...');
    
    tbody.innerHTML = "";
    if (cardsContainer) cardsContainer.innerHTML = "";
    
    const medicos = Medico.getAll();
    const clinicas = Storage.getClinicas() || [];
    const usuarioLogado = Storage.getUsuarioLogado();

    if (medicos.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    // Ordena médicos por nome
    medicos.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));

    // Preenche tabela (desktop)
    medicos.forEach(m => {
      const tr = document.createElement("tr");
      const isMedicoLogado = Medico.isMedicoLogado(m);
      
      // Busca o nome da clínica
      const clinica = clinicas.find(c => c.id == m.clinicaId);
      const clinicaNome = clinica ? clinica.nome : 'Não vinculado';
      
      // Destaca o médico logado
      if (isMedicoLogado) {
        tr.style.backgroundColor = 'var(--cor-destaque)';
        tr.style.fontWeight = '600';
      }

      tr.innerHTML = `
        <td>
          ${m.nome || 'Nome não informado'}
          ${isMedicoLogado ? ' <span style="color: var(--cor-principal);">(Você)</span>' : ''}
          ${m.usuarioId ? '<br><small style="color: var(--cor-secundaria);">👤 Automático</small>' : ''}
        </td>
        <td>${m.especialidade || 'Não informada'}</td>
        <td>
          ${clinicaNome !== 'Não vinculado' 
            ? `<span class="clinica-badge">${clinicaNome}</span>` 
            : '<span style="color: var(--cor-secundaria); font-size: 0.8rem;">Não vinculado</span>'}
        </td>
        <td>${m.telefone || 'Não informado'}</td>
        <td>${m.email || 'Email não informado'}</td>
        <td>
          <span class="status-badge ${m.status === 'ativo' ? 'status-ativo' : 'status-inativo'}">
            ${m.status === 'ativo' ? 'Ativo' : 'Inativo'}
          </span>
        </td>
        <td class="acoes-cell">
          ${isMedicoLogado ? 
            `<button class="btn-acao btn-ver-agenda" onclick="Medico.verMinhaAgenda()">
                📅 Minha Agenda
            </button>` : 
            `<button class="btn-acao btn-editar" onclick="Medico.edit(${m.id})">
                ✏️ Editar
            </button>
            <button class="btn-acao btn-excluir" onclick="Medico.remove(${m.id})">
                🗑️ Excluir
            </button>
            <button class="btn-acao btn-ver-agenda" onclick="Medico.verAgenda(${m.id})">
                📅 Agenda
            </button>`
          }
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Preenche cards (mobile)
    if (cardsContainer) {
      medicos.forEach(m => {
        const card = Medico.criarCardMedico(m);
        cardsContainer.appendChild(card);
      });
    }
    
    console.log('✅ Tabela renderizada com', medicos.length, 'médicos');
  },

  // =============================================
  // CRIAÇÃO DE CARD PARA MOBILE
  // =============================================
  criarCardMedico: (medico) => {
    const card = document.createElement("div");
    card.className = "medico-card";
    
    const isMedicoLogado = Medico.isMedicoLogado(medico);
    const clinicas = Storage.getClinicas() || [];
    const clinica = clinicas.find(c => c.id == medico.clinicaId);
    const clinicaNome = clinica ? clinica.nome : 'Não vinculado';
    
    if (isMedicoLogado) {
      card.style.border = "2px solid var(--cor-principal)";
      card.style.background = "var(--cor-destaque)";
    }

    card.innerHTML = `
      <div class="medico-header">
        <div class="medico-info">
          <div class="medico-nome">
            ${medico.nome || 'Nome não informado'}
            ${isMedicoLogado ? ' <span style="color: var(--cor-principal);">(Você)</span>' : ''}
          </div>
          <div class="medico-especialidade">${medico.especialidade || 'Não informada'}</div>
          <div class="medico-clinica">🏥 ${clinicaNome}</div>
          <div style="font-size: 0.7rem; color: var(--cor-secundaria); margin-bottom: 4px;">
            ${medico.usuarioId ? '👤 Automático' : '📝 Manual'}
          </div>
          <div class="medico-contato">📞 ${medico.telefone || 'Não informado'}</div>
          <div class="medico-email">📧 ${medico.email || 'Email não informado'}</div>
          <div style="margin-top: var(--espaco-xs);">
            <span class="status-badge ${medico.status === 'ativo' ? 'status-ativo' : 'status-inativo'}">
              ${medico.status === 'ativo' ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </div>
      </div>
      <div class="medico-acoes">
        ${isMedicoLogado ? 
          `<button class="btn-acao btn-ver-agenda" onclick="Medico.verMinhaAgenda()">
              📅 Minha Agenda
          </button>` :
          `<button class="btn-acao btn-editar" onclick="Medico.edit(${medico.id})">
              ✏️ Editar
          </button>
          <button class="btn-acao btn-excluir" onclick="Medico.remove(${medico.id})">
              🗑️ Excluir
          </button>
          <button class="btn-acao btn-ver-agenda" onclick="Medico.verAgenda(${medico.id})">
              📅 Agenda
          </button>`
        }
      </div>
    `;

    return card;
  },

  // =============================================
  // EDIÇÃO DE MÉDICO
  // =============================================
  edit: (id) => {
    console.log('✏️ Editando médico ID:', id);
    
    const medico = Medico.getAll().find(m => m.id == id);
    if (!medico) {
      alert("❌ Médico não encontrado!");
      return;
    }

    // Verifica se está tentando editar a si mesmo
    if (Medico.isMedicoLogado(medico)) {
      alert("⚠️ Você não pode editar seu próprio perfil aqui. Use a página de configurações.");
      return;
    }

    // Preenche o formulário
    document.getElementById("modalTitle").textContent = "Editar Médico";
    document.getElementById("nome").value = medico.nome || '';
    document.getElementById("email").value = medico.email || '';
    document.getElementById("telefone").value = medico.telefone || '';
    document.getElementById("especialidade").value = medico.especialidade || '';
    document.getElementById("crm").value = medico.crm || '';
    
    // Seleciona a clínica
    const clinicaSelect = document.getElementById("clinica");
    if (clinicaSelect && medico.clinicaId) {
      clinicaSelect.value = medico.clinicaId;
    }

    const form = document.getElementById("medicoForm");
    form.dataset.editId = id;
    document.getElementById("modalMedico").classList.add("active");
    
    console.log('✅ Formulário preenchido para edição');
  },

  // =============================================
  // FILTRAR MÉDICOS
  // =============================================
  filtrarMedicos: () => {
    const searchInput = document.getElementById("searchInput");
    const especialidadeFilter = document.getElementById("especialidadeFilter");
    const clinicaFilter = document.getElementById("clinicaFilter");
    const statusFilter = document.getElementById("statusFilter");
    
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const especialidade = especialidadeFilter ? especialidadeFilter.value : '';
    const clinicaId = clinicaFilter ? clinicaFilter.value : '';
    const status = statusFilter ? statusFilter.value : '';
    
    const medicos = Medico.getAll();
    const clinicas = Storage.getClinicas() || [];
    
    const medicosFiltrados = medicos.filter(medico => {
      const matchSearch = !searchTerm || 
        (medico.nome && medico.nome.toLowerCase().includes(searchTerm)) ||
        (medico.email && medico.email.toLowerCase().includes(searchTerm)) ||
        (medico.telefone && medico.telefone.includes(searchTerm));
      
      const matchEspecialidade = !especialidade || medico.especialidade === especialidade;
      const matchClinica = !clinicaId || medico.clinicaId == clinicaId;
      const matchStatus = !status || medico.status === status;
      
      return matchSearch && matchEspecialidade && matchClinica && matchStatus;
    });

    // Atualiza a exibição
    const tbody = document.querySelector("#medicosTable tbody");
    const cardsContainer = document.getElementById("medicosCards");
    const emptyState = document.getElementById("emptyState");
    
    if (!tbody) return;
    
    tbody.innerHTML = "";
    if (cardsContainer) cardsContainer.innerHTML = "";
    
    if (medicosFiltrados.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    medicosFiltrados.forEach(m => {
      const tr = document.createElement("tr");
      const isMedicoLogado = Medico.isMedicoLogado(m);
      const clinica = clinicas.find(c => c.id == m.clinicaId);
      const clinicaNome = clinica ? clinica.nome : 'Não vinculado';
      
      if (isMedicoLogado) {
        tr.style.backgroundColor = 'var(--cor-destaque)';
        tr.style.fontWeight = '600';
      }

      tr.innerHTML = `
        <td>
          ${m.nome || 'Nome não informado'}
          ${isMedicoLogado ? ' <span style="color: var(--cor-principal);">(Você)</span>' : ''}
          ${m.usuarioId ? '<br><small style="color: var(--cor-secundaria);">👤 Automático</small>' : ''}
        </td>
        <td>${m.especialidade || 'Não informada'}</td>
        <td>
          ${clinicaNome !== 'Não vinculado' 
            ? `<span class="clinica-badge">${clinicaNome}</span>` 
            : '<span style="color: var(--cor-secundaria); font-size: 0.8rem;">Não vinculado</span>'}
        </td>
        <td>${m.telefone || 'Não informado'}</td>
        <td>${m.email || 'Email não informado'}</td>
        <td>
          <span class="status-badge ${m.status === 'ativo' ? 'status-ativo' : 'status-inativo'}">
            ${m.status === 'ativo' ? 'Ativo' : 'Inativo'}
          </span>
        </td>
        <td class="acoes-cell">
          ${isMedicoLogado ? 
            `<button class="btn-acao btn-ver-agenda" onclick="Medico.verMinhaAgenda()">
                📅 Minha Agenda
            </button>` : 
            `<button class="btn-acao btn-editar" onclick="Medico.edit(${m.id})">
                ✏️ Editar
            </button>
            <button class="btn-acao btn-excluir" onclick="Medico.remove(${m.id})">
                🗑️ Excluir
            </button>
            <button class="btn-acao btn-ver-agenda" onclick="Medico.verAgenda(${m.id})">
                📅 Agenda
            </button>`
          }
        </td>
      `;
      tbody.appendChild(tr);
    });
    
    if (cardsContainer) {
      medicosFiltrados.forEach(m => {
        const card = Medico.criarCardMedico(m);
        cardsContainer.appendChild(card);
      });
    }
  },

  // =============================================
  // MINHA AGENDA - SISTEMA FUNCIONAL
  // =============================================
  verMinhaAgenda: () => {
    console.log('📅 Abrindo Minha Agenda...');
    
    const usuarioLogado = Storage.getUsuarioLogado();
    if (!usuarioLogado) {
      alert('❌ Você precisa estar logado para acessar sua agenda.');
      return;
    }

    const medicoLogado = Storage.getMedicoPorUsuarioId(usuarioLogado.id);
    if (!medicoLogado) {
      alert('❌ Perfil médico não encontrado para este usuário.');
      return;
    }

    Medico.abrirModalAgenda(medicoLogado);
  },

  verAgenda: (medicoId) => {
    console.log(`📅 Abrindo agenda do médico ID: ${medicoId}`);
    
    const medico = Medico.getAll().find(m => m.id == medicoId);
    if (!medico) {
      alert('❌ Médico não encontrado.');
      return;
    }

    Medico.abrirModalAgenda(medico);
  },

  abrirModalAgenda: (medico) => {
    const modalHTML = `
      <div class="modal active" id="modalAgenda">
        <div class="modal-content" style="max-width: 800px; max-height: 90vh;">
          <button class="modal-close" onclick="Medico.fecharModalAgenda()">&times;</button>
          <h2>📅 Agenda - ${medico.nome}</h2>
          
          <div class="agenda-controls" style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
            <button class="view-btn active" data-view="hoje" onclick="Medico.mudarVisualizacaoAgenda('hoje')">Hoje</button>
            <button class="view-btn" data-view="semana" onclick="Medico.mudarVisualizacaoAgenda('semana')">Esta Semana</button>
            <button class="view-btn" data-view="mes" onclick="Medico.mudarVisualizacaoAgenda('mes')">Este Mês</button>
            <button class="view-btn" data-view="todos" onclick="Medico.mudarVisualizacaoAgenda('todos')">Todos</button>
          </div>

          <div class="agenda-stats" style="background: var(--cor-fundo); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; text-align: center;">
              <div>
                <div style="font-size: 1.5rem; font-weight: bold; color: var(--cor-principal);" id="totalConsultas">0</div>
                <div style="font-size: 0.8rem; color: var(--cor-secundaria);">Total</div>
              </div>
              <div>
                <div style="font-size: 1.5rem; font-weight: bold; color: var(--cor-sucesso);" id="consultasConfirmadas">0</div>
                <div style="font-size: 0.8rem; color: var(--cor-secundaria);">Confirmadas</div>
              </div>
              <div>
                <div style="font-size: 1.5rem; font-weight: bold; color: var(--cor-aviso);" id="consultasPendentes">0</div>
                <div style="font-size: 0.8rem; color: var(--cor-secundaria);">Pendentes</div>
              </div>
              <div>
                <div style="font-size: 1.5rem; font-weight: bold; color: var(--cor-erro);" id="consultasCanceladas">0</div>
                <div style="font-size: 0.8rem; color: var(--cor-secundaria);">Canceladas</div>
              </div>
            </div>
          </div>

          <div id="agendaContent" style="max-height: 400px; overflow-y: auto;">
            <!-- Conteúdo da agenda será carregado aqui -->
          </div>

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--cor-borda);">
            <button class="btn-primary" onclick="Medico.novaConsulta(${medico.id})" style="width: 100%;">
              ➕ Nova Consulta
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    Medico.carregarAgenda(medico.id, 'hoje');
  },

  fecharModalAgenda: () => {
    const modal = document.getElementById('modalAgenda');
    if (modal) {
      modal.remove();
    }
  },

  carregarAgenda: (medicoId, periodo = 'hoje') => {
    console.log(`📋 Carregando agenda para médico ${medicoId}, período: ${periodo}`);
    
    const agendamentos = Storage.getAgendamentos();
    const hoje = new Date();
    
    let consultas = agendamentos.filter(ag => parseInt(ag.medicoId) === parseInt(medicoId));
    
    switch(periodo) {
      case 'hoje':
        consultas = consultas.filter(ag => {
          try {
            const dataAgendamento = new Date(ag.data);
            return dataAgendamento.toDateString() === hoje.toDateString();
          } catch (e) {
            return false;
          }
        });
        break;
      case 'semana':
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - hoje.getDay());
        inicioSemana.setHours(0, 0, 0, 0);
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);
        fimSemana.setHours(23, 59, 59, 999);
        consultas = consultas.filter(ag => {
          try {
            const dataAgendamento = new Date(ag.data);
            return dataAgendamento >= inicioSemana && dataAgendamento <= fimSemana;
          } catch (e) {
            return false;
          }
        });
        break;
      case 'mes':
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59, 999);
        consultas = consultas.filter(ag => {
          try {
            const dataAgendamento = new Date(ag.data);
            return dataAgendamento >= inicioMes && dataAgendamento <= fimMes;
          } catch (e) {
            return false;
          }
        });
        break;
    }
    
    consultas.sort((a, b) => {
      try {
        const dataA = new Date(a.data + ' ' + (a.horario || a.hora || '00:00'));
        const dataB = new Date(b.data + ' ' + (b.horario || b.hora || '00:00'));
        return dataA - dataB;
      } catch (e) {
        return 0;
      }
    });
    
    Medico.atualizarEstatisticasAgenda(consultas, medicoId);
    Medico.renderizarConsultasAgenda(consultas);
  },

  atualizarEstatisticasAgenda: (consultas, medicoId) => {
    const total = consultas.length;
    const confirmadas = consultas.filter(c => c.status === 'confirmado' || c.status === 'agendado').length;
    const pendentes = consultas.filter(c => c.status === 'pendente').length;
    const canceladas = consultas.filter(c => c.status === 'cancelado').length;
    
    document.getElementById('totalConsultas').textContent = total;
    document.getElementById('consultasConfirmadas').textContent = confirmadas;
    document.getElementById('consultasPendentes').textContent = pendentes;
    document.getElementById('consultasCanceladas').textContent = canceladas;
  },

  renderizarConsultasAgenda: (consultas) => {
    const agendaContent = document.getElementById('agendaContent');
    
    if (consultas.length === 0) {
      agendaContent.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--cor-secundaria);">
          <div style="font-size: 3rem; margin-bottom: 10px;">📅</div>
          <h3>Nenhuma consulta encontrada</h3>
          <p>Não há consultas agendadas para o período selecionado.</p>
        </div>
      `;
      return;
    }
    
    let html = '';
    consultas.forEach(consulta => {
      const data = new Date(consulta.data);
      const statusClass = {
        'confirmado': 'status-confirmado',
        'agendado': 'status-confirmado',
        'pendente': 'status-pendente',
        'cancelado': 'status-cancelado'
      }[consulta.status] || 'status-pendente';
      
      const statusText = {
        'confirmado': 'Confirmada',
        'agendado': 'Agendada', 
        'pendente': 'Pendente',
        'cancelado': 'Cancelada'
      }[consulta.status] || 'Pendente';
      
      html += `
        <div class="appointment-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
            <div style="flex: 1;">
              <div style="font-weight: bold; color: var(--cor-principal);">
                ${data.toLocaleDateString('pt-BR')} - ${consulta.horario || consulta.hora}
              </div>
              <div style="font-size: 0.9rem; color: var(--cor-texto); margin-top: 5px;">
                <strong>Paciente:</strong> ${consulta.pacienteNome || 'N/A'}
              </div>
            </div>
            <span class="status-badge ${statusClass}" style="padding: 4px 8px; border-radius: 5px; font-size: 0.7rem; white-space: nowrap;">
              ${statusText}
            </span>
          </div>
          
          ${consulta.observacoes ? `
          <div style="font-size: 0.8rem; margin-bottom: 10px; padding: 8px; background: var(--cor-fundo); border-radius: 5px;">
            <strong>Observações:</strong> ${consulta.observacoes}
          </div>
          ` : ''}
          
          <div style="display: flex; gap: 5px; flex-wrap: wrap;">
            <button class="btn-action" onclick="Medico.alterarStatusConsulta(${consulta.id}, 'confirmado')" 
                    style="padding: 5px 10px; background: var(--cor-sucesso); color: white; border: none; border-radius: 5px; font-size: 0.7rem; cursor: pointer;">
              ✅ Confirmar
            </button>
            <button class="btn-action" onclick="Medico.alterarStatusConsulta(${consulta.id}, 'cancelado')"
                    style="padding: 5px 10px; background: var(--cor-erro); color: white; border: none; border-radius: 5px; font-size: 0.7rem; cursor: pointer;">
              ❌ Cancelar
            </button>
            <button class="btn-action" onclick="Medico.verDetalhesConsulta(${consulta.id})"
                    style="padding: 5px 10px; background: var(--cor-info); color: white; border: none; border-radius: 5px; font-size: 0.7rem; cursor: pointer;">
              📋 Detalhes
            </button>
          </div>
        </div>
      `;
    });
    
    agendaContent.innerHTML = html;
  },

  mudarVisualizacaoAgenda: (periodo) => {
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    const titulo = document.querySelector('#modalAgenda h2').textContent;
    const medicoNome = titulo.replace('📅 Agenda - ', '');
    const medico = Medico.getAll().find(m => m.nome === medicoNome);
    
    if (medico) {
      Medico.carregarAgenda(medico.id, periodo);
    }
  },

  alterarStatusConsulta: (consultaId, novoStatus) => {
    const agendamentos = Storage.getAgendamentos();
    const consultaIndex = agendamentos.findIndex(a => a.id == consultaId);
    
    if (consultaIndex !== -1) {
      agendamentos[consultaIndex].status = novoStatus;
      localStorage.setItem('CallMed_agendamentos', JSON.stringify(agendamentos));
      
      const modal = document.getElementById('modalAgenda');
      if (modal) {
        const titulo = modal.querySelector('h2').textContent;
        const medicoNome = titulo.replace('📅 Agenda - ', '');
        const medico = Medico.getAll().find(m => m.nome === medicoNome);
        
        if (medico) {
          const periodoAtivo = document.querySelector('.view-btn.active').dataset.view;
          Medico.carregarAgenda(medico.id, periodoAtivo);
        }
      }
      
      alert(`Consulta ${novoStatus} com sucesso!`);
    }
  },

  verDetalhesConsulta: (consultaId) => {
    const agendamentos = Storage.getAgendamentos();
    const consulta = agendamentos.find(a => a.id == consultaId);
    
    if (!consulta) {
      alert('❌ Consulta não encontrada.');
      return;
    }
    
    const detalhesHTML = `
      <div class="modal active" id="modalDetalhesConsulta">
        <div class="modal-content" style="max-width: 500px;">
          <button class="modal-close" onclick="document.getElementById('modalDetalhesConsulta').remove()">&times;</button>
          <h2 style="color: var(--cor-principal);">📋 Detalhes da Consulta</h2>
          
          <div style="background: var(--cor-fundo); padding: 15px; border-radius: 10px; margin: 10px 0;">
            <strong>Data:</strong> ${new Date(consulta.data).toLocaleDateString('pt-BR')}<br>
            <strong>Horário:</strong> ${consulta.horario || consulta.hora}<br>
            <strong>Status:</strong> ${consulta.status}
          </div>
          
          <div style="background: var(--cor-fundo); padding: 15px; border-radius: 10px; margin: 10px 0;">
            <strong>Paciente:</strong> ${consulta.pacienteNome || 'N/A'}<br>
            <strong>Médico:</strong> ${consulta.medicoNome || 'N/A'}
          </div>
          
          ${consulta.observacoes ? `
          <div style="background: var(--cor-fundo); padding: 15px; border-radius: 10px; margin: 10px 0;">
            <strong>Observações:</strong> ${consulta.observacoes}
          </div>
          ` : ''}
          
          <div style="margin-top: 20px; display: flex; gap: 10px;">
            <button onclick="Medico.alterarStatusConsulta(${consulta.id}, 'confirmado'); document.getElementById('modalDetalhesConsulta').remove();" 
                    style="flex: 1; padding: 10px; background: var(--cor-sucesso); color: white; border: none; border-radius: 8px; cursor: pointer;">
              ✅ Confirmar
            </button>
            <button onclick="Medico.alterarStatusConsulta(${consulta.id}, 'cancelado'); document.getElementById('modalDetalhesConsulta').remove();" 
                    style="flex: 1; padding: 10px; background: var(--cor-erro); color: white; border: none; border-radius: 8px; cursor: pointer;">
              ❌ Cancelar
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', detalhesHTML);
  },

  novaConsulta: (medicoId) => {
    console.log('➕ Redirecionando para nova consulta - Médico ID:', medicoId);
    Medico.fecharModalAgenda();
    localStorage.setItem('medicoSelecionadoAgendamento', medicoId.toString());
    setTimeout(() => {
      window.location.href = 'agendar.html';
    }, 300);
  },

  // =============================================
  // DEBUG
  // =============================================
  debugAgendamentos: function() {
    const agendamentos = Storage.getAgendamentos();
    const medicos = Storage.getMedicos();
    const pacientes = Storage.getPacientes();
    
    console.log('🐛 DEBUG AGENDAMENTOS:');
    console.log('📋 Total agendamentos:', agendamentos.length);
    console.log('👥 Total pacientes:', pacientes.length);
    console.log('🩺 Total médicos:', medicos.length);
    
    agendamentos.forEach((ag, index) => {
      console.log(`Agendamento ${index + 1}:`, {
        id: ag.id,
        pacienteId: ag.pacienteId,
        medicoId: ag.medicoId,
        pacienteEncontrado: pacientes.find(p => p.id == ag.pacienteId),
        medicoEncontrado: medicos.find(m => m.id == ag.medicoId),
        data: ag.data
      });
    });
  }
};

// =============================================
// INICIALIZAÇÃO
// =============================================
document.addEventListener("DOMContentLoaded", () => {
  console.log('🚀 Inicializando sistema de médicos...');
  
  if (window.location.pathname.includes('medicos.html')) {
    // Carrega especialidades nos selects
    Medico.carregarEspecialidadesNoSelect();
    
    // Carrega clínicas nos selects
    Medico.carregarClinicasNoSelect();
    Medico.carregarClinicasNoFiltro();
    
    // Renderiza a tabela inicial
    Medico.renderTable();

    // Configura formulário
    const form = document.getElementById("medicoForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        console.log('📝 Submetendo formulário de médico...');

        const medicoData = {
          nome: document.getElementById("nome").value,
          email: document.getElementById("email").value,
          telefone: document.getElementById("telefone").value,
          especialidade: document.getElementById("especialidade").value,
          crm: document.getElementById("crm").value,
          clinicaId: document.getElementById("clinica").value || null // NOVO
        };

        console.log('Dados do médico:', medicoData);

        if (form.dataset.editId) {
          Medico.update(parseInt(form.dataset.editId), medicoData);
          delete form.dataset.editId;
        } else {
          Medico.add(medicoData);
        }

        form.reset();
        document.getElementById("modalTitle").textContent = "Novo Médico";
        document.getElementById("modalMedico").classList.remove("active");
      });
    }

    // Configura modal
    const modal = document.getElementById('modalMedico');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');

    if (openModalBtn) {
      openModalBtn.addEventListener('click', () => {
        console.log('➕ Abrindo modal para novo médico');
        const form = document.getElementById("medicoForm");
        if (form) {
          delete form.dataset.editId;
          form.reset();
          document.getElementById("modalTitle").textContent = "Novo Médico";
        }
        modal.classList.add('active');
      });
    }

    if (closeModalBtn) {
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

    // Configura filtros
    const searchInput = document.getElementById("searchInput");
    const especialidadeFilter = document.getElementById("especialidadeFilter");
    const clinicaFilter = document.getElementById("clinicaFilter");
    const statusFilter = document.getElementById("statusFilter");

    if (searchInput) {
      searchInput.addEventListener('input', Medico.filtrarMedicos);
    }

    if (especialidadeFilter) {
      especialidadeFilter.addEventListener('change', Medico.filtrarMedicos);
    }

    if (clinicaFilter) {
      clinicaFilter.addEventListener('change', Medico.filtrarMedicos);
    }

    if (statusFilter) {
      statusFilter.addEventListener('change', Medico.filtrarMedicos);
    }

    console.log('✅ Sistema de médicos inicializado com sucesso');
  }
});