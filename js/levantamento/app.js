/* ═══════════════════════════════════════════════════════════════
   Fercayo · Levantamento · App (init, event listeners)
   Depende de: todos os outros módulos do levantamento
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('data-lev').valueAsDate = new Date();
  document.getElementById('revisao').value = 'R0';
  loadCodigosSuggestions();
  verificarRascunho();
  addFoto();
  updateNav();
});

async function generateDocument() {
  buildSummary();
  currentStep = totalSteps;
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('section-4').classList.add('active');
  updateNav();
  window.scrollTo(0, 0);
  saveCodigoSuggestion(document.getElementById('cod-obra').value);
}

function backToEdit() {
  goToStep(3);
}

function resetApp() {
  limparRascunho().then(() => location.reload());
}

/* ── Auto-save on any input/change ── */
document.addEventListener('input',  () => autoSave());
document.addEventListener('change', () => autoSave());
