# Plano de implementação — dash (PBQ)

Documento de execução. Cada tarefa é independente e tem critério de aceite verificável.
Ordem sugerida = ordem das fases. Um commit por tarefa (ou por fase, se preferir).

## Regras gerais (valem para todas as tarefas)

- **Sem dependências novas.** Nada de npm, CDN ou biblioteca externa. JS vanilla.
- **Sem build step.** O que está no repo é o que roda.
- Idioma do código (variáveis, comentários, UI): **português**.
- Manter o padrão de ferramenta: `window._tools['id'] = { name, icon, desc, css, html, init }`.
- Arquivos são **UTF-8**. Nunca gravar com `>` do PowerShell (gera UTF-16). Usar heredoc bash ou a ferramenta Write.
- Rodar local: `python -m http.server 3131` na raiz. O `fetch` de `tools/calendario.json` exige servidor (não funciona em `file://`).
- Não commitar `config.js`.

---

# FASE 1 — Integridade de dados (crítico, fazer primeiro)

## 1.1 — Impedir que uma falha de carregamento apague a base

**Arquivo:** `todo.js`

**Problema:** se `DB.load()` lança (rede fora, Apps Script fora do ar, token inválido), o `catch` só
mostra a mensagem de erro e `items` fica `[]`. O app segue utilizável. Ao adicionar a primeira
tarefa, `save()` grava um array de 1 elemento por cima de toda a base no servidor. Perda total,
sem aviso.

**O que fazer:**

1. Criar uma flag de escopo do módulo `let carregouOk = false;`.
2. Marcar `carregouOk = true` **apenas** no caminho de sucesso da carga inicial.
3. No topo de `save()`, guardar:
   ```js
   function save() {
     if (!carregouOk) {
       setStatus("⚠ Sem sincronização — alterações não serão salvas", "sync-error");
       return;
     }
     ...
   }
   ```
4. Quando `carregouOk === false`, desabilitar o formulário de adição (inputs e botão `+`) e exibir
   uma faixa de erro persistente acima da tabela, com botão **"Tentar novamente"** que refaz a carga.
5. Extrair a carga inicial para uma função `carregar()` reutilizável pelo botão de retry.
6. Validar o retorno: se `DB.load()` não devolver um array, tratar como falha
   (`if (!Array.isArray(dados)) throw new Error('resposta inválida')`).

**Critério de aceite:** com o `SCRIPT_URL` do `config.js` apontando para uma URL inválida, a
lista aparece vazia com faixa de erro, o formulário fica desabilitado e nenhum POST é disparado
(verificar na aba Network).

## 1.2 — `DB.save()` precisa verificar a resposta

**Arquivo:** `db.js`

**Problema:** `save()` faz `await fetch(...)` e descarta o resultado. `load()` checa `res.ok`,
`save()` não. Qualquer 401/500 do Apps Script vira "Salvo ✓" na interface.

**O que fazer:**

```js
async function save(items) {
  const res = await fetch(`${CONFIG.SCRIPT_URL}?token=${CONFIG.TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(items),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}
```

**Atenção:** o Apps Script frequentemente responde 200 com HTML de erro. Se a resposta contiver
um corpo JSON de status, validar também (`{ ok: true }`). Se hoje o Script não devolve nada útil,
deixar um `// TODO` marcando que só o status HTTP é checado.

**Critério de aceite:** com URL inválida, o status mostra "⚠ Erro ao sincronizar", nunca "Salvo ✓".

## 1.3 — Escapar campos das tarefas

**Arquivos:** `todo.js` (`renderRow`, `renderEditRow`)

**Problema:** `renderRow` interpola `${item.cliente}` direto em `innerHTML` e `renderEditRow` faz
`value="${item.cliente}"`. Um cliente chamado `Empresa "X" Ltda` quebra o atributo e destrói a
linha de edição; um `<` some do texto renderizado.

**O que fazer:** parar de interpolar dados do usuário em HTML.

- Em `renderRow`: montar a estrutura com `innerHTML` **apenas para o esqueleto estático** e
  preencher as três células com `textContent`:
  ```js
  tr.querySelector('.col-cliente').textContent = item.cliente;
  tr.querySelector('.col-tema').textContent    = item.tema;
  tr.querySelector('.col-pasta').textContent   = item.pasta;
  ```
- Em `renderEditRow`: criar os inputs sem `value` no template e atribuir
  `inCliente.value = item.cliente;` (idem tema e pasta) depois de consultar os nós.

