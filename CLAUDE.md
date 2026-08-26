# CLAUDE.md — dash (PBQ)

## Visão geral

Dashboard jurídico pessoal (PWA). Frontend puro: sem framework, sem build step, sem bundler.

## Estrutura de arquivos

```
index.html          — shell: header, cards, nav tabs
style.css           — todos os estilos, incluindo tokens de cor em :root (~880 linhas)
app.js               — navegação: data-view no <body>, rotas por hash (#/<ferramenta>)
db.js                — DB.load() / DB.save() via Google Apps Script
todo.js              — lista de tarefas (~580 linhas)
emails.js            — extrator de e-mails (filtro @bomfimnovis.com.br)
utils.js             — copiarTexto() compartilhado (clipboard com fallback)
sw.js                 — service worker: cache-first do shell, offline
config.js             — SCRIPT_URL + TOKEN (não versionado)
config.example.js    — template de config
tools/
  honorarios.js      — calculadora Art. 85 §3º CPC (progressivo)
  prazos.js          — calculadora de prazos processuais + calendário visual
  inscricao.js       — dígito verificador de inscrição imobiliária (IPTU SSA)
  qrcode.js          — gerador de QR Code (lib qrcode-generator embutida)
  calendario.js      — feriados por tribunal + recesso, via `window._calendarioDados`
                        (script, não JSON — funciona em file://; feriados móveis
                        nacionais são calculados pela Páscoa em prazos.js, não ficam aqui)
manifest.json        — PWA manifest (icon-512.png incluído)
```

## Como as ferramentas funcionam

Cada ferramenta em `tools/*.js` expõe `window._tools['id'] = { name, html, css, init }`.
`app.js` injeta o CSS/HTML no `#tool-content` e chama `init()` ao abrir.

Navegação: um único atributo `data-view` no `<body>` (`"tarefas" | "emails" | "ferramentas" | "tool"`)
controla toda a visibilidade via seletores CSS (`body[data-view="..."] #card-...`) — `app.js` só
atualiza esse atributo, nunca `style.display` nem lê `window.innerWidth`. Ferramentas têm rota por
hash (`#/prazos`, `#/honorarios`, ...), reaberta automaticamente no carregamento da página.

## Backend

`db.js` faz fetch GET/POST para um Google Apps Script (`CONFIG.SCRIPT_URL`).
Autenticação por query param `?token=CONFIG.TOKEN` — **não é autenticação real**, só evita acesso
acidental (veja "Modelo de segurança" no README). Dados salvos como JSON plano. `todo.js` guarda um
cache local (`localStorage`) para exibir a última lista salva com sucesso se a sincronização falhar.

## Convenções

- Sem TypeScript, sem transpilação — JavaScript vanilla puro.
- Sem dependências externas (nem npm).
- Idioma do código: português (variáveis, comentários, UI).
- **Tema claro** (fundo `#f0f2f5`, texto escuro) — não escuro. Layout responsivo com CSS Grid de 3
  colunas (desktop) / 1 coluna (mobile, ≤768px).
- Cores em `var(--...)`, definidas no `:root` de `style.css` (azul de marca, fundo, bordas, tons de
  texto, cores de prioridade). O `<style>` de cada ferramenta é injetado no `<head>`, então essas
  variáveis valem lá também — não reintroduzir cores hardcoded que já têm token equivalente.
- Arquivos são **UTF-8**. Nunca gravar com `>` do PowerShell (gera UTF-16 e quebra a renderização
  no GitHub). Usar heredoc, a ferramenta Write, ou `Set-Content -Encoding utf8`.
