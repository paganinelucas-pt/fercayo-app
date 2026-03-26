/* ═══════════════════════════════════════════════════════════════
   Fercayo · Checklist · Gestão de Obras (render/filtro/CRUD)
   Depende de: shared/db.js, checklist/state.js
   ═══════════════════════════════════════════════════════════════ */

function renderizarObras(filtro = '') {
  const termo = filtro.toLowerCase();
  const lista = todasObras.filter(o =>
    o.codigo.toLowerCase().includes(termo) ||
    o.nome.toLowerCase().includes(termo)
  );
  const prog = JSON.parse(localStorage.getItem('ck_prog') || '{}');
  document.getElementById('lista-obras').innerHTML = lista.map(obra => {
    const isAtual = obraAtual?.id === obra.id;
    const p = prog[obra.id];
    let progHTML = '';
    if (p && p.total > 0) {
      const pct = Math.round(p.conf / p.total * 100);
      const cor = pct === 100 ? 'var(--estado-conferido)' : 'var(--gold)';
      progHTML = `<div class="obra-prog"><div class="obra-prog-fill" style="width:${pct}%;background:${cor}"></div></div>`;
    }
    const cod = highlight(obra.codigo, termo);
    const nm  = highlight(obra.nome, termo);
    return `
      <div class="obra-item ${isAtual ? 'selected' : ''}" onclick="selecionarObra('${obra.id}')" data-obra-id="${obra.id}">
        <div class="obra-cod">${cod}${obra.orc ? ' · ' + obra.orc : ''}</div>
        <div class="obra-nm">${nm}</div>
        ${progHTML}
      </div>`;
  }).join('');

  /* scroll para a obra seleccionada */
  if (obraAtual) {
    const el = document.querySelector(`[data-obra-id="${obraAtual.id}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }
}

function filtrarObras(valor) {
  renderizarObras(valor);
}

async function selecionarObra(id) {
  obraAtual = todasObras.find(o => o.id === id);
  itemAtual = null;
  localStorage.setItem('ck_obraId', id);
  localStorage.removeItem('ck_itemId');
  document.getElementById('breadcrumb').innerHTML =
    `<span>${obraAtual.codigo}</span> › ${obraAtual.nome}`;
  document.getElementById('add-row').style.display = 'flex';
  document.getElementById('obra-tabs').style.display = 'flex';
  await carregarItens();
  renderizarEstadoVazio();
  renderizarObras(document.getElementById('search-obras').value);
}

function abrirModal()  { document.getElementById('modal-overlay').classList.add('open'); }
function fecharModal() { document.getElementById('modal-overlay').classList.remove('open'); }

async function criarObra() {
  const codigo = document.getElementById('m-cod').value.trim().toUpperCase();
  const nome   = document.getElementById('m-nom').value.trim();
  const orc    = document.getElementById('m-orc').value.trim();
  if (!codigo || !nome) { alert('Código e nome são obrigatórios.'); return; }
  if (todasObras.find(o => o.id === codigo)) { alert('Código já existe.'); return; }
  await dbEscrever(db, 'obras', { id: codigo, codigo, nome, orc });
  todasObras = await dbLerTudo(db, 'obras');
  todasObras.sort((a, b) => a.codigo.localeCompare(b.codigo));
  renderizarObras();
  document.getElementById('cnt-obras').textContent = `${todasObras.length} obras`;
  fecharModal();
  ['m-cod', 'm-nom', 'm-orc'].forEach(id => document.getElementById(id).value = '');
}
