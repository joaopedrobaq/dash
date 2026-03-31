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
    tr.className = `row-${item.prioridade || "baixa"}`;
    tr.dataset.index = i;

    tr.innerHTML = `
      <td class="drag-handle">⠿</td>
      <td class="col-cliente">${item.cliente}</td>
      <td class="col-tema">${item.tema}</td>
      <td class="col-pasta">${item.pasta}</td>
      <td class="col-actions">
        <button class="btn-edit" data-i="${i}" title="Editar">✎</button>
        <button class="btn-del"  data-i="${i}" title="Remover">✕</button>
      </td>
    `;

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
      if (dragSrc === null || dragSrc === i) return;
      const moved = items.splice(dragSrc, 1)[0];
      items.splice(i, 0, moved);
      save();
      render();
    });

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

  /* ── Linha de seção ── */
  function sectionRow(label) {
    const tr = document.createElement("tr");
    tr.className = "section-row";
    tr.innerHTML = `<td colspan="5" class="section-label">${label}</td>`;
    return tr;
  }

  /* ── Render principal ── */
  function render(editingIndex = null) {
    tbody.innerHTML = "";

    const grupos = {
      alta:  { label: "Alta prioridade",  rows: [] },
      media: { label: "Prioridade média", rows: [] },
      baixa: { label: "Baixa prioridade", rows: [] },
    };

    items.forEach((item, i) => {
      const p  = item.prioridade || "baixa";
      const tr = i === editingIndex ? renderEditRow(item, i) : renderRow(item, i);
      grupos[p].rows.push(tr);
    });

    Object.values(grupos).forEach(grupo => {
      if (grupo.rows.length === 0) return;
      tbody.appendChild(sectionRow(grupo.label));
      grupo.rows.forEach(tr => tbody.appendChild(tr));
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
