/* ═══════════════════════════════════════════════════════════════
   Fercayo · Checklist · Inicialização da DB + Seed
   Depende de: shared/db.js, data/obras-default.js,
               data/seed-283-26.js, checklist/state.js
   ═══════════════════════════════════════════════════════════════ */

async function iniciar() {
  db = await abrirDB();

  const obrasExistentes = await dbLerTudo(db, 'obras');
  const idsExistentes = new Set(obrasExistentes.map(o => o.id));
  const obrasFaltantes = OBRAS_DEFAULT.filter(o => !idsExistentes.has(o.id));
  for (const obra of obrasFaltantes) {
    await dbEscrever(db, 'obras', obra);
  }

  todasObras = await dbLerTudo(db, 'obras');
  todasObras.sort((a, b) => a.codigo.localeCompare(b.codigo));

  const itens283 = await dbLerPorIndice(db, 'itens', 'obraId', '283_26');
  if (itens283.length === 0) {
    for (const item of SEED_283_26) {
      item.criadoEm = Date.now();
      await dbEscrever(db, 'itens', item);
    }
  }

  const itens301 = await dbLerPorIndice(db, 'itens', 'obraId', '301_26');
  if (itens301.length === 0) {
    for (const item of SEED_301_26) {
      item.criadoEm = Date.now();
      await dbEscrever(db, 'itens', item);
    }
  }

  const itens286 = await dbLerPorIndice(db, 'itens', 'obraId', '286_26');
  if (itens286.length === 0) {
    for (const item of SEED_286_26) {
      item.criadoEm = Date.now();
      await dbEscrever(db, 'itens', item);
    }
  }

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
