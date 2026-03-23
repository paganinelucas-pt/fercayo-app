/* ═══════════════════════════════════════════════════════════════
   Fercayo · Levantamento · Gestão de Artigos + Simbologia
   ═══════════════════════════════════════════════════════════════ */

const COR_TIPO = {
  P: '#AF7C34',
  J: '#2980B9',
  A: '#8E44AD',
  V: '#27AE60',
  M: '#E67E22',
  X: '#6A7079',
};

const NOME_TIPO = {
  P: 'Portas',
  J: 'Janelas',
  A: 'Armários',
  V: 'Vãos',
  M: 'Móveis',
  X: 'Outros',
};

function detectarLetra(item) {
  const txt = ((item.descricao || '') + ' ' + (item.tipo || '') + ' ' + (item.nome || '')).toLowerCase();
  if (/port[ao]|folha\s+abrir|folha\s+correr|pivotante|batente|aro/.test(txt)) return 'P';
  if (/janel[ao]|oscilo|guilhotin|fixo\s+vid|vid.*fixo|caixilho/.test(txt)) return 'J';
  if (/arm[aá]rio|roup[ae]iro|armari|guardar/.test(txt)) return 'A';
  if (/vão|passagem|entrada\s+sem/.test(txt)) return 'V';
  if (/m[oó]vel|c[o0]zinha|bancada|balcão|pr[ae]tele|rodap/.test(txt)) return 'M';
  return 'X';
}

function atribuirSimbologia(lista) {
  const contadores = { P: 0, J: 0, A: 0, V: 0, M: 0, X: 0 };
  return lista
    .slice()
    .sort((a, b) => (a.criadoEm || 0) - (b.criadoEm || 0))
    .map(item => {
      const letra = detectarLetra(item);
      contadores[letra]++;
      return { ...item, _letra: letra, _simbolo: letra + contadores[letra] };
    });
}

async function carregarArtigos() {
  if (!obraAtual) return;
  const itens = await dbLerPorIndice(db, 'itens', 'obraId', obraAtual.id);
  artigos = atribuirSimbologia(itens);
  renderizarArtigos();
  renderizarTabelaArtigos();
  atualizarSumbar();
}

function filtrarArtigos(texto) {
  filtroTexto = texto.toLowerCase();
  renderizarArtigos();
}

function renderizarArtigos() {
  const el = document.getElementById('lista-artigos');
  if (!artigos.length) {
    el.innerHTML = `<div class="empty-state">
      <div style="font-size:24px;opacity:.3">📦</div>
      Sem artigos nesta obra
    </div>`;
    return;
  }

  const filtrados = filtroTexto
    ? artigos.filter(a =>
        (a.descricao || '').toLowerCase().includes(filtroTexto) ||
        (a.artigo || '').toLowerCase().includes(filtroTexto) ||
        a._simbolo.toLowerCase().includes(filtroTexto)
      )
    : artigos;

  /* agrupar por letra */
  const grupos = {};
  filtrados.forEach(a => {
    if (!grupos[a._letra]) grupos[a._letra] = [];
    grupos[a._letra].push(a);
  });

  const ordem = ['P', 'J', 'A', 'V', 'M', 'X'];
  el.innerHTML = ordem
    .filter(l => grupos[l])
    .map(l => {
      const grupo = grupos[l];
      const rows = grupo.map(a => {
        const pinCount = pins.filter(p => p.artigoId === a.id).length;
        const isSelected = artigoActual?.id === a.id;
        return `
          <div class="artigo-row ${isSelected ? 'selected' : ''}"
               onclick="selecionarArtigo('${a.id}')">
            <div class="artigo-pin ${a._letra.toLowerCase()}">${a._simbolo}</div>
            <div style="flex:1;min-width:0">
              <div class="artigo-cod">${a.artigo || '—'}</div>
              <div class="artigo-desc">${(a.descricao || a.nome || '').substring(0, 40)}</div>
              ${a.dims ? `<div class="artigo-dims">${a.dims}</div>` : ''}
            </div>
            ${pinCount ? `<div class="artigo-pin-badge">📌${pinCount}</div>` : ''}
          </div>`;
      }).join('');

      return `
        <div class="artigo-grupo">
          <div class="artigo-grupo-hdr">
            ▾ ${NOME_TIPO[l]} <span class="cnt">${grupo.length}</span>
          </div>
          ${rows}
        </div>`;
    }).join('');
}

function selecionarArtigo(id) {
  artigoActual = artigos.find(a => a.id === id) || null;
  pinActual = null;
  renderizarArtigos();
  renderizarDetalhe();
  /* highlight any existing pin for this artigo */
  document.querySelectorAll('.map-pin').forEach(el => {
    el.classList.toggle('selected-pin', el.dataset.artigoId === id);
  });
}

function renderizarTabelaArtigos() {
  const el = document.getElementById('tabela-artigos');
  if (!artigos.length) {
    el.innerHTML = `<div class="empty-state"><div style="font-size:28px;opacity:.3">📋</div>Sem artigos</div>`;
    return;
  }
  const estadoLabel = {
    pendente: '○ Pendente', conferido: '✔ Conf.', alteracao: '⚠ Alt.',
    anulado: '✕ Anul.', extra: '＋ Extra',
  };
  const estadoCor = {
    pendente: 'var(--text3)', conferido: 'var(--estado-conferido)',
    alteracao: 'var(--estado-alteracao)', anulado: 'var(--estado-anulado)',
    extra: 'var(--estado-extra)',
  };

  el.innerHTML = `
    <div style="display:grid;grid-template-columns:50px 90px 1fr 100px 70px 50px;gap:6px;padding:5px 12px;border-bottom:1px solid var(--border);font-family:'DM Mono',monospace;font-size:9px;color:var(--text3);text-transform:uppercase">
      <span>Pin</span><span>Artigo</span><span>Descrição</span><span>Dims</span><span>Estado</span><span>Pins</span>
    </div>
    ${artigos.map(a => {
      const pinCount = pins.filter(p => p.artigoId === a.id).length;
      return `
        <div style="display:grid;grid-template-columns:50px 90px 1fr 100px 70px 50px;gap:6px;padding:6px 12px;border-radius:5px;align-items:center;cursor:pointer;transition:background .1s"
             onclick="mostrarPainel('planta');selecionarArtigo('${a.id}')"
             onmouseover="this.style.background='var(--bg3)'"
             onmouseout="this.style.background=''">
          <div style="width:24px;height:24px;border-radius:50%;background:${COR_TIPO[a._letra]};color:#fff;font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center">${a._simbolo}</div>
          <div style="font-family:'DM Mono',monospace;font-size:9px;color:var(--gold2)">${a.artigo || '—'}</div>
          <div style="font-size:11px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${a.descricao || a.nome || '—'}</div>
          <div style="font-family:'DM Mono',monospace;font-size:10px;color:var(--text2)">${a.dims || '—'}</div>
          <div style="font-size:10px;color:${estadoCor[a.estado] || 'var(--text3)'}">${estadoLabel[a.estado] || '—'}</div>
          <div style="font-family:'DM Mono',monospace;font-size:10px;color:${pinCount ? 'var(--gold2)' : 'var(--text3)'}">${pinCount || '—'}</div>
        </div>`;
    }).join('')}`;
}

function atualizarSumbar() {
  document.getElementById('s-pins').textContent    = pins.length;
  document.getElementById('s-artigos').textContent = artigos.length;
  document.getElementById('s-obra-info').textContent =
    obraAtual ? `${obraAtual.codigo} · ${obraAtual.nome}` : '';
}
