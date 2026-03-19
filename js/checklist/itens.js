/* ═══════════════════════════════════════════════════════════════
   Fercayo · Checklist · Gestão de Itens + Estado
   Depende de: shared/db.js, checklist/state.js
   ═══════════════════════════════════════════════════════════════ */

async function carregarItens() {
  if (!obraAtual) return;
  itensObra = await dbLerPorIndice(db, 'itens', 'obraId', obraAtual.id);
  renderizarItens();
  atualizarSummary();
}

function renderizarItens() {
  const el = document.getElementById('lista-itens');
  const itensFiltrados = filtroEstado === 'todos'
    ? itensObra
    : itensObra.filter(i => i.estado === filtroEstado);
  document.getElementById('cnt-itens').textContent = `${itensObra.length} itens`;
  if (!itensFiltrados.length) {
    el.innerHTML = `<div class="empty-state">
      <div style="font-size:24px;opacity:.3">📦</div>
      ${obraAtual ? 'Sem itens neste filtro' : 'Seleciona uma obra'}
    </div>`;
    return;
  }
  el.innerHTML = itensFiltrados.map(item => `
    <div class="item-row s-${item.estado} ${itemAtual?.id === item.id ? 'selected' : ''}"
         onclick="selecionarItem(${item.id})">
      <div class="item-art">${item.artigo || '⚠ Extra'}</div>
      <div class="item-nm">${item.descricao || item.nome || '—'}</div>
      <div class="item-meta">${[item.tipo, item.dims].filter(Boolean).join(' · ')}</div>
      <span class="badge b-${item.estado}">${etiquetaEstado(item.estado)}</span>
    </div>
  `).join('');
}

function setFiltro(valor, botao) {
  filtroEstado = valor;
  document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('active'));
  botao.classList.add('active');
  renderizarItens();
}

function selecionarItem(id) {
  itemAtual = itensObra.find(i => i.id === id);
  renderizarItens();
  renderizarEstado();
}

function renderizarEstadoVazio() {
  document.getElementById('estado-body').innerHTML = `
    <div class="empty-state">
      <div style="font-size:32px;opacity:.3">🔍</div>
      Seleciona um item
    </div>`;
}

