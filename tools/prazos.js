window._tools = window._tools || {};
window._tools['prazos'] = {
  name: 'Contador de Prazos',
  icon: '📅',
  desc: 'Cálculo de prazos · calendário visual',

  css: `
.pz-tool { font-family:"Segoe UI",Tahoma,Geneva,Verdana,sans-serif; padding:20px 20px 32px; background:#fff; }
.pz-card { background:#f0f2f5; border-radius:12px; padding:24px; margin-bottom:16px; }
.pz-result-card { background:#f0f2f5; border:2px solid #2c3e50; border-radius:12px; padding:24px; margin-bottom:16px; }
.pz-card-title { font-size:.7rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:#2c3e50; border-bottom:2px solid #dce3ea; padding-bottom:10px; margin-bottom:18px; }
.pz-field { margin-bottom:18px; }
.pz-field:last-child { margin-bottom:0; }
.pz-field > label:first-child { display:block; font-size:.78rem; color:#555; margin-bottom:6px; font-weight:500; }
.pz-date-row { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
.pz-date-row input[type="date"] { background:#fff; border:1px solid #c8d0d8; border-radius:6px; color:#222; font-family:inherit; font-size:.9rem; padding:8px 10px; outline:none; transition:border-color .15s,box-shadow .15s; }
.pz-date-row input[type="date"]:focus { border-color:#2c3e50; box-shadow:0 0 0 3px rgba(44,62,80,.1); }
.pz-toggle-group { display:flex; border:1px solid #c8d0d8; border-radius:6px; overflow:hidden; }
.pz-toggle-btn { background:#fff; border:none; cursor:pointer; font-size:.78rem; padding:8px 14px; color:#666; transition:background .15s,color .15s; font-family:"Segoe UI",Tahoma,Geneva,Verdana,sans-serif; }
.pz-toggle-btn:not(:last-child) { border-right:1px solid #c8d0d8; }
.pz-toggle-btn.active { background:#2c3e50; color:#fff; }
.pz-radio-group { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
.pz-radio-label { display:flex; align-items:center; gap:5px; font-size:.82rem; color:#444; cursor:pointer; padding:6px 12px; background:#fff; border:1px solid #c8d0d8; border-radius:6px; transition:border-color .15s,background .15s; user-select:none; }
.pz-radio-label.pz-radio-checked { border-color:#2c3e50; background:#e8edf2; }
.pz-radio-label input[type="radio"] { display:none; }
.pz-custom-num { background:#fff; border:1px solid #c8d0d8; border-radius:4px; font-family:inherit; font-size:.85rem; padding:4px 7px; width:58px; outline:none; }
.pz-custom-num:focus { border-color:#2c3e50; }
select.pz-select { width:100%; background:#fff; border:1px solid #c8d0d8; border-radius:6px; color:#222; font-family:inherit; font-size:.85rem; padding:8px 32px 8px 10px; outline:none; cursor:pointer; appearance:none; -webkit-appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; box-sizing:border-box; transition:border-color .15s; }
select.pz-select:focus { border-color:#2c3e50; }
.pz-field-inline { display:flex; align-items:center; gap:12px; justify-content:space-between; }
.pz-field-inline > label:first-child { margin-bottom:0; }
.pz-switch { position:relative; display:inline-block; width:44px; height:24px; flex-shrink:0; }
.pz-switch input { opacity:0; width:0; height:0; }
.pz-switch-slider { position:absolute; inset:0; background:#c8d0d8; border-radius:24px; cursor:pointer; transition:background .2s; }
.pz-switch-slider::before { content:''; position:absolute; width:18px; height:18px; left:3px; top:3px; background:#fff; border-radius:50%; transition:transform .2s; box-shadow:0 1px 3px rgba(0,0,0,.3); }
.pz-switch input:checked + .pz-switch-slider { background:#2c3e50; }
.pz-switch input:checked + .pz-switch-slider::before { transform:translateX(20px); }
.pz-loading { padding:24px; text-align:center; color:#888; font-size:.85rem; }
.pz-hint { font-size:.78rem; color:#7a8a99; padding:12px 16px; border-left:3px solid #c8d0d8; background:#f0f2f5; border-radius:0 6px 6px 0; margin-bottom:16px; }
.pz-resumo-grid { display:grid; grid-template-columns:auto 1fr; gap:6px 16px; font-size:.85rem; margin:0; }
.pz-resumo-grid dt { color:#7a8a99; font-size:.72rem; text-transform:uppercase; letter-spacing:.05em; display:flex; align-items:center; }
.pz-resumo-grid dd { color:#2c3e50; font-family:inherit; font-weight:600; font-size:.95rem; margin:0; }
.pz-resumo-grid .pz-resumo-muted { color:#7a8a99; font-weight:400; font-size:.82rem; }
.pz-note-prorr { font-size:.75rem; color:#e65100; background:#fff3e0; border:1px solid #ffcc80; border-radius:6px; padding:8px 12px; margin-top:10px; }
.pz-note-aviso { font-size:.75rem; color:#b71c1c; background:#ffebee; border:1px solid #ef9a9a; border-radius:6px; padding:8px 12px; margin-top:10px; }
.pz-cal-month { }
#pz-calendario { display:flex; flex-wrap:wrap; justify-content:center; gap:16px; }
.pz-cal-month { flex:0 0 calc((100% - 32px) / 3); }
@media (max-width:768px) { .pz-cal-month { flex:0 0 100%; } }
.pz-cal-month-title { font-size:.85rem; font-weight:600; color:#2c3e50; text-transform:capitalize; margin-bottom:8px; padding-bottom:6px; border-bottom:1px solid #dce3ea; }
.pz-cal-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:3px; }
.pz-cal-doh { font-size:.6rem; text-align:center; color:#999; padding:4px 0 6px; font-weight:600; }
.pz-cal-day { aspect-ratio:1/1; display:flex; align-items:center; justify-content:center; font-size:.75rem; border-radius:5px; position:relative; font-family:inherit; cursor:default; }
.pz-d-neutro { color:#ccc; }
.pz-d-vazio { }
.pz-d-fds { background:#f0f0f0; color:#bbb; }
.pz-d-contado { background:#e8f5e9; color:#2e7d32; font-weight:600; }
.pz-d-recesso { background:#fff8e1; color:#f57f17; font-weight:500; }
.pz-d-fer-nac { background:#ffebee; color:#c62828; font-weight:500; }
.pz-d-fer-trib { background:#fff3e0; color:#e65100; font-weight:500; }
.pz-d-dispon { background:#dbeafe; color:#1e40af; }
.pz-d-pub    { background:#e0e7ff; color:#3730a3; }
.pz-d-inicio { background:#1976d2; color:#fff; font-weight:700; border-radius:50%; }
.pz-d-fim { background:#0d47a1; color:#fff; font-weight:700; border-radius:50%; }
.pz-cal-day[data-tip] { cursor:help; }
.pz-cal-day[data-tip]:hover::after { content:attr(data-tip); position:absolute; bottom:calc(100% + 5px); left:50%; transform:translateX(-50%); background:rgba(30,30,30,.92); color:#fff; font-size:.65rem; font-family:"Segoe UI",Tahoma,Geneva,Verdana,sans-serif; padding:4px 8px; border-radius:4px; white-space:normal; max-width:180px; text-align:center; line-height:1.4; z-index:200; pointer-events:none; }
.pz-legenda { display:flex; flex-wrap:wrap; gap:8px; margin-top:16px; padding-top:12px; border-top:1px solid #dce3ea; }
.pz-leg-item { display:flex; align-items:center; gap:5px; font-size:.68rem; color:#555; }
.pz-leg-swatch { width:13px; height:13px; border-radius:3px; flex-shrink:0; }
.pz-text { width:100%; background:#fff; border:1px solid #c8d0d8; border-radius:6px; color:#222; font-family:inherit; font-size:.85rem; padding:8px 10px; outline:none; box-sizing:border-box; transition:border-color .15s,box-shadow .15s; }
.pz-text:focus { border-color:#2c3e50; box-shadow:0 0 0 3px rgba(44,62,80,.1); }
.pz-lbl-hint { color:#9aa7b3; font-weight:400; }
.pz-arts-row { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.pz-arts-row .pz-text { flex:1 1 130px; min-width:0; width:auto; }
.pz-arts-fixo { font-size:.85rem; color:#7a8a99; white-space:nowrap; }
.pz-arts-fixo.pz-arts-cola { margin-left:-6px; }
.pz-outro-row { display:grid; grid-template-columns:1fr 1fr; gap:8px; align-items:center; }
.pz-outro-row .pz-text { grid-column:1 / -1; min-width:0; }
select.pz-select-sm { font-size:.8rem; padding:8px 28px 8px 9px; }
.pz-temp-2col { display:grid; grid-template-columns:1fr 1fr; gap:0 16px; }
@media (max-width:768px) { .pz-temp-2col { grid-template-columns:1fr; } }
.pz-temp-out { background:#fff; border:1px solid #c8d0d8; border-radius:8px; padding:16px 18px; font-size:.85rem; line-height:1.7; color:#222; text-align:justify; user-select:text; }
.pz-temp-out.pz-temp-vazio { color:#9aa7b3; font-style:italic; text-align:left; }
.pz-btn-copy { margin-top:10px; background:#2c3e50; color:#fff; border:none; border-radius:6px; padding:9px 18px; font-size:.8rem; font-family:inherit; cursor:pointer; transition:background .15s; }
.pz-btn-copy:hover { background:#1e2b38; }
.pz-btn-copy.pz-copied { background:#2e7d32; }
`,

  html: `
<div class="pz-tool">
  <div id="pz-loading" class="pz-loading">Carregando calendário…</div>
  <div id="pz-main" style="display:none">

    <div class="pz-card">
      <div class="pz-card-title">Parâmetros</div>

      <div class="pz-field">
        <label>Data de referência</label>
        <div class="pz-date-row">
          <input type="date" id="pz-data" />
          <div class="pz-toggle-group">
            <button class="pz-toggle-btn active" data-tipo="disponibilizacao">Disponibilização</button>
            <button class="pz-toggle-btn" data-tipo="publicacao">Publicação</button>
          </div>
        </div>
      </div>

      <div class="pz-field">
        <label>Prazo</label>
        <div class="pz-radio-group" id="pz-prazo-group">
          <label class="pz-radio-label pz-radio-checked"><input type="radio" name="pz-prazo" value="5" checked />5 dias</label>
          <label class="pz-radio-label"><input type="radio" name="pz-prazo" value="15" />15 dias</label>
          <label class="pz-radio-label"><input type="radio" name="pz-prazo" value="30" />30 dias</label>
          <label class="pz-radio-label" id="pz-outro-label">
            <input type="radio" name="pz-prazo" value="outro" />Outro
            <input type="number" id="pz-prazo-custom" class="pz-custom-num" min="1" max="999" placeholder="dias" style="display:none" />
          </label>
        </div>
      </div>

      <div class="pz-field">
        <label>Tribunal / Modalidade</label>
        <select class="pz-select" id="pz-tribunal">
          <option value="_uteis">Genérico — dias úteis</option>
          <option value="_corridos">Genérico — dias corridos</option>
        </select>
      </div>

      <div class="pz-field pz-field-inline">
        <label>Prorrogação automática</label>
        <label class="pz-switch">
          <input type="checkbox" id="pz-prorrogacao" checked />
          <span class="pz-switch-slider"></span>
        </label>
      </div>
    </div>

    <div id="pz-result-area" style="display:none">
      <div class="pz-result-card">
        <div class="pz-card-title">Resultado</div>
        <dl class="pz-resumo-grid" id="pz-resumo"></dl>
        <div id="pz-note-prorr"></div>
        <div id="pz-note-aviso"></div>
      </div>
      <div class="pz-card">
        <div class="pz-card-title">Calendário</div>
        <div id="pz-calendario"></div>
        <div class="pz-legenda" id="pz-legenda"></div>
      </div>
    </div>

    <div id="pz-empty" class="pz-hint">Selecione uma data para calcular o prazo.</div>

    <div class="pz-card">
      <div class="pz-card-title">Texto de tempestividade</div>

      <div class="pz-field pz-field-inline">
        <label>Ato ainda não publicado</label>
        <label class="pz-switch">
          <input type="checkbox" id="pz-temp-naopub" />
          <span class="pz-switch-slider"></span>
        </label>
      </div>

      <div class="pz-field">
        <label>Peça a ser protocolada</label>
        <select class="pz-select" id="pz-temp-peca"></select>
      </div>

      <div class="pz-field" id="pz-temp-outro-field" style="display:none">
        <label>Nome da peça <span class="pz-lbl-hint">— concordância e ação ao lado</span></label>
        <div class="pz-outro-row">
          <input type="text" id="pz-temp-outro-nome" class="pz-text" placeholder="Ex.: Impugnação ao Cumprimento de Sentença" />
          <select class="pz-select pz-select-sm" id="pz-temp-outro-det">
            <option value="a presente">a presente</option>
            <option value="o presente">o presente</option>
            <option value="as presentes">as presentes</option>
            <option value="os presentes">os presentes</option>
          </select>
          <select class="pz-select pz-select-sm" id="pz-temp-outro-acao">
            <option value="apresentação">apresentação</option>
            <option value="interposição">interposição</option>
            <option value="oposição">oposição</option>
            <option value="propositura">propositura</option>
          </select>
        </div>
      </div>

      <div class="pz-temp-2col">
        <div class="pz-field">
          <label>Natureza do ato impugnado</label>
          <select class="pz-select" id="pz-temp-natureza"></select>
        </div>
        <div class="pz-field" id="pz-temp-veiculo-field">
          <label>Veículo de publicação</label>
          <input type="text" id="pz-temp-veiculo" class="pz-text" value="DJEN" />
        </div>
      </div>

      <div class="pz-field">
        <label>ID(s) do documento <span class="pz-lbl-hint">— separe múltiplos por ponto e vírgula</span></label>
        <input type="text" id="pz-temp-ids" class="pz-text" placeholder="2246959143; 102387675" />
      </div>

      <div class="pz-field" id="pz-temp-arts-field">
        <label>Artigo do prazo <span class="pz-lbl-hint">— os arts. 219 e 224 são fixos</span></label>
        <div class="pz-arts-row">
          <span class="pz-arts-fixo" id="pz-arts-pre">arts. 219, 224 e</span>
          <input type="text" id="pz-temp-arts" class="pz-text" />
          <span class="pz-arts-fixo" id="pz-arts-pos">do CPC</span>
        </div>
      </div>

      <div class="pz-temp-out" id="pz-temp-out"></div>
      <button type="button" class="pz-btn-copy" id="pz-temp-copy">Copiar texto</button>
    </div>
  </div>
</div>
`,

  init: function () {
    // Dados embutidos como fallback caso o fetch falhe (file://)
    const CAL_FALLBACK = {
      tribunais: [
        { id:'STJ',  nome:'Superior Tribunal de Justiça',              dias_uteis:true, recesso_dezembro_janeiro:true,  recesso_personalizado:null },
        { id:'STF',  nome:'Supremo Tribunal Federal',                   dias_uteis:true, recesso_dezembro_janeiro:true,  recesso_personalizado:null },
        { id:'TRF1', nome:'Tribunal Regional Federal da 1ª Região',     dias_uteis:true, recesso_dezembro_janeiro:true,  recesso_personalizado:null },
        { id:'TJBA', nome:'Tribunal de Justiça da Bahia',               dias_uteis:true, recesso_dezembro_janeiro:true,  recesso_personalizado:null },
        { id:'TJPB', nome:'Tribunal de Justiça da Paraíba',             dias_uteis:true, recesso_dezembro_janeiro:true,  recesso_personalizado:null },
        { id:'CARF', nome:'Conselho Administrativo de Recursos Fiscais',dias_uteis:true, recesso_dezembro_janeiro:false, recesso_personalizado:{inicio:'12-20',fim:'01-06'} }
      ],
      feriados: {
        fixos: [
          {data:'01-01',descricao:'Confraternização Universal'},
          {data:'04-21',descricao:'Tiradentes'},
          {data:'05-01',descricao:'Dia do Trabalho'},
          {data:'09-07',descricao:'Independência do Brasil'},
          {data:'10-12',descricao:'Nossa Senhora Aparecida'},
          {data:'11-02',descricao:'Finados'},
          {data:'11-15',descricao:'Proclamação da República'},
          {data:'11-20',descricao:'Consciência Negra'},
          {data:'12-25',descricao:'Natal'}
        ],
        '2025': {
          nacionais_variaveis:[
            {data:'2025-03-03',descricao:'Carnaval'},{data:'2025-03-04',descricao:'Carnaval'},
            {data:'2025-04-18',descricao:'Sexta-Feira da Paixão'},{data:'2025-06-19',descricao:'Corpus Christi'}
          ],
          por_tribunal:{STJ:[],STF:[],TRF1:[],TJBA:[],TJPB:[],CARF:[]}
        },
        '2026': {
          nacionais_variaveis:[
            {data:'2026-02-16',descricao:'Carnaval'},{data:'2026-02-17',descricao:'Carnaval'},
            {data:'2026-04-03',descricao:'Sexta-Feira da Paixão'},{data:'2026-06-04',descricao:'Corpus Christi'}
          ],
          por_tribunal:{
            STJ:[
              {data:'2026-04-01',descricao:'Semana Santa (Segunda)',tipo:'feriado'},
              {data:'2026-04-02',descricao:'Semana Santa (Terça) — feriado forense (Lei 5.010/66)',tipo:'feriado'},
              {data:'2026-08-11',descricao:'Dia da Justiça (Lei 5.010/66)',tipo:'feriado'},
              {data:'2026-12-08',descricao:'Dia da Justiça — Imaculada Conceição (Lei 5.010/66)',tipo:'feriado'},
              {data:'2026-02-18',descricao:'Quarta-Feira de Cinzas (até 14h)',tipo:'ponto_facultativo'},
              {data:'2026-04-20',descricao:'Ponto Facultativo',tipo:'ponto_facultativo'},
              {data:'2026-06-05',descricao:'Ponto Facultativo (após Corpus Christi)',tipo:'ponto_facultativo'},
              {data:'2026-08-10',descricao:'Ponto Facultativo',tipo:'ponto_facultativo'},
              {data:'2026-10-30',descricao:'Ponto Facultativo (transferência do Dia do Servidor)',tipo:'ponto_facultativo'},
              {data:'2026-12-07',descricao:'Ponto Facultativo',tipo:'ponto_facultativo'}
            ],
            STF:[
              {data:'2026-04-01',descricao:'Semana Santa (Segunda)',tipo:'feriado'},
              {data:'2026-04-02',descricao:'Semana Santa (Terça) — feriado forense (Lei 5.010/66)',tipo:'feriado'},
              {data:'2026-08-11',descricao:'Dia da Justiça (Lei 5.010/66)',tipo:'feriado'},
              {data:'2026-12-08',descricao:'Dia da Justiça — Imaculada Conceição (Lei 5.010/66)',tipo:'feriado'},
              {data:'2026-02-18',descricao:'Quarta-Feira de Cinzas (até 14h)',tipo:'ponto_facultativo'},
              {data:'2026-04-20',descricao:'Ponto Facultativo',tipo:'ponto_facultativo'},
              {data:'2026-06-05',descricao:'Ponto Facultativo (após Corpus Christi)',tipo:'ponto_facultativo'},
              {data:'2026-08-10',descricao:'Ponto Facultativo',tipo:'ponto_facultativo'},
              {data:'2026-10-30',descricao:'Ponto Facultativo (transferência do Dia do Servidor)',tipo:'ponto_facultativo'},
              {data:'2026-12-07',descricao:'Ponto Facultativo',tipo:'ponto_facultativo'}
            ],
            TRF1:[
              {data:'2026-04-01',descricao:'Semana Santa (Segunda)',tipo:'feriado'},
              {data:'2026-04-02',descricao:'Semana Santa (Terça) — feriado forense (Lei 5.010/66)',tipo:'feriado'},
              {data:'2026-08-11',descricao:'Dia do Direito (Lei 5.010/66)',tipo:'feriado'},
              {data:'2026-12-08',descricao:'Dia da Justiça — Imaculada Conceição (Lei 5.010/66)',tipo:'feriado'},
              {data:'2026-02-18',descricao:'Quarta-Feira de Cinzas (até 14h)',tipo:'ponto_facultativo'},
              {data:'2026-04-20',descricao:'Ponto Facultativo',tipo:'ponto_facultativo'},
              {data:'2026-06-05',descricao:'Ponto Facultativo (após Corpus Christi)',tipo:'ponto_facultativo'},
              {data:'2026-08-10',descricao:'Ponto Facultativo',tipo:'ponto_facultativo'},
              {data:'2026-10-30',descricao:'Ponto Facultativo (transferência do Dia do Servidor)',tipo:'ponto_facultativo'},
              {data:'2026-12-07',descricao:'Ponto Facultativo',tipo:'ponto_facultativo'}
            ],
            TJBA:[
              {data:'2026-01-02',descricao:'Confraternização Universal (extensão local)',tipo:'feriado'},
              {data:'2026-06-22',descricao:'São João',tipo:'feriado'},
              {data:'2026-06-23',descricao:'São João',tipo:'feriado'},
              {data:'2026-06-24',descricao:'São João',tipo:'feriado'},
              {data:'2026-07-02',descricao:'Independência da Bahia',tipo:'feriado'},
              {data:'2026-07-03',descricao:'Independência da Bahia',tipo:'feriado'},
              {data:'2026-08-11',descricao:'Dia do Magistrado / Dia do Advogado',tipo:'feriado'},
              {data:'2026-12-08',descricao:'Dia da Justiça',tipo:'feriado'},
              {data:'2026-02-12',descricao:'Pré-Carnaval (quinta-feira)',tipo:'ponto_facultativo'},
              {data:'2026-02-13',descricao:'Pré-Carnaval (sexta-feira)',tipo:'ponto_facultativo'},
              {data:'2026-02-18',descricao:'Quarta-Feira de Cinzas',tipo:'ponto_facultativo'},
              {data:'2026-04-02',descricao:'Endoenças (Quinta-Feira Santa)',tipo:'ponto_facultativo'},
              {data:'2026-04-20',descricao:'Ponto Facultativo (véspera de Tiradentes)',tipo:'ponto_facultativo'},
              {data:'2026-06-05',descricao:'Ponto Facultativo (pós-Corpus Christi)',tipo:'ponto_facultativo'},
              {data:'2026-08-10',descricao:'Dia da Criação dos Cursos Jurídicos',tipo:'ponto_facultativo'},
              {data:'2026-10-30',descricao:'Dia do Servidor Público (transferido do dia 28)',tipo:'ponto_facultativo'},
              {data:'2026-12-07',descricao:'Ponto Facultativo (véspera do Dia da Justiça)',tipo:'ponto_facultativo'}
            ],
            TJPB:[
              {data:'2026-08-05',descricao:'Data Magna da Paraíba (Lei Estadual nº 10.601/2015)',tipo:'feriado'},
              {data:'2026-08-11',descricao:'Fundação dos Cursos Jurídicos',tipo:'feriado'},
              {data:'2026-12-08',descricao:'Dia da Justiça',tipo:'feriado'},
              {data:'2026-02-18',descricao:'Quarta-Feira de Cinzas',tipo:'ponto_facultativo'},
              {data:'2026-04-02',descricao:'Semana Santa (Quinta-Feira Santa)',tipo:'ponto_facultativo'},
              {data:'2026-04-20',descricao:'Ponto Facultativo (véspera de Tiradentes)',tipo:'ponto_facultativo'},
              {data:'2026-06-05',descricao:'Ponto Facultativo (pós-Corpus Christi)',tipo:'ponto_facultativo'},
              {data:'2026-06-22',descricao:'Ponto Facultativo (São João antecipado)',tipo:'ponto_facultativo'},
              {data:'2026-06-23',descricao:'Ponto Facultativo (São João antecipado)',tipo:'ponto_facultativo'},
              {data:'2026-06-24',descricao:'São João',tipo:'ponto_facultativo'},
              {data:'2026-08-10',descricao:'Ponto Facultativo (compensado)',tipo:'ponto_facultativo'},
              {data:'2026-10-28',descricao:'Dia do Servidor Público',tipo:'ponto_facultativo'},
              {data:'2026-12-07',descricao:'Ponto Facultativo (véspera do Dia da Justiça)',tipo:'ponto_facultativo'}
            ],
            CARF:[]
          }
        },
        '2027': {
          nacionais_variaveis:[
            {data:'2027-02-15',descricao:'Carnaval'},{data:'2027-02-16',descricao:'Carnaval'},
            {data:'2027-03-26',descricao:'Sexta-Feira da Paixão'},{data:'2027-05-27',descricao:'Corpus Christi'}
          ],
          por_tribunal:{STJ:[],STF:[],TRF1:[],TJBA:[],TJPB:[],CARF:[]}
        }
      }
    };

    // `det` rege a concordância de toda a frase; `qual` é o particípio aplicado ao
    // ato impugnado ("embargad-", "recorrid-", "agravad-") — nulo nas peças que
    // não impugnam nada, como uma petição que apenas atende a despacho.
    // `art` = artigo específico do prazo; os arts. 219 e 224 (contagem e termo
    // inicial das publicações) são padrão e ficam fixos no texto.
    const PECAS = [
      { id:'ed',   nome:'Embargos de Declaração', det:'os presentes', acao:'oposição',     qual:'embargad', art:'1.023',      recursal:true },
      { id:'apel', nome:'Recurso de Apelação',    det:'o presente',   acao:'interposição', qual:'recorrid', art:'1.003, § 5º',recursal:true },
      { id:'agin', nome:'Agravo de Instrumento',  det:'o presente',   acao:'interposição', qual:'agravad',  art:'1.003, § 5º',recursal:true },
      { id:'agint',nome:'Agravo Interno',         det:'o presente',   acao:'interposição', qual:'agravad',  art:'1.021, § 2º',recursal:true },
      { id:'resp', nome:'Recurso Especial',       det:'o presente',   acao:'interposição', qual:'recorrid', art:'1.003, § 5º',recursal:true },
      { id:'rext', nome:'Recurso Extraordinário', det:'o presente',   acao:'interposição', qual:'recorrid', art:'1.003, § 5º',recursal:true },
      { id:'rord', nome:'Recurso Ordinário',      det:'o presente',   acao:'interposição', qual:'recorrid', art:'1.003, § 5º',recursal:true },
      { id:'pet',  nome:'Petição',                det:'a presente',   acao:'apresentação', qual:null,       art:'218, § 3º',  recursal:false },
      { id:'manif',nome:'Manifestação',           det:'a presente',   acao:'apresentação', qual:null,       art:'218, § 3º',  recursal:false }
    ];

    // Concordância derivada do determinante escolhido.
    const DETS = {
      'o presente':   { adj:'tempestivo',  verbo:'revela-se'  },
      'a presente':   { adj:'tempestiva',  verbo:'revela-se'  },
      'os presentes': { adj:'tempestivos', verbo:'revelam-se' },
      'as presentes': { adj:'tempestivas', verbo:'revelam-se' }
    };

    const NATUREZAS = [
      { id:'sentenca',  nome:'Sentença',            gen:'a' },
      { id:'acordao',   nome:'Acórdão',             gen:'o' },
      { id:'decisao',   nome:'Decisão',             gen:'a' },
      { id:'monoc',     nome:'Decisão Monocrática', gen:'a' },
      { id:'despacho',  nome:'Despacho',            gen:'o' },
      { id:'intimacao', nome:'Intimação',           gen:'a' }
    ];

    const $   = id => document.getElementById(id);
    let calData = null;
    let tipoSelecionado = 'disponibilizacao';
    let ultimoCalculo = null;

    // ── utilidades ──────────────────────────────────────────────────────────
    const addDays  = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
    const sameDay  = (a, b) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
    const isoStr   = d => { const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), dd=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${dd}`; };
    const mmdd     = d => String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    const fmtDate  = d => d.toLocaleDateString('pt-BR');
    const DIAS_PT  = ['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
    const diaSem   = d => DIAS_PT[d.getDay()];
    const isWknd   = d => d.getDay()===0 || d.getDay()===6;

    function isRecesso(date, tribunal) {
      if (!tribunal) return false;
      const md = (date.getMonth()+1)*100 + date.getDate();
      if (tribunal.recesso_dezembro_janeiro) return md >= 1220 || md <= 120;
      if (tribunal.recesso_personalizado) {
        const [im,id2] = tribunal.recesso_personalizado.inicio.split('-').map(Number);
        const [fm,fd]  = tribunal.recesso_personalizado.fim.split('-').map(Number);
        const imd = im*100+id2, fmd = fm*100+fd;
        return imd > fmd ? (md >= imd || md <= fmd) : (md >= imd && md <= fmd);
      }
      return false;
    }

    function getFeriado(date, tribunalId) {
      if (!calData) return null;
      const fixo = calData.feriados.fixos.find(f => f.data === mmdd(date));
      if (fixo) return { tipo:'nacional', desc:fixo.descricao };
      const yrData = calData.feriados[String(date.getFullYear())];
      if (yrData) {
        const iso = isoStr(date);
        const varFer = yrData.nacionais_variaveis.find(f => f.data === iso);
        if (varFer) return { tipo:'nacional', desc:varFer.descricao };
        if (tribunalId && yrData.por_tribunal[tribunalId]) {
          const tf = yrData.por_tribunal[tribunalId].find(f => f.data === iso);
          if (tf) return { tipo:'tribunal', desc:tf.descricao };
        }
      }
      return null;
    }

    function isUtilDay(date, tribunal) {
      if (isWknd(date)) return false;
      if (isRecesso(date, tribunal)) return false;
      if (getFeriado(date, tribunal ? tribunal.id : null)) return false;
      return true;
    }

    function nextUtilDay(from, tribunal) {
      let d = addDays(from, 1), s = 0;
      while (!isUtilDay(d, tribunal) && s++ < 500) d = addDays(d, 1);
      return d;
    }

    // ── cálculo ─────────────────────────────────────────────────────────────
    function calcular() {
      ultimoCalculo = null;

      const dataVal = $('pz-data').value;
      if (!dataVal || !calData) { mostrarVazio(); renderTempestividade(); return; }

      const [yr,mo,dy] = dataVal.split('-').map(Number);
      const dateRef = new Date(yr, mo-1, dy);

      const prazoPre = document.querySelector('input[name="pz-prazo"]:checked').value;
      const prazo    = prazoPre === 'outro' ? (parseInt($('pz-prazo-custom').value)||0) : parseInt(prazoPre);
      if (prazo <= 0) { mostrarVazio(); renderTempestividade(); return; }

      const tribunalId     = $('pz-tribunal').value;
      const prorrogacaoAtiva = $('pz-prorrogacao').checked;

      let tribunal  = null;
      let modalidade = 'dias_uteis';
      if (tribunalId === '_corridos') {
        modalidade = 'dias_corridos';
      } else if (tribunalId !== '_uteis') {
        tribunal   = calData.tribunais.find(t => t.id === tribunalId) || null;
        if (tribunal) modalidade = tribunal.dias_uteis ? 'dias_uteis' : 'dias_corridos';
      }

      // Termo inicial
      let termoInicial, dateDispon = null, datePub = null;
      if (tipoSelecionado === 'disponibilizacao') {
        dateDispon   = dateRef;
        datePub      = nextUtilDay(dateRef, tribunal);
        termoInicial = nextUtilDay(datePub, tribunal);
      } else {
        datePub      = dateRef;
        termoInicial = nextUtilDay(dateRef, tribunal);
      }

      // Contagem
      let termoFinal;
      if (modalidade === 'dias_corridos') {
        termoFinal = addDays(termoInicial, prazo - 1);
      } else {
        // pseudocódigo da spec: conta dia a dia, pula não-úteis
        let count = 0, current = new Date(termoInicial), s = 0;
        while (count < prazo && s++ < 10000) {
          if (!isWknd(current) && !isRecesso(current, tribunal) && !getFeriado(current, tribunal ? tribunal.id : null)) count++;
          if (count < prazo) current = addDays(current, 1);
        }
        termoFinal = current;
      }

      // Prorrogação
      let prorrogadoDe    = null;
      let motivoProrrogacao = null;
      const naoEUtil = !isUtilDay(termoFinal, tribunal);
      if (naoEUtil && prorrogacaoAtiva) {
        prorrogadoDe = new Date(termoFinal);
        if (isWknd(termoFinal))             motivoProrrogacao = 'fim de semana';
        else if (isRecesso(termoFinal, tribunal)) motivoProrrogacao = 'recesso';
        else {
          const fer = getFeriado(termoFinal, tribunal ? tribunal.id : null);
          motivoProrrogacao = fer ? fer.desc : 'dia não útil';
        }
        let d = addDays(termoFinal, 1), s2 = 0;
        while (!isUtilDay(d, tribunal) && s2++ < 500) d = addDays(d, 1);
        termoFinal = d;
      }

      ultimoCalculo = { termoInicial, termoFinal, dateDispon, datePub };

      renderResultado(termoInicial, termoFinal, prorrogadoDe, motivoProrrogacao,
                      prorrogacaoAtiva, naoEUtil, tribunal, modalidade, dateDispon, datePub);
      renderTempestividade();
    }

    // ── renderização do resultado ────────────────────────────────────────────
    function renderResultado(termoInicial, termoFinal, prorrogadoDe, motivoProrrogacao,
                              prorrogacaoAtiva, originalNaoUtil, tribunal, modalidade, dateDispon, datePub) {
      mostrarVazio(false);

      let resumoHtml = '';
      if (dateDispon)
        resumoHtml += `<dt>Disponibilização</dt><dd class="pz-resumo-muted">${fmtDate(dateDispon)} (${diaSem(dateDispon)})</dd>`;
      if (datePub)
        resumoHtml += `<dt>Publicação</dt><dd class="pz-resumo-muted">${fmtDate(datePub)} (${diaSem(datePub)})</dd>`;
      resumoHtml +=
        `<dt>Termo inicial</dt><dd>${fmtDate(termoInicial)} (${diaSem(termoInicial)})</dd>` +
        `<dt>Termo final</dt><dd>${fmtDate(termoFinal)} (${diaSem(termoFinal)})</dd>`;
      $('pz-resumo').innerHTML = resumoHtml;

      $('pz-note-prorr').innerHTML  = '';
      $('pz-note-aviso').innerHTML  = '';
      if (prorrogadoDe) {
        $('pz-note-prorr').innerHTML =
          `<div class="pz-note-prorr">Prorrogado de ${fmtDate(prorrogadoDe)} (${motivoProrrogacao})</div>`;
      } else if (originalNaoUtil && !prorrogacaoAtiva) {
        $('pz-note-aviso').innerHTML =
          `<div class="pz-note-aviso">⚠ O termo final calculado não é dia útil. Prorrogação automática desativada.</div>`;
      }

      renderCalendario(termoInicial, termoFinal, tribunal, modalidade, prorrogadoDe, dateDispon, datePub);
    }

    // ── calendário ───────────────────────────────────────────────────────────
    function dayInfo(date, t0, t1, tribunal, modalidade, prorrogadoDe, dateDispon, datePub) {
      if (sameDay(date, t0)) return { cls:'pz-d-inicio', tip:'Termo inicial' };
      if (sameDay(date, t1)) {
        const tip = prorrogadoDe
          ? `Termo final — prorrogado de ${fmtDate(prorrogadoDe)}`
          : 'Termo final';
        return { cls:'pz-d-fim', tip };
      }
      if (dateDispon && sameDay(date, dateDispon)) return { cls:'pz-d-dispon', tip:'Disponibilização' };
      if (datePub    && sameDay(date, datePub))    return { cls:'pz-d-pub',    tip:'Publicação' };
      if (date < t0 || date > t1) return { cls:'pz-d-neutro', tip:null };
      if (modalidade === 'dias_corridos') return { cls:'pz-d-contado', tip:null };
      if (isWknd(date))                  return { cls:'pz-d-fds',     tip:null };
      if (isRecesso(date, tribunal))     return { cls:'pz-d-recesso', tip:'Recesso — prazo suspenso' };
      const fer = getFeriado(date, tribunal ? tribunal.id : null);
      if (fer) {
        if (fer.tipo === 'nacional') return { cls:'pz-d-fer-nac',  tip:fer.desc };
        if (fer.tipo === 'tribunal') return { cls:'pz-d-fer-trib', tip:fer.desc + (tribunal ? ` — ${tribunal.id}` : '') };
      }
      return { cls:'pz-d-contado', tip:null };
    }

    function renderCalendario(t0, t1, tribunal, modalidade, prorrogadoDe, dateDispon, datePub) {
      const el = $('pz-calendario');
      el.innerHTML = '';
      const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
      const DOW   = ['D','S','T','Q','Q','S','S'];

      const calStart = dateDispon || datePub || t0;
      let cursor   = new Date(calStart.getFullYear(), calStart.getMonth(), 1);
      const endMo  = new Date(t1.getFullYear(), t1.getMonth(), 1);
      let rendered = 0;

      while (cursor <= endMo && rendered++ < 24) {
        const yr = cursor.getFullYear(), mo = cursor.getMonth();
        const wrap = document.createElement('div');
        wrap.className = 'pz-cal-month';

        const title = document.createElement('div');
        title.className = 'pz-cal-month-title';
        title.textContent = MESES[mo] + ' ' + yr;
        wrap.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'pz-cal-grid';

        DOW.forEach(d => {
          const h = document.createElement('div');
          h.className = 'pz-cal-doh';
          h.textContent = d;
          grid.appendChild(h);
        });

        // offset para o primeiro dia do mês
        const offset = new Date(yr, mo, 1).getDay();
        for (let i = 0; i < offset; i++) {
          const e = document.createElement('div');
          e.className = 'pz-cal-day pz-d-vazio';
          grid.appendChild(e);
        }

        const diasNoMes = new Date(yr, mo+1, 0).getDate();
        for (let d = 1; d <= diasNoMes; d++) {
          const date = new Date(yr, mo, d);
          const info = dayInfo(date, t0, t1, tribunal, modalidade, prorrogadoDe, dateDispon, datePub);
          const cell = document.createElement('div');
          cell.className = 'pz-cal-day ' + info.cls;
          cell.textContent = d;
          if (info.tip) cell.setAttribute('data-tip', info.tip);
          grid.appendChild(cell);
        }

        wrap.appendChild(grid);
        el.appendChild(wrap);
        cursor = new Date(yr, mo+1, 1);
      }

      renderLegenda(t0, t1, tribunal, modalidade, dateDispon, datePub);
    }

    function renderLegenda(t0, t1, tribunal, modalidade, dateDispon, datePub) {
      const leg = $('pz-legenda');
      leg.innerHTML = '';
      const items = [];
      if (dateDispon) items.push({ bg:'#dbeafe', fg:'#1e40af', label:'Disponibilização' });
      if (datePub)    items.push({ bg:'#e0e7ff', fg:'#3730a3', label:'Publicação' });
      items.push(
        { bg:'#1976d2', label:'Termo inicial' },
        { bg:'#0d47a1', label:'Termo final' },
        { bg:'#e8f5e9', fg:'#2e7d32', label:'Dia contado' }
      );
      if (modalidade === 'dias_uteis') {
        items.push({ bg:'#f0f0f0', fg:'#bbb', label:'Fim de semana' });
        items.push({ bg:'#ffebee', fg:'#c62828', label:'Feriado nacional' });
        if (temCategoriaNoPeriodo(t0, t1, tribunal, 'recesso'))
          items.push({ bg:'#fff8e1', fg:'#f57f17', label:'Recesso' });
        if (temCategoriaNoPeriodo(t0, t1, tribunal, 'feriado_trib'))
          items.push({ bg:'#fff3e0', fg:'#e65100', label:'Feriado do tribunal' });
      }
      items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'pz-leg-item';
        const sw = document.createElement('div');
        sw.className = 'pz-leg-swatch';
        sw.style.background = item.bg;
        if (item.fg) sw.style.color = item.fg;
        div.appendChild(sw);
        div.appendChild(document.createTextNode(item.label));
        leg.appendChild(div);
      });
    }

    function temCategoriaNoPeriodo(t0, t1, tribunal, cat) {
      let d = new Date(t0), s = 0;
      while (d <= t1 && s++ < 3000) {
        if (cat === 'recesso' && isRecesso(d, tribunal)) return true;
        if (cat === 'feriado_trib') {
          const f = getFeriado(d, tribunal ? tribunal.id : null);
          if (f && f.tipo === 'tribunal') return true;
        }
        d = addDays(d, 1);
      }
      return false;
    }

    // ── texto de tempestividade ──────────────────────────────────────────────
    // Data por extenso no padrão forense: o dia 1 vira "1º".
    function fmtDataForense(d) {
      const dia = d.getDate() === 1 ? '1º' : String(d.getDate()).padStart(2,'0');
      return `${dia}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} (${diaSem(d)})`;
    }

    // "ID nº 123" ou "ID’s nº 123; 456; e 789"
    function fmtIds(raw) {
      const ids = (raw || '').split(/[;,\n]+/).map(s => s.trim()).filter(Boolean);
      if (!ids.length) return null;
      if (ids.length === 1) return 'ID nº ' + ids[0];
      return 'ID’s nº ' + ids.slice(0, -1).join('; ') + '; e ' + ids[ids.length-1];
    }

    // Insere o artigo do prazo em ordem numérica entre os arts. 219 e 224, que são
    // fixos. `pre`/`pos` espelham na interface exatamente o que sairá no texto.
    function citacaoArts() {
      const art = ($('pz-temp-arts').value || '').trim();
      if (!art) return { full:'arts. 219 e 224', pre:'arts. 219 e 224', pos:'do CPC' };
      const m = art.replace(/\./g, '').match(/^\d+/);
      const n = m ? parseInt(m[0], 10) : 0;
      if (n && n < 219)  return { full:`arts. ${art}, 219 e 224`, pre:'arts.',      pos:', 219 e 224 do CPC' };
      if (n > 219 && n < 224) return { full:`arts. 219, ${art} e 224`, pre:'arts. 219,', pos:'e 224 do CPC' };
      return { full:`arts. 219, 224 e ${art}`, pre:'arts. 219, 224 e', pos:'do CPC' };
    }

    // Peça selecionada; "outro" monta uma definição a partir dos campos livres.
    function pecaAtual() {
      const v = $('pz-temp-peca').value;
      if (v !== 'outro') return PECAS.find(p => p.id === v) || PECAS[0];
      return {
        id:'outro',
        nome: ($('pz-temp-outro-nome').value || '').trim() || 'Petição',
        det:  $('pz-temp-outro-det').value,
        acao: $('pz-temp-outro-acao').value,
        qual: null,
        recursal: false
      };
    }

    function montarTexto() {
      const peca = pecaAtual();
      const nat  = NATUREZAS.find(n => n.id === $('pz-temp-natureza').value) || NATUREZAS[0];
      const naoPub = $('pz-temp-naopub').checked;

      const ids     = fmtIds($('pz-temp-ids').value);
      const parIds  = ids ? ` (${ids})` : '';
      const artNat  = nat.gen === 'a' ? 'a' : 'o';           // a Sentença / o Acórdão
      const conc    = DETS[peca.det] || DETS['a presente'];
      const detPeca = `${peca.det} ${peca.nome}`;
      // Petição/manifestação não impugna nada: fica só "o Despacho (ID nº …)".
      const qualTxt   = peca.qual ? ` ora ${peca.qual}${artNat}` : '';
      const qualNaoPub= peca.qual ? ` ${peca.qual}${artNat}` : '';
      const prazoNome = peca.recursal ? 'prazo recursal' : 'prazo';

      if (naoPub) {
        const cap = detPeca.charAt(0).toUpperCase() + detPeca.slice(1);
        return `${cap} ${conc.verbo} ${conc.adj}. ` +
          `${artNat.toUpperCase()} ${nat.nome}${qualNaoPub}${parIds} ainda não foi publicad${artNat}, ` +
          `razão pela qual sequer se iniciou a contagem do ${prazoNome}. ` +
          `Nos termos do art. 218, § 4º, do Código de Processo Civil, segundo o qual “será considerado ` +
          `tempestivo o ato praticado antes do termo inicial do prazo”, é plenamente admissível a prática ` +
          `do ato processual antes do início da fluência do ${prazoNome}.`;
      }

      if (!ultimoCalculo) return null;

      const { termoInicial, termoFinal, dateDispon, datePub } = ultimoCalculo;
      const veiculo = ($('pz-temp-veiculo').value || '').trim();
      const noVeic  = veiculo ? ` no ${veiculo}` : '';
      const arts    = citacaoArts().full;

      const divulgacao = dateDispon
        ? `sido disponibilizad${artNat}${noVeic} em ${fmtDataForense(dateDispon)}, ` +
          `com publicação em ${fmtDataForense(datePub)}`
        : `sido publicad${artNat}${noVeic} em ${fmtDataForense(datePub)}`;

      return `Tendo ${artNat} ${nat.nome}${qualTxt}${parIds} ${divulgacao}, ` +
        `o prazo para ${peca.acao} d${detPeca} teve início em ${fmtDataForense(termoInicial)} ` +
        `e encerra-se em ${fmtDataForense(termoFinal)}, nos termos dos ${arts} do Código de Processo Civil. ` +
        `Revela-se, portanto, tempestiva a ${peca.acao} d${detPeca} nesta data.`;
    }

    function renderTempestividade() {
      const naoPub = $('pz-temp-naopub').checked;
      $('pz-temp-veiculo-field').style.display = naoPub ? 'none' : '';
      $('pz-temp-arts-field').style.display    = naoPub ? 'none' : '';
      $('pz-temp-outro-field').style.display   = $('pz-temp-peca').value === 'outro' ? '' : 'none';

      const cit = citacaoArts();
      $('pz-arts-pre').textContent = cit.pre;
      $('pz-arts-pos').textContent = cit.pos;
      // fecha o gap do flex quando o sufixo começa por vírgula
      $('pz-arts-pos').classList.toggle('pz-arts-cola', cit.pos.charAt(0) === ',');

      const out = $('pz-temp-out');
      const txt = montarTexto();
      if (txt) {
        out.classList.remove('pz-temp-vazio');
        out.textContent = txt;
        $('pz-temp-copy').style.display = '';
      } else {
        out.classList.add('pz-temp-vazio');
        out.textContent = 'Calcule um prazo válido para gerar o texto.';
        $('pz-temp-copy').style.display = 'none';
      }
    }

    function copiarTexto() {
      const txt = $('pz-temp-out').textContent;
      const btn = $('pz-temp-copy');
      const ok = () => {
        btn.textContent = 'Copiado ✓';
        btn.classList.add('pz-copied');
        setTimeout(() => { btn.textContent = 'Copiar texto'; btn.classList.remove('pz-copied'); }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(ok).catch(() => fallbackCopy(txt, ok));
      } else {
        fallbackCopy(txt, ok);
      }
    }

    function fallbackCopy(txt, ok) {
      const ta = document.createElement('textarea');
      ta.value = txt;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); ok(); } catch (e) { /* silencioso */ }
      document.body.removeChild(ta);
    }

    // ── auxiliares de UI ─────────────────────────────────────────────────────
    function mostrarVazio(vazio = true) {
      $('pz-result-area').style.display = vazio ? 'none' : '';
      $('pz-empty').style.display       = vazio ? ''     : 'none';
    }

    function syncRadioStyles() {
      document.querySelectorAll('input[name="pz-prazo"]').forEach(r => {
        r.closest('.pz-radio-label').classList.toggle('pz-radio-checked', r.checked);
      });
    }

    // ── setup (chamado após carregar dados) ──────────────────────────────────
    function setup(data) {
      calData = data;

      // popular dropdown de tribunais
      const sel = $('pz-tribunal');
      data.tribunais.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = t.nome + ' (' + t.id + ')';
        sel.appendChild(opt);
      });

      // toggle disponibilização / publicação
      document.querySelectorAll('[data-tipo]').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('[data-tipo]').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          tipoSelecionado = btn.dataset.tipo;
          calcular();
        });
      });

      // radios de prazo
      document.querySelectorAll('input[name="pz-prazo"]').forEach(r => {
        r.addEventListener('change', () => {
          const custom = $('pz-prazo-custom');
          custom.style.display = r.value === 'outro' ? '' : 'none';
          if (r.value === 'outro') custom.focus();
          syncRadioStyles();
          calcular();
        });
      });

      $('pz-prazo-custom').addEventListener('input', calcular);
      $('pz-data').addEventListener('change', calcular);
      sel.addEventListener('change', calcular);
      $('pz-prorrogacao').addEventListener('change', calcular);

      // ── tempestividade ──
      const selPeca = $('pz-temp-peca');
      PECAS.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.nome;
        selPeca.appendChild(opt);
      });
      const optOutro = document.createElement('option');
      optOutro.value = 'outro';
      optOutro.textContent = 'Outra peça…';
      selPeca.appendChild(optOutro);
      const selNat = $('pz-temp-natureza');
      NATUREZAS.forEach(n => {
        const opt = document.createElement('option');
        opt.value = n.id;
        opt.textContent = n.nome;
        selNat.appendChild(opt);
      });

      $('pz-temp-arts').value = PECAS[0].art;
      selPeca.addEventListener('change', () => {
        const p = PECAS.find(x => x.id === selPeca.value);
        if (p) $('pz-temp-arts').value = p.art;   // artigo segue a peça, mas continua editável
        renderTempestividade();
      });
      ['pz-temp-natureza','pz-temp-veiculo','pz-temp-ids','pz-temp-arts','pz-temp-naopub',
       'pz-temp-outro-nome','pz-temp-outro-det','pz-temp-outro-acao']
        .forEach(id => $(id).addEventListener('input', renderTempestividade));
      $('pz-temp-naopub').addEventListener('change', renderTempestividade);
      $('pz-temp-copy').addEventListener('click', copiarTexto);

      // data padrão = hoje
      $('pz-data').value = isoStr(new Date());

      $('pz-main').style.display    = '';
      $('pz-loading').style.display = 'none';
      calcular();
    }

    // ── carga do JSON ────────────────────────────────────────────────────────
    fetch('./tools/calendario.json')
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setup)
      .catch(() => setup(CAL_FALLBACK));
  }
};
