/* ═══════════════════════════════════════════════════════════════
   Fercayo · Checklist · Exportar / Importar Backup
   Depende de: shared/db.js, checklist/state.js
   ═══════════════════════════════════════════════════════════════ */

async function exportarBackup() {
  const obras = await dbLerTudo(db, 'obras');
  const itens = await dbLerTudo(db, 'itens');
  const backup = {
    versao: 1,
    data: new Date().toISOString(),
    obras,
    itens
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = `fercayo-backup-${new Date().toISOString().slice(0,10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

async function importarBackup(evento) {
  const ficheiro = evento.target.files[0];
  if (!ficheiro) return;
  const texto  = await ficheiro.text();
  let backup;
  try {
    backup = JSON.parse(texto);
  } catch {
    alert('Ficheiro inválido. Certifica-te que é um backup gerado por esta app.');
    return;
  }
  if (!backup.obras || !backup.itens) {
    alert('Formato de backup não reconhecido.');
    return;
  }
  const confirmar = confirm(
    `Importar backup de ${backup.data?.slice(0,10) || 'data desconhecida'}?\n\n` +
    `${backup.obras.length} obras · ${backup.itens.length} itens\n\n` +
    `Os dados existentes serão substituídos.`
  );
  if (!confirmar) return;
  for (const obra of backup.obras) await dbEscrever(db, 'obras', obra);
  for (const item of backup.itens) await dbEscrever(db, 'itens', item);
  alert('✓ Backup importado com sucesso!');
  todasObras = await dbLerTudo(db, 'obras');
  todasObras.sort((a, b) => a.codigo.localeCompare(b.codigo));
  renderizarObras();
  document.getElementById('cnt-obras').textContent = `${todasObras.length} obras`;
  obraAtual = null;
  itemAtual = null;
  itensObra = [];
  atualizarSummary();
}
