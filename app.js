window.addEventListener("DOMContentLoaded", () => {
  const tabs   = document.querySelectorAll(".nav-tab");
  const panels = document.querySelectorAll(".card");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      panels.forEach(p => p.classList.remove("panel-active"));
      tabs.forEach(t => t.classList.remove("active"));
      document.getElementById(tab.dataset.target).classList.add("panel-active");
      tab.classList.add("active");
    });
  });
});
