/* ── Navegação ──
   Um único estado — data-view no <body> — controla tudo o que é visível.
   Toda a visibilidade fica em style.css (seletores `body[data-view=...]`);
   este arquivo só atualiza esse atributo e o hash da URL. Sem
   `style.display` inline e sem checar `window.innerWidth` — o CSS decide
   o que aparece em cada tamanho de tela. */

let viewAnterior = "tarefas";
let toolAtual = null;

window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".nav-tab").forEach(tab => {
    tab.addEventListener("click", () => irPara(tab.dataset.view));
  });

  document.querySelectorAll(".tool-item").forEach(item => {
    item.addEventListener("click", () => abrirFerramenta(item.dataset.tool));
  });

  window.addEventListener("hashchange", rotear);

  // Estado inicial: se a URL já aponta para uma ferramenta (link direto,
  // recarregar a página, favorito), abre ela; senão, tela de tarefas.
  const m = location.hash.match(/^#\/(\w+)$/);
  if (m && window._tools && window._tools[m[1]]) {
    abrirFerramenta(m[1]);
  } else {
    irPara("tarefas");
  }
});

function fecharFerramentaConteudo() {
  document.getElementById("tool-content").innerHTML = "";
  toolAtual = null;
  if (location.hash) history.replaceState(null, "", location.pathname + location.search);
}

function irPara(view) {
  fecharFerramentaConteudo();
  viewAnterior = view;
  document.body.dataset.view = view;
  document.querySelectorAll(".nav-tab").forEach(t => t.classList.toggle("active", t.dataset.view === view));
}

function goHome() {
  irPara("tarefas");
}

function abrirFerramenta(toolId) {
  const tool = (window._tools || {})[toolId];
  if (!tool) return;

  // Garante que a URL reflita a ferramenta aberta antes de renderizar —
  // se o hash ainda não bate, ajusta e deixa o próprio hashchange chamar
  // esta função de novo (evita duplicar a lógica de render em dois lugares).
  const hashAlvo = "#/" + toolId;
  if (location.hash !== hashAlvo) {
    location.hash = "/" + toolId;
    return;
  }

  if (toolAtual !== toolId) {
    if (document.body.dataset.view !== "tool") viewAnterior = document.body.dataset.view;

    if (!document.getElementById("tool-css-" + toolId)) {
      const style = document.createElement("style");
      style.id = "tool-css-" + toolId;
      style.textContent = tool.css || "";
      document.head.appendChild(style);
    }

    document.getElementById("tool-content").innerHTML = tool.html || "";
    document.getElementById("tool-title").textContent = tool.name || "";
    toolAtual = toolId;
    if (tool.init) tool.init();
  }

  document.body.dataset.view = "tool";
  document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
}

function closeTool() {
  irPara(viewAnterior || "tarefas");
}

function rotear() {
  const m = location.hash.match(/^#\/(\w+)$/);
  if (m && window._tools && window._tools[m[1]]) {
    abrirFerramenta(m[1]);
  } else if (document.body.dataset.view === "tool") {
    irPara(viewAnterior || "tarefas");
  }
}
