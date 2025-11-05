const API_URL = "barbersho-juan.us-east-2.elasticbeanstalk.com";

// ==================== LOGIN ====================
async function loginUsuario() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    if (!res.ok) throw new Error("Falha no login");

    const data = await res.json();
    console.log("🔍 Resposta do login:", data);

    if (!data.token) throw new Error("Token não retornado pelo servidor.");
    if (!data.usuarioDTO || !data.usuarioDTO.id)
      throw new Error("Login feito, mas ID do usuário não retornado.");

    localStorage.setItem("token", data.token);
    localStorage.setItem("usuarioId", data.usuarioDTO.id);
    localStorage.setItem("usuarioNome", data.usuarioDTO.nome);
    localStorage.setItem("usuarioEmail", data.usuarioDTO.email);
    localStorage.setItem("usuarioRole", data.usuarioDTO.role);

    if (data.usuarioDTO.role === "ADMIN") {
      window.location.href = "admin-gerenciamento.html";
    } else {
      window.location.href = "admin-gerenciamento.html";
    }

    const token = data.token;
    localStorage.setItem("token", token);
    localStorage.setItem("usuarioLogado", "true");

    // 🔎 decodifica o token JWT
    const payloadBase64 = token.split(".")[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));
    console.log("📦 Payload do token:", decodedPayload);

    alert("Login realizado com sucesso!");
    window.location.href = "agendamento.html";
  } catch (err) {
    console.error("Erro no login:", err);
    alert(err.message);
  }
}

// ============== FUNCAO DE REGISTRAR ================
async function registrarUsuario() {
  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const telefone = document.getElementById("telefone").value;

  try {
    const res = await fetch(`${API_URL}/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha, telefone }),
    });

    const data = await res.json(); // sempre tenta ler a resposta JSON

    if (!res.ok) {
      // se tiver erro, mostra a mensagem do backend
      const erroMensagem =
        data?.erro || data?.message || "Erro ao registrar usuário";
      throw new Error(erroMensagem);
    }

    alert("✅ Cadastro realizado com sucesso! Faça login.");
    window.location.href = "login.html";
  } catch (err) {
    console.error("Erro do servidor:", err);
    alert(`❌ ${err.message}`);
  }
}

//============ FUNCAO RECUPERAR SENHA ==============
async function recuperarSenha() {
  const email = document.getElementById("email").value;

  try {
    const res = await fetch(`${API_URL}/auth/recuperar-senha`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) throw new Error("Falha ao solicitar recuperação de senha");
    alert(
      "Se o email existir, você receberá instruções para redefinir sua senha."
    );
    window.location.href = "login.html";
  } catch (err) {
    alert(err.message);
  }
}

// ==================== BOTÃO LOGIN / SAIR ====================
function atualizarBotaoLogin() {
  document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("loginBtn");
    if (!loginBtn) return;

    // Clona o botão para remover listeners antigos
    const novoBtn = loginBtn.cloneNode(true);
    loginBtn.parentNode.replaceChild(novoBtn, loginBtn);

    if (localStorage.getItem("usuarioLogado") === "true") {
      novoBtn.textContent = "Sair";
      novoBtn.href = "#";

      novoBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("token");
        localStorage.removeItem("usuarioLogado");
        localStorage.removeItem("usuarioId");
        window.location.href = "index.html";
      });
    } else {
      novoBtn.textContent = "Login";
      novoBtn.href = "login.html";
    }
  });
}

// Chama ao carregar a página
atualizarBotaoLogin();

// ==================== AUXILIAR ====================
function getUsuarioId() {
  return localStorage.getItem("usuarioId");
}

// ==================== LISTAR SERVIÇOS ====================
async function listarServicos() {
  try {
    const res = await fetch(`${API_URL}/servicos`);
    const servicos = await res.json();
    const container = document.getElementById("servicos-lista");
    if (!container) return;
    container.innerHTML = servicos
      .map(
        (s) => `
      <div class="card">
        <h3>${s.nome}</h3>
        <p>${s.descricao || ""}</p>
        <p>Preço: R$ ${s.preco.toFixed(2)}</p>
        <p>Duração: ${s.duracao}</p>
      </div>
    `
      )
      .join("");
  } catch (err) {
    console.error(err);
  }
}

// ==================== LISTAR BARBEIROS ====================
async function listarBarbeiros() {
  try {
    const res = await fetch(`${API_URL}/barbeiros`);
    const barbeiros = await res.json();
    const container = document.getElementById("barbeiros-lista");
    if (!container) return;
    container.innerHTML = barbeiros
      .map(
        (b) => `
      <div class="card">
        <h3>${b.nome}</h3>
        <p>Especialidade: ${b.especialidade}</p>
        <p>Telefone: ${b.telefone}</p>
      </div>
    `
      )
      .join("");
  } catch (err) {
    console.error(err);
  }
}

// ==================== POPULAR SELECTS ====================
async function popularBarbeiros() {
  try {
    const res = await fetch(`${API_URL}/barbeiros`);
    const barbeiros = await res.json();
    const select = document.getElementById("barbeiro");
    if (!select) return;
    select.innerHTML = barbeiros
      .map((b) => `<option value="${b.id}">${b.nome}</option>`)
      .join("");
  } catch (err) {
    console.error(err);
  }
}

async function popularServicos() {
  try {
    const res = await fetch(`${API_URL}/servicos`);
    const servicos = await res.json();
    const select = document.getElementById("servico");
    if (!select) return;
    select.innerHTML = servicos
      .map((s) => `<option value="${s.id}">${s.nome}</option>`)
      .join("");
  } catch (err) {
    console.error(err);
  }
}

// ==================== CRIAR AGENDAMENTO ====================
async function criarAgendamento() {
  const idBarbeiro = document.getElementById("barbeiro").value;
  const idServico = document.getElementById("servico").value;
  const dataHoraInput = document.getElementById("dataHora").value;
  const idUsuario = localStorage.getItem("usuarioId");

  if (!idUsuario) {
    alert("Erro: ID do usuário não encontrado. Faça login novamente.");
    return;
  }

  // Converte data/hora para formato ISO compatível com OffsetDateTime
  const dataHora = new Date(dataHoraInput).toISOString().replace("Z", "+03:00");

  const agendamentoDados = {
    idUsuario: parseInt(idUsuario),
    idServico: parseInt(idServico),
    idBarbeiro: parseInt(idBarbeiro),
    dataHora: dataHora,
    status: "PENDENTE",
  };

  try {
    const res = await fetch(`${API_URL}/agendamentos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(agendamentoDados),
    });

    if (!res.ok) {
      const erro = await res.text();
      console.error("Erro backend:", erro);
      throw new Error("Falha ao criar agendamento");
    }

    const data = await res.json(); // <-- precisa ler o JSON retornado do backend

    alert("✅ Agendamento criado com sucesso!");

    // 🔹 Abre o link do WhatsApp, se vier na resposta
    if (data.whatsapp) {
      window.open(data.whatsapp, "_blank");
    }

    const form = document.getElementById("agendamento-form");
    if (form) form.reset();
  } catch (err) {
    console.error("Erro ao criar agendamento:", err);
    alert(err.message);
  }
}
