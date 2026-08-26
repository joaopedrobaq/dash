// Utilitários compartilhados entre app.js, emails.js e as ferramentas em tools/*.js.

// Copia texto para a área de transferência, com fallback para contextos onde
// navigator.clipboard não existe (file://, HTTP sem TLS). Sempre devolve uma
// Promise — resolve em sucesso, rejeita se as duas formas falharem, para que
// quem chamar possa dar feedback visual em vez de falhar em silêncio.
function copiarTexto(texto) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(texto).catch(() => copiarTextoFallback(texto));
  }
  return copiarTextoFallback(texto);
}

function copiarTextoFallback(texto) {
  return new Promise((resolve, reject) => {
    const ta = document.createElement("textarea");
    ta.value = texto;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      ok ? resolve() : reject(new Error("execCommand('copy') falhou"));
    } catch (e) {
      document.body.removeChild(ta);
      reject(e);
    }
  });
}
