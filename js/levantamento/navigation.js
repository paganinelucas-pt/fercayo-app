/* ═══════════════════════════════════════════════════════════════
   Fercayo · Levantamento · Navegação e Steps
   Depende de: levantamento/state.js
   ═══════════════════════════════════════════════════════════════ */

function goToStep(i) {
  autoSave();
  if (i === currentStep) return;
  if (i === totalSteps - 1) buildSummary();
  currentStep = i;
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(`section-${i}`).classList.add('active');
  updateNav();
  updateTabs();
  window.scrollTo(0, 0);
}

function goNext() {
  if (currentStep === totalSteps - 1) { generateDocument(); return; }
  goToStep(currentStep + 1);
}

function goBack() {
  if (currentStep > 0) goToStep(currentStep - 1);
}

function updateNav() {
  document.getElementById('btn-back').style.display = currentStep > 0 && currentStep < totalSteps ? '' : 'none';
  const btn = document.getElementById('btn-next');
  const nav = document.getElementById('nav-bar');
  if (currentStep === totalSteps) { nav.style.display = 'none'; return; }
  nav.style.display = 'flex';
  if (currentStep === totalSteps - 1) {
    btn.textContent = '✓ Gerar Documento';
    btn.className = 'btn btn-generate';
  } else {
    btn.textContent = 'Continuar →';
    btn.className = 'btn btn-next';
  }
}

function updateTabs() {
  for (let i = 0; i < totalSteps; i++) {
    const t = document.getElementById(`tab-${i}`);
    if (!t) continue;
    t.className = 'step-tab';
    if (i === currentStep) t.classList.add('active');
    else if (i < currentStep) t.classList.add('done');
  }
}

function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function loadCodigosSuggestions() {
  const _raw = localStorage.getItem('fercayo_codigos');
  const _obj = _raw ? JSON.parse(_raw) : { data: [] };
  const s = Array.isArray(_obj) ? _obj : (_obj.data || []);
  document.getElementById('codigos-list').innerHTML = s.map(c => `<option value="${escHtml(c)}">`).join('');
}

function saveCodigoSuggestion(v) {
  if (!v || v.length < 2) return;
  const raw = localStorage.getItem('fercayo_codigos');
  let obj = raw ? JSON.parse(raw) : { ts: Date.now(), data: [] };
  if (!obj.ts || Date.now() - obj.ts > 90 * 24 * 60 * 60 * 1000) { obj = { ts: Date.now(), data: [] }; }
  const s = obj.data;
  if (!s.includes(v)) { s.unshift(v); if (s.length > 20) s.pop(); }
  obj.ts = Date.now();
  localStorage.setItem('fercayo_codigos', JSON.stringify(obj));
  loadCodigosSuggestions();
}

function handleMedidorChange(v) {
  document.getElementById('medidor-outro-wrap').style.display = v === 'outro' ? '' : 'none';
}

function handleDiretorChange(v) {
  document.getElementById('diretor-outro-wrap').style.display = v === 'outro' ? '' : 'none';
}

function getMedidor() {
  const s = document.getElementById('medidor-select').value;
  return s === 'outro' ? (document.getElementById('medidor-outro').value || '—') : s;
}

function getDiretor() {
  const s = document.getElementById('diretor-select').value;
  return s === 'outro' ? (document.getElementById('diretor-outro').value || '—') : s;
}

function selectOption(el) {
  const g = el.dataset.group;
  document.querySelectorAll(`[data-group="${g}"]`).forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  selections[g] = el.dataset.val;
}
