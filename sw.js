// Service worker do PBQ Dashboard.
// Cache-first para o shell (HTML/CSS/JS/ícones/calendário) — as
// ferramentas e a navegação funcionam offline. As chamadas ao Google
// Apps Script (tarefas) nunca são cacheadas: são sempre rede, sempre
// dados atuais, e falham com a mensagem de erro já tratada em todo.js.
const CACHE = "dash-v1";

const ARQUIVOS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./todo.js",
  "./emails.js",
  "./db.js",
  "./config.js",
  "./tools/honorarios.js",
  "./tools/prazos.js",
  "./tools/inscricao.js",
  "./tools/qrcode.js",
  "./tools/calendario.json",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ARQUIVOS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((chaves) => Promise.all(chaves.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Só GET, só mesma origem — o Apps Script é outra origem e passa direto.
  if (req.method !== "GET" || url.origin !== self.location.origin) return;

  event.respondWith(caches.match(req).then((resp) => resp || fetch(req)));
});
