/* ═══════════════════════════════════════════════════════════════
   Fercayo · Checklist · App (navegação, eventos, inicialização)
   Depende de: todos os outros módulos do checklist
   ═══════════════════════════════════════════════════════════════ */

function mostrarPainel(nome) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + nome).classList.add('active');
  document.querySelector(`.nav-btn[data-p="${nome}"]`)?.classList.add('active');
}

/* ── Atalhos de teclado ── */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { fecharModal(); return; }
  const tagActiva = document.activeElement.tagName;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tagActiva)) return;

  /* Enter → marcar item actual como Conferido */
  if (e.key === 'Enter' && itemAtual) {
    e.preventDefault();
    definirEstado('conferido');
    return;
  }

  if (!e.key.startsWith('Arrow')) return;

  /* Navegar obras (quando nenhum item está seleccionado) */
  if (!itemAtual) {
    const termo = (document.getElementById('search-obras').value || '').toLowerCase();
    const lista = todasObras.filter(o =>
      o.codigo.toLowerCase().includes(termo) || o.nome.toLowerCase().includes(termo)
    );
    if (!lista.length) return;
    const idx = obraAtual ? lista.findIndex(o => o.id === obraAtual.id) : -1;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selecionarObra(lista[idx < lista.length - 1 ? idx + 1 : 0].id);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      selecionarObra(lista[idx > 0 ? idx - 1 : lista.length - 1].id);
    }
    return;
  }

  /* Navegar itens (quando um item está seleccionado) */
  if (!obraAtual) return;
  const itensFiltrados = filtroEstado === 'todos'
    ? itensObra
    : itensObra.filter(i => i.estado === filtroEstado);
  const indiceActual = itensFiltrados.findIndex(i => i.id === itemAtual.id);
  if (e.key === 'ArrowDown' && indiceActual < itensFiltrados.length - 1) {
    e.preventDefault();
    selecionarItem(itensFiltrados[indiceActual + 1].id);
  }
  if (e.key === 'ArrowUp' && indiceActual > 0) {
    e.preventDefault();
    selecionarItem(itensFiltrados[indiceActual - 1].id);
  }
});

/* ── Colunas redimensionáveis ── */
(function() {
  const MIN = 160;
  const saved = JSON.parse(localStorage.getItem('ck_cols') || '{}');
  if (saved.obras) document.getElementById('col-obras').style.width = saved.cols_obras + 'px';
  if (saved.itens) document.getElementById('col-itens').style.width = saved.cols_itens + 'px';

  document.querySelectorAll('.col-resize-handle').forEach(handle => {
    handle.addEventListener('mousedown', e => {
      e.preventDefault();
      const colId  = handle.dataset.col;
      const col    = document.getElementById(colId);
      const startX = e.clientX;
      const startW = col.offsetWidth;
      handle.classList.add('dragging');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      function onMove(ev) {
        const newW = Math.max(MIN, startW + ev.clientX - startX);
        col.style.width = newW + 'px';
      }
      function onUp() {
        handle.classList.remove('dragging');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        const s = JSON.parse(localStorage.getItem('ck_cols') || '{}');
        s['cols_' + colId.replace('col-', '')] = col.offsetWidth;
        localStorage.setItem('ck_cols', JSON.stringify(s));
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  });

  /* restaurar larguras guardadas */
  const s = JSON.parse(localStorage.getItem('ck_cols') || '{}');
  if (s.cols_obras) document.getElementById('col-obras').style.width = s.cols_obras + 'px';
  if (s.cols_itens) document.getElementById('col-itens').style.width = s.cols_itens + 'px';
})();

/* ── Fechar dropdowns ao clicar fora ── */
document.addEventListener('click', (e) => {
  if (!e.target.closest('.obra-search-wrap')) {
    document.getElementById('ext-drop')?.classList.remove('open');
    document.getElementById('rel-drop')?.classList.remove('open');
  }
});

/* ── Arranque ── */
iniciarAuth(iniciar);
