window.addEventListener("DOMContentLoaded", () => {
  const tabs   = document.querySelectorAll(".nav-tab");
  const panels = document.querySelectorAll(".card");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      // Fechar ferramenta se estiver aberta antes de trocar de painel
      if (document.getElementById("card-tool").classList.contains("panel-active")) {
        closeTool();
      }
      panels.forEach(p => p.classList.remove("panel-active"));
      tabs.forEach(t => t.classList.remove("active"));
      document.getElementById(tab.dataset.target).classList.add("panel-active");
      tab.classList.add("active");
    });
  });
});

function openTool(event, toolId) {
  event.preventDefault();
  const tool = (window._tools || {})[toolId];
  if (!tool) return;

  // Injeta CSS uma única vez
  if (!document.getElementById("tool-css-" + toolId)) {
    const style = document.createElement("style");
    style.id = "tool-css-" + toolId;
    style.textContent = tool.css || "";
    document.head.appendChild(style);
  }

  // Injeta HTML e roda init
  document.getElementById("tool-content").innerHTML = tool.html || "";
  if (tool.init) tool.init();

  document.getElementById("tool-title").textContent = tool.name || "";

  const isMobile = window.innerWidth <= 768;
  window._toolOpenedFrom = isMobile ? "card-esquerda" : "card-todo";

  const cardTool = document.getElementById("card-tool");
  document.querySelectorAll(".card").forEach(p => p.classList.remove("panel-active"));
  document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
  cardTool.classList.add("panel-active");

  if (!isMobile) {
    // Desktop: esconde card-todo (mesma coluna do grid) e mostra card-tool via inline
    document.getElementById("card-todo").style.display = "none";
    cardTool.style.display = "block";
    document.querySelector(".btn-tool-back").textContent = "← Tarefas";
  } else {
    // Mobile: panel-active já cuida da visibilidade; inline styles não são necessários
    document.querySelector(".btn-tool-back").textContent = "← Ferramentas";
  }
}

function closeTool() {
  const from    = window._toolOpenedFrom || "card-todo";
  const cardTool = document.getElementById("card-tool");

  // Limpa inline styles usados no desktop
  cardTool.style.display = "";
  document.getElementById("card-todo").style.display = "";
  document.getElementById("tool-content").innerHTML = "";

  cardTool.classList.remove("panel-active");

  // Volta ao painel de origem
  document.querySelectorAll(".card").forEach(p => p.classList.remove("panel-active"));
  document.getElementById(from).classList.add("panel-active");

  document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
  const navTab = document.querySelector('[data-target="' + from + '"]');
  if (navTab) navTab.classList.add("active");
}
