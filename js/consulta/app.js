/* ═══════════════════════════════════════════════════════════════
   Fercayo · Consulta · App (eventos + init)
   ═══════════════════════════════════════════════════════════════ */

/* ── Fechar dropdown ao clicar fora ────────────────────── */
document.addEventListener('click', e => {
  if (!e.target.closest('.obra-search-wrap')) {
    document.getElementById('cons-drop')?.classList.remove('open');
  }
});

/* ── Arranque ───────────────────────────────────────────── */
iniciarAuth(async () => {
  await iniciar();

  /* auto-seleccionar a obra activa nas outras abas */
  const savedId = localStorage.getItem('ck_obraId');
  if (savedId && todasObras.find(o => o.id === savedId)) {
    await selecionarObraConsulta(savedId);
  }
});