**Critério de aceite:** criar tarefa com cliente `Empresa "X" & <Cia> Ltda`, salvar, recarregar.
O texto aparece íntegro na tabela e no modo de edição.

## 1.4 — Cache local das tarefas

**Arquivos:** `todo.js`, `db.js`

**O que fazer:** gravar `localStorage.setItem('dash:tarefas', JSON.stringify(items))` a cada
`save()` bem-sucedido e a cada carga bem-sucedida. Se `DB.load()` falhar e existir cache, exibir os
dados do cache em **modo somente leitura** com faixa `"Exibindo dados locais de <data> — sem
sincronização"`. Isso não substitui a 1.1: com cache, `carregouOk` continua `false`.

**Critério de aceite:** carregar com sucesso, derrubar o servidor, recarregar a página → a lista
aparece com a faixa de aviso e o formulário desabilitado.

## 1.5 — Confirmação e desfazer na exclusão

**Arquivo:** `todo.js`

**Problema:** o `✕` apaga e grava imediatamente. Botão de 25×29px no mobile, colado no `✎`.

**O que fazer:** ao excluir, remover da lista e mostrar no `#sync-status` (ou numa faixa)
`"Tarefa removida — Desfazer"` por 6 segundos, guardando `{item, index}`. Clicar em "Desfazer"
reinsere no índice original e salva. Se os 6s passarem, aí sim persistir.
Alternativa mais simples e aceitável: `confirm()` com o nome do cliente.

**Critério de aceite:** excluir uma tarefa e desfazer restaura a tarefa na mesma posição e prioridade.

## 1.6 — Debounce e proteção contra escrita concorrente

**Arquivos:** `todo.js`, `db.js`

**O que fazer:**

1. **Debounce:** agrupar mutações rápidas (arrastar várias tarefas) num único POST após ~600ms.
   Manter o "Salvando…" durante a janela.
2. **Concorrência (opcional, exige mexer no Apps Script):** o backend passa a devolver e exigir um
   `updatedAt`. `save()` envia o `updatedAt` que carregou; se o servidor tiver outro, responde
   conflito e o front avisa `"A lista foi alterada em outro dispositivo — recarregue"`.
   Se não quiser mexer no Apps Script agora, implementar só o debounce e registrar o resto
   como limitação conhecida no README.

**Critério de aceite:** arrastar 3 tarefas seguidas dispara 1 POST, não 3.

---

# FASE 2 — Correção do contador de prazos

## 2.1 — Avisar quando faltam dados de feriado (mais importante desta fase)

**Arquivo:** `tools/prazos.js`

**Problema:** `tools/calendario.json` só tem `por_tribunal` preenchido para **2026**. Em 2025 e
2027 as listas estão vazias; de 2028 em diante nem os feriados nacionais variáveis existem
(`getFeriado` faz `calData.feriados[ano]` e, se `undefined`, ignora Carnaval, Sexta-Feira da Paixão
e Corpus Christi em silêncio). O resultado é um termo final **antecipado**, exibido com a mesma
aparência de um cálculo correto.

**O que fazer:**

1. Criar `function coberturaAnos()` que devolve o conjunto de anos com dados
   (chaves numéricas de `calData.feriados`).
2. Criar `function verificarCobertura(t0, t1, tribunalId)` que percorre os anos entre `t0` e `t1` e
   devolve uma lista de problemas:
   - ano ausente em `calData.feriados` → `"sem dados de feriados para <ano>"`;
   - ano presente mas `por_tribunal[tribunalId]` vazio ou ausente, com tribunal selecionado →
     `"sem feriados do <ID> para <ano>"`.
3. Renderizar o resultado dentro do card **Resultado**, em destaque (mesmo estilo de
   `.pz-note-aviso`, que já existe), acima do resumo:
   `"⚠ Cálculo possivelmente incorreto: sem feriados do TJBA para 2027. Confira manualmente."`
4. O aviso **não** deve impedir o cálculo, apenas marcá-lo como não confiável.

**Critério de aceite:** com tribunal TJBA e data de referência em 2027, o card de Resultado exibe o
aviso. Com data em 2026, não exibe.

## 2.2 — Calcular a Páscoa por algoritmo

**Arquivo:** `tools/prazos.js`

**O que fazer:** implementar o algoritmo de Meeus/Butcher (~12 linhas, sem dependências) e derivar,
para qualquer ano:

