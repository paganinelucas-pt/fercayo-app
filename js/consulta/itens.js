/* ═══════════════════════════════════════════════════════════════
   Fercayo · Consulta · Lista e Detalhe de Itens (só leitura)
   ═══════════════════════════════════════════════════════════════ */

const _ESTADO_LABEL = {
  pendente:  '○ Pendente',
  conferido: '✔ Conferido',
  alteracao: '⚠ Alteração',
  anulado:   '✕ Anulado',
  extra:     '＋ Extra',
};
const _ESTADO_COR = {
  pendente:  'var(--estado-pendente)',
  conferido: 'var(--estado-conferido)',
  alteracao: 'var(--estado-alteracao)',
  anulado:   'var(--estado-anulado)',
  extra:     'var(--estado-extra)',
};

/* ── Filtros ────────────────────────────────────────────── */
function resetFiltroChips() {
  filtroEstado = null;
  document.querySelectorAll('.filtro-chip').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.estado === '');
  });
}

function setFiltroEstado(estado) {
  filtroEstado = estado || null;
  document.querySelectorAll('.filtro-chip').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.estado === (estado || ''));
  });
  renderizarItens();
}

function filtrarItens(texto) {
  filtroTexto = texto.toLowerCase();
  renderizarItens();
}

/* ── Renderizar lista agrupada por secção ───────────────── */
function renderizarItens() {
  const el = document.getElementById('lista-itens');
  if (!obraAtual) {
    el.innerHTML = `<div class="empty-state">
      <div style="font-size:24px;opacity:.3">📋</div>Selecciona uma obra</div>`;
    return;
  }

  let lista = itens;
  if (filtroEstado) lista = lista.filter(i => i.estado === filtroEstado);
  if (filtroTexto)  lista = lista.filter(i =>
    (i.artigo || '').toLowerCase().includes(filtroTexto) ||
    (i.descricao || i.nome || '').toLowerCase().includes(filtroTexto) ||
    (i.seccao || '').toLowerCase().includes(filtroTexto)
  );

  if (!lista.length) {
    el.innerHTML = `<div class="empty-state">
      <div style="font-size:24px;opacity:.3">📦</div>Sem itens</div>`;
    return;
  }

  /* Ordenar por código de artigo (ordem natural) */
  const ordenados = [...lista].sort((a, b) =>
    (a.artigo || '').localeCompare(b.artigo || '', 'pt', { numeric: true }));

  /* Agrupar por secção */
  const grupos = new Map();
  for (const item of ordenados) {
    const sec = item.seccao || '';
    if (!grupos.has(sec)) grupos.set(sec, []);
    grupos.get(sec).push(item);
  }

  let html = '';
  for (const [sec, items] of grupos) {
    if (sec) {
      html += `<div class="cons-seccao-hdr">${sec}</div>`;
    }
    html += items.map(item => {
      const isSelected = itemActual?.id === item.id;
      const estadoCor  = _ESTADO_COR[item.estado] || 'var(--text3)';
      const temMedicao = item.medicao &&
        Object.keys(item.medicao).some(k =>
          item.medicao[k] !== '' && item.medicao[k] != null);

      return `
        <div class="cons-item-row ${isSelected ? 'selected' : ''} s-${item.estado || 'pendente'}"
             onclick="selecionarItem('${item.id}')">
          <div style="min-width:0;flex:1">
            <div class="item-art">${item.artigo || '—'}</div>
            <div class="item-nm">${(item.descricao || item.nome || '').substring(0, 60)}</div>
            ${item.quant || item.unid ? `<div class="item-qt">${[item.quant, item.unid].filter(Boolean).join(' ')}</div>` : ''}
          </div>
          <div style="display:flex;align-items:center;gap:5px;flex-shrink:0;margin-left:8px">
            ${temMedicao ? '<span style="font-size:9px;color:var(--gold2)" title="Medição registada">📐</span>' : ''}
            <span style="font-size:10px;color:${estadoCor};white-space:nowrap">${_ESTADO_LABEL[item.estado] || '—'}</span>
          </div>
        </div>`;
    }).join('');
  }

  el.innerHTML = html;
}

