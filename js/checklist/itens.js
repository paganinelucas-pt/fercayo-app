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
  let itensFiltrados = filtroEstado === 'todos'
    ? itensObra
    : itensObra.filter(i => i.estado === filtroEstado);
  if (filtroNotas) itensFiltrados = itensFiltrados.filter(i => i.nota);
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
         onclick="selecionarItem('${item.id}')">
      <div class="item-art">${item.artigo || '⚠ Extra'}</div>
      <div class="item-nm">${item.descricao || item.nome || '—'}</div>
      <div class="item-meta">${[item.tipo, item.dims].filter(Boolean).join(' · ')}</div>
      <span class="badge b-${item.estado}">${etiquetaEstado(item.estado)}</span>
    </div>
  `).join('');
}

let filtroNotas = false;

function setFiltro(valor, botao) {
  filtroEstado = valor;
  document.querySelectorAll('.fbtn:not(#fbtn-notas)').forEach(b => b.classList.remove('active'));
  botao.classList.add('active');
  renderizarItens();
}

function toggleFiltroNotas(botao) {
  filtroNotas = !filtroNotas;
  botao.classList.toggle('active', filtroNotas);
  renderizarItens();
}

function selecionarItem(id) {
  itemAtual = itensObra.find(i => i.id === id);
  if (itemAtual) localStorage.setItem('ck_itemId', id);
  renderizarItens();
  renderizarEstado();
  document.querySelector(`.item-row.selected`)?.scrollIntoView({ block: 'nearest' });
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
  const mostrarNota = true;
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
        <div class="orc-info">
          <div class="orc-row orc-header">
            <span class="orc-col-art">Artigo</span>
            <span class="orc-col-desc">Designação dos Trabalhos</span>
            <span class="orc-col-unid">Unid</span>
            <span class="orc-col-quant">Quant</span>
          </div>
          <div class="orc-row orc-data">
            <span class="orc-col-art">${item.artigo || '—'}</span>
            <span class="orc-col-desc">${item.descricao || item.nome || '—'}</span>
            <span class="orc-col-unid">${item.unid || '—'}</span>
            <span class="orc-col-quant">${item.quant || '—'}</span>
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
          }"
          onblur="guardarNota(this.value)">${item.nota || ''}</textarea>
      </div>
    </div>` : ''}
    <div class="ec diretor-only">
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
  if (papelAtual !== 'diretor' && papelAtual !== 'gestao') return;
  itemAtual.estado = novoEstado;
  await dbEscrever(db, 'itens', itemAtual);
  await carregarItens();
  renderizarEstado();
  /* flash de confirmação na linha */
  requestAnimationFrame(() => {
    const row = document.querySelector('.item-row.selected');
    if (row) { row.classList.remove('flash-ok'); void row.offsetWidth; row.classList.add('flash-ok'); }
  });
}

async function guardarNota(texto) {
  if (!itemAtual) return;
  if (papelAtual !== 'diretor' && papelAtual !== 'gestao') return;
  itemAtual.nota = texto;
  await dbEscrever(db, 'itens', itemAtual);
  mostrarToast('✓ Guardado');
}

async function removerItem() {
  if (!itemAtual) return;
  if (!confirm(`Remover "${itemAtual.descricao || itemAtual.nome}"?`)) return;
  await dbApagar(db, 'itens', itemAtual.id);
  itemAtual = null;
  localStorage.removeItem('ck_itemId');
  await carregarItens();
  renderizarEstadoVazio();
}

function abrirModalExtra() {
  ['ex-art','ex-desc','ex-unid','ex-quant'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('modal-extra').classList.add('open');
  document.getElementById('ex-desc').focus();
}

function fecharModalExtra() {
  document.getElementById('modal-extra').classList.remove('open');
}

async function confirmarItemExtra() {
  if (!obraAtual) return;
  const artigo = document.getElementById('ex-art').value.trim();
  const descricao = document.getElementById('ex-desc').value.trim();
  const unid  = document.getElementById('ex-unid').value.trim();
  const quant = document.getElementById('ex-quant').value.trim();
  if (!descricao) { document.getElementById('ex-desc').focus(); return; }
  await dbEscrever(db, 'itens', {
    obraId:   obraAtual.id,
    artigo,
    descricao,
    nome:     descricao,
    unid,
    quant:    quant ? parseFloat(quant) : '',
    tipo: '', dims: '', ref: '', material: '',
    seccao:   'Extra',
    nota:     '',
    estado:   'extra',
    criadoEm: Date.now()
  });
  fecharModalExtra();
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
  const total = itensObra.length;
  const comNota = itensObra.filter(i => i.nota).length;

  document.getElementById('s-pend').textContent = cont.pendente;
  document.getElementById('s-conf').textContent = cont.conferido;
  document.getElementById('s-alt').textContent  = cont.alteracao;
  document.getElementById('s-anul').textContent = cont.anulado;
  document.getElementById('s-ext').textContent  = cont.extra;
  document.getElementById('s-total').textContent = `${total} itens`;

  /* contagens nos filtros */
  [
    ['todos',     'Todos',    total],
    ['pendente',  'Pendente', cont.pendente],
    ['conferido', 'Conf.',    cont.conferido],
    ['alteracao', 'Alt.',     cont.alteracao],
    ['anulado',   'Anulado',  cont.anulado],
    ['extra',     'Extra',    cont.extra],
  ].forEach(([estado, label, count]) => {
    const btn = document.querySelector(`.fbtn[onclick*="'${estado}'"]`);
    if (btn) btn.textContent = count ? `${label} (${count})` : label;
  });
  const notasBtn = document.getElementById('fbtn-notas');
  if (notasBtn) notasBtn.textContent = comNota ? `📝 Com nota (${comNota})` : '📝 Com nota';

  /* guardar progresso no cache para todas as obras */
  if (obraAtual) {
    const prog = JSON.parse(localStorage.getItem('ck_prog') || '{}');
    prog[obraAtual.id] = { conf: cont.conferido, total };
    localStorage.setItem('ck_prog', JSON.stringify(prog));
    renderizarObras(document.getElementById('search-obras')?.value || '');
  }

  /* breadcrumb com progresso vivo */
  if (obraAtual) {
    const pct = total ? Math.round(cont.conferido / total * 100) : 0;
    let extra = '';
    if (cont.alteracao) extra += ` · <span style="color:var(--estado-alteracao)">${cont.alteracao} alt.</span>`;
    if (cont.pendente)  extra += ` · <span style="color:var(--text3)">${cont.pendente} pend.</span>`;
    document.getElementById('breadcrumb').innerHTML =
      `<span>${obraAtual.codigo}</span> › ${obraAtual.nome}` +
      `<span style="margin-left:10px;color:var(--gold2);font-weight:600">${pct}%</span>${extra}`;
  }
}
