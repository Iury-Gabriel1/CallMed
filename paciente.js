// paciente.js (ATUALIZADO)
// Gerenciamento de pacientes usando Storage unificado

const Paciente = {
  getAll: () => Storage.getPacientes(),

  add: (paciente) => {
    Storage.salvarPaciente(paciente);
    Paciente.renderTable();
    if (typeof Notificacao !== "undefined") {
      Notificacao.show("Paciente adicionado com sucesso!", "success");
    } else {
      alert("Paciente adicionado com sucesso!");
    }
  },

  remove: (id) => {
    Storage.excluirPaciente(id);
    Paciente.renderTable();
    if (typeof Notificacao !== "undefined") {
      Notificacao.show("Paciente removido!", "warning");
    } else {
      alert("Paciente removido!");
    }
  },

  update: (id, dados) => {
    const paciente = { id, ...dados };
    Storage.salvarPaciente(paciente);
    Paciente.renderTable();
    if (typeof Notificacao !== "undefined") {
      Notificacao.show("Paciente atualizado!", "success");
    } else {
      alert("Paciente atualizado!");
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

// Inicializa tabela e formulário
document.addEventListener("DOMContentLoaded", () => {
  // Verifica se está na página de pacientes
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

    // Configura modal
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