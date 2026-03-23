/* ═══════════════════════════════════════════════════════════════
   Fercayo · Levantamento · Planta Interactiva + Pins
   ═══════════════════════════════════════════════════════════════ */

const COR_TIPO_PLANTA = {
  P: '#AF7C34', J: '#2980B9', A: '#8E44AD',
  V: '#27AE60', M: '#E67E22', X: '#6A7079',
};

/* ── Upload da planta ─────────────────────────────────── */
function uploadPlanta(event) {
  const file = event.target.files[0];
  if (!file || !obraAtual) return;

  if (file.type === 'application/pdf') {
    renderizarPDF(file);
  } else {
    const reader = new FileReader();
    reader.onload = e => {
      guardarEMostrarPlanta(e.target.result);
    };
    reader.readAsDataURL(file);
  }
  event.target.value = '';
}

function renderizarPDF(file) {
  /* usa PDF.js se disponível, caso contrário pede para exportar como imagem */
  if (typeof pdfjsLib === 'undefined') {
    alert('Para carregar PDFs, exporta a planta como PNG ou JPG primeiro.\n(Suporte PDF em breve)');
    return;
  }
  const url = URL.createObjectURL(file);
  pdfjsLib.getDocument(url).promise.then(pdf => {
    pdf.getPage(1).then(page => {
      const viewport = page.getViewport({ scale: 2 });
      const canvas   = document.createElement('canvas');
      canvas.width   = viewport.width;
      canvas.height  = viewport.height;
      const ctx = canvas.getContext('2d');
      page.render({ canvasContext: ctx, viewport }).promise.then(() => {
        guardarEMostrarPlanta(canvas.toDataURL('image/jpeg', 0.85));
        URL.revokeObjectURL(url);
      });
    });
  });
}

function guardarEMostrarPlanta(dataURL) {
  if (obraAtual) {
    localStorage.setItem(`planta_${obraAtual.id}`, dataURL);
  }
  mostrarPlanta(dataURL);
}

function carregarPlanta() {
  if (!obraAtual) return;
  const dataURL = localStorage.getItem(`planta_${obraAtual.id}`);
  if (dataURL) {
    mostrarPlanta(dataURL);
  } else {
    document.getElementById('planta-empty').style.display = 'flex';
    document.getElementById('planta-img').style.display   = 'none';
  }
}

function mostrarPlanta(dataURL) {
  const img   = document.getElementById('planta-img');
  const empty = document.getElementById('planta-empty');
  img.src             = dataURL;
  img.style.display   = 'block';
  empty.style.display = 'none';
}

function limparPlanta() {
  if (!obraAtual) return;
  if (!confirm('Remover a imagem da planta desta obra?')) return;
  localStorage.removeItem(`planta_${obraAtual.id}`);
  document.getElementById('planta-img').style.display   = 'none';
  document.getElementById('planta-empty').style.display = 'flex';
}

/* ── Zoom / Pan ───────────────────────────────────────── */
function applyTransform() {
  const layer = document.getElementById('planta-zoom-layer');
  if (layer) layer.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
  const el = document.getElementById('zoom-level');
  if (el) el.textContent = Math.round(scale * 100) + '%';
}

function _ajustarZoom(factor, cx, cy) {
  const newScale = Math.min(Math.max(scale * factor, 0.15), 12);
  panX = cx - (cx - panX) * (newScale / scale);
  panY = cy - (cy - panY) * (newScale / scale);
  scale = newScale;
  applyTransform();
}

function zoomIn() {
  const w = document.getElementById('planta-wrap');
  _ajustarZoom(1.25, w.offsetWidth / 2, w.offsetHeight / 2);
}
function zoomOut() {
  const w = document.getElementById('planta-wrap');
  _ajustarZoom(0.8, w.offsetWidth / 2, w.offsetHeight / 2);
}
function resetZoom() {
  scale = 1; panX = 0; panY = 0;
  applyTransform();
}

/* scroll para zoom */
document.getElementById('planta-wrap').addEventListener('wheel', e => {
  e.preventDefault();
  const rect   = e.currentTarget.getBoundingClientRect();
  const mx     = e.clientX - rect.left;
  const my     = e.clientY - rect.top;
  _ajustarZoom(e.deltaY < 0 ? 1.12 : 1 / 1.12, mx, my);
}, { passive: false });

/* arrastar para pan */
let _isPanning = false, _panSX = 0, _panSY = 0, _panOX = 0, _panOY = 0;