function renderizarEstado() {
  if (!itemAtual) { renderizarEstadoVazio(); return; }
  const item = itemAtual;
  const estados = [
    { k: 'pendente',  lbl: 'Pendente',          sub: 'Não conferido',                    ic: '○',  cor: 'var(--estado-pendente)' },
    { k: 'conferido', lbl: 'Conferido',          sub: 'Aprovado — pode produzir',         ic: '✔',  cor: 'var(--estado-conferido)' },
    { k: 'alteracao', lbl: 'Alteração em curso', sub: 'Requer nota explicativa',          ic: '⚠',  cor: 'var(--estado-alteracao)' },
    { k: 'anulado',   lbl: 'Anulado',            sub: 'Item cancelado / não se aplica',   ic: '✕',  cor: 'var(--estado-anulado)' },
    { k: 'extra',     lbl: 'Extra',              sub: 'Fora de ORC · orçamento em curso', ic: '＋', cor: 'var(--estado-extra)' },
  ];
  const mostrarNota = ['alteracao', 'extra'].includes(item.estado) || item.nota;
  document.getElementById('estado-body').innerHTML = `
    <div class="ec">
      <div class="ec-hdr">Informação</div>
      <div class="ec-body">
        ${item.estado === 'extra' ? `
          <div style="background:rgba(74,158,255,.08);border:1px solid var(--estado-extra);
                      border-radius:6px;padding:7px 10px;margin-bottom:10px;
                      font-size:11px;color:var(--estado-extra)">
            ＋ Item extra — fora do orçamento, necessita ser orçado
          </div>` : ''}
        <div class="info-grid">
          ${item.artigo  ? `<div class="info-field"><div class="info-label">Artigo</div><div class="info-val mono">${item.artigo}</div></div>` : ''}
          ${item.seccao  ? `<div class="info-field"><div class="info-label">Secção</div><div class="info-val">${item.seccao}</div></div>` : ''}
          ${item.tipo    ? `<div class="info-field"><div class="info-label">Tipo</div><div class="info-val">${item.tipo}</div></div>` : ''}
          ${item.dims    ? `<div class="info-field"><div class="info-label">Dimensões</div><div class="info-val mono">${item.dims}</div></div>` : ''}
          ${item.ref     ? `<div class="info-field"><div class="info-label">Referência</div><div class="info-val mono">${item.ref}</div></div>` : ''}
          ${item.quant   ? `<div class="info-field"><div class="info-label">Quantidade</div><div class="info-val mono">${item.quant} ${item.unid || ''}</div></div>` : ''}
          ${item.material? `<div class="info-field info-full"><div class="info-label">Material / Cor</div><div class="info-val">${item.material}</div></div>` : ''}
          <div class="info-field info-full">
            <div class="info-label">Descrição</div>
            <div class="info-val" style="font-size:12px;line-height:1.5">${item.descricao || item.nome || '—'}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="ec">
      <div class="ec-hdr">Estado</div>
      <div class="ec-body">
        ${estados.map(e => `
          <div class="pip-step ${item.estado === e.k ? 'ativo' : ''}"
               onclick="definirEstado('${e.k}')">
            <div class="pip-circle" style="${item.estado === e.k ? 'border-color:' + e.cor : ''}">
              <span style="color:${e.cor}">${e.ic}</span>
            </div>
            <div>
              <div class="pip-label" style="color:${e.cor}">${e.lbl}</div>
              <div class="pip-sub">${e.sub}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    ${mostrarNota ? `
    <div class="ec">
      <div class="ec-hdr">
        ${item.estado === 'extra' ? 'Descrição do Item Extra' :
          item.estado === 'alteracao' ? 'Nota de Alteração' : 'Nota'}
      </div>
      <div class="ec-body">
        <textarea class="nota-ta" id="nota-ta"
          placeholder="${item.estado === 'extra'
            ? 'Descreve o item extra e o estado do orçamento…'
            : 'Descreve a alteração: dimensões, material, cor, ferragem…'
          }">${item.nota || ''}</textarea>
        <div style="margin-top:8px">
          <button class="abtn" onclick="guardarNota(document.getElementById('nota-ta').value)">
            💾 Guardar nota
          </button>
        </div>
      </div>
    </div>` : ''}
    <div class="ec">
      <div class="ec-hdr">Ações Rápidas</div>
      <div class="ec-body">
        <div class="acao-row">
          <button class="abtn" onclick="definirEstado('pendente')" style="border-color:var(--estado-pendente);color:var(--estado-pendente)">○ Pendente</button>
          <button class="abtn" onclick="definirEstado('conferido')" style="border-color:var(--estado-conferido);color:var(--estado-conferido)">✔ Conferido</button>
          <button class="abtn" onclick="definirEstado('alteracao')" style="border-color:var(--estado-alteracao);color:var(--estado-alteracao)">⚠ Alteração</button>
          <button class="abtn" onclick="definirEstado('anulado')"   style="border-color:var(--estado-anulado);color:var(--estado-anulado)">✕ Anulado</button>
          <button class="abtn" onclick="definirEstado('extra')"     style="border-color:var(--estado-extra);color:var(--estado-extra)">＋ Extra</button>
          <button class="abtn btn-danger" onclick="removerItem()">🗑 Remover</button>
        </div>
      </div>
    </div>
  `;
}

async function definirEstado(novoEstado) {
  if (!itemAtual) return;
  itemAtual.estado = novoEstado;
  await dbEscrever(db, 'itens', itemAtual);
  await carregarItens();
  renderizarEstado();
}

async function guardarNota(texto) {
  if (!itemAtual) return;
  itemAtual.nota = texto;
  await dbEscrever(db, 'itens', itemAtual);
}

async function removerItem() {
  if (!itemAtual) return;
  if (!confirm(`Remover "${itemAtual.descricao || itemAtual.nome}"?`)) return;
  await dbApagar(db, 'itens', itemAtual.id);
  itemAtual = null;
  await carregarItens();
  renderizarEstadoVazio();
}

async function adicionarItemExtra() {
  const input = document.getElementById('add-inp');
  const valor = input.value.trim();
  if (!valor || !obraAtual) return;
  await dbEscrever(db, 'itens', {
    obraId:    obraAtual.id,
    artigo:    '',
    descricao: valor,
    nome:      valor,
    tipo:      '',
    dims:      '',
    ref:       '',
    quant:     '',
    unid:      '',
    material:  '',
    seccao:    'Extra',
    nota:      '',
    estado:    'extra',
    criadoEm:  Date.now()
  });
  input.value = '';
  await carregarItens();
}

function etiquetaEstado(estado) {
  const mapa = {
    pendente:  '○ Pendente',
    conferido: '✔ Conferido',
    alteracao: '⚠ Alteração',
    anulado:   '✕ Anulado',
    extra:     '＋ Extra',
  };
  return mapa[estado] || estado;
}

function atualizarSummary() {
  const cont = { pendente: 0, conferido: 0, alteracao: 0, anulado: 0, extra: 0 };
  itensObra.forEach(i => { if (cont[i.estado] !== undefined) cont[i.estado]++; });
  document.getElementById('s-pend').textContent = cont.pendente;
  document.getElementById('s-conf').textContent = cont.conferido;
  document.getElementById('s-alt').textContent  = cont.alteracao;
  document.getElementById('s-anul').textContent = cont.anulado;
  document.getElementById('s-ext').textContent  = cont.extra;
  document.getElementById('s-total').textContent = `${itensObra.length} itens`;
}