- Carnaval: segunda e terça = Páscoa − 48 e − 47 dias
- Sexta-Feira da Paixão: Páscoa − 2
- Corpus Christi: Páscoa + 60
- (Opcional, usados como ponto facultativo por vários tribunais: Quarta-Feira de Cinzas = Páscoa − 46,
  Quinta-Feira Santa = Páscoa − 3)

`getFeriado()` passa a consultar essa função em vez de `nacionais_variaveis`. Manter a leitura do
JSON como *override* (se o ano tiver `nacionais_variaveis`, ele vence), para não quebrar dados existentes.

Depois disso, `nacionais_variaveis` pode sair do JSON — e o aviso da 2.1 passa a valer só para
`por_tribunal`.

**Critério de aceite:** teste manual — Páscoa 2025 = 20/04, 2026 = 05/04, 2027 = 28/03.
Logo, Carnaval 2026 = 16 e 17/02 e Corpus Christi 2026 = 04/06, batendo com o JSON atual.

## 2.3 — Eliminar o `CAL_FALLBACK` duplicado

**Arquivo:** `tools/prazos.js`

**Problema:** `CAL_FALLBACK` (~110 linhas dentro de `init`) é uma segunda cópia do
`calendario.json`, já divergente dele. Duas fontes de verdade para dados jurídicos: o resultado
muda conforme o `fetch` funcione ou não, e o usuário não sabe qual foi usado.

**O que fazer:** remover `CAL_FALLBACK`. No `.catch()` do fetch, exibir estado de erro no lugar da
ferramenta: `"Não foi possível carregar o calendário. A ferramenta precisa ser aberta via servidor
(python -m http.server), não por file://."` com botão "Tentar novamente".

Se a fase 4 (service worker) for feita, o SW passa a garantir o `calendario.json` offline e o
fallback fica definitivamente desnecessário.

**Critério de aceite:** `tools/prazos.js` encolhe ~110 linhas; abrir a ferramenta com o
`calendario.json` renomeado mostra o erro em vez de calcular.

## 2.4 — Preencher 2027 e adicionar 2028

**Arquivo:** `tools/calendario.json`

**O que fazer:** preencher `por_tribunal` para 2027 e criar a entrada de 2028, para STJ, STF, TRF1,
TJBA, TJPB e CARF. Fontes: portarias/resoluções anuais de cada tribunal.

> **Não inventar datas.** Se não houver a portaria publicada, deixar o ano ausente — o aviso da 2.1
> cobre o caso. Um feriado inventado é pior que um aviso.

Esta tarefa provavelmente exige o usuário; deixar por último e perguntar.

## 2.5 — Usar (ou remover) o campo `tipo`

**Arquivos:** `tools/prazos.js`, `tools/calendario.json`

**Problema:** o JSON distingue `"feriado"` de `"ponto_facultativo"`, mas `getFeriado()` trata tudo
em `por_tribunal` como dia não útil. O campo nunca é lido no cálculo.

**O que fazer:** decidir com o usuário entre:

- **(a)** manter tudo como dia não útil (comportamento atual, conservador e correto na prática
  forense) e **documentar** isso na nota da ferramenta: *"pontos facultativos são tratados como
  dias não úteis"*; ou
- **(b)** usar o `tipo` para diferenciar visualmente no calendário e permitir um toggle
  *"considerar pontos facultativos"*.

Recomendação: **(a) + documentar**, mais o realce visual do `tipo` no calendário (a cor já existe:
`pz-d-fer-trib`).

---

# FASE 3 — Segurança e deploy

## 3.1 — Deixar explícito que o token é público

**Arquivos:** `.github/workflows/deploy.yml`, `README.md`

**Problema:** o workflow gera `config.js` a partir dos secrets **e remove `config.js` do
`.gitignore`** para publicá-lo no GitHub Pages. O token vai em texto puro para o site: qualquer
visitante tem leitura e escrita completas na base de tarefas. O `config.js` no `.gitignore` protege
o repositório, não o deploy.

**O que fazer nesta tarefa (documentação, não mudança de arquitetura):**

1. Comentário no `deploy.yml` explicando que `config.js` é publicado e que o TOKEN é, por
   construção, público.
2. Seção no README: *"Modelo de segurança"* — o token só evita acesso acidental, não é
   autenticação. Quem tiver a URL do site tem a base.

