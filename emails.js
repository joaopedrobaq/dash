window.addEventListener("DOMContentLoaded", () => {
  const textarea = document.getElementById("texto");
  const resultado = document.getElementById("resultado");

  function extrairEmails(texto) {
    const todos = texto.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    const filtrados = todos.filter(e => !e.toLowerCase().endsWith("@bomfimnovis.com.br"));
    return [...new Set(filtrados)];
  }

  textarea.addEventListener("input", () => {
    resultado.textContent = extrairEmails(textarea.value).join("\n");
  });

  document.getElementById("btn-limpar-emails").addEventListener("click", () => {
    textarea.value = "";
    resultado.textContent = "";
  });

  resultado.addEventListener("click", () => {
    const texto = resultado.textContent;
    if (texto.trim() === "") return;
    navigator.clipboard.writeText(texto).then(() => {
      resultado.classList.add("copiado");
      resultado.textContent = "Copiado!";
      setTimeout(() => {
        resultado.classList.remove("copiado");
        resultado.textContent = extrairEmails(textarea.value).join("\n");
      }, 500);
    });
  });
});
