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
  if (!itemAtual || !obraAtual) return;
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

/* ── Fechar dropdowns ao clicar fora ── */
document.addEventListener('click', (e) => {
  if (!e.target.closest('.obra-search-wrap')) {
    document.getElementById('ext-drop')?.classList.remove('open');
    document.getElementById('rel-drop')?.classList.remove('open');
  }
});

/* ── Arranque ── */
iniciar();