**Decisão para o usuário (não implementar sem confirmar):**
- (a) tornar o repositório e o Pages privados;
- (b) trocar o token por autenticação Google no próprio Apps Script
  (`Session.getEffectiveUser().getEmail()` com allowlist), eliminando o segredo do front;
- (c) aceitar o risco conscientemente.

## 3.2 — Tirar o token da query string

**Arquivos:** `db.js` (e o Apps Script, fora deste repo)

**Problema:** o token viaja em `?token=` no GET e no POST — fica em log de servidor, histórico do
navegador e cabeçalho `Referer`.

**O que fazer:** mover o token para o corpo do POST
(`body: JSON.stringify({ token: CONFIG.TOKEN, items })`). O GET do Apps Script não aceita corpo;
manter na query só no `load()` ou converter tudo para POST. **Exige alteração correspondente no
Apps Script** — combinar com o usuário antes.

---

# FASE 4 — PWA e offline

## 4.1 — Service worker

**Arquivos novos:** `sw.js`; alteração em `index.html`

**Problema:** existe `manifest.json`, mas nenhum service worker. O README afirma que "funciona
offline para as ferramentas" — não funciona.

**O que fazer:**

1. `sw.js` com estratégia **cache-first** para o shell:
   `index.html`, `style.css`, `app.js`, `todo.js`, `emails.js`, `db.js`,
   `tools/honorarios.js`, `tools/prazos.js`, `tools/inscricao.js`, `tools/qrcode.js`,
   `tools/calendario.json`, `icon.svg`, `icon-192.png`, `apple-touch-icon.png`, `manifest.json`.
2. **Nunca** cachear as chamadas ao `CONFIG.SCRIPT_URL` (sempre rede).
3. Versionar o cache (`const CACHE = 'dash-v1'`) e limpar caches antigos no `activate`.
4. Registrar no fim do `index.html`, com guarda:
   ```js
   if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
   ```
5. **Cuidado com o escopo:** o `start_url` do manifest é `/dash/`. O SW precisa ser servido da
   mesma raiz do deploy; conferir se o Pages publica em `/dash/` ou na raiz do domínio e ajustar
   caminhos relativos (usar `./`).

**Critério de aceite:** carregar o app, ativar modo offline no DevTools, recarregar → o shell e as
4 ferramentas funcionam; as tarefas mostram o aviso de sincronização da 1.1/1.4.

## 4.2 — Corrigir o manifest

**Arquivo:** `manifest.json`

- `background_color` está `#f0f2f5` e `theme_color` `#2c3e50` — coerente com o tema atual, manter.
- Adicionar `"description"`, `"lang": "pt-BR"`, `"orientation": "portrait-primary"` e um ícone
  `512x512` com `"purpose": "any maskable"` (hoje só há 180 e 192, e o Android pede 512).
- Adicionar `<meta name="theme-color" content="#2c3e50">` no `index.html` (hoje ausente).

---

# FASE 5 — UI / UX

> Medições feitas com o app rodando em 1440×900 e 375×812, com a base real (26 tarefas).

## 5.1 — Tokens de cor em CSS custom properties

**Arquivos:** `style.css`, `tools/*.js`

**Problema:** 280 declarações de cor hardcoded. `#2c3e50` aparece 39 vezes, `#c8d0d8` 18,
`#f0f2f5` 16 — espalhadas entre `style.css` e o bloco `css:` de cada ferramenta. Cada ferramenta
nova recopia a paleta.

**O que fazer:** definir em `:root` no `style.css`:

```css
:root {
  --azul-900:#1e2b38; --azul-700:#2c3e50;
  --fundo:#f0f2f5; --superficie:#fff;
  --borda:#c8d0d8; --borda-clara:#dce3ea;
  --txt:#222; --txt-2:#555; --txt-3:#5a6a78;
  --alta:#c62828; --media:#f57f17; --baixa:#2e7d32;
  --raio:12px; --raio-sm:6px;
}
```

Substituir os literais nos blocos `css:` das ferramentas por `var(--...)` — o `<style>` é injetado
no `<head>`, então as variáveis do `:root` valem normalmente. Fazer ferramenta por ferramenta,
conferindo visualmente cada uma.

**Ganho colateral:** com os tokens no lugar, modo escuro vira um bloco
`@media (prefers-color-scheme: dark)` redefinindo ~12 variáveis.

## 5.2 — Botões de ação da tarefa: contraste e alvo de toque

**Arquivo:** `style.css`

