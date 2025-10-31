// js/main.js
const API_URL = "http://localhost:8080";

// Login
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
    localStorage.setItem("token", data.token);
    alert("Login realizado com sucesso!");
    window.location.href = "agendamento.html";
  } catch (err) {
    alert(err.message);
  }
}

// Listar serviços
async function listarServicos() {
  try {
    const res = await fetch(`${API_URL}/servicos`);
    const servicos = await res.json();
    const container = document.getElementById("servicos-lista");
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

// Listar barbeiros
async function listarBarbeiros() {
  try {
    const res = await fetch(`${API_URL}/barbeiros`);
    const barbeiros = await res.json();
    const container = document.getElementById("barbeiros-lista");
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

// Popular barbeiros no select
async function popularBarbeiros() {
  try {
    const res = await fetch(`${API_URL}/barbeiros`);
    const barbeiros = await res.json();
    document.getElementById("barbeiro").innerHTML = barbeiros
      .map((b) => `<option value="${b.id}">${b.nome}</option>`)
      .join("");
  } catch (err) {
    console.error(err);
  }
}

// Popular serviços no select
async function popularServicos() {
  try {
    const res = await fetch(`${API_URL}/servicos`);
    const servicos = await res.json();
    document.getElementById("servico").innerHTML = servicos
      .map((s) => `<option value="${s.id}">${s.nome}</option>`)
      .join("");
  } catch (err) {
    console.error(err);
  }
}

// Criar agendamento
async function criarAgendamento() {
  const idUsuario = document.getElementById("usuario").value;
  const idBarbeiro = document.getElementById("barbeiro").value;
  const idServico = document.getElementById("servico").value;
  const dataHora = document.getElementById("dataHora").value;

  try {
    const res = await fetch(`${API_URL}/agendamentos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ idUsuario, idBarbeiro, idServico, dataHora }),
    });
    if (!res.ok) throw new Error("Falha ao criar agendamento");
    alert("Agendamento criado com sucesso!");
    document.getElementById("agendamento-form").reset();
  } catch (err) {
    alert(err.message);
  }
}
