// backup.js
// Permite exportar e importar dados do localStorage

const Backup = {
  export: () => {
    const data = {
      pacientes: JSON.parse(localStorage.getItem("CallMed_pacientes")) || [],
      medicos: JSON.parse(localStorage.getItem("CallMed_medicos")) || [],
      agendamentos: JSON.parse(localStorage.getItem("CallMed_agendamentos")) || []
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "CallMed_backup.json";
    a.click();
    URL.revokeObjectURL(url);
  },

  import: (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(e.target.result);
      localStorage.setItem("CallMed_pacientes", JSON.stringify(data.pacientes || []));
      localStorage.setItem("CallMed_medicos", JSON.stringify(data.medicos || []));
      localStorage.setItem("CallMed_agendamentos", JSON.stringify(data.agendamentos || []));
      Notificacao.show("Backup importado com sucesso!", "success");
      location.reload();
    };
    reader.readAsText(file);
  }
};
