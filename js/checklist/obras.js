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
  document.getElementById('lista-obras').innerHTML = lista.map(obra => `
    <div class="obra-item ${obraAtual?.id === obra.id ? 'selected' : ''}"
         onclick="selecionarObra('${obra.id}')">
      <div class="obra-cod">${obra.codigo}${obra.orc ? ' · ' + obra.orc : ''}</div>
      <div class="obra-nm">${obra.nome}</div>
    </div>
  `).join('');
}

function filtrarObras(valor) {
  renderizarObras(valor);
}

async function selecionarObra(id) {
  obraAtual = todasObras.find(o => o.id === id);
  itemAtual = null;
  document.getElementById('breadcrumb').innerHTML =
    `<span>${obraAtual.codigo}</span> › ${obraAtual.nome}`;
  document.getElementById('add-row').style.display = 'flex';
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
