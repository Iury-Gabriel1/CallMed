/* ===========================================================
   CallMed -  crud.js
   Paciente + Medico + Clinica + Especialidade
   =========================================================== */

/* ===========================================================
   PACIENTE
   =========================================================== */

const Paciente = {
  getAll: () => Storage.getPacientes(),

  add: async (paciente) => {
    await Storage.salvarPaciente(paciente);
    Paciente.renderTable();
    if (typeof Notificacao !== "undefined") {
      Notificacao.show("Paciente adicionado com sucesso!", "success");
    }
  },

  remove: async (id) => {
    await Storage.excluirPaciente(id);
    Paciente.renderTable();
    if (typeof Notificacao !== "undefined") {
      Notificacao.show("Paciente removido!", "warning");
    }
  },

  update: async (id, dados) => {
    const paciente = { id, ...dados };
    await Storage.salvarPaciente(paciente);
    Paciente.renderTable();
    if (typeof Notificacao !== "undefined") {
      Notificacao.show("Paciente atualizado!", "success");
    }
  },

  renderTable: () => {
    const tbody = document.querySelector("#pacientesTable tbody");
    if (!tbody) return;
    
    tbody.innerHTML = "";
    const pacientes = Paciente.getAll();

    if (pacientes.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 2rem; color: var(--cor-secundaria);">
            Nenhum paciente cadastrado. Clique em "+ Novo Paciente" para adicionar.
          </td>
        </tr>
      `;
      return;
    }

    pacientes.forEach(p => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          <div class="table-avatar">
            <div class="foto-padrao">
              <div class="foto-placeholder">${p.nome?.charAt(0) || 'P'}</div>
            </div>
            ${p.nome}
          </div>
        </td>
        <td>${p.email}</td>
        <td>${p.telefone}</td>
        <td>${new Date(p.nascimento).toLocaleDateString('pt-BR')}</td>
        <td>
          <button onclick="Paciente.edit(${p.id})" class="btn-edit">Editar</button>
          <button onclick="Paciente.remove(${p.id})" class="btn-delete">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  edit: (id) => {
    const paciente = Paciente.getAll().find(p => p.id === id);
    if (!paciente) return;

    document.getElementById("nome").value = paciente.nome;
    document.getElementById("email").value = paciente.email;
    document.getElementById("telefone").value = paciente.telefone;
    document.getElementById("nascimento").value = paciente.nascimento;

    const form = document.getElementById("pacienteForm");
    form.dataset.editId = id;
    document.getElementById("modalPaciente").classList.add("active");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  if (window.location.href.includes('pacientes.html')) {
    Paciente.renderTable();

    const form = document.getElementById("pacienteForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        const pacienteData = {
          nome: form.nome.value,
          email: form.email.value,
          telefone: form.telefone.value,
          nascimento: form.nascimento.value
        };

        if (form.dataset.editId) {
          Paciente.update(parseInt(form.dataset.editId), pacienteData);
          delete form.dataset.editId;
        } else {
          Paciente.add(pacienteData);
        }

        form.reset();
        document.getElementById("modalPaciente").classList.remove("active");
      });
    }

    const modal = document.getElementById('modalPaciente');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');

    if (openModalBtn) {
      openModalBtn.addEventListener('click', () => {
        delete form.dataset.editId;
        form.reset();
        modal.classList.add('active');
      });
    }

    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));
    }

    if (modal) {
      window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    }
  }
});

/* ===========================================================
   MÉDICO
   =========================================================== */

const Medico = {
  getAll: () => Storage.getMedicos(),

  add: async (medico) => {
    const resultado = await Storage.salvarMedico(medico);
    Medico.renderTable();
    if (resultado) alert("✅ Médico adicionado com sucesso!");
    else alert("❌ Erro ao adicionar médico!");
    return resultado;
  },

  remove: async (id) => {
    const usuarioLogado = Storage.getUsuarioLogado();
    const medico = Medico.getAll().find(m => m.id == id);
    
    if (!medico) {
      alert("❌ Médico não encontrado!");
      return;
    }

    if (usuarioLogado && medico.usuarioId && medico.usuarioId.toString() === usuarioLogado.id.toString()) {
      alert("❌ Você não pode excluir seu próprio perfil.");
      return;
    }

    if (medico.usuarioId) {
      if (!confirm('⚠️ Este médico está vinculado a um usuário do sistema. Tem certeza que deseja excluir?')) return;
    } else {
      if (!confirm('Tem certeza que deseja excluir este médico?')) return;
    }

    await Storage.excluirMedico(id);
    Medico.renderTable();
    alert("✅ Médico excluído com sucesso!");
  },

  update: async (id, dados) => {
    const medicoExistente = Medico.getAll().find(m => m.id == id);
    if (!medicoExistente) {
      alert("❌ Médico não encontrado!");
      return null;
    }

    const medicoAtualizado = {
      ...medicoExistente,
      ...dados,
      id: medicoExistente.id,
      usuarioId: medicoExistente.usuarioId,
      dataCadastro: medicoExistente.dataCadastro
    };

    const resultado = await Storage.salvarMedico(medicoAtualizado);
    Medico.renderTable();
    if (resultado) alert("✅ Médico atualizado com sucesso!");
    else alert("❌ Erro ao atualizar médico!");
    return resultado;
  },

  isMedicoLogado: (medico) => {
    const usuarioLogado = Storage.getUsuarioLogado();
    return usuarioLogado && medico.usuarioId && medico.usuarioId.toString() === usuarioLogado.id.toString();
  },

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
  },

  carregarEspecialidadesNoSelect: () => {
    const especialidades = Medico.getEspecialidades();
    
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
  },

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
  },

  getEspecialidades: () => {
    return [
      "Acupuntura", "Alergologia e Imunologia", "Anestesiologia", "Angiologia",
      "Cancerologia", "Cardiologia", "Cirurgia Cardiovascular", "Cirurgia da Mão",
      "Cirurgia de Cabeça e Pescoço", "Cirurgia do Aparelho Digestivo", "Cirurgia Geral",
      "Cirurgia Pediátrica", "Cirurgia Plástica", "Cirurgia Torácica", "Cirurgia Vascular",
      "Clínica Médica", "Coloproctologia", "Dermatologia", "Endocrinologia e Metabologia",
      "Endoscopia", "Gastroenterologia", "Genética Médica", "Geriatria",
      "Ginecologia e Obstetrícia", "Hematologia e Hemoterapia", "Homeopatia",
      "Infectologia", "Mastologia", "Medicina de Emergência", "Medicina do Trabalho",
      "Medicina de Família e Comunidade", "Medicina Esportiva", "Medicina Física e Reabilitação",
      "Medicina Intensiva", "Medicina Legal e Perícia Médica", "Medicina Nuclear",
      "Medicina Preventiva e Social", "Nefrologia", "Neurocirurgia", "Neurologia",
      "Nutrologia", "Oftalmologia", "Oncologia Clínica", "Ortopedia e Traumatologia",
      "Otorrinolaringologia", "Patologia", "Patologia Clínica/Medicina Laboratorial",
      "Pediatria", "Pneumologia", "Psiquiatria", "Radiologia e Diagnóstico por Imagem",
      "Radioterapia", "Reumatologia", "Urologia", "Outra"
    ];
  },

  renderTable: () => {
    const tbody = document.querySelector("#medicosTable tbody");
    const cardsContainer = document.getElementById("medicosCards");
    const emptyState = document.getElementById("emptyState");
    
    if (!tbody) return;

    tbody.innerHTML = "";
    if (cardsContainer) cardsContainer.innerHTML = "";
    
    const medicos = Medico.getAll();
    const clinicas = Storage.getClinicas() || [];

    if (medicos.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    medicos.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));

    medicos.forEach(m => {
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
            `<button class="btn-acao btn-ver-agenda" onclick="Medico.verMinhaAgenda()">📅 Minha Agenda</button>` : 
            `<button class="btn-acao btn-editar" onclick="Medico.edit(${m.id})">✏️ Editar</button>
            <button class="btn-acao btn-excluir" onclick="Medico.remove(${m.id})">🗑️ Excluir</button>
            <button class="btn-acao btn-ver-agenda" onclick="Medico.verAgenda(${m.id})">📅 Agenda</button>`
          }
        </td>
      `;
      tbody.appendChild(tr);
    });

    if (cardsContainer) {
      medicos.forEach(m => {
        const card = Medico.criarCardMedico(m);
        cardsContainer.appendChild(card);
      });
    }
  },

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
          <div class="medico-contato">📞 ${medico.telefone || 'Não informado'}</div>
          <div class="medico-email">📧 ${medico.email || 'Email não informado'}</div>
        </div>
      </div>
      <div class="medico-acoes">
        ${isMedicoLogado ? 
          `<button class="btn-acao btn-ver-agenda" onclick="Medico.verMinhaAgenda()">📅 Minha Agenda</button>` :
          `<button class="btn-acao btn-editar" onclick="Medico.edit(${medico.id})">✏️ Editar</button>
          <button class="btn-acao btn-excluir" onclick="Medico.remove(${medico.id})">🗑️ Excluir</button>
          <button class="btn-acao btn-ver-agenda" onclick="Medico.verAgenda(${medico.id})">📅 Agenda</button>`
        }
      </div>
    `;

    return card;
  },

  edit: (id) => {
    const medico = Medico.getAll().find(m => m.id == id);
    if (!medico) {
      alert("❌ Médico não encontrado!");
      return;
    }

    if (Medico.isMedicoLogado(medico)) {
      alert("⚠️ Você não pode editar seu próprio perfil aqui. Use a página de configurações.");
      return;
    }

    const modalTitle = document.getElementById("modalTitle");
    if (modalTitle) modalTitle.textContent = "Editar Médico";
    
    document.getElementById("nome").value = medico.nome || '';
    document.getElementById("email").value = medico.email || '';
    document.getElementById("telefone").value = medico.telefone || '';
    document.getElementById("especialidade").value = medico.especialidade || '';
    document.getElementById("crm").value = medico.crm || '';
    
    const clinicaSelect = document.getElementById("clinica");
    if (clinicaSelect && medico.clinicaId) clinicaSelect.value = medico.clinicaId;

    const form = document.getElementById("medicoForm");
    form.dataset.editId = id;
    document.getElementById("modalMedico").classList.add("active");
  },

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
        <td>${m.nome || 'Nome não informado'}${isMedicoLogado ? ' <span style="color: var(--cor-principal);">(Você)</span>' : ''}</td>
        <td>${m.especialidade || 'Não informada'}</td>
        <td>${clinicaNome !== 'Não vinculado' ? `<span class="clinica-badge">${clinicaNome}</span>` : '<span style="color: var(--cor-secundaria);">Não vinculado</span>'}</td>
        <td>${m.telefone || 'Não informado'}</td>
        <td>${m.email || 'Email não informado'}</td>
        <td><span class="status-badge ${m.status === 'ativo' ? 'status-ativo' : 'status-inativo'}">${m.status === 'ativo' ? 'Ativo' : 'Inativo'}</span></td>
        <td class="acoes-cell">
          ${isMedicoLogado ? 
            `<button class="btn-acao btn-ver-agenda" onclick="Medico.verMinhaAgenda()">📅 Minha Agenda</button>` : 
            `<button class="btn-acao btn-editar" onclick="Medico.edit(${m.id})">✏️ Editar</button>
            <button class="btn-acao btn-excluir" onclick="Medico.remove(${m.id})">🗑️ Excluir</button>
            <button class="btn-acao btn-ver-agenda" onclick="Medico.verAgenda(${m.id})">📅 Agenda</button>`
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

  verMinhaAgenda: () => {
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
          
          <div class="agenda-controls">
            <button class="view-btn active" data-view="hoje" onclick="Medico.mudarVisualizacaoAgenda('hoje')">Hoje</button>
            <button class="view-btn" data-view="semana" onclick="Medico.mudarVisualizacaoAgenda('semana')">Esta Semana</button>
            <button class="view-btn" data-view="mes" onclick="Medico.mudarVisualizacaoAgenda('mes')">Este Mês</button>
            <button class="view-btn" data-view="todos" onclick="Medico.mudarVisualizacaoAgenda('todos')">Todos</button>
          </div>

          <div class="agenda-stats">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; text-align: center;">
              <div><div style="font-size: 1.5rem; font-weight: bold; color: var(--cor-principal);" id="totalConsultas">0</div><div style="font-size: 0.8rem;">Total</div></div>
              <div><div style="font-size: 1.5rem; font-weight: bold; color: var(--cor-sucesso);" id="consultasConfirmadas">0</div><div style="font-size: 0.8rem;">Confirmadas</div></div>
              <div><div style="font-size: 1.5rem; font-weight: bold; color: var(--cor-aviso);" id="consultasPendentes">0</div><div style="font-size: 0.8rem;">Pendentes</div></div>
              <div><div style="font-size: 1.5rem; font-weight: bold; color: var(--cor-erro);" id="consultasCanceladas">0</div><div style="font-size: 0.8rem;">Canceladas</div></div>
            </div>
          </div>

          <div id="agendaContent" style="max-height: 400px; overflow-y: auto;"></div>

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--cor-borda);">
            <button class="btn-primary" onclick="Medico.novaConsulta(${medico.id})" style="width: 100%;">➕ Nova Consulta</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    Medico.carregarAgenda(medico.id, 'hoje');
  },

  fecharModalAgenda: () => {
    const modal = document.getElementById('modalAgenda');
    if (modal) modal.remove();
  },

  carregarAgenda: (medicoId, periodo = 'hoje') => {
    const agendamentos = Storage.getAgendamentos();
    const hoje = new Date();
    
    let consultas = agendamentos.filter(ag => parseInt(ag.medicoId) === parseInt(medicoId));
    
    switch(periodo) {
      case 'hoje':
        consultas = consultas.filter(ag => {
          try { return new Date(ag.data).toDateString() === hoje.toDateString(); }
          catch (e) { return false; }
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
          } catch (e) { return false; }
        });
        break;
      case 'mes':
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59, 999);
        consultas = consultas.filter(ag => {
          try {
            const dataAgendamento = new Date(ag.data);
            return dataAgendamento >= inicioMes && dataAgendamento <= fimMes;
          } catch (e) { return false; }
        });
        break;
    }
    
    consultas.sort((a, b) => {
      try {
        const dataA = new Date(a.data + ' ' + (a.horario || a.hora || '00:00'));
        const dataB = new Date(b.data + ' ' + (b.horario || b.hora || '00:00'));
        return dataA - dataB;
      } catch (e) { return 0; }
    });
    
    Medico.atualizarEstatisticasAgenda(consultas);
    Medico.renderizarConsultasAgenda(consultas);
  },

  atualizarEstatisticasAgenda: (consultas) => {
    const total = consultas.length;
    const confirmadas = consultas.filter(c => c.status === 'confirmado' || c.status === 'agendado').length;
    const pendentes = consultas.filter(c => c.status === 'pendente').length;
    const canceladas = consultas.filter(c => c.status === 'cancelado').length;
    
    const elTotal = document.getElementById('totalConsultas');
    const elConf = document.getElementById('consultasConfirmadas');
    const elPend = document.getElementById('consultasPendentes');
    const elCanc = document.getElementById('consultasCanceladas');
    
    if (elTotal) elTotal.textContent = total;
    if (elConf) elConf.textContent = confirmadas;
    if (elPend) elPend.textContent = pendentes;
    if (elCanc) elCanc.textContent = canceladas;
  },

  renderizarConsultasAgenda: (consultas) => {
    const agendaContent = document.getElementById('agendaContent');
    if (!agendaContent) return;
    
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
      const statusText = {
        'confirmado': 'Confirmada', 'agendado': 'Agendada', 
        'pendente': 'Pendente', 'cancelado': 'Cancelada'
      }[consulta.status] || 'Pendente';
      
      html += `
        <div class="appointment-card">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <div style="flex: 1;">
              <div style="font-weight: bold; color: var(--cor-principal);">
                ${data.toLocaleDateString('pt-BR')} - ${consulta.horario || consulta.hora}
              </div>
              <div style="font-size: 0.9rem;"><strong>Paciente:</strong> ${consulta.pacienteNome || 'N/A'}</div>
            </div>
            <span class="status-badge">${statusText}</span>
          </div>
          <div style="display: flex; gap: 5px; flex-wrap: wrap;">
            <button class="btn-action" onclick="Medico.alterarStatusConsulta(${consulta.id}, 'confirmado')" style="background: var(--cor-sucesso);">✅ Confirmar</button>
            <button class="btn-action" onclick="Medico.alterarStatusConsulta(${consulta.id}, 'cancelado')" style="background: var(--cor-erro);">❌ Cancelar</button>
            <button class="btn-action" onclick="Medico.verDetalhesConsulta(${consulta.id})" style="background: var(--cor-info);">📋 Detalhes</button>
          </div>
        </div>
      `;
    });
    
    agendaContent.innerHTML = html;
  },

  mudarVisualizacaoAgenda: (periodo) => {
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const titulo = document.querySelector('#modalAgenda h2').textContent;
    const medicoNome = titulo.replace('📅 Agenda - ', '');
    const medico = Medico.getAll().find(m => m.nome === medicoNome);
    
    if (medico) Medico.carregarAgenda(medico.id, periodo);
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
    const consulta = Storage.getAgendamentos().find(a => a.id == consultaId);
    if (!consulta) {
      alert('❌ Consulta não encontrada.');
      return;
    }
    
    const detalhesHTML = `
      <div class="modal active" id="modalDetalhesConsulta">
        <div class="modal-content" style="max-width: 500px;">
          <button class="modal-close" onclick="document.getElementById('modalDetalhesConsulta').remove()">&times;</button>
          <h2>📋 Detalhes da Consulta</h2>
          <div style="background: var(--cor-fundo); padding: 15px; border-radius: 10px; margin: 10px 0;">
            <strong>Data:</strong> ${new Date(consulta.data).toLocaleDateString('pt-BR')}<br>
            <strong>Horário:</strong> ${consulta.horario || consulta.hora}<br>
            <strong>Status:</strong> ${consulta.status}
          </div>
          <div style="background: var(--cor-fundo); padding: 15px; border-radius: 10px; margin: 10px 0;">
            <strong>Paciente:</strong> ${consulta.pacienteNome || 'N/A'}<br>
            <strong>Médico:</strong> ${consulta.medicoNome || 'N/A'}
          </div>
          <div style="margin-top: 20px; display: flex; gap: 10px;">
            <button onclick="Medico.alterarStatusConsulta(${consulta.id}, 'confirmado'); document.getElementById('modalDetalhesConsulta').remove();" style="flex: 1; padding: 10px; background: var(--cor-sucesso); color: white; border: none; border-radius: 8px; cursor: pointer;">✅ Confirmar</button>
            <button onclick="Medico.alterarStatusConsulta(${consulta.id}, 'cancelado'); document.getElementById('modalDetalhesConsulta').remove();" style="flex: 1; padding: 10px; background: var(--cor-erro); color: white; border: none; border-radius: 8px; cursor: pointer;">❌ Cancelar</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', detalhesHTML);
  },

  novaConsulta: (medicoId) => {
    Medico.fecharModalAgenda();
    localStorage.setItem('medicoSelecionadoAgendamento', medicoId.toString());
    setTimeout(() => { window.location.href = 'agendar.html'; }, 300);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes('medicos.html')) {
    Medico.carregarEspecialidadesNoSelect();
    Medico.carregarClinicasNoSelect();
    Medico.carregarClinicasNoFiltro();
    Medico.renderTable();

    const form = document.getElementById("medicoForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        const medicoData = {
          nome: document.getElementById("nome").value,
          email: document.getElementById("email").value,
          telefone: document.getElementById("telefone").value,
          especialidade: document.getElementById("especialidade").value,
          crm: document.getElementById("crm").value,
          clinicaId: document.getElementById("clinica").value || null
        };

        if (form.dataset.editId) {
          Medico.update(parseInt(form.dataset.editId), medicoData);
          delete form.dataset.editId;
        } else {
          Medico.add(medicoData);
        }

        form.reset();
        const modalTitle = document.getElementById("modalTitle");
        if (modalTitle) modalTitle.textContent = "Novo Médico";
        document.getElementById("modalMedico").classList.remove("active");
      });
    }

    const modal = document.getElementById('modalMedico');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');

    if (openModalBtn) {
      openModalBtn.addEventListener('click', () => {
        if (form) {
          delete form.dataset.editId;
          form.reset();
          const modalTitle = document.getElementById("modalTitle");
          if (modalTitle) modalTitle.textContent = "Novo Médico";
        }
        modal.classList.add('active');
      });
    }

    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));
    }

    if (modal) {
      window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    }

    const searchInput = document.getElementById("searchInput");
    const especialidadeFilter = document.getElementById("especialidadeFilter");
    const clinicaFilter = document.getElementById("clinicaFilter");
    const statusFilter = document.getElementById("statusFilter");

    if (searchInput) searchInput.addEventListener('input', Medico.filtrarMedicos);
    if (especialidadeFilter) especialidadeFilter.addEventListener('change', Medico.filtrarMedicos);
    if (clinicaFilter) clinicaFilter.addEventListener('change', Medico.filtrarMedicos);
    if (statusFilter) statusFilter.addEventListener('change', Medico.filtrarMedicos);
  }
});

