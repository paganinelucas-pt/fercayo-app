/* ═══════════════════════════════════════════════════════════════
   Fercayo · Checklist · Inicialização da DB + Seed
   Depende de: shared/db.js, data/obras-default.js,
               data/seed-283-26.js, checklist/state.js
   ═══════════════════════════════════════════════════════════════ */

async function iniciar() {
  db = await abrirDB(NOME_DB, VERSAO_DB, (bd) => {
    if (!bd.objectStoreNames.contains('obras')) {
      bd.createObjectStore('obras', { keyPath: 'id' });
    }
    if (!bd.objectStoreNames.contains('itens')) {
      const store = bd.createObjectStore('itens', { keyPath: 'id', autoIncrement: true });
      store.createIndex('obraId', 'obraId', { unique: false });
    }
  });

  const obrasExistentes = await dbLerTudo(db, 'obras');
  if (obrasExistentes.length === 0) {
    for (const obra of OBRAS_DEFAULT) {
      await dbEscrever(db, 'obras', obra);
    }
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

  renderizarObras();
  document.getElementById('cnt-obras').textContent = `${todasObras.length} obras`;
}