**Medição:** `.btn-pause` / `.btn-edit` / `.btn-del` têm **24×23px no desktop e 25×29px no mobile**,
com `color: #ccc`. `#ccc` sobre branco dá **1,6:1** de contraste — muito abaixo do mínimo de 3:1
para controles (WCAG 2.1 SC 1.4.11) — e o alvo está longe dos 44×44px recomendados.
São três glifos cinza-claro colados, e um deles apaga a tarefa.

**O que fazer:**

- Cor base `var(--txt-3)` (`#5a6a78`, ~5,3:1).
- Alvo mínimo: 32×32px no desktop, **44×44px no mobile** (usar padding, mantendo o glifo pequeno).
- `.btn-del:hover` / `:focus-visible` em `var(--alta)`; os outros em `var(--azul-700)`.
- Aumentar o `gap` entre os três botões para no mínimo 8px no mobile.
- Adicionar `:focus-visible` com contorno visível (hoje não há estilo de foco em lugar nenhum).

## 5.3 — Cabeçalho da tabela e cabeçalhos de seção fixos

**Arquivos:** `style.css`, `todo.js`

**Medição:** com 26 tarefas o `#card-todo` tem **1222px** de altura e a página **1348px**; o
`<thead>` é `position: static`, então some ao rolar. Numa tela de 900px o usuário perde a
referência das colunas e da prioridade em que está.

**O que fazer:**

- `#todo-table thead th { position: sticky; top: 0; z-index: 2; background: var(--superficie); }`
- `.section-row .section-label { position: sticky; top: <altura do thead>; z-index: 1; }`
- Testar no mobile, onde a tabela vira cards empilhados — pode exigir desativar o sticky no
  `@media (max-width:768px)`.

## 5.4 — Cabeçalho de seção legível + contagem

**Arquivos:** `style.css`, `todo.js`

**Medição:** `.section-label` está em **10px, `#999` sobre branco = 2,85:1** — reprovado no mínimo
de 4,5:1 para texto.

**O que fazer:** subir para 11–12px, `var(--txt-3)`, `font-weight:700`, e acrescentar a contagem do
grupo: `Alta prioridade · 6`. Adicionar um ponto colorido (`var(--alta)`/`--media`/`--baixa`) antes
do rótulo.

## 5.5 — Prioridade não pode depender só da cor de fundo

**Arquivo:** `style.css`

**Medição:** as linhas usam pastéis quase idênticos em luminância
(`row-alta #fff0f0`, `row-media #fffbe6`, `row-baixa #f2fbf4`) e `border-left-width: 0`.
Em escala de cinza ou para daltônicos, os três grupos são indistinguíveis assim que o cabeçalho de
seção sai da tela.

**O que fazer:** adicionar `border-left: 3px solid` na cor plena da prioridade
(`--alta`/`--media`/`--baixa`) em cada `tr`. Combinado com a 5.3 (seção sticky) resolve.

## 5.6 — Estado vazio da lista

**Arquivo:** `todo.js`

**Problema:** com zero tarefas, `render()` pula todos os grupos e o `<tbody>` fica vazio — a tela
mostra só a linha de cabeçalho, sem nenhuma mensagem.

**O que fazer:** renderizar uma linha `<td colspan="5">` com
*"Nenhuma tarefa. Adicione a primeira acima."* Distinguir do estado de erro da 1.1.

## 5.7 — Concluir ≠ excluir

**Arquivos:** `todo.js`, `index.html`, `style.css`

**Problema (produto):** hoje só existe **pausar** e **excluir**. Concluir uma tarefa significa
destruir o registro — não sobra histórico do que foi feito.

**O que fazer:** adicionar `concluido: true/false` ao item, com botão `✓`. Tarefas concluídas saem
das seções de prioridade e vão para um grupo **"Concluídas"** recolhido por padrão, com contagem.
Manter `excluir` para remoção definitiva.

> Mudança de formato de dados: itens antigos não têm o campo. Tratar `item.concluido` ausente como
> `false` (mesmo padrão já usado em `item.pausado` e `item.prioridade || 'baixa'`).

## 5.8 — Busca / filtro rápido

**Arquivos:** `index.html`, `todo.js`, `style.css`

**Justificativa:** a base real tem 26 tarefas em 1222px de tabela; achar um cliente exige rolar.

