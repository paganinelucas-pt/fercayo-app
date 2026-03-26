/* ═══════════════════════════════════════════════════════════════
   Fercayo · Levantamento · Painel de Detalhe do Artigo
   ═══════════════════════════════════════════════════════════════ */

function renderizarDetalhe() {
  const hdr  = document.getElementById('detalhe-header');
  const body = document.getElementById('detalhe-body');

  if (!artigoActual) {
    hdr.innerHTML = `
      <div class="empty-state" style="height:80px">
        <div style="font-size:22px;opacity:.3">📌</div>
        Selecciona um artigo
      </div>`;
    body.innerHTML = '';
    return;
  }

  const a      = artigoActual;
  const cor    = COR_TIPO_PLANTA[a._letra] || '#6A7079';
  const pinArt = pins.filter(p => p.artigoId === a.id);
  const estadoLabel = {
    pendente: '○ Pendente', conferido: '✔ Conferido',
    alteracao: '⚠ Alteração', anulado: '✕ Anulado', extra: '＋ Extra',
  };
  const estadoCor = {
    pendente:  'var(--estado-pendente)',
    conferido: 'var(--estado-conferido)',
    alteracao: 'var(--estado-alteracao)',
    anulado:   'var(--estado-anulado)',
    extra:     'var(--estado-extra)',
  };

  hdr.innerHTML = `
    <div class="detalhe-pin-big" style="background:${cor}">${a._simbolo}</div>
    <div class="detalhe-art">${a.artigo || '—'}</div>
    <div class="detalhe-desc">${a.descricao || a.nome || '—'}</div>`;

  let pinsHTML = '';
  if (pinArt.length) {
    pinsHTML = `
      <div class="ec">
        <div class="ec-hdr">Pins na Planta (${pinArt.length})</div>
        <div class="ec-body" style="display:flex;flex-direction:column;gap:6px">
          ${pinArt.map(p => `
            <div style="display:flex;align-items:center;gap:8px;background:rgba(175,124,52,.08);
                        border:1px solid rgba(175,124,52,.2);border-radius:5px;padding:6px 8px;cursor:pointer"
                 onclick="selecionarPin('${p.id}', event)">
              <div style="width:20px;height:20px;border-radius:50%;background:${cor};
                          color:#fff;font-size:8px;font-weight:700;display:flex;
                          align-items:center;justify-content:center;flex-shrink:0">${p.simbolo}</div>
              <div style="flex:1;font-size:11px;color:var(--text2)">
                ${p.nota || 'Sem nota'}
              </div>
              <button onclick="removerPin('${p.id}')"
                      style="background:none;border:none;color:var(--red);cursor:pointer;font-size:12px;padding:0">✕</button>
            </div>`).join('')}
        </div>
      </div>`;
  }

  const notaPin = pinActual?.artigoId === a.id ? pinActual : null;

  body.innerHTML = `
    ${a.tipo    ? `<div class="detalhe-lbl">Tipo</div><div class="detalhe-val">${a.tipo}</div>` : ''}
    ${a.dims    ? `<div class="detalhe-lbl">Dimensões</div><div class="detalhe-val mono">${a.dims}</div>` : ''}
    ${a.quant   ? `<div class="detalhe-lbl">Quantidade</div><div class="detalhe-val mono">${a.quant} ${a.unid || ''}</div>` : ''}
    ${a.material? `<div class="detalhe-lbl">Material / Cor</div><div class="detalhe-val">${a.material}</div>` : ''}
    ${a.estado  ? `<div class="detalhe-lbl">Estado Checklist</div>
                   <div class="detalhe-val" style="color:${estadoCor[a.estado] || 'inherit'}">${estadoLabel[a.estado] || a.estado}</div>` : ''}

    ${pinsHTML}

    ${notaPin ? `
      <div class="ec">
        <div class="ec-hdr">Nota do Pin Seleccionado</div>
        <div class="ec-body">
          <textarea class="nota-ta" id="nota-pin-ta"
            placeholder="Observações do preparador…">${notaPin.nota || ''}</textarea>
          <div style="margin-top:8px">
            <button class="btn btn-gold btn-sm" style="width:100%"
              onclick="guardarNotaPin(document.getElementById('nota-pin-ta').value)">
              💾 Guardar nota
            </button>
          </div>
        </div>
      </div>` : ''}

    ${renderizarFormMedicao(a)}

    <div style="display:flex;flex-direction:column;gap:6px;margin-top:4px">
      <button class="btn btn-gold btn-sm"
        onclick="setModo('pin');selecionarArtigo('${a.id}')"
        style="justify-content:center">
        📌 Colocar Pin na Planta
      </button>
    </div>`;
}
