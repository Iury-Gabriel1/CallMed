(() => {
  const messagesElement = document.getElementById('chatMessages');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('messageInput');
  if (!messagesElement || !form || !input) return;

  const sendButton = form.querySelector('[type="submit"]');
  const newConversationButton = document.getElementById('chatNewConversation');
  const user = Storage.getUsuarioLogado();
  const isPatient = user?.tipo === 'paciente';
  const conversationStorageKey = `callmed-triage-${user?.id || 'user'}`;
  let conversation = null;
  let busy = false;

  function addMessage(role, content, extraClass = '') {
    const message = document.createElement('div');
    message.className = `message ${role}${extraClass ? ` ${extraClass}` : ''}`;
    message.textContent = content;
    messagesElement.appendChild(message);
    messagesElement.scrollTop = messagesElement.scrollHeight;
    return message;
  }

  function showWelcome() {
    messagesElement.replaceChildren();
    if (isPatient) {
      const name = user?.nome ? `, ${user.nome.split(' ')[0]}` : '';
      addMessage(
        'bot',
        `Olá${name}! Pode me contar com calma o que está sentindo. Vou ajudar a organizar as informações e, se fizer sentido, sugerir uma especialidade para conversar com um profissional. Não faço diagnósticos nem indico medicamentos.`
      );
    } else {
      addMessage(
        'bot',
        'Olá! Sou o assistente virtual da CallMed. Posso ajudar com informações gerais sobre médicos, agenda e funcionamento do sistema. Não substituo um profissional de saúde.'
      );
    }
  }

  function renderConversation(data) {
    conversation = data;
    sessionStorage.setItem(conversationStorageKey, data.id);
    messagesElement.replaceChildren();
    for (const message of data.mensagens || []) {
      addMessage(message.papel === 'user' ? 'user' : 'bot', message.conteudo);
    }
  }

  function setBusy(value) {
    busy = value;
    input.disabled = value;
    sendButton.disabled = value;
    if (newConversationButton) newConversationButton.disabled = value;
  }

  function normalize(value) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR')
      .trim();
  }

  function replyForClinicQuestion(text) {
    const message = normalize(text);
    const doctors = Storage.getMedicos();
    const appointments = Storage.getAgendamentos();

    if (/^(oi|ola|bom dia|boa tarde|boa noite)\b/.test(message)) {
      return 'Oi! Como posso ajudar com as informações da clínica?';
    }
    if (/(remedio|medicamento|dose|antibiotico|diagnostico|o que eu tenho)/.test(message)) {
      return 'Não consigo diagnosticar nem recomendar remédios ou doses. Posso ajudar a organizar uma triagem para o paciente, mas a avaliação e a conduta cabem a um profissional de saúde.';
    }
    if (/(urgente|emergencia|dor no peito|falta de ar|nao consegue respirar)/.test(message)) {
      return 'Se alguém estiver em perigo imediato, procure um serviço de emergência ou ligue 192 (SAMU) no Brasil. Não espere por uma resposta do aplicativo.';
    }
    if (/(medico|medicos|profissional|especialidade|especialidades)/.test(message)) {
      if (!doctors.length) {
        return 'Ainda não há médicos carregados no cadastro. Tente novamente depois que os dados da clínica forem sincronizados.';
      }
      const summary = doctors
        .slice(0, 5)
        .map((doctor) => {
          const specialty = doctor.especialidade
            ? ` — ${doctor.especialidade}`
            : '';
          return `${doctor.nome || 'Profissional'}${specialty}`;
        })
        .join('; ');
      return `Encontrei ${doctors.length} médico(s) no cadastro. Alguns: ${summary}${doctors.length > 5 ? '; e outros.' : '.'}`;
    }
    if (/(agenda|agendamento|consulta|marcar|horario)/.test(message)) {
      return `O sistema tem ${appointments.length} agendamento(s) carregado(s). Para marcar uma consulta, use a área de agendamentos e confira a disponibilidade real antes de confirmar.`;
    }
    if (/(triagem|sintoma)/.test(message)) {
      return 'A triagem ajuda a organizar o que a pessoa relata e pode sugerir uma especialidade de forma preliminar. Ela não é diagnóstico e não substitui avaliação profissional.';
    }
    if (/(ajuda|o que voce pode|como funciona|duvida)/.test(message)) {
      return 'Posso consultar informações gerais do cadastro de médicos e da quantidade de agendamentos. Para dados detalhados, use as telas correspondentes da CallMed. O que você gostaria de saber?';
    }
    return 'Quero ajudar, mas não entendi bem. Você pode perguntar sobre médicos, agenda, triagem ou funcionamento da CallMed?';
  }

  async function sendPatientMessage(text) {
    const typing = addMessage('bot', 'Um instante, estou acompanhando você…', 'typing');
    try {
      if (!conversation) {
        conversation = await apiRequest('/triagem/conversas', {
          method: 'POST',
          body: JSON.stringify({})
        });
      }
      const result = await apiRequest(
        `/triagem/conversas/${encodeURIComponent(conversation.id)}/mensagens`,
        {
          method: 'POST',
          body: JSON.stringify({ mensagem: text })
        }
      );
      typing.remove();
      renderConversation(result);
    } catch (error) {
      typing.remove();
      addMessage('bot', error.message || 'Não consegui enviar sua mensagem. Tente novamente.');
    }
  }

  async function sendMessage(text) {
    if (!text || busy) return;
    setBusy(true);
    addMessage('user', text);
    input.value = '';
    try {
      if (isPatient) {
        await sendPatientMessage(text);
      } else {
        await new Promise((resolve) => window.setTimeout(resolve, 250));
        addMessage('bot', replyForClinicQuestion(text));
      }
    } finally {
      setBusy(false);
      input.focus();
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    void sendMessage(input.value.trim());
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  document.querySelectorAll('[data-chat-message]').forEach((button) => {
    button.addEventListener('click', () => {
      void sendMessage(button.dataset.chatMessage);
    });
  });

  document.querySelectorAll('[data-chat-action="new"]').forEach((button) => {
    button.addEventListener('click', async () => {
      if (busy) return;
      conversation = null;
      sessionStorage.removeItem(conversationStorageKey);
      showWelcome();
      if (!isPatient) return;

      setBusy(true);
      const typing = addMessage('bot', 'Preparando uma nova conversa…', 'typing');
      try {
        const result = await apiRequest('/triagem/conversas', {
          method: 'POST',
          body: JSON.stringify({})
        });
        typing.remove();
        renderConversation(result);
      } catch (error) {
        typing.remove();
        addMessage('bot', error.message || 'Não consegui iniciar uma nova conversa.');
      } finally {
        setBusy(false);
      }
    });
  });

  showWelcome();
  if (isPatient) {
    const savedConversationId = sessionStorage.getItem(conversationStorageKey);
    if (savedConversationId) {
      setBusy(true);
      apiRequest(`/triagem/conversas/${encodeURIComponent(savedConversationId)}`)
        .then(renderConversation)
        .catch((error) => {
          addMessage(
            'bot',
            `Não consegui recuperar a conversa anterior (${error.message}). Você pode começar uma nova conversa.`
          );
        })
        .finally(() => setBusy(false));
    }
  }
})();
