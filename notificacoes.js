// notificacoes.js (ATUALIZADO)
// Sistema de notificações com CSS automático

const Notificacao = {
  container: null,

  init: () => {
    if (!Notificacao.container) {
      Notificacao.container = document.createElement("div");
      Notificacao.container.id = "notificacaoContainer";
      Notificacao.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 300px;
      `;
      document.body.appendChild(Notificacao.container);
      
      // Injeta CSS dinamicamente
      const style = document.createElement('style');
      style.textContent = `
        .notificacao {
          background: white;
          padding: 12px 16px;
          margin-bottom: 10px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          border-left: 4px solid #007bff;
          transform: translateX(100%);
          transition: transform 0.3s ease;
        }
        .notificacao.show {
          transform: translateX(0);
        }
        .notificacao.success { border-left-color: #28a745; }
        .notificacao.warning { border-left-color: #ffc107; }
        .notificacao.error { border-left-color: #dc3545; }
      `;
      document.head.appendChild(style);
    }
  },

  show: (mensagem, tipo = "info", duracao = 3000) => {
    Notificacao.init();

    const popup = document.createElement("div");
    popup.className = `notificacao ${tipo}`;
    popup.textContent = mensagem;
    Notificacao.container.appendChild(popup);

    setTimeout(() => popup.classList.add("show"), 10);

    setTimeout(() => {
      popup.classList.remove("show");
      setTimeout(() => {
        if (popup.parentNode) popup.parentNode.removeChild(popup);
      }, 300);
    }, duracao);
  }
};