**O que fazer:** um campo de busca no cabeçalho do card que filtra por cliente/tema/pasta
(case-insensitive, sem acento) escondendo as linhas que não casam. Puramente client-side, sem
alterar `items`. Limpar com `Esc`.

## 5.9 — Aproveitar as colunas laterais no desktop

**Arquivo:** `style.css`

**Medição:** em 1440×900, `#card-esquerda` tem 353px e `#card-emails` 347px de altura contra
**1222px** do `#card-todo` — cerca de **875px de espaço morto** em cada lateral, e a página inteira
rola (1348px), levando embora o header e as próprias ferramentas.

**O que fazer (escolher uma):**

- **(a) Colunas laterais sticky** — `position: sticky; top: 24px;` em `#card-esquerda` e
  `#card-emails`. Menor mudança, resolve o essencial: as ferramentas ficam sempre alcançáveis.
- **(b) Rolagem interna** — dar `max-height: calc(100vh - 140px); overflow-y: auto;` ao
  `#card-todo`, com o `thead` sticky da 5.3. A página deixa de rolar; cada card rola sozinho.

Recomendação: **(a)**, que é uma linha de CSS por card e não muda o comportamento de rolagem
a que o usuário já está acostumado.

## 5.10 — Contador de Prazos: o resultado precisa estar visível

**Arquivo:** `tools/prazos.js`

**Medição:** a ferramenta tem **1730px** de altura numa coluna de 657px. O card *Parâmetros* ocupa
344px, e o **Resultado começa em y=527** — abaixo da dobra numa tela de 900px. O card
*Texto de tempestividade* começa em **y=1119**. Depois de escolher a data, o usuário precisa rolar
para ver a resposta que foi buscar.

**O que fazer:**

- Uma **barra de resultado fixa** no topo do painel da ferramenta (`position: sticky; top: 0`)
  mostrando só o essencial: **Termo final — 05/06/2026 (sexta-feira)**, com o aviso da 2.1 quando houver.
  O card completo continua embaixo.
- Alternativa mais simples: inverter a ordem — *Resultado* antes de *Parâmetros*.
- Esconder o card *Texto de tempestividade* enquanto não houver cálculo válido (hoje ele ocupa
  657px sempre, mesmo vazio).

## 5.11 — Calendário: tooltips inacessíveis

**Arquivo:** `tools/prazos.js`

**Problema:** os detalhes dos dias não úteis existem só em
`.pz-cal-day[data-tip]:hover::after`. **No mobile não há hover** — a informação é inalcançável.
No teclado também: as células não são focáveis. E as células medem **23×23px**, metade do alvo de
toque recomendado.

Saber *quais* feriados caíram no período é justamente o que se quer conferir num contador de prazos.

**O que fazer:**

1. Abaixo do calendário, renderizar uma **lista textual** dos dias não úteis do período:
   `04/06/2026 (quinta) — Corpus Christi (nacional)`. Resolve mobile, teclado e leitor de tela de
   uma vez, e é o formato mais útil para conferência.
2. Tornar as células com `data-tip` focáveis (`tabindex="0"`) e mostrar o tooltip também em
   `:focus-visible`.
3. No mobile, aumentar a célula para ≥32px e disparar o tooltip por clique.

## 5.12 — Contraste dos textos auxiliares nas ferramentas

**Arquivos:** `tools/honorarios.js`, `tools/prazos.js`, `tools/inscricao.js`

**Medição:** `.h-hint` / `.pz-hint` / `.ins-hint` usam `#7a8a99` sobre `#f0f2f5` a 0.7rem (11,2px):
**3,12:1** — reprovado no mínimo de 4,5:1 para texto normal.

**O que fazer:** trocar para `var(--txt-3)` (`#5a6a78`, ~4,9:1 sobre `#f0f2f5`) e subir o corpo
para 0.75rem. Mesmo tratamento nos rótulos `.h-result-item label` (0.62rem é pequeno demais para
rótulo de dado importante).

## 5.13 — Rotas por hash

**Arquivos:** `app.js`, `index.html`

**Problema:** as ferramentas abrem via `openTool()` sem alterar a URL. Dar F5 com o Contador de
Prazos aberto volta para a lista de tarefas; não dá para favoritar nem mandar link de uma
ferramenta. Além disso os itens são `<a href="#">`, o que empurra a rolagem para o topo e polui o
histórico.

**O que fazer:**

1. Trocar os `<a href="#" onclick="openTool(...)">` por `<button type="button" data-tool="prazos">`
   (corrige também teclado e leitor de tela — ver 5.15).
