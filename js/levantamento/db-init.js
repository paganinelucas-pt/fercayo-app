/* ═══════════════════════════════════════════════════════════════
   Fercayo · Levantamento · Inicialização Firebase
   ═══════════════════════════════════════════════════════════════ */

async function iniciar() {
  db = await abrirDB();

  const obrasExistentes = await dbLerTudo(db, 'obras');
  if (obrasExistentes.length === 0) {
    for (const obra of OBRAS_DEFAULT) {
      await dbEscrever(db, 'obras', obra);
    }
  }

  todasObras = await dbLerTudo(db, 'obras');
  todasObras.sort((a, b) => a.codigo.localeCompare(b.codigo));
}