function selecionarItem(id) {
  itemActual = itens.find(i => i.id === id) || null;
  renderizarItens();
  renderizarDetalheConsulta();
}

/* ── Formatação de medição ──────────────────────────────── */
function _formatarMedicao(item) {
  const med    = item.medicao || {};
  const campos = [];

  const txt = [item.descricao, item.tipo, item.nome].filter(Boolean).join(' ').toLowerCase();
  let tipo = 'outro';
  if      (/apainelado|painel.*madei|revestim.*madei/.test(txt)) tipo = 'apainelado';
  else if (/lambrim|rodap/.test(txt))                            tipo = 'lambrim';
  else if (/roup[ae]iro/.test(txt))                              tipo = 'roupeiro';
  else if (/cozinha|m[oó]vel.*complex|bancada/.test(txt))        tipo = 'cozinha';
  else if (/port[ao]|batente|correr|sanfona|folha.*abri|aro.*porta/.test(txt)) tipo = 'porta';

  if (tipo === 'porta') {
    if (med.altura       != null && med.altura       !== '') campos.push(['Altura',      med.altura       + ' mm']);
    if (med.largura      != null && med.largura      !== '') campos.push(['Largura',     med.largura      + ' mm']);
    if (med.profundidade != null && med.profundidade !== '') campos.push(['Profundidade',med.profundidade + ' mm']);
    if (med.sentido)   campos.push(['Sentido',    med.sentido.charAt(0).toUpperCase() + med.sentido.slice(1)]);
    if (med.tipo_porta) campos.push(['Tipo',      med.tipo_porta.charAt(0).toUpperCase() + med.tipo_porta.slice(1)]);
  } else if (tipo === 'apainelado') {
    if (med.comprimento != null && med.comprimento !== '') campos.push(['Comprimento', med.comprimento + ' mm']);
    if (med.altura      != null && med.altura      !== '') campos.push(['Altura',      med.altura      + ' mm']);
    const extr = ['esq', 'dir', 'cima', 'baixo'].filter(e => med['extrem_' + e]).join(', ');
    if (extr) campos.push(['Extremidades', extr]);
  } else if (tipo === 'lambrim') {
    if (med.metros != null && med.metros !== '') campos.push(['Metros lineares', med.metros + ' m']);
    if (med.altura != null && med.altura !== '') campos.push(['Altura', med.altura + ' mm']);
  }

  return { tipo, campos };
}