2. `openTool()` passa a fazer `location.hash = '#/' + toolId`; `closeTool()`/`goHome()` limpam o hash.
3. `window.addEventListener('hashchange', rotear)` e uma chamada a `rotear()` no `DOMContentLoaded`
   abrem a ferramenta correspondente.

## 5.14 — Unificar o controle de painéis

**Arquivos:** `app.js`, `style.css`

**Problema:** `openTool`/`closeTool`/`goHome` misturam `classList` com `style.display` inline e
ramificam por `window.innerWidth <= 768` — breakpoint duplicado entre JS e CSS.
**Bug reproduzível:** abrir uma ferramenta com a janela estreita (mobile) e alargá-la para desktop
deixa `#card-tool` e `#card-todo` na mesma célula do grid (`grid-column: 2; grid-row: 1`),
sobrepostos.

**O que fazer:** um único atributo de estado no `<body>` — `data-view="tarefas|emails|ferramentas|tool"` —
e todo o resto resolvido em CSS. Zero `style.display` no JS, zero leitura de `innerWidth`.
O texto do botão voltar ("← Tarefas" / "← Ferramentas") também sai do JS, via `::after` com
`content` diferente por media query.

## 5.15 — Acessibilidade básica

**Arquivos:** `index.html`, `style.css`, `todo.js`

- Ferramentas como `<button>`, não `<a href="#">` (ver 5.13).
- `aria-label` nos botões que são só ícone (`⏸`, `✎`, `✕`, `⠿`) — hoje só têm `title`.
- `#sync-status` com `role="status"` e `aria-live="polite"` para que o resultado da sincronização
  seja anunciado.
- Estilo de `:focus-visible` global (hoje não existe nenhum): `outline: 2px solid var(--azul-700);
  outline-offset: 2px`.
- `<h1 onclick="goHome()">` não é alcançável por teclado: virar `<button>` ou ganhar
  `tabindex="0"` + handler de `Enter`.
- O `<img class="header-logo" alt="">` está correto (decorativo) — manter.

## 5.16 — Feedback de sincronização mais honesto

**Arquivos:** `todo.js`, `style.css`

**Problema:** `setStatus` limpa a mensagem após 2,5s **inclusive as de erro**
(a condição atual só preserva `sync-loading`). Um erro de sincronização some sozinho e o usuário
segue trabalhando achando que salvou.

**O que fazer:** erros (`sync-error`) **persistem** até a próxima operação bem-sucedida, com
botão "Tentar novamente". Só `sync-ok` desaparece sozinho.

## 5.17 — Ícones das ferramentas

**Arquivo:** `index.html`

Os ícones são emoji (`📅 ⚖ ⬛ 🏠`), que renderizam de forma diferente em cada SO e desalinham
verticalmente. `⬛` para QR Code é pouco expressivo e `🏠` não comunica "dígito verificador de IPTU".

**O que fazer (opcional, cosmético):** trocar por SVG inline monocromático herdando `currentColor`.
Custa ~4 ícones de 24px e resolve alinhamento, cor e consistência entre plataformas de uma vez.

---

# FASE 6 — Manutenção e documentação

## 6.1 — Recodificar o README para UTF-8

**Arquivo:** `README.md`

**Problema:** o arquivo está em **UTF-16LE sem BOM** (começa com os bytes `23 00 20 00`), resultado
de um `>` do PowerShell. O GitHub o trata como binário/mojibake — a documentação está ilegível na
página do repositório.

**O que fazer:** reescrever o conteúdo em UTF-8 (heredoc bash ou Write). Conferir com
`file README.md` → deve dizer `UTF-8 text`. Aproveitar para corrigir a afirmação de que o app
"funciona offline" (só será verdade depois da 4.1) e adicionar a seção de segurança da 3.1.

## 6.2 — Atualizar o `CLAUDE.md`

**Arquivo:** `CLAUDE.md`

Dois pontos desatualizados que induzem a erro em trabalhos futuros:

- Diz **"Tema escuro"**; o `style.css` é claro (`background-color: #f0f2f5`, texto escuro).
  Uma ferramenta nova seguindo essa instrução sairia com o tema errado.
- A árvore de `tools/` lista apenas `honorarios.js`, `prazos.js` e `calendario.json` —
  faltam `inscricao.js` e `qrcode.js`.

Acrescentar também: onde ficam os tokens de cor (5.1) e a regra de UTF-8.

