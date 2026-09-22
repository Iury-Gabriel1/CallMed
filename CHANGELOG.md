# CallMed - Registro de Alteracoes

## 2026-09-21 a 2026-09-22

### Integracao com o backend

- Centralizada a comunicacao com a API em `http://localhost:5000/api`.
- Criado o fluxo de requisicoes com tratamento para backend indisponivel, erros HTTP e sessao expirada.
- Adicionado `Storage.ready` para aguardar o carregamento inicial dos dados remotos.
- Migrados para a API os dados de usuarios, pacientes, medicos, agendamentos, clinicas e configuracoes.
- Mantidos no `localStorage` apenas sessao, fotos e configuracoes especificas locais.
- Integrados login e cadastro com `POST /api/login` e `POST /api/cadastro`.
- Integrado perfil com `GET/PUT /api/perfil/<usuarioId>`.
- Integrados os endpoints de criacao, consulta, atualizacao e exclusao de registros.

### Limpeza e estabilidade

- Removidas fachadas API duplicadas no `js/app.js`.
- Removidas declaracoes duplicadas de `API_URL` e `apiRequest`.
- Corrigido objeto `Storage` aninhado que causava mais de nove erros no VS Code.
- Desativada a criacao automatica de contas demo no frontend.
- Corrigidas inicializacoes para aguardar `Storage.ready`.
- Preservados os modulos de login, painel administrativo, painel do paciente, agenda, perfil, configuracoes e chatbot.

### Matchmaking e triagem

- Adicionado formulario de matchmaking no painel do paciente.
- O paciente pode informar necessidade, sintomas, data e horario desejados.
- Integrada a chamada `POST /api/matchmaking`.
- Exibidas recomendacoes com especialidade, pontuacao e disponibilidade.
- Permite encaminhar o medico recomendado diretamente para o fluxo de agendamento.
- O backend passou a considerar conflitos de agenda no calculo de disponibilidade.
- Medicos disponiveis recebem prioridade quando o paciente informa data e horario.
- O agendamento so exibe confirmacao depois da persistencia bem-sucedida na API.

### Agenda e cadastros

- Pacientes passaram a ser criados e editados pela API.
- Medicos passaram a ser criados, editados e excluidos pela API.
- Agendamentos passaram a usar campos em camelCase no frontend.
- Cancelamento e alteracao de status passaram a atualizar o backend.
- Cadastro de paciente cria o perfil de paciente vinculado ao usuario no backend.
- Mantida a busca de medicos por especialidade e nome.
- Mantido o fluxo de escolha de horario antes da confirmacao da consulta.

### Interface e visual

- Corrigido texto de codigo que aparecia na tela: havia comentarios JavaScript antes do `<!DOCTYPE html>`.
- Removidos os cabecalhos invalidos de `login.html`, `index.html`, `admin.html` e `paciente.html`.
- Corrigido o titulo da pagina de login para `CallMed - Login`.
- Corrigido overflow horizontal da tela de login.
- Melhorada a centralizacao e a apresentacao do formulario de entrada.
- Atualizadas as contas demonstrativas exibidas na tela de login:
  - `admin@AgendaMed.com / 123456`
  - `altemar@clinica.com / 123456`
  - `sabrina@AgendaMed.com / 123456`

### Backend

- Mantidas as rotas de login, cadastro, usuarios, pacientes, medicos, agenda, perfil, configuracoes, triagem e matchmaking.
- Adicionadas rotas de exclusao para pacientes, medicos e agendamentos.
- Adicionada normalizacao entre campos camelCase e snake_case.
- O cadastro de paciente cria tambem o registro correspondente em `pacientes`.
- O matchmaking retorna recomendacoes, triagem, pontuacao e disponibilidade.

### Validacoes executadas

- `node --check` executado nos modulos JavaScript.
- Scripts inline das paginas HTML validados.
- Diagnosticos do VS Code para `js/app.js`: nenhum erro.
- Backend validado com a suite oficial:

```text
Ran 7 tests
OK
```

- Backend iniciado em `http://localhost:5000`.
- Frontend iniciado com `python -m http.server 5500`.
- Frontend acessado em `http://localhost:5500/login.html`.
- Login administrativo testado com sucesso.
- Endpoint de matchmaking testado com recomendacao de Cardiologia e disponibilidade confirmada.
- Pagina do paciente validada com formulario de matchmaking e chamada para a API.

## Como executar

### Backend

```powershell
cd C:\Users\arthu\Downloads\CallMed-backend
.\.venv\Scripts\python.exe app.py
```

### Frontend

```powershell
cd C:\Users\arthu\Downloads\AgendaMed
python -m http.server 5500
```

Acesse:

```text
http://localhost:5500/login.html
```

## Pendencias conhecidas

- O backend ainda usa `db.json` como persistencia.
- Ainda nao existe autenticacao por token.
- Integracoes externas com planos de saude e sistemas de clinicas dependem de novos endpoints.
- Algumas configuracoes especificas de clinicas permanecem locais por falta de contrato equivalente na API.
