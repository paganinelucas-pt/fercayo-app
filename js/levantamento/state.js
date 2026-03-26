/* ═══════════════════════════════════════════════════════════════
   Fercayo · Levantamento · Estado Global
   ═══════════════════════════════════════════════════════════════ */

let _toastTimer = null;
function mostrarToast(msg, dur = 2000) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), dur);
}

let db            = null;
let todasObras    = [];
let obraAtual     = null;
let artigos       = [];   // itens do Firestore com simbologia atribuída
let pins          = [];   // pins do Firestore para a obra actual
let artigoActual  = null; // artigo seleccionado na lista
let pinActual     = null; // pin seleccionado na planta
let plantaModo    = 'pin'; // 'pin' | 'view'
let filtroTexto   = '';
let scale  = 1;
let panX   = 0;
let panY   = 0;
let pinSize = 28;