## 6.3 — Utilitário de cópia compartilhado

**Arquivos:** novo `utils.js`; `emails.js`, `tools/inscricao.js`, `tools/prazos.js`, `index.html`

**Problema:** `emails.js` e `tools/inscricao.js` chamam `navigator.clipboard.writeText().then()`
**sem `catch`**. Em contexto não seguro (`file://`, HTTP simples) `navigator.clipboard` é
`undefined` e o clique não faz nada — silenciosamente. `tools/prazos.js` já tem o `fallbackCopy`
correto com `document.execCommand`.

**O que fazer:** extrair `copiarTexto(texto)` de `prazos.js` para um `utils.js` carregado antes dos
demais scripts, e usar nos três lugares. Retornar uma Promise para o feedback de UI.

## 6.4 — Cachear o calendário entre aberturas

**Arquivo:** `tools/prazos.js`

`init()` refaz o `fetch('./tools/calendario.json')` toda vez que a ferramenta é aberta.
Guardar em `window._calCache` e reutilizar.

## 6.5 — `updateBadge()` acoplado à ordem do array

**Arquivo:** `tools/honorarios.js`

`updateBadge()` usa `$('hon-sm-select').selectedIndex` para indexar `SM_HISTORICO` — funciona por
acoplamento posicional e quebra silenciosamente se alguém reordenar o array ou adicionar um
`<option>`. Passar a ler `option.dataset.ano` e buscar no array.

## 6.6 — Nota sobre Fazenda Pública na calculadora

**Arquivo:** `tools/honorarios.js`

O art. 85, §3º só se aplica quando a Fazenda Pública é parte. O README diz isso, a interface não.
Acrescentar à `.h-note` para evitar uso indevido.

## 6.7 — Limpar worktrees abandonados

Existem dois worktrees em `.claude/worktrees/` (`angry-beaver-72412e`, `hungry-sutherland-cd685d`)
com cópias antigas do projeto. São ignorados pelo git, mas poluem buscas e `grep`.
Conferir se não há trabalho não commitado e remover com `git worktree remove`.

## 6.8 — `.claude/launch.json` apontava para um Python inexistente

**Já corrigido nesta sessão.** O arquivo apontava para
`C:/Users/pbq/AppData/Local/Programs/Python/Python311/python.exe`, que não existe mais
(o sistema tem Python 3.14 via WindowsApps). Passou a usar `python` do PATH.
Não é versionado — se o preview quebrar em outra máquina, é aqui.

---

# Ordem de execução recomendada

| Bloco | Tarefas | Por quê |
|---|---|---|
| **1** | 1.1, 1.2, 1.3, 6.1 | Perda de dados e documentação ilegível. Rápidas e independentes. |
| **2** | 2.1, 2.3 | Prazo errado em silêncio. 2.1 é o aviso; 2.3 remove a fonte dupla. |
| **3** | 1.4, 1.5, 1.6, 5.16 | Fecham o ciclo de confiabilidade da lista. |
| **4** | 5.1, 5.14, 5.13 | Refatorações de base — fazer antes das mudanças visuais. |
| **5** | 5.2 a 5.12, 5.15 | UI/UX, uma de cada vez, conferindo no navegador. |
| **6** | 4.1, 4.2 | Offline, já com o shell estabilizado. |
| **7** | 2.2, 2.4, 2.5, 3.1, 3.2 | Exigem decisão ou dados do usuário — **perguntar antes**. |
| **8** | 6.2 a 6.8 | Limpeza final. |

## Tarefas que exigem decisão do usuário (não executar sozinho)

- **2.4** — dados de feriados de 2027/2028: não inventar datas.
- **2.5** — tratamento de ponto facultativo.
- **3.1 / 3.2** — modelo de segurança e alteração do Apps Script.
- **5.7** — mudança no formato dos dados das tarefas (campo `concluido`).
- **5.9 / 5.10** — escolha entre as alternativas propostas.

## Como validar

Não há testes automatizados no projeto e não é objetivo criar uma suíte agora. Validar assim:

1. `python -m http.server 3131` na raiz.
2. Conferir cada critério de aceite no navegador, em **1440×900 e em 375×812**.
3. Console sem erros.
4. Para a Fase 1, testar com `SCRIPT_URL` inválida — é o caminho que hoje destrói dados.
5. Para a Fase 2, conferir um prazo conhecido à mão antes e depois da mudança.
