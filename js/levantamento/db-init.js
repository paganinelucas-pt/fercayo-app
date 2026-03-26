/* ═══════════════════════════════════════════════════════════════
   Fercayo · Levantamento · Inicialização Firebase
   ═══════════════════════════════════════════════════════════════ */

async function iniciar() {
  db = await abrirDB();

  todasObras = await dbLerTudo(db, 'obras');
  todasObras.sort((a, b) => a.codigo.localeCompare(b.codigo));
}
