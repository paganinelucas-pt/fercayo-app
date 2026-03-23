/* ═══════════════════════════════════════════════════════════════
   Fercayo · Levantamento · App (navegação + eventos + init)
   ═══════════════════════════════════════════════════════════════ */

/* ── Navegação de painéis ──────────────────────────────── */
function mostrarPainel(nome) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + nome).classList.add('active');
  document.querySelector(`.nav-btn[data-p="${nome}"]`)?.classList.add('active');
}

/* ── Dropdown de obras ─────────────────────────────────── */
function filtrarDropdownObra() {
  const inp   = document.getElementById('lev-search');
  const drop  = document.getElementById('lev-drop');
  const termo = inp.value.toLowerCase();
  const lista = todasObras
    .filter(o => o.codigo.toLowerCase().includes(termo) || o.nome.toLowerCase().includes(termo))
    .slice(0, 12);
  drop.innerHTML = lista.map(o => `
    <div class="obra-dd-item" onclick="selecionarObraLev('${o.id}')">
      <div class="obra-dd-cod">${o.codigo}${o.orc ? ' · ' + o.orc : ''}</div>
      <div class="obra-dd-nm">${o.nome}</div>
    </div>`).join('');
  drop.classList.add('open');
}

function abrirDropdown() {
  filtrarDropdownObra();
}

async function selecionarObraLev(id) {
  obraAtual    = todasObras.find(o => o.id === id);
  artigoActual = null;
  pinActual    = null;

  document.getElementById('lev-search').value = '';
  document.getElementById('lev-drop').classList.remove('open');

  /* tag da obra */
  const tagEl = document.getElementById('obra-tag-lev');
  tagEl.style.display = 'block';
  tagEl.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;background:rgba(175,124,52,.08);
                border:1px solid rgba(175,124,52,.3);border-radius:5px;padding:6px 10px">
      <span style="font-family:'DM Mono',monospace;font-size:10px;color:var(--gold2)">${obraAtual.codigo}</span>
      <span style="font-size:11px;color:var(--text);flex:1">${obraAtual.nome}</span>
      <span onclick="limparObraLev()" style="cursor:pointer;color:var(--text3);font-size:12px">✕</span>
    </div>`;

  document.getElementById('bc-obra').textContent = `${obraAtual.codigo} · ${obraAtual.nome}`;
  document.getElementById('lista-obra-sub').textContent = `${obraAtual.codigo} · ${obraAtual.nome}`;

  await carregarArtigos();
  await carregarPins();
  carregarPlanta();
}

function limparObraLev() {
  obraAtual    = null;
  artigoActual = null;
  pinActual    = null;
  artigos      = [];
  pins         = [];

  document.getElementById('obra-tag-lev').style.display = 'none';
  document.getElementById('bc-obra').textContent = 'Levantamento';
  document.getElementById('lista-obra-sub').textContent = 'Selecciona uma obra';
  document.getElementById('planta-img').style.display   = 'none';
  document.getElementById('planta-empty').style.display = 'flex';
  document.getElementById('pins-layer').innerHTML = '';
  document.getElementById('lista-artigos').innerHTML =
    `<div class="empty-state"><div style="font-size:28px;opacity:.3">📐</div>Selecciona uma obra</div>`;
  document.getElementById('detalhe-header').innerHTML =
    `<div class="empty-state" style="height:80px"><div style="font-size:22px;opacity:.3">📌</div>Selecciona um artigo</div>`;
  document.getElementById('detalhe-body').innerHTML = '';
  atualizarSumbar();
}

/* ── Modal Nova Obra ───────────────────────────────────── */
function abrirModalObra()  { document.getElementById('modal-overlay').classList.add('open'); }
function fecharModalObra() { document.getElementById('modal-overlay').classList.remove('open'); }

async function criarObra() {
  const codigo = document.getElementById('m-cod').value.trim().toUpperCase();
  const nome   = document.getElementById('m-nom').value.trim();
  const orc    = document.getElementById('m-orc').value.trim();
  if (!codigo || !nome) { alert('Código e nome são obrigatórios.'); return; }
  if (todasObras.find(o => o.id === codigo)) { alert('Código já existe.'); return; }
  await dbEscrever(db, 'obras', { id: codigo, codigo, nome, orc });
  todasObras = await dbLerTudo(db, 'obras');
  todasObras.sort((a, b) => a.codigo.localeCompare(b.codigo));
  fecharModalObra();
  ['m-cod', 'm-nom', 'm-orc'].forEach(id => document.getElementById(id).value = '');
}

/* ── Exportar PDF (impressão) ──────────────────────────── */
function exportarPDF() {
  window.print();
}

/* ── Fechar dropdowns ao clicar fora ───────────────────── */
document.addEventListener('click', e => {
  if (!e.target.closest('.obra-search-wrap')) {
    document.getElementById('lev-drop')?.classList.remove('open');
  }
});

/* ── Click na planta ───────────────────────────────────── */
document.getElementById('planta-wrap').addEventListener('click', handlePlantaClick);

/* ── Arranque ──────────────────────────────────────────── */
iniciar().then(async () => {
  setModo('pin');
  /* auto-seleccionar a obra activa no Checklist */
  const savedId = localStorage.getItem('ck_obraId');
  if (savedId && todasObras.find(o => o.id === savedId)) {
    await selecionarObraLev(savedId);
  }
});
