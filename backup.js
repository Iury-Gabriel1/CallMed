// backup.js
// Permite exportar e importar dados do localStorage

const Backup = {
  export: () => {
    const data = {
      pacientes: JSON.parse(localStorage.getItem("AgendaMed_pacientes")) || [],
      medicos: JSON.parse(localStorage.getItem("AgendaMed_medicos")) || [],
      agendamentos: JSON.parse(localStorage.getItem("AgendaMed_agendamentos")) || []
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "AgendaMed_backup.json";
    a.click();
    URL.revokeObjectURL(url);
  },

  import: (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(e.target.result);
      localStorage.setItem("AgendaMed_pacientes", JSON.stringify(data.pacientes || []));
      localStorage.setItem("AgendaMed_medicos", JSON.stringify(data.medicos || []));
      localStorage.setItem("AgendaMed_agendamentos", JSON.stringify(data.agendamentos || []));
      Notificacao.show("Backup importado com sucesso!", "success");
      location.reload();
    };
    reader.readAsText(file);
  }
};
