/* ═══════════════════════════════════════════════════════════════
   Fercayo · Levantamento · Fotos (Firebase Storage)
   ═══════════════════════════════════════════════════════════════ */

async function uploadFotoArtigo(event) {
  if (!artigoActual || !obraAtual) return;
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { mostrarToast('Apenas imagens (JPG, PNG)'); return; }

  mostrarToast('⏳ A carregar foto…');
  event.target.value = ''; /* permite re-upload do mesmo ficheiro */

  try {
    const storage = firebase.storage();
    const path    = `obras/${obraAtual.id}/${artigoActual.id}/${Date.now()}_${file.name}`;
    const ref     = storage.ref(path);

    await ref.put(file);
    const url = await ref.getDownloadURL();

    if (!artigoActual.fotos) artigoActual.fotos = [];
    artigoActual.fotos.push(url);
    await dbEscrever(db, 'itens', artigoActual);

    /* atualizar array em memória */
    const idx = artigos.findIndex(a => a.id === artigoActual.id);
    if (idx >= 0) artigos[idx] = { ...artigos[idx], fotos: artigoActual.fotos };

    renderizarDetalhe();
    mostrarToast('✓ Foto guardada');
  } catch (e) {
    console.error('[Fotos] Erro ao carregar:', e);
    mostrarToast('Erro ao carregar — verifica as regras do Firebase Storage');
  }
}

async function removerFotoArtigo(idx) {
  if (!artigoActual) return;
  const fotos = artigoActual.fotos || [];
  if (idx < 0 || idx >= fotos.length) return;
  if (!confirm('Remover esta foto?')) return;

  artigoActual.fotos = fotos.filter((_, i) => i !== idx);
  await dbEscrever(db, 'itens', artigoActual);

  const arrIdx = artigos.findIndex(a => a.id === artigoActual.id);
  if (arrIdx >= 0) artigos[arrIdx] = { ...artigos[arrIdx], fotos: artigoActual.fotos };

  renderizarDetalhe();
  mostrarToast('Foto removida');
}

function abrirFotoFullscreen(idx) {
  const fotos = artigoActual?.fotos || [];
  if (idx < 0 || idx >= fotos.length) return;
  const url = fotos[idx];

  const overlay = document.createElement('div');
  overlay.style.cssText =
    'position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:9999;' +
    'display:flex;align-items:center;justify-content:center;cursor:zoom-out';
  overlay.onclick = () => document.body.removeChild(overlay);

  const img = document.createElement('img');
  img.src = url;
  img.style.cssText = 'max-width:95vw;max-height:92vh;border-radius:6px;object-fit:contain;box-shadow:0 8px 40px rgba(0,0,0,.6)';

  /* navegação entre fotos */
  if (fotos.length > 1) {
    const btnPrev = _criarBtnNav('‹', () => { document.body.removeChild(overlay); abrirFotoFullscreen((idx - 1 + fotos.length) % fotos.length); });
    const btnNext = _criarBtnNav('›', () => { document.body.removeChild(overlay); abrirFotoFullscreen((idx + 1) % fotos.length); });
    btnPrev.style.left = '16px';
    btnNext.style.right = '16px';
    overlay.appendChild(btnPrev);
    overlay.appendChild(btnNext);
  }

  const counter = document.createElement('div');
  counter.style.cssText = 'position:absolute;bottom:16px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.6);font-size:11px;font-family:monospace';
  counter.textContent = `${idx + 1} / ${fotos.length}`;

  overlay.appendChild(img);
  overlay.appendChild(counter);
  document.body.appendChild(overlay);
}

function _criarBtnNav(texto, onclick) {
  const btn = document.createElement('button');
  btn.textContent = texto;
  btn.style.cssText =
    'position:absolute;top:50%;transform:translateY(-50%);' +
    'background:rgba(255,255,255,.15);border:none;color:#fff;' +
    'font-size:32px;padding:8px 16px;border-radius:6px;cursor:pointer;' +
    'transition:background .15s;z-index:1';
  btn.onmouseover = () => btn.style.background = 'rgba(255,255,255,.25)';
  btn.onmouseout  = () => btn.style.background = 'rgba(255,255,255,.15)';
  btn.onclick = (e) => { e.stopPropagation(); onclick(); };
  return btn;
}
