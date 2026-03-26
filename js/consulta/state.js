/* ═══════════════════════════════════════════════════════════════
   Fercayo · Consulta · Estado Global
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

let db           = null;
let todasObras   = [];
let obraAtual    = null;
let itens        = [];
let itemActual   = null;
let filtroEstado = null;
let filtroTexto  = '';