/* ── Renderizar detalhe (só leitura) ────────────────────── */
function renderizarDetalheConsulta() {
  const el = document.getElementById('detalhe-cons');

  if (!itemActual) {
    el.innerHTML = `
      <div class="empty-state" style="height:160px">
        <div style="font-size:28px;opacity:.3">📋</div>
        Selecciona um item para ver o detalhe
      </div>`;
    return;
  }

  const i          = itemActual;
  const estadoCor  = _ESTADO_COR[i.estado] || 'var(--text3)';
  const { tipo, campos } = _formatarMedicao(i);
  const tipoLabel  = {
    porta: '🚪 Porta', apainelado: '🪟 Apainelado',
    lambrim: '▬ Lambrim', roupeiro: '🗄 Roupeiro',
    cozinha: '🍳 Cozinha / Móvel', outro: '📦 Outro',
  };

  const notaReuniao      = i.nota_reuniao || i.nota || '';
  const notaLevantamento = i.nota_levantamento || '';

  const notaReuniaoHTML = notaReuniao ? `
    <div class="cons-sec">
      <div class="cons-sec-hdr">📋 Nota de Reunião</div>
      <div class="cons-sec-body">
        <div class="cons-nota-text">${notaReuniao.replace(/\n/g, '<br>')}</div>
      </div>
    </div>` : '';

  const medidasHTML = campos.length ? `
    <div class="cons-sec">
      <div class="cons-sec-hdr">📐 Medição · ${tipoLabel[tipo] || tipo}</div>
      <div class="cons-sec-body">
        <div class="cons-grid">
          ${campos.map(([lbl, val]) => `
            <div class="cons-field-lbl">${lbl}</div>
            <div class="cons-field-val">${val}</div>
          `).join('')}
        </div>
      </div>
    </div>` : '';

  const notaLevHTML = notaLevantamento ? `
    <div class="cons-sec">
      <div class="cons-sec-hdr">📝 Nota de Levantamento</div>
      <div class="cons-sec-body">
        <div class="cons-nota-text">${notaLevantamento.replace(/\n/g, '<br>')}</div>
      </div>
    </div>` : '';

  const fotos = i.fotos || [];
  const fotosHTML = fotos.length ? `
    <div class="cons-sec">
      <div class="cons-sec-hdr">📷 Fotos (${fotos.length})</div>
      <div class="cons-sec-body">
        <div class="cons-fotos-grid">
          ${fotos.map((url, idx) => `
            <img src="${url}" class="cons-foto-thumb"
                 onclick="abrirFotoConsulta(${idx})" title="Clica para ampliar">`
          ).join('')}
        </div>
      </div>
    </div>` : '';

  const semDados = !notaReuniaoHTML && !medidasHTML && !notaLevHTML && !fotosHTML;

  el.innerHTML = `
    <div class="cons-detalhe-hdr">
      <div style="min-width:0;flex:1">
        ${i.seccao ? `<div style="font-size:9px;text-transform:uppercase;letter-spacing:.8px;color:var(--gold2);margin-bottom:3px">${i.seccao}</div>` : ''}
        <div class="cons-detalhe-art">${i.artigo || '—'}</div>
        <div class="cons-detalhe-desc">${i.descricao || i.nome || '—'}</div>
        ${i.dims  ? `<div style="font-family:'DM Mono',monospace;font-size:10px;color:var(--text3);margin-top:2px">${i.dims}</div>` : ''}
        ${i.quant ? `<div style="font-size:10px;color:var(--text3);margin-top:2px">${i.quant} ${i.unid || ''}</div>` : ''}
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div style="font-size:11px;font-weight:600;color:${estadoCor}">${_ESTADO_LABEL[i.estado] || '—'}</div>
        ${i.material ? `<div style="font-size:10px;color:var(--text3);margin-top:3px">${i.material}</div>` : ''}
      </div>
    </div>

    ${notaReuniaoHTML}
    ${medidasHTML}
    ${notaLevHTML}
    ${fotosHTML}

    ${semDados ? `
      <div style="padding:24px 16px;text-align:center;color:var(--text3);font-size:11px">
        Sem dados de reunião ou levantamento registados.
      </div>` : ''}
  `;
}

/* ── Fullscreen foto (só leitura) ───────────────────────── */
function abrirFotoConsulta(idx) {
  const fotos = itemActual?.fotos || [];
  if (!fotos.length) return;

  let current = idx;
  const overlay = document.createElement('div');
  overlay.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:9999;
    display:flex;align-items:center;justify-content:center;`;

  function render() {
    overlay.innerHTML = `
      <button onclick="this.closest('[style]').remove()" style="position:absolute;top:16px;right:20px;
        background:none;border:none;color:#fff;font-size:24px;cursor:pointer;z-index:2">✕</button>
      <button id="fs-prev" onclick="" style="position:absolute;left:16px;background:rgba(255,255,255,.15);
        border:none;color:#fff;font-size:22px;width:44px;height:44px;border-radius:50%;cursor:pointer">‹</button>
      <img src="${fotos[current]}" style="max-width:92vw;max-height:88vh;object-fit:contain;border-radius:6px">
      <button id="fs-next" onclick="" style="position:absolute;right:16px;background:rgba(255,255,255,.15);
        border:none;color:#fff;font-size:22px;width:44px;height:44px;border-radius:50%;cursor:pointer">›</button>
      <div style="position:absolute;bottom:18px;color:rgba(255,255,255,.6);font-size:12px">
        ${current + 1} / ${fotos.length}
      </div>`;
    overlay.querySelector('#fs-prev').onclick = () => { current = (current - 1 + fotos.length) % fotos.length; render(); };
    overlay.querySelector('#fs-next').onclick = () => { current = (current + 1) % fotos.length; render(); };
  }

  render();
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}
