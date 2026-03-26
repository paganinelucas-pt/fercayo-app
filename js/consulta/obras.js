/* ═══════════════════════════════════════════════════════════════
   Fercayo · Consulta · Seleção de Obra
   ═══════════════════════════════════════════════════════════════ */

function filtrarDropdownObra() {
  const inp   = document.getElementById('cons-search');
  const drop  = document.getElementById('cons-drop');
  const termo = inp.value.toLowerCase();
  const lista = todasObras
    .filter(o => o.codigo.toLowerCase().includes(termo) || o.nome.toLowerCase().includes(termo))
    .slice(0, 12);
  drop.innerHTML = lista.map(o => `
    <div class="obra-dd-item" onclick="selecionarObraConsulta('${o.id}')">
      <div class="obra-dd-cod">${o.codigo}${o.orc ? ' · ' + o.orc : ''}</div>
      <div class="obra-dd-nm">${o.nome}</div>
    </div>`).join('');
  drop.classList.add('open');
}

function abrirDropdownConsulta() {
  filtrarDropdownObra();
}

async function selecionarObraConsulta(id) {
  obraAtual    = todasObras.find(o => o.id === id);
  itemActual   = null;
  filtroEstado = null;
  filtroTexto  = '';

  document.getElementById('cons-search').value = '';
  document.getElementById('cons-drop').classList.remove('open');
  document.getElementById('search-itens').value = '';

  const tagEl = document.getElementById('obra-tag-cons');
  tagEl.style.display = 'block';
  tagEl.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;background:rgba(175,124,52,.08);
                border:1px solid rgba(175,124,52,.3);border-radius:5px;padding:6px 10px">
      <span style="font-family:'DM Mono',monospace;font-size:10px;color:var(--gold2)">${obraAtual.codigo}</span>
      <span style="font-size:11px;color:var(--text);flex:1">${obraAtual.nome}</span>
      <span onclick="limparObraConsulta()" style="cursor:pointer;color:var(--text3);font-size:12px">✕</span>
    </div>`;

  document.getElementById('bc-obra').textContent = `${obraAtual.codigo} · ${obraAtual.nome}`;
  document.getElementById('obra-tabs').style.display = 'flex';
  document.getElementById('btn-resumo-pdf').style.display = '';
  localStorage.setItem('ck_obraId', id);

  resetFiltroChips();
  await carregarItens();
}

function limparObraConsulta() {
  obraAtual    = null;
  itemActual   = null;
  itens        = [];
  filtroEstado = null;
  filtroTexto  = '';

  document.getElementById('obra-tag-cons').style.display = 'none';
  document.getElementById('bc-obra').textContent = 'Consulta';
  document.getElementById('obra-tabs').style.display = 'none';
  document.getElementById('btn-resumo-pdf').style.display = 'none';
  document.getElementById('search-itens').value = '';
  renderizarItens();
  renderizarDetalheConsulta();
}

async function carregarItens() {
  if (!obraAtual) return;
  const lista = await dbLerPorIndice(db, 'itens', 'obraId', obraAtual.id);
  itens = lista.sort((a, b) => (a.criadoEm || 0) - (b.criadoEm || 0));
  renderizarItens();
  renderizarDetalheConsulta();
}
