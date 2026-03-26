/* ═══════════════════════════════════════════════════════════════
   Fercayo · Levantamento · Formulários de Medição por Tipo
   ═══════════════════════════════════════════════════════════════ */

const _TIPO_FORM_LABEL = {
  porta:      '🚪 Porta',
  apainelado: '🪟 Apainelado',
  lambrim:    '▬ Lambrim',
  roupeiro:   '🗄 Roupeiro',
  cozinha:    '🍳 Cozinha / Móvel',
  outro:      '📦 Outro',
};

function detectarTipoForm(artigo) {
  const txt = [artigo.descricao, artigo.tipo, artigo.nome]
    .filter(Boolean).join(' ').toLowerCase();
  if (/apainelado|painel.*madei|revestim.*madei/.test(txt)) return 'apainelado';
  if (/lambrim|rodap/.test(txt))                            return 'lambrim';
  if (/roup[ae]iro/.test(txt))                              return 'roupeiro';
  if (/cozinha|m[oó]vel.*complex|bancada/.test(txt))        return 'cozinha';
  if (/port[ao]|batente|correr|sanfona|folha.*abri|aro.*porta/.test(txt)) return 'porta';
  return 'outro';
}

function _medInp(id, placeholder, val, step) {
  return `<input class="med-inp" id="${id}" type="number"
    placeholder="${placeholder}" value="${val !== undefined && val !== '' ? val : ''}"
    ${step ? 'step="' + step + '"' : ''}>`;
}

function _medToggle(campo, valor, atual) {
  const label = valor.charAt(0).toUpperCase() + valor.slice(1);
  return `<button class="med-toggle ${atual === valor ? 'active' : ''}"
    onclick="toggleMedicao('${campo}','${valor}')">${label}</button>`;
}

function _medToggleCheck(campo, label, val) {
  return `<button class="med-toggle ${val ? 'active' : ''}"
    onclick="toggleMedicaoCheck('${campo}')">${label}</button>`;
}

function renderizarFormMedicao(artigo) {
  const tipo = detectarTipoForm(artigo);
  const med  = artigo.medicao          || {};
  const nota = artigo.nota_levantamento || '';

  let camposHTML = '';

  /* ── PORTA ──────────────────────────────────────────── */
  if (tipo === 'porta') {
    camposHTML = `
      <div class="med-grid-3">
        <div class="med-field">
          <div class="med-label">Altura mm</div>
          ${_medInp('med-altura', '2100', med.altura)}
        </div>
        <div class="med-field">
          <div class="med-label">Largura mm</div>
          ${_medInp('med-largura', '900', med.largura)}
        </div>
        <div class="med-field">
          <div class="med-label">Prof. mm</div>
          ${_medInp('med-profundidade', '120', med.profundidade)}
        </div>
      </div>
      <div class="med-field">
        <div class="med-label">Sentido</div>
        <div class="med-toggle-group">
          ${_medToggle('sentido', 'esq', med.sentido)}
          ${_medToggle('sentido', 'dir', med.sentido)}
        </div>
      </div>
      <div class="med-field">
        <div class="med-label">Tipo</div>
        <div class="med-toggle-group">
          ${_medToggle('tipo_porta', 'batente', med.tipo_porta)}
          ${_medToggle('tipo_porta', 'correr',  med.tipo_porta)}
          ${_medToggle('tipo_porta', 'sanfona', med.tipo_porta)}
        </div>
      </div>`;
  }

  /* ── APAINELADO ─────────────────────────────────────── */
  if (tipo === 'apainelado') {
    camposHTML = `
      <div class="med-grid">
        <div class="med-field">
          <div class="med-label">Comprimento mm</div>
          ${_medInp('med-comprimento', '3200', med.comprimento)}
        </div>
        <div class="med-field">
          <div class="med-label">Altura mm</div>
          ${_medInp('med-altura', '2400', med.altura)}
        </div>
      </div>
      <div class="med-field">
        <div class="med-label">Extremidades</div>
        <div class="med-toggle-group">
          ${_medToggleCheck('extrem_esq',   'Esq',  med.extrem_esq)}
          ${_medToggleCheck('extrem_dir',   'Dir',  med.extrem_dir)}
          ${_medToggleCheck('extrem_cima',  'Cima', med.extrem_cima)}
          ${_medToggleCheck('extrem_baixo', 'Baixo',med.extrem_baixo)}
        </div>
      </div>`;
  }

  /* ── LAMBRIM ────────────────────────────────────────── */
  if (tipo === 'lambrim') {
    camposHTML = `
      <div class="med-grid">
        <div class="med-field">
          <div class="med-label">Metros lineares</div>
          ${_medInp('med-metros', '3.5', med.metros, '0.1')}
        </div>
        <div class="med-field">
          <div class="med-label">Altura mm</div>
          ${_medInp('med-altura', '900', med.altura)}
        </div>
      </div>`;
  }

  /* roupeiro / cozinha / outro → só nota + foto */

  const notaObrig  = ['apainelado', 'lambrim', 'roupeiro', 'cozinha'].includes(tipo);
  const notaPlaceholder = (tipo === 'roupeiro' || tipo === 'cozinha')
    ? 'Descreve as cotas e referências a partir das fotos…'
    : 'Observações do levantamento…';

  return `
    <div class="ec">
      <div class="ec-hdr">${_TIPO_FORM_LABEL[tipo] || tipo} · Medição</div>
      <div class="ec-body" style="display:flex;flex-direction:column;gap:10px">
        ${camposHTML}
        <div class="med-field">
          <div class="med-label">Fotos${notaObrig ? ' *' : ''}
            <span style="font-size:9px;opacity:.5"> — em breve</span>
          </div>
          <div class="med-foto-placeholder">📷 Upload de fotos disponível em breve</div>
        </div>
        <div class="med-field">
          <div class="med-label">Nota de Levantamento${notaObrig ? ' *' : ''}</div>
          <textarea class="nota-ta" id="med-nota-lev"
            placeholder="${notaPlaceholder}">${nota}</textarea>
        </div>
        <button class="btn btn-gold btn-sm" style="width:100%;justify-content:center"
          onclick="guardarMedicao()">💾 Guardar Medição</button>
      </div>
    </div>`;
}

