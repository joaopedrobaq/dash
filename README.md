# PBQ — Dashboard Jurídico

Dashboard PWA para uso interno do escritório. Roda no navegador sem instalação e sincroniza tarefas com Google Sheets via Google Apps Script.

---

## Funcionalidades

### Tarefas
Tabela de tarefas com campos de Cliente, Tema e Pasta. Cada tarefa recebe prioridade (Alta / Média / Baixa), pode ser pausada e reordenada por drag-and-drop (arraste pela alça `⠿` no desktop ou toque longo no mobile). As tarefas são salvas automaticamente no Google Sheets configurado.

### Ferramentas

| Ferramenta | Descrição |
|---|---|
| **Contador de Prazos** | Conta prazos em dias úteis com calendário visual — respeita feriados nacionais, estaduais e recesso do TJPB |
| **Calculadora de Honorários** | Cálculo progressivo de honorários sucumbenciais contra a Fazenda Pública (Art. 85, §3º CPC) |
| **Gerador de QR Code** | Gera QR Code offline a partir de qualquer texto ou URL |
| **Calculadora de Dígito - IPTU SSA** | Calcula o dígito verificador de inscrições imobiliárias do município de Salvador |

### Extrator de E-mails
Cola um texto bruto e extrai todos os endereços de e-mail únicos, filtrando automaticamente os internos (`@bomfimnovis.com.br`). Clique no resultado para copiar tudo.

---

## Dependências

O projeto é **zero-dependências**: HTML, CSS e JavaScript puro. Nenhum `npm install` necessário.

A única biblioteca embutida é o `qrcode-generator` (MIT — Kazuhiko Arase), já incluída em [`tools/qrcode.js`](tools/qrcode.js).

Para sincronização de tarefas é necessário um **Google Apps Script** publicado como Web App (veja [Configuração](#configuração)).

---

## Rodar localmente

### Opção 1 — Python (recomendado, já vem no sistema)

```bash
# Na raiz do projeto:
python -m http.server 8000
# Acesse: http://localhost:8000
```

> Python 3 já vem instalado no macOS e na maioria das distros Linux. No Windows, instale em [python.org](https://www.python.org/downloads/) ou via Microsoft Store.

### Opção 2 — Node.js (`npx serve`)

```bash
npx serve .
# Acesse a URL exibida no terminal (geralmente http://localhost:3000)
```

### Opção 3 — VS Code Live Server

Instale a extensão [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer), clique com o botão direito em `index.html` → **Open with Live Server**.

---

> **Abrir o `index.html` diretamente (`file://`) funciona?**
> As ferramentas (Contador de Prazos, Honorários, QR Code, Inscrição Imobiliária) funcionam normalmente, mesmo sem servidor. Só a sincronização de tarefas com o Google Apps Script não funciona em `file://` (fetch para um domínio externo é bloqueado por CORS nesse contexto) — para isso é necessário um servidor local ou o deploy no GitHub Pages.

---

## Configuração

### 1. Criar o `config.js`

```bash
cp config.example.js config.js
```

Edite `config.js` com seus valores:

```js
const CONFIG = {
  SCRIPT_URL: "https://script.google.com/macros/s/SEU_ID_AQUI/exec",
  TOKEN: "ESCOLHA_UMA_SENHA_QUALQUER",
};
```

> `config.js` está no `.gitignore` e **nunca deve ser commitado**.

### 2. Configurar o Google Apps Script

1. Acesse [script.google.com](https://script.google.com) e crie um novo projeto.
2. Implemente o script que gerencia a planilha (leitura, escrita, reordenação de tarefas).
3. Em **Implantar → Nova implantação**, escolha tipo **Web App**, execute como *Você* e acesso *Qualquer pessoa*.
4. Copie a URL gerada para `SCRIPT_URL` no `config.js`.
5. Escolha um `TOKEN` (qualquer string) — ele será verificado pelo script para autenticação simples.

---

## Modelo de segurança

O deploy no GitHub Pages gera `config.js` a partir dos secrets do repositório **e o publica junto com o site** (veja `deploy.yml`). Isso significa que `SCRIPT_URL` e `TOKEN` ficam visíveis no código-fonte da página para qualquer visitante.

O `TOKEN` evita acesso acidental à planilha, mas **não é autenticação real**: quem tiver a URL do site publicado consegue ler e sobrescrever a lista de tarefas inteira. Se o repositório/Pages for público, trate essa exposição como aceita conscientemente, ou:

- torne o repositório e o GitHub Pages **privados**; ou
- substitua o token por autenticação Google diretamente no Apps Script
  (`Session.getEffectiveUser().getEmail()` com lista de permissão).

---

## Limitações conhecidas

- **Sem controle de concorrência entre abas/dispositivos.** Cada alteração grava a lista de tarefas inteira; se duas abas estiverem abertas ao mesmo tempo, a última a salvar sobrescreve a outra por completo ("last write wins"). Evite manter o dashboard aberto em mais de um lugar simultaneamente enquanto edita tarefas.
- **Cache local é só de emergência.** Se a sincronização falhar ao carregar, o app exibe a última lista salva com sucesso no navegador (via `localStorage`), em modo somente leitura — nenhuma alteração feita nesse estado é persistida até a sincronização voltar.

---

## Estrutura do projeto

```
/
├── index.html              # Página única (SPA)
├── app.js                  # Navegação (data-view + rotas por hash)
├── todo.js                 # Lógica de tarefas (CRUD, drag-and-drop, sync)
├── db.js                   # Comunicação com o Google Apps Script
├── emails.js               # Extrator de e-mails
├── utils.js                # copiarTexto() compartilhado
├── sw.js                   # Service worker (cache-first do shell, offline)
├── style.css               # Estilos (tokens de cor em :root, grid + mobile)
├── config.js               # Credenciais locais (não commitado)
├── config.example.js       # Template de configuração
├── manifest.json           # PWA manifest
├── tools/
│   ├── prazos.js           # Contador de Prazos
│   ├── honorarios.js       # Calculadora de Honorários
│   ├── qrcode.js           # Gerador de QR Code (lib embutida)
│   ├── inscricao.js        # Calculadora de Dígito - IPTU SSA
│   └── calendario.js       # Feriados por tribunal + recesso (script, não
│                            # JSON — funciona também em file://)
└── .github/workflows/
    └── deploy.yml          # CI/CD → GitHub Pages
```

---

## Deploy (GitHub Pages)

O deploy é automático via GitHub Actions a cada push em `main`.

Configure os **Secrets** do repositório (`Settings → Secrets and variables → Actions`):

| Secret | Valor |
|---|---|
| `SCRIPT_URL` | URL do seu Google Apps Script |
| `TOKEN` | Mesma senha usada localmente |

O workflow gera o `config.js` a partir dos secrets e publica no GitHub Pages. Veja [Modelo de segurança](#modelo-de-segurança) antes de publicar um repositório público.

---

## Layout responsivo

- **Desktop**: três colunas — Ferramentas | Tarefas | Extrator de E-mails.
- **Mobile**: navegação inferior com abas (Tarefas / E-mails / Ferramentas). Ferramentas abrem em painel próprio com botão de voltar.
