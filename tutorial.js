// tutorial.js
// Guia inicial do AgendaMed

const Tutorial = {
  steps: [
    "Bem-vindo ao AgendaMed! Aqui você pode gerenciar pacientes e médicos.",
    "Use a aba 'Agendar' para marcar consultas rapidamente.",
    "Visualize o histórico completo no menu 'Histórico'.",
    "Não esqueça de explorar as configurações e temas personalizados!",
    "Tudo pronto! Aproveite o AgendaMed."
  ],
  currentStep: 0,
  container: null,

  start: () => {
    Tutorial.container = document.createElement("div");
    Tutorial.container.classList.add("modal", "active");
    Tutorial.container.innerHTML = `
      <div class="modal-content">
        <p id="tutorialText">${Tutorial.steps[0]}</p>
        <button id="tutorialNext">Próximo</button>
      </div>
    `;
    document.body.appendChild(Tutorial.container);

    document.getElementById("tutorialNext").addEventListener("click", Tutorial.next);
  },

  next: () => {
    Tutorial.currentStep++;
    if (Tutorial.currentStep >= Tutorial.steps.length) {
      Tutorial.container.classList.remove("active");
      document.body.removeChild(Tutorial.container);
      return;
    }
    document.getElementById("tutorialText").innerText = Tutorial.steps[Tutorial.currentStep];
  }
};