document.getElementById('planta-wrap').addEventListener('mousedown', e => {
  if (plantaModo !== 'view') return;
  _isPanning = true;
  _panSX = e.clientX; _panSY = e.clientY;
  _panOX = panX;      _panOY = panY;
  e.currentTarget.style.cursor = 'grabbing';
  e.preventDefault();
});
document.addEventListener('mousemove', e => {
  if (!_isPanning) return;
  panX = _panOX + (e.clientX - _panSX);
  panY = _panOY + (e.clientY - _panSY);
  applyTransform();
});
document.addEventListener('mouseup', () => {
  if (!_isPanning) return;
  _isPanning = false;
  const wrap = document.getElementById('planta-wrap');
  if (wrap && plantaModo === 'view') wrap.style.cursor = 'default';
});

/* ── Tamanho dos pins ─────────────────────────────────── */
function setPinSize(val) {
  pinSize = parseInt(val);
  document.documentElement.style.setProperty('--pin-size', pinSize + 'px');
}

/* ── Modo (pin / view) ────────────────────────────────── */
function setModo(modo) {
  plantaModo = modo;
  const wrap = document.getElementById('planta-wrap');
  wrap.classList.toggle('modo-view', modo === 'view');
  document.getElementById('tool-pin').classList.toggle('active', modo === 'pin');
  document.getElementById('tool-view').classList.toggle('active', modo === 'view');
}

/* ── Click na planta → colocar pin ───────────────────── */
function handlePlantaClick(event) {
  if (plantaModo !== 'pin') return;
  if (_isPanning) return;
  if (!obraAtual)     { alert('Selecciona uma obra primeiro.'); return; }
  if (!artigoActual)  { alert('Selecciona um artigo da lista primeiro.'); return; }

  const wrap = document.getElementById('planta-wrap');
  const rect = wrap.getBoundingClientRect();
  /* converter para coordenadas originais (antes do zoom/pan) */
  const x = ((event.clientX - rect.left - panX) / scale / rect.width)  * 100;
  const y = ((event.clientY - rect.top  - panY) / scale / rect.height) * 100;

  colocarPin(x, y);
}

async function colocarPin(x, y) {
  const pinDoc = {
    obraId:    obraAtual.id,
    artigoId:  artigoActual.id,
    simbolo:   artigoActual._simbolo,
    x,
    y,
    nota:      '',
    criadoEm:  Date.now(),
  };
  const id = await dbEscrever(db, 'pins', pinDoc);
  pinDoc.id = id;
  pins.push(pinDoc);
  renderizarPins();
  renderizarArtigos();
  atualizarSumbar();
  /* seleccionar o novo pin */
  pinActual = pinDoc;
  renderizarDetalhe();
}

/* ── Render todos os pins ─────────────────────────────── */
function renderizarPins() {
  const layer = document.getElementById('pins-layer');
  layer.innerHTML = pins.map(pin => {
    const artigo = artigos.find(a => a.id === pin.artigoId);
    const letra  = artigo?._letra || 'X';
    const cor    = COR_TIPO_PLANTA[letra] || '#6A7079';
    const isSelected = pinActual?.id === pin.id;
    return `
      <div class="map-pin ${isSelected ? 'selected-pin' : ''}"
           style="left:${pin.x}%;top:${pin.y}%"
           data-pin-id="${pin.id}"
           data-artigo-id="${pin.artigoId}"
           onclick="selecionarPin('${pin.id}', event)">
        <div class="pin-bubble" style="background:${cor}">
          <span>${pin.simbolo}</span>
        </div>
        <div class="pin-label">${(artigo?.descricao || artigo?.nome || '').substring(0, 12)}</div>
      </div>`;
  }).join('');
}

function selecionarPin(id, event) {
  event.stopPropagation();
  pinActual = pins.find(p => p.id === id) || null;
  if (pinActual) {
    artigoActual = artigos.find(a => a.id === pinActual.artigoId) || null;
  }
  renderizarPins();
  renderizarArtigos();
  renderizarDetalhe();
}

async function carregarPins() {
  if (!obraAtual) { pins = []; return; }
  pins = await dbLerPorIndice(db, 'pins', 'obraId', obraAtual.id);
  renderizarPins();
}

async function removerPin(id) {
  await dbApagar(db, 'pins', id);
  pins = pins.filter(p => p.id !== id);
  if (pinActual?.id === id) pinActual = null;
  renderizarPins();
  renderizarArtigos();
  renderizarDetalhe();
  atualizarSumbar();
}

async function guardarNotaPin(nota) {
  if (!pinActual) return;
  pinActual.nota = nota;
  await dbEscrever(db, 'pins', pinActual);
  const idx = pins.findIndex(p => p.id === pinActual.id);
  if (idx !== -1) pins[idx] = pinActual;
}
