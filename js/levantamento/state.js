/* ═══════════════════════════════════════════════════════════════
   Fercayo · Levantamento · Estado global
   ═══════════════════════════════════════════════════════════════ */

let currentStep = 0;
const totalSteps = 4;
let selections = {};
let fotos = [];
let fotoCount = 0;
let db = null;
let _saveTimer = null;

const DB_NAME = 'FercayoDB';
const DB_VER = 1;
