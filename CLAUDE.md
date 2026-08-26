# CLAUDE.md — dash (PBQ)

## Visão geral

Dashboard jurídico pessoal (PWA). Frontend puro: sem framework, sem build step, sem bundler.

## Estrutura de arquivos

```
index.html          — shell: header, cards, nav tabs
style.css           — todos os estilos (~660 linhas)
app.js              — tabs/painéis, openTool(), closeTool()
db.js               — DB.load() / DB.save() via Google Apps Script
todo.js             — lista de tarefas (~312 linhas)
emails.js           — extrator de e-mails (filtro @bomfimnovis.com.br)
config.js           — SCRIPT_URL + TOKEN (não versionado)
config.example.js   — template de config
tools/
  honorarios.js     — calculadora Art. 85 §3º CPC (progressivo)
  prazos.js         — calculadora de prazos processuais + calendário visual
  calendario.json   — feriados e dias não úteis (TJPB incluído)
manifest.json       — PWA manifest
```

## Como as ferramentas funcionam

Cada ferramenta em `tools/*.js` expõe `window._tools['id'] = { name, html, css, init }`.  
`app.js` injeta o CSS/HTML no `#card-tool` e chama `init()` ao abrir.  
No mobile, usa `panel-active`; no desktop, esconde `#card-todo` e exibe `#card-tool` inline.

## Backend

`db.js` faz fetch GET/POST para um Google Apps Script (`CONFIG.SCRIPT_URL`).  
Autenticação por query param `?token=CONFIG.TOKEN`.  
Dados salvos como JSON plano.

## Convenções

- Sem TypeScript, sem transpilação — JavaScript vanilla puro.
- Sem dependências externas (nem npm).
- Idioma do código: português (variáveis, comentários, UI).
- Tema escuro; layout responsivo com CSS Grid de 3 colunas (desktop) / 1 coluna (mobile, ≤768px).