/* ===========================================================
   CLÍNICA
   =========================================================== */

const Clinica = {
  init() {
    this.renderTable();
    this.configurarFormulario();
    this.configurarFiltros();
    this.configurarModal();
  },

  getAll() {
    return Storage.getClinicas();
  },

  async add(clinica) {
    const resultado = await Storage.salvarClinica(clinica);
    this.renderTable();
    if (resultado) {
      Notificacao?.show('✅ Clínica adicionada com sucesso!', 'success');
    } else {
      Notificacao?.show('❌ Erro ao adicionar clínica!', 'error');
    }
    return resultado;
  },

  async remove(id) {
    if (!confirm('Tem certeza que deseja excluir esta clínica?')) return;
    
    const medicos = Storage.getMedicosPorClinica(id);
    if (medicos.length > 0) {
      if (!confirm(`⚠️ Esta clínica tem ${medicos.length} médicos vinculados. Excluir mesmo assim?`)) return;
    }

    await Storage.excluirClinica(id);
    this.renderTable();
    Notificacao?.show('🗑️ Clínica excluída com sucesso!', 'warning');
  },

  async update(id, dados) {
    const clinicaExistente = this.getAll().find(c => c.id == id);
    if (!clinicaExistente) {
      Notificacao?.show('❌ Clínica não encontrada!', 'error');
      return null;
    }

    const clinicaAtualizada = {
      ...clinicaExistente,
      ...dados,
      id: clinicaExistente.id,
      dataCadastro: clinicaExistente.dataCadastro
    };

    const resultado = await Storage.salvarClinica(clinicaAtualizada);
    this.renderTable();
    if (resultado) {
      Notificacao?.show('✅ Clínica atualizada com sucesso!', 'success');
    } else {
      Notificacao?.show('❌ Erro ao atualizar clínica!', 'error');
    }
    return resultado;
  },

  renderTable() {
    const tbody = document.querySelector("#clinicasTable tbody");
    const cardsContainer = document.getElementById("clinicasCards");
    const emptyState = document.getElementById("emptyState");

    if (!tbody) return;

    const clinicas = this.getAll();
    tbody.innerHTML = "";
    if (cardsContainer) cardsContainer.innerHTML = "";

    if (clinicas.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    clinicas.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));

    clinicas.forEach(c => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${c.nome || 'Nome não informado'}</strong></td>
        <td>${c.cnpj || 'Não informado'}</td>
        <td>${c.telefone || 'Não informado'}</td>
        <td>${c.email || 'Não informado'}</td>
        <td>
          <span class="status-badge ${c.status === 'ativo' ? 'status-ativo' : 'status-inativo'}">
            ${c.status === 'ativo' ? 'Ativa' : 'Inativa'}
          </span>
        </td>
        <td class="acoes-cell">
          <button class="btn-acao btn-ver-medicos" onclick="Clinica.verMedicos('${c.id}')">👨‍⚕️ Médicos</button>
          <button class="btn-acao btn-editar" onclick="Clinica.edit('${c.id}')">✏️ Editar</button>
          <button class="btn-acao btn-excluir" onclick="Clinica.remove('${c.id}')">🗑️ Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    if (cardsContainer) {
      clinicas.forEach(c => {
        cardsContainer.appendChild(this.criarCardClinica(c));
      });
    }
  },

  criarCardClinica(clinica) {
    const card = document.createElement("div");
    card.className = "clinica-card";
    card.innerHTML = `
      <div class="clinica-header">
        <div class="clinica-nome">${clinica.nome || 'Nome não informado'}</div>
        <span class="status-badge ${clinica.status === 'ativo' ? 'status-ativo' : 'status-inativo'}">
          ${clinica.status === 'ativo' ? 'Ativa' : 'Inativa'}
        </span>
      </div>
      <div class="clinica-info">
        <div><strong>CNPJ:</strong> ${clinica.cnpj || 'Não informado'}</div>
        <div><strong>Telefone:</strong> ${clinica.telefone || 'Não informado'}</div>
        <div><strong>E-mail:</strong> ${clinica.email || 'Não informado'}</div>
        <div><strong>Endereço:</strong> ${clinica.endereco || 'Não informado'}</div>
      </div>
      <div class="clinica-acoes">
        <button class="btn-acao btn-ver-medicos" onclick="Clinica.verMedicos('${clinica.id}')">👨‍⚕️ Médicos (${Storage.getMedicosPorClinica(clinica.id).length})</button>
        <button class="btn-acao btn-editar" onclick="Clinica.edit('${clinica.id}')">✏️ Editar</button>
        <button class="btn-acao btn-excluir" onclick="Clinica.remove('${clinica.id}')">🗑️ Excluir</button>
      </div>
    `;
    return card;
  },

  edit(id) {
    const clinica = this.getAll().find(c => c.id == id);
    if (!clinica) {
      Notificacao?.show('❌ Clínica não encontrada!', 'error');
      return;
    }

    const modalTitle = document.getElementById("modalTitle");
    if (modalTitle) modalTitle.textContent = "Editar Clínica";
    
    document.getElementById("nome").value = clinica.nome || '';
    document.getElementById("cnpj").value = clinica.cnpj || '';
    document.getElementById("telefone").value = clinica.telefone || '';
    document.getElementById("email").value = clinica.email || '';
    document.getElementById("endereco").value = clinica.endereco || '';
    document.getElementById("horario_inicio").value = clinica.horario_inicio || '';
    document.getElementById("horario_fim").value = clinica.horario_fim || '';
    document.getElementById("status").value = clinica.status || 'ativo';

    const form = document.getElementById("clinicaForm");
    form.dataset.editId = id;
    document.getElementById("modalClinica").classList.add("active");
  },

  verMedicos(clinicaId) {
    const clinica = this.getAll().find(c => c.id == clinicaId);
    if (!clinica) {
      Notificacao?.show('❌ Clínica não encontrada!', 'error');
      return;
    }

    const medicos = Storage.getMedicosPorClinica(clinicaId);
    const modal = document.getElementById('modalMedicosClinica');
    const lista = document.getElementById('medicosClinicaList');
    if (!modal || !lista) return;

    if (medicos.length === 0) {
      lista.innerHTML = `<div style="text-align: center; padding: var(--espaco-xl); color: var(--cor-secundaria);"><p>Nenhum médico vinculado a esta clínica.</p><button class="btn-primary" onclick="window.location.href='medicos.html'" style="margin-top: var(--espaco-md);">+ Vincular Médico</button></div>`;
    } else {
      let html = `<h3>${clinica.nome}</h3><p>Total: ${medicos.length} médico(s)</p><hr style="margin: var(--espaco-md) 0;">`;
      medicos.forEach(m => {
        html += `<div style="display: flex; justify-content: space-between; align-items: center; padding: var(--espaco-sm); border-bottom: 1px solid var(--cor-borda);"><div><strong>${m.nome}</strong><br><small>${m.especialidade || 'N/A'} | CRM: ${m.crm || 'N/A'}</small></div><button class="btn-acao btn-editar" onclick="window.location.href='medicos.html'">👁️ Ver</button></div>`;
      });
      lista.innerHTML = html;
    }

    modal.classList.add('active');
  },

  configurarFormulario() {
    const form = document.getElementById("clinicaForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const selectEspecialidades = document.getElementById("especialidades");
      const especialidadesSelecionadas = selectEspecialidades 
        ? Array.from(selectEspecialidades.options).filter(opt => opt.selected).map(opt => opt.value)
        : [];

      const clinicaData = {
        nome: document.getElementById("nome").value.trim(),
        cnpj: document.getElementById("cnpj").value.trim(),
        telefone: document.getElementById("telefone").value.trim(),
        email: document.getElementById("email").value.trim(),
        endereco: document.getElementById("endereco").value.trim(),
        horario_inicio: document.getElementById("horario_inicio").value,
        horario_fim: document.getElementById("horario_fim").value,
        especialidades: especialidadesSelecionadas,
        status: document.getElementById("status").value
      };

      if (form.dataset.editId) {
        this.update(parseInt(form.dataset.editId), clinicaData);
        delete form.dataset.editId;
      } else {
        this.add(clinicaData);
      }

      form.reset();
      const modalTitle = document.getElementById("modalTitle");
      if (modalTitle) modalTitle.textContent = "Nova Clínica";
      document.getElementById("modalClinica").classList.remove("active");
    });
  },

  configurarFiltros() {
    const searchInput = document.getElementById("searchInput");
    const statusFilter = document.getElementById("statusFilter");

    if (searchInput) searchInput.addEventListener('input', () => this.filtrarClinicas());
    if (statusFilter) statusFilter.addEventListener('change', () => this.filtrarClinicas());
  },

  filtrarClinicas() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    const status = document.getElementById("statusFilter").value;

    const clinicasFiltradas = this.getAll().filter(c => {
      const matchSearch = !searchTerm ||
        (c.nome && c.nome.toLowerCase().includes(searchTerm)) ||
        (c.cnpj && c.cnpj.includes(searchTerm)) ||
        (c.email && c.email.toLowerCase().includes(searchTerm));
      const matchStatus = !status || c.status === status;
      return matchSearch && matchStatus;
    });

    const tbody = document.querySelector("#clinicasTable tbody");
    const cardsContainer = document.getElementById("clinicasCards");
    const emptyState = document.getElementById("emptyState");
    if (!tbody) return;

    tbody.innerHTML = "";
    if (cardsContainer) cardsContainer.innerHTML = "";

    if (clinicasFiltradas.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      return;
    }
    if (emptyState) emptyState.style.display = 'none';

    clinicasFiltradas.forEach(c => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${c.nome}</strong></td>
        <td>${c.cnpj || 'Não informado'}</td>
        <td>${c.telefone || 'Não informado'}</td>
        <td>${c.email || 'Não informado'}</td>
        <td><span class="status-badge ${c.status === 'ativo' ? 'status-ativo' : 'status-inativo'}">${c.status === 'ativo' ? 'Ativa' : 'Inativa'}</span></td>
        <td class="acoes-cell">
          <button class="btn-acao btn-ver-medicos" onclick="Clinica.verMedicos('${c.id}')">👨‍⚕️ Médicos</button>
          <button class="btn-acao btn-editar" onclick="Clinica.edit('${c.id}')">✏️ Editar</button>
          <button class="btn-acao btn-excluir" onclick="Clinica.remove('${c.id}')">🗑️ Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    if (cardsContainer) {
      clinicasFiltradas.forEach(c => cardsContainer.appendChild(this.criarCardClinica(c)));
    }
  },

  configurarModal() {
    const modal = document.getElementById('modalClinica');
    const openBtn = document.getElementById('openModalBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    const form = document.getElementById('clinicaForm');

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        const modalTitle = document.getElementById("modalTitle");
        if (modalTitle) modalTitle.textContent = "Nova Clínica";
        form.reset();
        delete form.dataset.editId;
        modal.classList.add('active');
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        form.reset();
        delete form.dataset.editId;
      });
    }

    if (modal) {
      window.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
          form.reset();
          delete form.dataset.editId;
        }
      });
    }

    const modalMedicos = document.getElementById('modalMedicosClinica');
    const closeMedicosBtn = document.getElementById('closeMedicosModalBtn');

    if (closeMedicosBtn) {
      closeMedicosBtn.addEventListener('click', () => modalMedicos.classList.remove('active'));
    }

    if (modalMedicos) {
      window.addEventListener('click', (e) => {
        if (e.target === modalMedicos) modalMedicos.classList.remove('active');
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', function() {
  if (window.location.pathname.includes('clinicas.html')) {
    setTimeout(() => Clinica.init(), 100);
  }
});