window.addEventListener("DOMContentLoaded", () => {
  const tabs   = document.querySelectorAll(".nav-tab");
  const panels = document.querySelectorAll(".card");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      // Fechar ferramenta se estiver aberta
      if (document.getElementById("card-tool").style.display !== "none") {
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

  const cardTool = document.getElementById("card-tool");
  const cardTodo = document.getElementById("card-todo");
  cardTodo.style.display = "none";
  cardTool.style.display = "block";

  // Mobile: troca panel-active
  document.querySelectorAll(".card").forEach(p => p.classList.remove("panel-active"));
  cardTool.classList.add("panel-active");
}

function closeTool() {
  const cardTool = document.getElementById("card-tool");
  const cardTodo = document.getElementById("card-todo");

  cardTool.style.display = "none";
  cardTodo.style.display = "block";
  document.getElementById("tool-frame").src = "";

  // Mobile: troca panel-active
  cardTool.classList.remove("panel-active");
  cardTodo.classList.add("panel-active");

  // Atualiza nav mobile
  document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
  const tabTodo = document.querySelector('[data-target="card-todo"]');
  if (tabTodo) tabTodo.classList.add("active");
}
