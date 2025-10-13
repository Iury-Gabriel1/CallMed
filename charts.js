// charts.js
// Estatísticas e relatórios

document.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById("chartConsultas").getContext("2d");

  const agendamentos = JSON.parse(localStorage.getItem("AgendaMed_agendamentos")) || [];
  const dias = [];
  const contagem = [];

  // Contar consultas nos últimos 7 dias
  for (let i = 6; i >= 0; i--) {
    const data = new Date();
    data.setDate(data.getDate() - i);
    const dia = data.toISOString().split("T")[0];
    dias.push(dia);
    const total = agendamentos.filter(a => a.data === dia).length;
    contagem.push(total);
  }

  if (ctx) {
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dias,
        datasets: [{
          label: 'Consultas por dia',
          data: contagem,
          backgroundColor: 'rgba(0,123,255,0.6)',
          borderColor: 'rgba(0,123,255,1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
});
