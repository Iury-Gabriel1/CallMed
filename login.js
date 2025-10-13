// login.js - VERSÃO CORRIGIDA (compatível com login.html)
document.addEventListener("DOMContentLoaded", () => {
  // Verifica se já existe um script de login no HTML
  if (document.querySelector('script[src*="login.js"]')) {
    console.log('✅ Login.js carregado, mas o login.html já tem o script embutido');
    return; // Não executa se o HTML já tem o script
  }

  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");

  // Se já estiver logado, redireciona para a página correta
  const usuarioLogado = Storage.getUsuarioLogado();
  if (usuarioLogado) {
    redirecionarPorTipoUsuario(usuarioLogado);
    return;
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = loginForm.email.value.trim();
      const senha = loginForm.senha.value.trim();
      const lembrar = document.getElementById("rememberMe").checked;

      const usuario = Storage.login(email, senha);

      if (usuario) {
        // Remove qualquer foto temporária do localStorage anterior
        localStorage.removeItem('AgendaMed_user_photo');
        
        // Se lembrar-me, salva o último email
        if (lembrar) {
          localStorage.setItem("AgendaMedUltimoLogin", email);
        }
        
        // Redireciona baseado no tipo de usuário
        redirecionarPorTipoUsuario(usuario);
      } else {
        if (loginError) {
          loginError.style.display = "block";
        }
      }
    });
  }

  // Modal de cadastro (só executa se não existir no HTML)
  const modalCadastro = document.getElementById('modalCadastro');
  const abrirModalCadastro = document.getElementById('abrirModalCadastro');
  const fecharModalCadastro = document.getElementById('fecharModalCadastro');

  if (abrirModalCadastro && !abrirModalCadastro.hasAttribute('data-listener-added')) {
    abrirModalCadastro.setAttribute('data-listener-added', 'true');
    abrirModalCadastro.addEventListener('click', e => {
      e.preventDefault();
      if (modalCadastro) modalCadastro.classList.add('active');
    });
  }

  if (fecharModalCadastro && !fecharModalCadastro.hasAttribute('data-listener-added')) {
    fecharModalCadastro.setAttribute('data-listener-added', 'true');
    fecharModalCadastro.addEventListener('click', () => {
      if (modalCadastro) modalCadastro.classList.remove('active');
    });
  }

  if (modalCadastro) {
    modalCadastro.addEventListener('click', e => {
      if (e.target === modalCadastro) {
        modalCadastro.classList.remove('active');
      }
    });
  }

  // Cadastro de usuário
  const cadastroForm = document.getElementById('cadastroForm');
  if (cadastroForm && !cadastroForm.hasAttribute('data-listener-added')) {
    cadastroForm.setAttribute('data-listener-added', 'true');
    cadastroForm.addEventListener('submit', e => {
      e.preventDefault();
      const nome = document.getElementById('novoNome').value.trim();
      const email = document.getElementById('novoEmail').value.trim();
      const senha = document.getElementById('novaSenha').value.trim();
      const erro = document.getElementById('cadastroError');

      if (!nome || !email || !senha) {
        if (erro) {
          erro.textContent = 'Preencha todos os campos.';
          erro.style.display = 'block';
        }
        return;
      }

      const novoUsuario = Storage.criarUsuario(nome, email, senha);

      if (!novoUsuario) {
        if (erro) {
          erro.textContent = 'Este e-mail já está cadastrado.';
          erro.style.display = 'block';
        }
        return;
      }

      alert('Conta criada com sucesso! Você já pode fazer login.');
      if (modalCadastro) modalCadastro.classList.remove('active');
    });
  }
});

// FUNÇÃO PARA REDIRECIONAR POR TIPO DE USUÁRIO
function redirecionarPorTipoUsuario(usuario) {
  console.log('👤 Redirecionando usuário:', usuario.nome, 'Tipo:', usuario.tipo);
  
  if (usuario.tipo === 'paciente') {
    console.log('📍 Redirecionando paciente para paciente-dashboard.html');
    window.location.href = "paciente-dashboard.html";
  } else {
    console.log('📍 Redirecionando para index.html (clínica)');
    window.location.href = "index.html";
  }
}