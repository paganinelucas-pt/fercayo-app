/* ═══════════════════════════════════════════════════════════════
   Fercayo · Levantamento · Auto-save e Rascunho (IndexedDB)
   Depende de: shared/db.js, levantamento/state.js
   ═══════════════════════════════════════════════════════════════ */

function recolherCampos() {
  const ids = [
    'cod-obra', 'morada', 'cliente', 'data-lev', 'revisao',
    'medidor-select', 'medidor-outro',
    'diretor-select', 'diretor-outro',
    'encarregado', 'contacto', 'horario',
    'obs-acesso', 'obs-gerais'
  ];
  const campos = {};
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) campos[id] = el.value;
  });
  campos['_selections'] = JSON.stringify(selections);
  campos['_currentStep'] = currentStep;
  return campos;
}

async function autoSave() {
  if (!db) return;
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(async () => {
    try {
      const campos = recolherCampos();
      await dbPut(db, 'rascunho', 'campos', campos);
      await dbClear(db, 'fotos');
      for (const f of fotos) {
        await dbPut(db, 'fotos', null, f);
      }
    } catch (e) { console.warn('AutoSave erro:', e); }
  }, 800);
}

async function verificarRascunho() {
  try {
    db = await abrirDB(DB_NAME, DB_VER, (d) => {
      if (!d.objectStoreNames.contains('rascunho')) d.createObjectStore('rascunho');
      if (!d.objectStoreNames.contains('fotos'))    d.createObjectStore('fotos', { keyPath: 'id' });
    });
    const campos = await dbGet(db, 'rascunho', 'campos');
    if (!campos) return;
    const cod  = campos['cod-obra']  || '—';
    const data = campos['data-lev']  || '—';
    if (cod === '—' && data === '—') return;
    document.getElementById('rb-cod').textContent  = cod;
    document.getElementById('rb-data').textContent = data;
    document.getElementById('rascunho-banner').style.display = 'flex';
  } catch (e) { console.warn('verificarRascunho erro:', e); }
}

async function recuperarRascunho() {
  document.getElementById('rascunho-banner').style.display = 'none';
  try {
    const campos = await dbGet(db, 'rascunho', 'campos');
    if (!campos) return;

    const ids = [
      'cod-obra', 'morada', 'cliente', 'data-lev', 'revisao',
      'medidor-select', 'medidor-outro',
      'diretor-select', 'diretor-outro',
      'encarregado', 'contacto', 'horario',
      'obs-acesso', 'obs-gerais'
    ];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el && campos[id] !== undefined) el.value = campos[id];
    });

    if (campos['medidor-select']) handleMedidorChange(campos['medidor-select']);
    if (campos['diretor-select']) handleDiretorChange(campos['diretor-select']);

    if (campos['_selections']) {
      try {
        const sel = JSON.parse(campos['_selections']);
        Object.assign(selections, sel);
        document.querySelectorAll('.option-btn').forEach(btn => {
          const grp = btn.dataset.group, val = btn.dataset.value;
          if (grp && selections[grp] === val) btn.classList.add('selected');
          else btn.classList.remove('selected');
        });
      } catch (e) {}
    }

    const fotosGuardadas = await dbGetAll(db, 'fotos');
    if (fotosGuardadas && fotosGuardadas.length > 0) {
      fotos.length = 0;
      fotosGuardadas.forEach(f => fotos.push(f));
      renderFotos();
    }

    const step = parseInt(campos['_currentStep']) || 0;
    if (step > 0) {
      currentStep = 0;
      goToStep(step);
    }

    saveCodigoSuggestion(campos['cod-obra'] || '');
  } catch (e) { console.warn('recuperarRascunho erro:', e); }
}

async function descartarRascunho() {
  document.getElementById('rascunho-banner').style.display = 'none';
  await limparRascunho();
}

async function limparRascunho() {
  if (!db) return;
  await dbClear(db, 'rascunho');
  await dbClear(db, 'fotos');
}
