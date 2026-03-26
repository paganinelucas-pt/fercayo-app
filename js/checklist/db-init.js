/* ═══════════════════════════════════════════════════════════════
   Fercayo · Checklist · Inicialização Firebase
   ═══════════════════════════════════════════════════════════════ */

async function iniciar() {
  db = await abrirDB();

  todasObras = await dbLerTudo(db, 'obras');
  todasObras.sort((a, b) => a.codigo.localeCompare(b.codigo));

  renderizarObras();
  document.getElementById('cnt-obras').textContent = `${todasObras.length} obras`;

  /* ── restaurar sessão anterior ── */
  const savedObraId = localStorage.getItem('ck_obraId');
  const savedItemId = localStorage.getItem('ck_itemId');
  if (savedObraId && todasObras.find(o => o.id === savedObraId)) {
    await selecionarObra(savedObraId);
    if (savedItemId) {
      const item = itensObra.find(i => i.id === savedItemId);
      if (item) selecionarItem(item.id);
    }
  }
}
