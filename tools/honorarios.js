window._tools = window._tools || {};
window._tools['honorarios'] = {
  name: 'Honorários – Fazenda',
  icon: '⚖',
  desc: 'Art. 85, §3º CPC · cálculo progressivo',

  css: `
.hon-tool { font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; padding: 20px 20px 32px; background: #fff; }
.hon-tool .h-card { background:#f0f2f5; border-radius:12px; padding:24px; margin-bottom:16px; }
.hon-tool .h-result-card { background:#f0f2f5; border:2px solid #2c3e50; border-radius:12px; padding:24px; margin-bottom:16px; }
.hon-tool .h-card-title { font-size:.7rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:#2c3e50; border-bottom:2px solid #dce3ea; padding-bottom:10px; margin-bottom:18px; }
.hon-tool .h-field { margin-bottom:18px; }
.hon-tool .h-field:last-child { margin-bottom:0; }
.hon-tool label { display:block; font-size:.78rem; color:#555; margin-bottom:6px; font-weight:500; }
.hon-tool .h-input-wrap { position:relative; }
.hon-tool .h-prefix { position:absolute; left:12px; top:50%; transform:translateY(-50%); font-size:.85rem; color:#888; font-family:inherit; pointer-events:none; }
.hon-tool input[type="number"] { width:100%; background:#fff; border:1px solid #c8d0d8; border-radius:6px; color:#222; font-family:inherit; font-size:.95rem; padding:8px 10px 8px 36px; outline:none; transition:border-color .15s,box-shadow .15s; box-sizing:border-box; }
.hon-tool input[type="number"]:focus { border-color:#2c3e50; box-shadow:0 0 0 3px rgba(44,62,80,.1); }
.hon-tool input[type="number"]::placeholder { color:#bbb; }
.hon-tool select { width:100%; background:#fff; border:1px solid #c8d0d8; border-radius:6px; color:#222; font-family:inherit; font-size:.85rem; padding:8px 32px 8px 10px; outline:none; cursor:pointer; transition:border-color .15s; appearance:none; -webkit-appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; box-sizing:border-box; }
.hon-tool select:focus { border-color:#2c3e50; }
.hon-tool .h-sm-badge { margin-top:8px; font-size:.75rem; color:#2c3e50; background:#dce6f0; border:1px solid #b8cedd; border-radius:4px; padding:5px 10px; display:inline-block; font-family:inherit; }
.hon-tool .h-slider-row { display:flex; align-items:center; gap:12px; }
.hon-tool input[type="range"] { flex:1; -webkit-appearance:none; appearance:none; height:4px; background:#c8d0d8; border-radius:2px; outline:none; cursor:pointer; }
.hon-tool input[type="range"]::-webkit-slider-thumb { -webkit-appearance:none; width:18px; height:18px; border-radius:50%; background:#2c3e50; cursor:pointer; box-shadow:0 1px 4px rgba(44,62,80,.35); }
.hon-tool .h-pct-display { font-family:inherit; font-size:.9rem; color:#2c3e50; font-weight:600; min-width:3.5rem; text-align:right; }
.hon-tool .h-hint { font-size:.7rem; color:#7a8a99; margin-top:5px; }
.hon-tool .h-band-table { width:100%; border-collapse:collapse; font-size:.78rem; margin-top:4px; }
.hon-tool .h-band-table thead tr th { background:#dce3ea; font-size:.62rem; letter-spacing:.07em; text-transform:uppercase; color:#6a7a88; padding:7px 10px; text-align:left; border-bottom:2px solid #c8d0d8; }
.hon-tool .h-band-table tbody tr { border-bottom:1px solid #dce3ea; transition:background .1s; }
.hon-tool .h-band-table tbody tr:hover { background:#e6eaee; }
.hon-tool .h-band-table tbody tr.h-active-row { background:#d4e5f5 !important; border-left:3px solid #2c3e50; }
.hon-tool .h-band-table tbody td { padding:8px 10px; color:#333; font-family:inherit; }
.hon-tool .h-band-table tbody td.h-dim { color:#7a8a99; font-size:.73rem; }
.hon-tool .h-band-table tbody td.h-accent { color:#2c3e50; font-weight:600; }
.hon-tool .h-badge-active { display:inline-block; font-size:.6rem; background:#b8d4ec; color:#2c3e50; border:1px solid #90b8d8; border-radius:3px; padding:1px 6px; margin-left:6px; vertical-align:middle; font-weight:600; letter-spacing:.04em; }
.hon-tool .h-result-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:16px; margin-top:4px; }
.hon-tool .h-result-item label { font-size:.62rem; letter-spacing:.08em; text-transform:uppercase; color:#7a8a99; margin-bottom:4px; border:none; padding:0; }
.hon-tool .h-val { font-size:1.45rem; color:#2c3e50; font-weight:700; line-height:1.1; }
.hon-tool .h-sub { font-size:.72rem; color:#7a8a99; margin-top:3px; }
.hon-tool .h-divider { border:none; border-top:1px solid #dce3ea; margin:18px 0; }
.hon-tool .h-breakdown-table { width:100%; border-collapse:collapse; font-size:.78rem; }
.hon-tool .h-breakdown-table thead tr th { font-size:.62rem; letter-spacing:.07em; text-transform:uppercase; color:#6a7a88; padding:7px 10px; text-align:left; border-bottom:2px solid #c8d0d8; background:#dce3ea; }
.hon-tool .h-breakdown-table tbody td { padding:8px 10px; font-family:inherit; color:#333; border-bottom:1px solid #dce3ea; }
.hon-tool .h-breakdown-table tfoot td { padding:10px; font-family:inherit; font-weight:700; color:#2c3e50; border-top:2px solid #2c3e50; font-size:.9rem; }
.hon-tool .h-note { font-size:.72rem; color:#7a8a99; padding:12px 16px; border-left:3px solid #c8d0d8; background:#f0f2f5; border-radius:0 6px 6px 0; line-height:1.7; }
.hon-tool .h-note strong { color:#4a5a68; }
`,

  html: `
<div class="hon-tool">
  <div class="h-card">
    <div class="h-card-title">Parâmetros</div>
    <div class="h-field">
      <label>Valor da condenação ou do proveito econômico obtido (R$)</label>
      <div class="h-input-wrap">
        <span class="h-prefix">R$</span>
        <input type="number" id="hon-valor" placeholder="0,00" min="0" step="0.01" />
      </div>
    </div>
    <div class="h-field">
      <label>Salário mínimo de referência</label>
      <select id="hon-sm-select"></select>
      <div class="h-sm-badge" id="hon-sm-badge">—</div>
    </div>
    <div class="h-field">
      <label>Percentual a aplicar sobre cada faixa</label>
      <div class="h-slider-row">
        <input type="range" id="hon-pct" min="1" max="20" step="0.5" value="10" />
        <span class="h-pct-display" id="hon-pct-val">10,0%</span>
      </div>
      <div class="h-hint">Limitado automaticamente ao intervalo legal de cada faixa.</div>
    </div>
  </div>

  <div class="h-card">
    <div class="h-card-title">Faixas legais (§ 3º)</div>
    <table class="h-band-table" id="hon-band-table">
      <thead><tr><th>Inc.</th><th>Faixa (em SM)</th><th>Valor em R$</th><th>Min – Máx</th></tr></thead>
      <tbody></tbody>
    </table>
  </div>

  <div class="h-result-card">
    <div class="h-card-title">Resultado</div>
    <div class="h-result-grid">
      <div class="h-result-item"><label>Honorários mínimos</label><div class="h-val" id="hon-res-min">—</div><div class="h-sub" id="hon-res-min-sub"></div></div>
      <div class="h-result-item"><label>Honorários máximos</label><div class="h-val" id="hon-res-max">—</div><div class="h-sub" id="hon-res-max-sub"></div></div>
      <div class="h-result-item"><label>Pelo % selecionado</label><div class="h-val" id="hon-res-sel">—</div><div class="h-sub" id="hon-res-sel-sub"></div></div>
    </div>
    <hr class="h-divider" />
    <div class="h-card-title">Memória de cálculo (progressivo)</div>
    <table class="h-breakdown-table">
      <thead><tr><th>Faixa</th><th>Base na faixa (R$)</th><th>Min% / Máx%</th><th>Hon. mínimos (R$)</th><th>Hon. máximos (R$)</th></tr></thead>
      <tbody id="hon-breakdown-body"></tbody>
      <tfoot><tr><td colspan="3">Total</td><td id="hon-total-min">—</td><td id="hon-total-max">—</td></tr></tfoot>
    </table>
  </div>

  <p class="h-note">
    <strong>Notas:</strong> Cálculo progressivo — cada faixa incide apenas sobre o excedente.
    Percentuais fixados pelo juiz conforme art. 85, §2º, I–IV.
    Valores do SM conforme decretos federais. Em 2023 consta o segundo reajuste (mai/2023, Lei 14.663/2023).
    Este simulador não substitui análise jurídica profissional.
  </p>
</div>
`,

  init: function() {
    const SM_HISTORICO = [
      { ano: 2026, valor: 1621.00, ref: 'Dec. 12.797/2025' },
      { ano: 2025, valor: 1518.00, ref: 'Dec. 12.342/2024' },
      { ano: 2024, valor: 1412.00, ref: 'Dec. 11.864/2023' },
      { ano: 2023, valor: 1320.00, ref: 'Lei 14.663/2023 (mai)' },
      { ano: 2022, valor: 1212.00, ref: 'Dec. 10.944/2022' },
      { ano: 2021, valor: 1100.00, ref: 'Dec. 10.577/2020' },
      { ano: 2020, valor: 1045.00, ref: 'Dec. 10.163/2019' },
      { ano: 2019, valor:  998.00, ref: 'Dec. 9.661/2019' },
      { ano: 2018, valor:  954.00, ref: 'Dec. 9.255/2017' },
      { ano: 2017, valor:  937.00, ref: 'Dec. 8.948/2016' },
      { ano: 2016, valor:  880.00, ref: 'Dec. 8.618/2015' },
      { ano: 2015, valor:  788.00, ref: 'Dec. 8.381/2014' },
      { ano: 2014, valor:  724.00, ref: 'Dec. 8.166/2013' },
      { ano: 2013, valor:  678.00, ref: 'Dec. 7.872/2012' },
      { ano: 2012, valor:  622.00, ref: 'Dec. 7.655/2011' },
      { ano: 2011, valor:  545.00, ref: 'Dec. 7.445/2011' },
      { ano: 2010, valor:  510.00, ref: 'Dec. 7.116/2010' },
      { ano: 2009, valor:  465.00, ref: 'Dec. 6.867/2009' },
      { ano: 2008, valor:  415.00, ref: 'Dec. 6.307/2007' },
      { ano: 2007, valor:  380.00, ref: 'Dec. 6.045/2007' },
      { ano: 2006, valor:  350.00, ref: 'Dec. 5.690/2006' },
      { ano: 2005, valor:  300.00, ref: 'Dec. 5.421/2005' },
      { ano: 2004, valor:  260.00, ref: 'Dec. 5.063/2004' },
      { ano: 2003, valor:  240.00, ref: 'Dec. 4.862/2003' },
      { ano: 2002, valor:  200.00, ref: 'MP 35/2002' },
      { ano: 2001, valor:  180.00, ref: 'MP 2.142/2001' },
      { ano: 2000, valor:  151.00, ref: 'MP 2.018/2000' },
    ];
    const FAIXAS = [
      { inf: 0,      sup: 200,      pmin: 10, pmax: 20, inciso: 'I'   },
      { inf: 200,    sup: 2000,     pmin:  8, pmax: 10, inciso: 'II'  },
      { inf: 2000,   sup: 20000,    pmin:  5, pmax:  8, inciso: 'III' },
      { inf: 20000,  sup: 100000,   pmin:  3, pmax:  5, inciso: 'IV'  },
      { inf: 100000, sup: Infinity, pmin:  1, pmax:  3, inciso: 'V'   },
    ];
    const fmt  = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
    const fmtN = v => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const $    = id => document.getElementById(id);

    function getSM() { return parseFloat($('hon-sm-select').value); }

    function updateBadge() {
      const idx  = $('hon-sm-select').selectedIndex;
      const item = SM_HISTORICO[idx];
      $('hon-sm-badge').textContent = `SM ${item.ano}: R$ ${fmtN(item.valor)}  ·  ${item.ref}`;
    }

    function buildSelect() {
      const sel = $('hon-sm-select');
      SM_HISTORICO.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.valor;
        opt.textContent = `${item.ano}  ·  R$ ${fmtN(item.valor)}  —  ${item.ref}`;
        sel.appendChild(opt);
      });
      sel.selectedIndex = 0;
      updateBadge();
    }

    function buildBandTable(valor, SM) {
      const tbody = $('hon-band-table').querySelector('tbody');
      tbody.innerHTML = '';
      const vSM = valor / SM;
      FAIXAS.forEach(f => {
        const tr = document.createElement('tr');
        const label = f.inf === 0
          ? `Até ${f.sup.toLocaleString('pt-BR')} SM`
          : `${f.inf.toLocaleString('pt-BR')} a ${f.sup === Infinity ? '∞' : f.sup.toLocaleString('pt-BR')} SM`;
        const labelR = f.inf === 0
          ? `Até ${fmt(f.sup * SM)}`
          : `${fmt(f.inf * SM)} a ${f.sup === Infinity ? '∞' : fmt(f.sup * SM)}`;
        const ativa = valor > 0 && vSM > f.inf;
        tr.className = ativa ? 'h-active-row' : '';
        tr.innerHTML = `
          <td>${f.inciso}</td>
          <td class="h-dim">${label}${ativa ? '<span class="h-badge-active">ativa</span>' : ''}</td>
          <td class="h-dim">${labelR}</td>
          <td class="h-accent">${f.pmin}% – ${f.pmax}%</td>
        `;
        tbody.appendChild(tr);
      });
    }

    function calcularHonorarios(valor, pct, SM) {
      let min = 0, max = 0, sel = 0;
      const linhas = [];
      const vSM = valor / SM;
      FAIXAS.forEach(f => {
        if (vSM <= f.inf) return;
        const topo     = f.sup === Infinity ? vSM : Math.min(vSM, f.sup);
        const baseR    = (topo - f.inf) * SM;
        const pClamped = Math.min(Math.max(pct, f.pmin), f.pmax);
        const hMin = baseR * f.pmin / 100;
        const hMax = baseR * f.pmax / 100;
        const hSel = baseR * pClamped / 100;
        min += hMin; max += hMax; sel += hSel;
        linhas.push({ faixa: f.inciso, baseR, pmin: f.pmin, pmax: f.pmax, hMin, hMax });
      });
      return { min, max, sel, linhas };
    }

    function calcular() {
      const valor = parseFloat($('hon-valor').value) || 0;
      const pct   = parseFloat($('hon-pct').value);
      const SM    = getSM();
      buildBandTable(valor, SM);

      const clear = (ids, txt) => ids.forEach(id => $(id).textContent = txt);
      if (valor <= 0) {
        clear(['hon-res-min','hon-res-max','hon-res-sel','hon-total-min','hon-total-max'], '—');
        clear(['hon-res-min-sub','hon-res-max-sub','hon-res-sel-sub'], '');
        $('hon-breakdown-body').innerHTML = '';
        return;
      }

      const { min, max, sel, linhas } = calcularHonorarios(valor, pct, SM);
      $('hon-res-min').textContent     = fmt(min);
      $('hon-res-min-sub').textContent = `${fmtN(min / SM)} SM`;
      $('hon-res-max').textContent     = fmt(max);
      $('hon-res-max-sub').textContent = `${fmtN(max / SM)} SM`;
      $('hon-res-sel').textContent     = fmt(sel);
      $('hon-res-sel-sub').textContent = `Pct: ${pct.toFixed(1).replace('.', ',')}%`;

      const tbody = $('hon-breakdown-body');
      tbody.innerHTML = '';
      linhas.forEach(l => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${l.faixa}</td><td>${fmt(l.baseR)}</td><td>${l.pmin}% / ${l.pmax}%</td><td>${fmt(l.hMin)}</td><td>${fmt(l.hMax)}</td>`;
        tbody.appendChild(tr);
      });
      $('hon-total-min').textContent = fmt(min);
      $('hon-total-max').textContent = fmt(max);
    }

    // Eventos
    $('hon-valor').addEventListener('input', calcular);
    $('hon-sm-select').addEventListener('change', () => { updateBadge(); calcular(); });
    $('hon-pct').addEventListener('input', () => {
      const v = parseFloat($('hon-pct').value);
      $('hon-pct-val').textContent = v.toFixed(1).replace('.', ',') + '%';
      calcular();
    });

    buildSelect();
    buildBandTable(0, getSM());
  }
};