/* ── Toggle handlers ───────────────────────────────────── */
function toggleMedicao(campo, valor) {
  if (!artigoActual) return;
  if (!artigoActual.medicao) artigoActual.medicao = {};
  artigoActual.medicao[campo] = (artigoActual.medicao[campo] === valor) ? '' : valor;
  document.querySelectorAll('.med-toggle').forEach(btn => {
    const oc = btn.getAttribute('onclick') || '';
    if (oc.includes(`'${campo}'`)) {
      btn.classList.toggle('active',
        oc.includes(`'${valor}'`) && artigoActual.medicao[campo] === valor);
    }
  });
}

function toggleMedicaoCheck(campo) {
  if (!artigoActual) return;
  if (!artigoActual.medicao) artigoActual.medicao = {};
  artigoActual.medicao[campo] = !artigoActual.medicao[campo];
  document.querySelectorAll('.med-toggle').forEach(btn => {
    const oc = btn.getAttribute('onclick') || '';
    if (oc.includes(`'${campo}'`)) {
      btn.classList.toggle('active', !!artigoActual.medicao[campo]);
    }
  });
}

/* ── Guardar ────────────────────────────────────────────── */
async function guardarMedicao() {
  if (!artigoActual) return;
  if (!artigoActual.medicao) artigoActual.medicao = {};

  const tipo = detectarTipoForm(artigoActual);
  const camposNumericos = {
    porta:      ['altura', 'largura', 'profundidade'],
    apainelado: ['comprimento', 'altura'],
    lambrim:    ['metros', 'altura'],
  };

  (camposNumericos[tipo] || []).forEach(c => {
    const el = document.getElementById('med-' + c);
    if (el) artigoActual.medicao[c] = el.value !== '' ? parseFloat(el.value) : '';
  });

  const notaEl = document.getElementById('med-nota-lev');
  if (notaEl) artigoActual.nota_levantamento = notaEl.value;

  await dbEscrever(db, 'itens', artigoActual);

  /* atualizar array artigos em memória */
  const idx = artigos.findIndex(a => a.id === artigoActual.id);
  if (idx >= 0) {
    artigos[idx] = {
      ...artigos[idx],
      medicao:            artigoActual.medicao,
      nota_levantamento:  artigoActual.nota_levantamento,
    };
  }

  mostrarToast('✓ Medição guardada');
}
