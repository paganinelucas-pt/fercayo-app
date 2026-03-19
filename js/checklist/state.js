/* ═══════════════════════════════════════════════════════════════
   Fercayo · Checklist · Estado global da aplicação
   ═══════════════════════════════════════════════════════════════ */

const NOME_DB  = 'FercayoChecklist';
const VERSAO_DB = 1;

let db            = null;
let todasObras    = [];
let obraAtual     = null;
let itemAtual     = null;
let filtroEstado  = 'todos';
let itensObra     = [];
let itensPrevImport = [];
let obraImport    = null;
let obraRelatorio = null;
