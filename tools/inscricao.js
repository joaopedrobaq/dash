window._tools = window._tools || {};
window._tools['inscricao'] = {
  name: 'Calculadora de Dígito - IPTU SSA',
  icon: '🏠',
  desc: 'Calcula o dígito verificador da inscrição imobiliária',

  css: `
.ins-tool { padding: 20px 20px 32px; }
.ins-field { margin-bottom: 16px; }
.ins-field label { display: block; font-size: .78rem; color: #555; font-weight: 500; margin-bottom: 6px; }
.ins-field input {
  width: 100%; box-sizing: border-box;
  background: #fff; border: 1px solid #c8d0d8; border-radius: 6px;
  font-family: inherit; font-size: 1.4rem; font-weight: 700; letter-spacing: .12em;
  color: #2c3e50; padding: 10px 14px; outline: none;
  transition: border-color .15s, box-shadow .15s;
}
.ins-field input:focus { border-color: #2c3e50; box-shadow: 0 0 0 3px rgba(44,62,80,.1); }
.ins-field input::placeholder { color: #bbb; font-weight: 400; letter-spacing: 0; }
.ins-result-label { font-size: .78rem; color: #555; font-weight: 500; margin-bottom: 6px; }
.ins-result {
  padding: 14px 16px; background: #f8f9fa; border: 1px solid #ddd; border-radius: 8px;
  min-height: 50px; white-space: pre-wrap; color: #222; font-family: inherit;
  font-size: 1.5rem; font-weight: 700; letter-spacing: .1em;
  cursor: pointer; transition: background .2s; user-select: all;
}
.ins-result.ins-vazio { color: #bbb; font-weight: 400; font-size: .9rem; letter-spacing: 0; }
.ins-result.ins-copiado { background: #d4edda; border-color: #c3e6cb; color: #155724; }
.ins-result.ins-erro { background: #fff3cd; border-color: #ffeaa7; color: #856404; font-size: .9rem; letter-spacing: 0; font-weight: 400; }
.ins-hint { font-size: .72rem; color: #7a8a99; margin-top: 8px; }
`,

  html: `
<div class="ins-tool">
  <div class="ins-field">
    <label for="ins-input">Inscrição imobiliária (6 dígitos, sem DV)</label>
    <input type="text" id="ins-input" placeholder="984363" maxlength="6" inputmode="numeric" autocomplete="off" />
  </div>
  <div class="ins-result-label">Inscrição completa (clique para copiar)</div>
  <div class="ins-result ins-vazio" id="ins-result">—</div>
  <div class="ins-hint">Formato: NNN.NNN-D</div>
</div>
`,

  init: function () {
    const input = document.getElementById('ins-input');
    const box   = document.getElementById('ins-result');
    let _ultima = '';

    function calcDV(s) {
      const pesos = [7, 6, 5, 4, 3, 2];
      const soma  = s.split('').reduce((acc, d, i) => acc + parseInt(d) * pesos[i], 0);
      const dv    = 11 - (soma % 11);
      return dv >= 10 ? 0 : dv;
    }

    function formatar(s) {
      const dv = calcDV(s);
      return s.slice(0, 3) + '.' + s.slice(3, 6) + '-' + dv;
    }

    function render() {
      const raw = input.value.replace(/\D/g, '').slice(0, 6);
      if (raw !== input.value) input.value = raw;

      if (raw.length === 0) {
        box.textContent = '—';
        box.className = 'ins-result ins-vazio';
        _ultima = '';
        return;
      }
      if (raw.length < 6) {
        box.textContent = 'Digite os 6 dígitos…';
        box.className = 'ins-result ins-erro';
        _ultima = '';
        return;
      }
      _ultima = formatar(raw);
      box.textContent = _ultima;
      box.className = 'ins-result';
    }

    input.addEventListener('input', render);

    box.addEventListener('click', () => {
      if (!_ultima) return;
      navigator.clipboard.writeText(_ultima).then(() => {
        const prev = box.textContent;
        box.className = 'ins-result ins-copiado';
        box.textContent = 'Copiado!';
        setTimeout(() => {
          box.className = 'ins-result';
          box.textContent = prev;
        }, 600);
      });
    });

    setTimeout(() => input.focus(), 50);
  }
};
