window.addEventListener("DOMContentLoaded", async () => {
  let items = [];
  let dragSrc = null;

  const tbody  = document.getElementById("todo-body");
  const form   = document.getElementById("todo-form");
  const status = document.getElementById("sync-status");

  const PRIORIDADES = [
    { key: "alta",  label: "Alta"  },
    { key: "media", label: "Média" },
    { key: "baixa", label: "Baixa" },
  ];

  /* ── Status de sincronização ── */
  function setStatus(msg, cls) {
    status.textContent = msg;
    status.className   = cls || "";
    if (msg && cls !== "sync-loading") {
      setTimeout(() => { status.textContent = ""; status.className = ""; }, 2500);
    }
  }

  function save() {
    setStatus("Salvando…", "sync-loading");
    DB.save(items)
      .then(()  => setStatus("Salvo ✓", "sync-ok"))
      .catch(()  => setStatus("⚠ Erro ao sincronizar", "sync-error"));
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
    tr.draggable = true;
    tr.className = `row-${item.prioridade || "baixa"}${item.pausado ? " row-pausado" : ""}`;
    tr.dataset.index = i;

    tr.innerHTML = `
      <td class="drag-handle">⠿</td>
      <td class="col-cliente">${item.cliente}</td>
      <td class="col-tema">${item.tema}</td>
      <td class="col-pasta">${item.pasta}</td>
      <td class="col-actions">
        <button class="btn-pause ${item.pausado ? "is-pausado" : ""}" data-i="${i}" title="${item.pausado ? "Retomar" : "Pausar"}">${item.pausado ? "▶" : "⏸"}</button>
        <button class="btn-edit" data-i="${i}" title="Editar">✎</button>
        <button class="btn-del"  data-i="${i}" title="Remover">✕</button>
      </td>
    `;

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
      <td class="col-cliente"><input class="edit-input" value="${item.cliente}" /></td>
      <td class="col-tema"><input class="edit-input" value="${item.tema}" /></td>
      <td class="col-pasta"><input class="edit-input" value="${item.pasta}" /></td>
      <td class="col-actions">
        <button class="btn-save" title="Salvar">✓</button>
        <button class="btn-cancel" title="Cancelar">✕</button>
      </td>
    `;

    const tdTema = tr.querySelectorAll("td")[2];
    tdTema.appendChild(buildPrioSelector(prioSelecionada, (k) => { prioSelecionada = k; }));

    const [inCliente, inTema, inPasta] = tr.querySelectorAll(".edit-input");

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
  function sectionRow(label, prioridade) {
    const tr = document.createElement("tr");
    tr.className = "section-row";
    tr.dataset.prioridade = prioridade;
    tr.innerHTML = `<td colspan="5" class="section-label">${label}</td>`;

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

    Object.entries(grupos).forEach(([key, grupo]) => {
      const todos = [...grupo.rows, ...grupo.pausados];
      if (todos.length === 0) return;
      tbody.appendChild(sectionRow(grupo.label, key));
      todos.forEach(tr => tbody.appendChild(tr));
    });

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
      btn.addEventListener("click", () => {
        items.splice(+btn.dataset.i, 1);
        save();
        render();
      });
    });
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

  /* ── Carga inicial ── */
  setStatus("Carregando…", "sync-loading");
  try {
    items = await DB.load();
    setStatus("");
  } catch {
    setStatus("⚠ Falha ao carregar dados", "sync-error");
  }
  render();
});
