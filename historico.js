// historico.js (ATUALIZADO)
// Mostra histórico de agendamentos com filtros

document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.querySelector("#historicoTableBody");
  const semDados = document.getElementById("semDados");
  const filtroForm = document.getElementById("filtroForm");
  const btnLimpar = document.getElementById("btnLimparFiltros");

  function renderTable(filtros = {}) {
    if (!tbody) return;
    
    let agendamentos = Storage.getAgendamentos();
    
    // Aplicar filtros
    if (filtros.paciente) {
      agendamentos = agendamentos.filter(a => 
        a.paciente?.toLowerCase().includes(filtros.paciente.toLowerCase()) ||
        a.pacienteId?.toString().includes(filtros.paciente)
      );
    }
    
    if (filtros.medico) {
      agendamentos = agendamentos.filter(a => 
        a.medico?.toLowerCase().includes(filtros.medico.toLowerCase()) ||
        a.medicoId?.toString().includes(filtros.medico)
      );
    }
    
    if (filtros.data) {
      agendamentos = agendamentos.filter(a => a.data === filtros.data);
    }

    tbody.innerHTML = "";

    if (agendamentos.length === 0) {
      semDados.style.display = 'block';
      return;
    }
    
    semDados.style.display = 'none';

    agendamentos.forEach(a => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${a.paciente || 'Paciente ' + a.pacienteId}</td>
        <td>${a.medico || 'Médico ' + a.medicoId}</td>
        <td>${new Date(a.data).toLocaleDateString('pt-BR')}</td>
        <td>${a.hora || '--:--'}</td>
        <td><span class="badge ${a.status || 'agendado'}">${a.status || 'Agendado'}</span></td>
        <td>${a.diagnostico || 'Consulta realizada'}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Inicializa tabela
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
      filtroForm.reset();
      renderTable();
    });
  }
});