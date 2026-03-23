/* ═══════════════════════════════════════════════════════════════
   Fercayo · Checklist · Estado global da aplicação
   ═══════════════════════════════════════════════════════════════ */

const NOME_DB  = 'FercayoChecklist';
const VERSAO_DB = 1;

/* ── Utilitários globais ── */
let _toastTimer = null;
function mostrarToast(msg, dur = 2000) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), dur);
}

function highlight(text, termo) {
  if (!termo || !text) return text || '';
  const esc = termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return String(text).replace(new RegExp(`(${esc})`, 'gi'), '<mark>$1</mark>');
}

let db            = null;
let todasObras    = [];
let obraAtual     = null;
let itemAtual     = null;
let filtroEstado  = 'todos';
let itensObra     = [];
let itensPrevImport = [];
let obraImport    = null;
let obraRelatorio = null;
