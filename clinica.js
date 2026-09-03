// clinica.js - Gerenciamento completo de Clínicas

const Clinica = {
  // =============================================
  // INICIALIZAÇÃO
  // =============================================
  init() {
    console.log('🚀 Inicializando sistema de clínicas...');
    this.renderTable();
    this.configurarFormulario();
    this.configurarFiltros();
    this.configurarModal();
    this.carregarEspecialidadesNoSelect();
  },

  // =============================================
  // CRUD
  // =============================================
  getAll() {
    return Storage.getClinicas();
  },

  add(clinica) {
    const resultado = Storage.salvarClinica(clinica);
    this.renderTable();
    if (resultado) {
      Notificacao?.show('✅ Clínica adicionada com sucesso!', 'success');
    } else {
      Notificacao?.show('❌ Erro ao adicionar clínica!', 'error');
    }
    return resultado;
  },

  remove(id) {
    if (!confirm('Tem certeza que deseja excluir esta clínica?')) return;
    
    // Verifica se há médicos vinculados
    const medicos = Storage.getMedicosPorClinica(id);
    if (medicos.length > 0) {
      if (!confirm(`⚠️ Esta clínica tem ${medicos.length} médicos vinculados. Excluir mesmo assim?`)) {
        return;
      }
    }

    Storage.excluirClinica(id);
    this.renderTable();
    Notificacao?.show('🗑️ Clínica excluída com sucesso!', 'warning');
  },

  update(id, dados) {
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

    const resultado = Storage.salvarClinica(clinicaAtualizada);
    this.renderTable();
    if (resultado) {
      Notificacao?.show('✅ Clínica atualizada com sucesso!', 'success');
    } else {
      Notificacao?.show('❌ Erro ao atualizar clínica!', 'error');
    }
    return resultado;
  },

  // =============================================
  // RENDERIZAÇÃO
  // =============================================
  renderTable() {
    const tbody = document.querySelector("#clinicasTable tbody");
    const cardsContainer = document.getElementById("clinicasCards");
    const emptyState = document.getElementById("emptyState");

    if (!tbody) {
      console.error('❌ Tabela de clínicas não encontrada');
      return;
    }

    const clinicas = this.getAll();
    console.log('📋 Renderizando clínicas:', clinicas.length);

    tbody.innerHTML = "";
    if (cardsContainer) cardsContainer.innerHTML = "";

    if (clinicas.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    // Ordena por nome
    clinicas.sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));

    // Preenche tabela
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
          <button class="btn-acao btn-ver-medicos" onclick="Clinica.verMedicos('${c.id}')">
            👨‍⚕️ Médicos
          </button>
          <button class="btn-acao btn-editar" onclick="Clinica.edit('${c.id}')">
            ✏️ Editar
          </button>
          <button class="btn-acao btn-excluir" onclick="Clinica.remove('${c.id}')">
            🗑️ Excluir
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Preenche cards (mobile)
    if (cardsContainer) {
      clinicas.forEach(c => {
        const card = this.criarCardClinica(c);
        cardsContainer.appendChild(card);
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
        ${clinica.horario_inicio ? `<div><strong>Horário:</strong> ${clinica.horario_inicio} - ${clinica.horario_fim || 'Fechado'}</div>` : ''}
      </div>
      <div class="clinica-acoes">
        <button class="btn-acao btn-ver-medicos" onclick="Clinica.verMedicos('${clinica.id}')">
          👨‍⚕️ Médicos (${Storage.getMedicosPorClinica(clinica.id).length})
        </button>
        <button class="btn-acao btn-editar" onclick="Clinica.edit('${clinica.id}')">
          ✏️ Editar
        </button>
        <button class="btn-acao btn-excluir" onclick="Clinica.remove('${clinica.id}')">
          🗑️ Excluir
        </button>
      </div>
    `;
    return card;
  },

  // =============================================
  // EDIÇÃO
  // =============================================
  edit(id) {
    console.log('✏️ Editando clínica ID:', id);
    const clinica = this.getAll().find(c => c.id == id);
    if (!clinica) {
      Notificacao?.show('❌ Clínica não encontrada!', 'error');
      return;
    }

    // Preenche o formulário
    document.getElementById("modalTitle").textContent = "Editar Clínica";
    document.getElementById("nome").value = clinica.nome || '';
    document.getElementById("cnpj").value = clinica.cnpj || '';
    document.getElementById("telefone").value = clinica.telefone || '';
    document.getElementById("email").value = clinica.email || '';
    document.getElementById("endereco").value = clinica.endereco || '';
    document.getElementById("horario_inicio").value = clinica.horario_inicio || '';
    document.getElementById("horario_fim").value = clinica.horario_fim || '';
    document.getElementById("status").value = clinica.status || 'ativo';

    // Seleciona especialidades
    if (clinica.especialidades && Array.isArray(clinica.especialidades)) {
      const select = document.getElementById("especialidades");
      Array.from(select.options).forEach(opt => {
        opt.selected = clinica.especialidades.includes(opt.value);
      });
    }

    const form = document.getElementById("clinicaForm");
    form.dataset.editId = id;
    document.getElementById("modalClinica").classList.add("active");
  },

  // =============================================
  // MÉDICOS DA CLÍNICA
  // =============================================
  verMedicos(clinicaId) {
    console.log('👨‍⚕️ Buscando médicos da clínica ID:', clinicaId);
    const clinica = this.getAll().find(c => c.id == clinicaId);
    if (!clinica) {
      Notificacao?.show('❌ Clínica não encontrada!', 'error');
      return;
    }

    const medicos = Storage.getMedicosPorClinica(clinicaId);
    const modal = document.getElementById('modalMedicosClinica');
    const lista = document.getElementById('medicosClinicaList');

    if (medicos.length === 0) {
      lista.innerHTML = `
        <div style="text-align: center; padding: var(--espaco-xl); color: var(--cor-secundaria);">
          <p>Nenhum médico vinculado a esta clínica.</p>
          <button class="btn-primary" onclick="window.location.href='medicos.html'" style="margin-top: var(--espaco-md);">
            + Vincular Médico
          </button>
        </div>
      `;
    } else {
      let html = `<h3>${clinica.nome}</h3><p>Total: ${medicos.length} médico(s)</p><hr style="margin: var(--espaco-md) 0;">`;
      medicos.forEach(medico => {
        html += `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--espaco-sm); border-bottom: 1px solid var(--cor-borda);">
            <div>
              <strong>${medico.nome}</strong><br>
              <small>${medico.especialidade || 'Especialidade não informada'} | CRM: ${medico.crm || 'N/A'}</small>
            </div>
            <button class="btn-acao btn-editar" onclick="window.location.href='medicos.html'">
              👁️ Ver
            </button>
          </div>
        `;
      });
      lista.innerHTML = html;
    }

    modal.classList.add('active');
  },

  // =============================================
  // FORMULÁRIO
  // =============================================
  configurarFormulario() {
    const form = document.getElementById("clinicaForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      console.log('📝 Submetendo formulário de clínica...');

      // Coleta especialidades selecionadas
      const selectEspecialidades = document.getElementById("especialidades");
      const especialidadesSelecionadas = Array.from(selectEspecialidades.options)
        .filter(opt => opt.selected)
        .map(opt => opt.value);

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

      // Validação
      if (!clinicaData.nome) {
        Notificacao?.show('❌ O nome da clínica é obrigatório!', 'error');
        return;
      }
      if (!clinicaData.cnpj) {
        Notificacao?.show('❌ O CNPJ é obrigatório!', 'error');
        return;
      }
      if (!clinicaData.telefone) {
        Notificacao?.show('❌ O telefone é obrigatório!', 'error');
        return;
      }

      if (form.dataset.editId) {
        // EDIÇÃO
        this.update(parseInt(form.dataset.editId), clinicaData);
        delete form.dataset.editId;
      } else {
        // NOVA CLÍNICA
        this.add(clinicaData);
      }

      form.reset();
      document.getElementById("modalTitle").textContent = "Nova Clínica";
      document.getElementById("modalClinica").classList.remove("active");
    });
  },

  // =============================================
  // FILTROS
  // =============================================
  configurarFiltros() {
    const searchInput = document.getElementById("searchInput");
    const statusFilter = document.getElementById("statusFilter");

    if (searchInput) {
      searchInput.addEventListener('input', () => this.filtrarClinicas());
    }

    if (statusFilter) {
      statusFilter.addEventListener('change', () => this.filtrarClinicas());
    }
  },

  filtrarClinicas() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    const status = document.getElementById("statusFilter").value;

    const clinicas = this.getAll();
    const clinicasFiltradas = clinicas.filter(c => {
      const matchSearch = !searchTerm ||
        (c.nome && c.nome.toLowerCase().includes(searchTerm)) ||
        (c.cnpj && c.cnpj.includes(searchTerm)) ||
        (c.email && c.email.toLowerCase().includes(searchTerm));

      const matchStatus = !status || c.status === status;
      return matchSearch && matchStatus;
    });

    // Atualiza a exibição com as clínicas filtradas
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
          <button class="btn-acao btn-ver-medicos" onclick="Clinica.verMedicos('${c.id}')">
            👨‍⚕️ Médicos
          </button>
          <button class="btn-acao btn-editar" onclick="Clinica.edit('${c.id}')">
            ✏️ Editar
          </button>
          <button class="btn-acao btn-excluir" onclick="Clinica.remove('${c.id}')">
            🗑️ Excluir
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    if (cardsContainer) {
      clinicasFiltradas.forEach(c => {
        const card = this.criarCardClinica(c);
        cardsContainer.appendChild(card);
      });
    }
  },

  // =============================================
  // MODAL
  // =============================================
  configurarModal() {
    const modal = document.getElementById('modalClinica');
    const openBtn = document.getElementById('openModalBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    const form = document.getElementById('clinicaForm');

    // Abrir modal
    if (openBtn) {
      openBtn.addEventListener('click', () => {
        document.getElementById("modalTitle").textContent = "Nova Clínica";
        form.reset();
        delete form.dataset.editId;
        // Desmarca todas as especialidades
        const select = document.getElementById("especialidades");
        Array.from(select.options).forEach(opt => opt.selected = false);
        modal.classList.add('active');
      });
    }

    // Fechar modal
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        form.reset();
        delete form.dataset.editId;
      });
    }

    // Fechar ao clicar fora
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        form.reset();
        delete form.dataset.editId;
      }
    });

    // Modal de médicos da clínica
    const modalMedicos = document.getElementById('modalMedicosClinica');
    const closeMedicosBtn = document.getElementById('closeMedicosModalBtn');

    if (closeMedicosBtn) {
      closeMedicosBtn.addEventListener('click', () => {
        modalMedicos.classList.remove('active');
      });
    }

    window.addEventListener('click', (e) => {
      if (e.target === modalMedicos) {
        modalMedicos.classList.remove('active');
      }
    });
  },

  // =============================================
  // ESPECIALIDADES
  // =============================================
  carregarEspecialidadesNoSelect() {
    const select = document.getElementById("especialidades");
    if (!select) return;

    // Pega as especialidades do sistema (da lista de médicos)
    const especialidades = [
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

    select.innerHTML = '';
    especialidades.forEach(esp => {
      const option = document.createElement('option');
      option.value = esp;
      option.textContent = esp;
      select.appendChild(option);
    });
  },

  // =============================================
  // DEBUG
  // =============================================
  debug() {
    console.group('🐛 DEBUG CLÍNICAS');
    const clinicas = this.getAll();
    console.log('📊 Total de clínicas:', clinicas.length);
    console.log('📋 Clínicas:', clinicas);
    console.groupEnd();
    return clinicas;
  }
};

// Inicializa automaticamente se estiver na página de clínicas
document.addEventListener('DOMContentLoaded', function() {
  if (window.location.pathname.includes('clinicas.html')) {
    // Aguarda o DOM estar completamente carregado
    setTimeout(() => {
      Clinica.init();
    }, 100);
  }
});