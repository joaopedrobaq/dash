window.addEventListener("DOMContentLoaded", async () => {
  let items = [];
  let dragSrc = null;
  let carregouOk = false;
  let saveTimer = null;

  const tbody  = document.getElementById("todo-body");
  const form   = document.getElementById("todo-form");
  const status = document.getElementById("sync-status");
  const banner = document.getElementById("todo-erro-banner");

  const PRIORIDADES = [
    { key: "alta",  label: "Alta"  },
    { key: "media", label: "Média" },
    { key: "baixa", label: "Baixa" },
  ];

  /* ── Cache local (só leitura de emergência — nunca substitui a sincronização) ── */
  const CACHE_KEY    = "dash:tarefas";
  const CACHE_TS_KEY = "dash:tarefas:ts";

  function salvarCache(dados) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(dados));
      localStorage.setItem(CACHE_TS_KEY, new Date().toISOString());
    } catch {
      /* localStorage indisponível (modo privado, quota) — cache é só conveniência */
    }
  }

  function lerCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const dados = JSON.parse(raw);
      if (!Array.isArray(dados)) return null;
      return { dados, ts: localStorage.getItem(CACHE_TS_KEY) };
    } catch {
      return null;
    }
  }

  function fmtDataHora(iso) {
    if (!iso) return "data desconhecida";
    const d = new Date(iso);
    if (isNaN(d)) return "data desconhecida";
    return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  /* ── Status de sincronização ──
     Erros ficam visíveis até a próxima operação bem-sucedida (nunca somem
     sozinhos) e ficam clicáveis para tentar salvar de novo. */
  function setStatus(msg, cls) {
    status.textContent = msg;
    status.className   = cls || "";
    status.onclick = null;
    status.style.cursor = "";
    if (cls === "sync-error") {
      status.onclick = () => save();
      status.style.cursor = "pointer";
      status.title = "Clique para tentar salvar novamente";
      return;
    }
    if (msg && cls !== "sync-loading") {
      setTimeout(() => { status.textContent = ""; status.className = ""; }, 2500);
    }
  }

  /* ── Habilita/desabilita o formulário conforme o estado de sincronização ──
     Enquanto a carga inicial não tiver sucesso, qualquer alteração local seria
     perdida no primeiro save() — então o formulário fica bloqueado. */
  function setFormHabilitado(habilitado) {
    form.classList.toggle("form-desabilitado", !habilitado);
    form.querySelectorAll("input, button").forEach(el => { el.disabled = !habilitado; });
  }

  function mostrarBanner(msg) {
    banner.innerHTML = "";
    const p = document.createElement("p");
    p.textContent = msg;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "Tentar novamente";
    btn.addEventListener("click", carregar);
    banner.appendChild(p);
    banner.appendChild(btn);
    banner.style.display = "";
  }

  function esconderBanner() {
    banner.style.display = "none";
    banner.innerHTML = "";
  }

  function save() {
    if (!carregouOk) {
      setStatus("⚠ Sem sincronização — alterações não serão salvas", "sync-error");
      return;
    }
    setStatus("Salvando…", "sync-loading");
    // Agrupa mutações rápidas (ex.: arrastar várias tarefas seguidas) num único
    // POST em vez de um por mutação — o setTimeout sempre lê o `items` mais
    // recente no momento em que dispara, então nenhuma mutação se perde.
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      DB.save(items)
        .then(() => { salvarCache(items); setStatus("Salvo ✓", "sync-ok"); })
        .catch(() => setStatus("⚠ Erro ao sincronizar", "sync-error"));
    }, 600);
  }

  /* ── Helpers de reordenação com troca de prioridade ── */
  function dropOnItem(srcIndex, targetIndex) {
    if (srcIndex === targetIndex) return;
    const targetPrioridade = items[targetIndex].prioridade;
    const moved = items.splice(srcIndex, 1)[0];
    moved.prioridade = targetPrioridade;
    const adjusted = srcIndex < targetIndex ? targetIndex - 1 : targetIndex;
    items.splice(adjusted, 0, moved);
    save();
    render();
  }

  function dropOnSection(srcIndex, prioridade) {
    const moved = items.splice(srcIndex, 1)[0];
    moved.prioridade = prioridade;
    // Insere no início da seção
    const firstInGroup = items.findIndex(it => it.prioridade === prioridade);
    items.splice(firstInGroup === -1 ? items.length : firstInGroup, 0, moved);
    save();
    render();
  }

  /* ── Seletor de prioridade ── */
  function buildPrioSelector(selected, onChange) {
    const wrap = document.createElement("div");
    wrap.className = "prio-selector";
    PRIORIDADES.forEach(({ key, label }) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `prio-btn prio-${key}`;
      btn.textContent = label;
      if (key === selected) btn.classList.add("prio-active");
      btn.addEventListener("click", () => {
        wrap.querySelectorAll(".prio-btn").forEach(b => b.classList.remove("prio-active"));
        btn.classList.add("prio-active");
        onChange(key);
      });
      wrap.appendChild(btn);
    });
    return wrap;
  }

  /* ── Linha normal ── */
  function renderRow(item, i) {
    const tr = document.createElement("tr");
    tr.draggable = carregouOk;
    tr.className = `row-${item.prioridade || "baixa"}${item.pausado ? " row-pausado" : ""}`;
    tr.dataset.index = i;

    const desabilitado = carregouOk ? "" : "disabled";
    tr.innerHTML = `
      <td class="drag-handle" aria-hidden="true">⠿</td>
      <td class="col-cliente"></td>
      <td class="col-tema"></td>
      <td class="col-pasta"></td>
      <td class="col-actions">
        <button class="btn-pause ${item.pausado ? "is-pausado" : ""}" data-i="${i}" title="${item.pausado ? "Retomar" : "Pausar"}" aria-label="${item.pausado ? "Retomar" : "Pausar"}" ${desabilitado}>${item.pausado ? "▶" : "⏸"}</button>
        <button class="btn-edit" data-i="${i}" title="Editar" aria-label="Editar" ${desabilitado}>✎</button>
        <button class="btn-del"  data-i="${i}" title="Remover" aria-label="Remover" ${desabilitado}>✕</button>
      </td>
    `;
    tr.querySelector(".col-cliente").textContent = item.cliente;
    tr.querySelector(".col-tema").textContent    = item.tema;
    tr.querySelector(".col-pasta").textContent   = item.pasta;

    // Drag — desktop
    tr.addEventListener("dragstart", (e) => {
      dragSrc = i;
      tr.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });
    tr.addEventListener("dragend", () => tr.classList.remove("dragging"));
    tr.addEventListener("dragover", (e) => { e.preventDefault(); tr.classList.add("drag-over"); });
    tr.addEventListener("dragleave", () => tr.classList.remove("drag-over"));
    tr.addEventListener("drop", (e) => {
      e.preventDefault();
      tr.classList.remove("drag-over");
      if (dragSrc === null) return;
      dropOnItem(dragSrc, i);
      dragSrc = null;
    });

    // Drag — touch (mobile)
    const handle = tr.querySelector(".drag-handle");
    let touchDropTarget = null;

    handle.addEventListener("touchstart", (e) => {
      if (!carregouOk) return;
      dragSrc = i;
      touchDropTarget = null;
      tr.classList.add("dragging");
      e.preventDefault();
    }, { passive: false });

    handle.addEventListener("touchmove", (e) => {
      e.preventDefault();
      const y = e.touches[0].clientY;
      tbody.querySelectorAll("tr").forEach(r => r.classList.remove("drag-over"));
      touchDropTarget = null;

      // Verifica se está sobre uma seção
      for (const r of tbody.querySelectorAll("tr.section-row")) {
        const rect = r.getBoundingClientRect();
        if (y >= rect.top && y <= rect.bottom) {
          r.classList.add("drag-over");
          touchDropTarget = { type: "section", prioridade: r.dataset.prioridade };
          return;
        }
      }

      // Linha de item mais próxima
      let closest = null, closestDist = Infinity;
      tbody.querySelectorAll("tr[data-index]").forEach(r => {
        if (r === tr) return;
        const rect = r.getBoundingClientRect();
        const dist = Math.abs(y - (rect.top + rect.height / 2));
        if (dist < closestDist) { closestDist = dist; closest = r; }
      });

      if (closest) {
        touchDropTarget = { type: "item", index: +closest.dataset.index };
        closest.classList.add("drag-over");
      }
    }, { passive: false });

    const endTouch = () => {
      tr.classList.remove("dragging");
      tbody.querySelectorAll("tr").forEach(r => r.classList.remove("drag-over"));

      if (dragSrc !== null && touchDropTarget !== null) {
        if (touchDropTarget.type === "item") {
          dropOnItem(dragSrc, touchDropTarget.index);
        } else if (touchDropTarget.type === "section") {
          dropOnSection(dragSrc, touchDropTarget.prioridade);
        }
      }

      dragSrc = null;
      touchDropTarget = null;
    };

    handle.addEventListener("touchend", endTouch);
    handle.addEventListener("touchcancel", endTouch);

    return tr;
  }

  /* ── Linha de edição ── */
  function renderEditRow(item, i) {
    const tr = document.createElement("tr");
    tr.classList.add("editing");
    let prioSelecionada = item.prioridade || "baixa";

    tr.innerHTML = `
      <td class="drag-handle"></td>
      <td class="col-cliente"><input class="edit-input" /></td>
      <td class="col-tema"><input class="edit-input" /></td>
      <td class="col-pasta"><input class="edit-input" /></td>
      <td class="col-actions">
        <button class="btn-save" title="Salvar">✓</button>
        <button class="btn-cancel" title="Cancelar">✕</button>
      </td>
    `;

    const tdTema = tr.querySelectorAll("td")[2];
    tdTema.appendChild(buildPrioSelector(prioSelecionada, (k) => { prioSelecionada = k; }));

    const [inCliente, inTema, inPasta] = tr.querySelectorAll(".edit-input");
    inCliente.value = item.cliente;
    inTema.value    = item.tema;
    inPasta.value   = item.pasta;

    tr.querySelector(".btn-save").addEventListener("click", () => {
      items[i] = {
        cliente:    inCliente.value.trim(),
        tema:       inTema.value.trim(),
        pasta:      inPasta.value.trim(),
        prioridade: prioSelecionada,
      };
      save();
      render();
    });

    tr.querySelector(".btn-cancel").addEventListener("click", () => render());

    tr.querySelectorAll(".edit-input").forEach(input => {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter")  tr.querySelector(".btn-save").click();
        if (e.key === "Escape") render();
      });
    });

    return tr;
  }

  /* ── Linha de seção (também é drop target) ── */
  function sectionRow(label, prioridade, contagem) {
    const tr = document.createElement("tr");
    tr.className = "section-row";
    tr.dataset.prioridade = prioridade;
    tr.innerHTML =
      `<td colspan="5" class="section-label">` +
      `<span class="section-dot section-dot-${prioridade}"></span>${label} ` +
      `<span class="section-count">· ${contagem}</span></td>`;

    tr.addEventListener("dragover", (e) => { e.preventDefault(); tr.classList.add("drag-over"); });
    tr.addEventListener("dragleave", () => tr.classList.remove("drag-over"));
    tr.addEventListener("drop", (e) => {
      e.preventDefault();
      tr.classList.remove("drag-over");
      if (dragSrc === null) return;
      dropOnSection(dragSrc, prioridade);
      dragSrc = null;
    });

    return tr;
  }

  /* ── Render principal ── */
  function render(editingIndex = null) {
    tbody.innerHTML = "";

    const grupos = {
      alta:  { label: "Alta prioridade",  rows: [], pausados: [] },
      media: { label: "Prioridade média", rows: [], pausados: [] },
      baixa: { label: "Baixa prioridade", rows: [], pausados: [] },
    };

    items.forEach((item, i) => {
      const p  = item.prioridade || "baixa";
      const tr = i === editingIndex ? renderEditRow(item, i) : renderRow(item, i);
      (item.pausado ? grupos[p].pausados : grupos[p].rows).push(tr);
    });

    let totalRenderizado = 0;
    Object.entries(grupos).forEach(([key, grupo]) => {
      const todos = [...grupo.rows, ...grupo.pausados];
      if (todos.length === 0) return;
      totalRenderizado += todos.length;
      tbody.appendChild(sectionRow(grupo.label, key, todos.length));
      todos.forEach(tr => tbody.appendChild(tr));
    });

    if (totalRenderizado === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = carregouOk
        ? `<td colspan="5" class="todo-vazio">Nenhuma tarefa. Adicione a primeira acima.</td>`
        : `<td colspan="5" class="todo-vazio">Nenhuma tarefa em cache local.</td>`;
      tbody.appendChild(tr);
    }

    tbody.querySelectorAll(".btn-pause").forEach(btn => {
      btn.addEventListener("click", () => {
        items[+btn.dataset.i].pausado = !items[+btn.dataset.i].pausado;
        save();
        render();
      });
    });

    tbody.querySelectorAll(".btn-edit").forEach(btn => {
      btn.addEventListener("click", () => render(+btn.dataset.i));
    });

    tbody.querySelectorAll(".btn-del").forEach(btn => {
      btn.addEventListener("click", () => excluirComDesfazer(+btn.dataset.i));
    });
  }

  /* ── Exclusão com desfazer ──
     Remove da lista imediatamente (feedback visual instantâneo), mas só
     persiste no servidor depois de 6s — tempo suficiente para o usuário
     desfazer um clique acidental no botão de excluir. */
  let desfazerPendente = null; // { item, index, timer, toast }

  function limparDesfazerPendente() {
    if (!desfazerPendente) return;
    clearTimeout(desfazerPendente.timer);
    desfazerPendente.toast.remove();
    desfazerPendente = null;
  }

  function excluirComDesfazer(i) {
    if (!carregouOk) return;
    // Uma exclusão pendente anterior é confirmada (persistida) antes de abrir outra.
    if (desfazerPendente) { clearTimeout(desfazerPendente.timer); desfazerPendente.toast.remove(); save(); }

    const item = items.splice(i, 1)[0];
    render();

    const toast = document.createElement("div");
    toast.className = "todo-toast";
    const texto = document.createElement("span");
    texto.textContent = `Tarefa "${item.cliente || item.tema || item.pasta || "sem nome"}" removida.`;
    const btnDesfazer = document.createElement("button");
    btnDesfazer.type = "button";
    btnDesfazer.textContent = "Desfazer";
    btnDesfazer.addEventListener("click", () => {
      if (!desfazerPendente) return;
      clearTimeout(desfazerPendente.timer);
      items.splice(desfazerPendente.index, 0, desfazerPendente.item);
      desfazerPendente.toast.remove();
      desfazerPendente = null;
      render();
    });
    toast.appendChild(texto);
    toast.appendChild(btnDesfazer);
    document.getElementById("card-todo").appendChild(toast);

    const timer = setTimeout(() => {
      toast.remove();
      desfazerPendente = null;
      save();
    }, 6000);

    desfazerPendente = { item, index: i, timer, toast };
  }

  /* ── Formulário de adição ── */
  let prioNovo = "baixa";
  const prioWrap = document.getElementById("todo-prio-selector");
  prioWrap.appendChild(buildPrioSelector(prioNovo, (k) => { prioNovo = k; }));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const cliente = document.getElementById("f-cliente").value.trim();
    const tema    = document.getElementById("f-tema").value.trim();
    const pasta   = document.getElementById("f-pasta").value.trim();
    if (!cliente && !tema && !pasta) return;
    items.push({ cliente, tema, pasta, prioridade: prioNovo });
    save();
    render();
    form.reset();
    prioNovo = "baixa";
    prioWrap.innerHTML = "";
    prioWrap.appendChild(buildPrioSelector(prioNovo, (k) => { prioNovo = k; }));
    document.getElementById("f-cliente").focus();
  });

  /* ── Carga inicial (também reusada pelo botão "Tentar novamente") ── */
  async function carregar() {
    setFormHabilitado(false);
    esconderBanner();
    limparDesfazerPendente();
    setStatus("Carregando…", "sync-loading");
    try {
      const dados = await DB.load();
      if (!Array.isArray(dados)) throw new Error("resposta inválida");
      items = dados;
      carregouOk = true;
      salvarCache(items);
      setFormHabilitado(true);
      setStatus("");
    } catch {
      carregouOk = false;
      const cache = lerCache();
      if (cache) {
        items = cache.dados;
        setStatus("⚠ Falha ao carregar — exibindo dados locais", "sync-error");
        mostrarBanner(`Exibindo dados locais de ${fmtDataHora(cache.ts)} — sem sincronização. Alterações não serão salvas.`);
      } else {
        items = [];
        setStatus("⚠ Falha ao carregar dados", "sync-error");
        mostrarBanner("Não foi possível carregar as tarefas. Nada será salvo até a sincronização ser restabelecida.");
      }
    }
    render();
  }

  await carregar();
});
