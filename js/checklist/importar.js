/* ═══════════════════════════════════════════════════════════════
   Fercayo · Checklist · Importação de Itens (PDF / JSON)
   Depende de: shared/db.js, checklist/state.js, checklist/obras.js
   ═══════════════════════════════════════════════════════════════ */

function filtrarDropdownObra(contexto) {
  const input = document.getElementById(`${contexto}-search`);
  const drop  = document.getElementById(`${contexto}-drop`);
  const termo = input.value.toLowerCase();
  const lista = todasObras
    .filter(o => o.codigo.toLowerCase().includes(termo) || o.nome.toLowerCase().includes(termo))
    .slice(0, 12);
  drop.innerHTML = lista.map(o => `
    <div class="obra-dd-item" onclick="selecionarObraContexto('${contexto}', '${o.id}')">
      <div class="obra-dd-cod">${o.codigo}${o.orc ? ' · ' + o.orc : ''}</div>
      <div class="obra-dd-nm">${o.nome}</div>
    </div>
  `).join('');
  drop.classList.add('open');
}

function abrirDropdown(contexto) {
  filtrarDropdownObra(contexto);
}

function selecionarObraContexto(contexto, id) {
  const obra = todasObras.find(o => o.id === id);
  document.getElementById(`${contexto}-search`).value = '';
  document.getElementById(`${contexto}-drop`).classList.remove('open');
  const tagHtml = `
    <div class="obra-tag">
      <span class="cod">${obra.codigo}</span>
      <span class="nm">${obra.nome}</span>
      <span class="clr" onclick="limparObraContexto('${contexto}')">✕</span>
    </div>`;
  document.getElementById(`${contexto}-obra-tag`).style.display = 'flex';
  document.getElementById(`${contexto}-obra-tag`).innerHTML = tagHtml;
  if (contexto === 'ext') {
    obraImport = obra;
    const tag2 = document.getElementById('ext-obra-tag2');
    if (tag2) {
      tag2.style.display = 'block';
      tag2.innerHTML = `<div class="obra-tag"><span class="cod">${obra.codigo}</span><span class="nm">${obra.nome}</span></div>`;
    }
  } else {
    obraRelatorio = obra;
    renderizarResumoRelatorio();
  }
}

function limparObraContexto(contexto) {
  document.getElementById(`${contexto}-obra-tag`).style.display = 'none';
  document.getElementById(`${contexto}-obra-tag`).innerHTML = '';
  if (contexto === 'ext') {
    obraImport = null;
  } else {
    obraRelatorio = null;
    document.getElementById('rel-resumo-card').style.display = 'none';
    document.getElementById('rel-acao').style.display = 'none';
  }
}

function setModoImport(modo) {
  const isPdf = modo === 'pdf';
  document.getElementById('mode-pdf').style.display  = isPdf ? 'block' : 'none';
  document.getElementById('mode-json').style.display = isPdf ? 'none'  : 'block';
  document.getElementById('tab-pdf').className  = 'mode-btn ' + (isPdf ? 'active' : 'inactive');
  document.getElementById('tab-json').className = 'mode-btn ' + (isPdf ? 'inactive' : 'active');
}

function processarTextoPDF() {
  if (!obraImport) { alert('Seleciona a obra de destino primeiro.'); return; }
  const texto = document.getElementById('txt-pdf').value.trim();
  if (!texto)  { alert('Cola o texto do PDF primeiro.'); return; }
  itensPrevImport = [];
  const linhas = texto.split('\n').map(l => l.trim()).filter(l => l.length > 5);
  const reArtigo = /^(\d+\.\d[\d.]*)/;
  for (const linha of linhas) {
    if (/total|iva|preço|fercayo|nipc|email|página|data:|artigo|designação|unid\.|parciais|capital social/i.test(linha)) continue;
    if (/^\d+[,.]?\d*\s*€/.test(linha)) continue;
    if (linha.length < 8) continue;
    const matchArtigo = linha.match(reArtigo);
    if (!matchArtigo) continue;
    const artigo = matchArtigo[1];
    const resto  = linha.slice(artigo.length).trim();
    const matchDims = resto.match(/(\d{3,4}[xX×]\d{3,4}(?:[xX×]\d{2,4})?(?:mm)?)/);
    const dims = matchDims ? matchDims[1] : '';
    const matchRef = resto.match(/\([-\w]+\)/);
    const ref = matchRef ? matchRef[0] : '';
    const matchQt = resto.match(/\b(\d+[,.]?\d*)\s*(un|ml|m2|m3)\b/i);
    const quant = matchQt ? matchQt[1] : '';
    const unid  = matchQt ? matchQt[2] : '';
    let descricao = resto
      .replace(/\b\d+[,.]?\d*\s*€/g, '')
      .replace(/\b(un|ml|m2|m3)\b.*$/i, '')
      .trim();
    if (descricao.length < 4) continue;
    itensPrevImport.push({
      obraId:    obraImport.id,
      artigo,
      descricao: descricao.substring(0, 150),
      nome:      descricao.substring(0, 150),
      tipo:      '',
      dims,
      ref,
      quant,
      unid,
      material:  '',
      seccao:    '',
      nota_reuniao: '',
      estado:    'pendente',
      criadoEm:  Date.now()
    });
  }
  mostrarPreVisualizacao();
}

function processarJSON() {
  if (!obraImport) { alert('Seleciona a obra de destino primeiro.'); return; }
  const texto = document.getElementById('txt-json').value.trim();
  if (!texto)  { alert('Cola o JSON primeiro.'); return; }
  let parsed;
  try {
    parsed = JSON.parse(texto);
  } catch (e) {
    alert('JSON inválido. Verifica o formato.\n\n' + e.message);
    return;
  }
  if (!Array.isArray(parsed)) {
    alert('O JSON deve ser uma lista (array) de itens.');
    return;
  }
  itensPrevImport = parsed.map(it => ({
    obraId:    obraImport.id,
    artigo:    it.artigo    || '',
    descricao: it.descricao || it.nome || '',
    nome:      it.descricao || it.nome || '',
    tipo:      it.tipo      || '',
    dims:      it.dims      || it.dimensoes || '',
    ref:       it.ref       || it.referencia || '',
    quant:     it.quant     || it.quantidade || '',
    unid:      it.unid      || it.unidade    || '',
    material:  it.material  || it.cor        || '',
    seccao:    it.seccao    || it.secção      || '',
    nota:      '',
    estado:    'pendente',
    criadoEm:  Date.now()
  }));
  mostrarPreVisualizacao();
}

function mostrarPreVisualizacao() {
  if (!itensPrevImport.length) {
    alert('Nenhum item reconhecido. Verifica o formato.');
    return;
  }
  document.getElementById('ext-cnt').textContent = `${itensPrevImport.length} itens`;
  document.getElementById('ext-prev-card').style.display = 'block';
  document.getElementById('ext-prev').innerHTML = itensPrevImport.map((item, idx) => `
    <div class="prev-item">
      <div class="prev-art">${item.artigo || '—'}</div>
      <div class="prev-nm">${(item.descricao || '').substring(0, 70)}</div>
      <div class="prev-dims">${item.dims}</div>
      <div class="prev-tipo">${item.tipo}</div>
      <div style="font-family:'DM Mono',monospace;font-size:10px;color:var(--text2)">${item.quant} ${item.unid}</div>
      <button onclick="removerItemPreview(${idx})"
              style="background:none;border:none;color:var(--red);cursor:pointer;font-size:14px;padding:0">✕</button>
    </div>
  `).join('');
}

function removerItemPreview(indice) {
  itensPrevImport.splice(indice, 1);
  mostrarPreVisualizacao();
}

async function confirmarImportacao() {
  if (!itensPrevImport.length) return;
  for (const item of itensPrevImport) {
    await dbEscrever(db, 'itens', item);
  }
  const idObra = itensPrevImport[0].obraId;
  alert(`✓ ${itensPrevImport.length} itens importados para ${obraImport.codigo}!`);
  itensPrevImport = [];
  limparObraContexto('ext');
  document.getElementById('ext-prev-card').style.display = 'none';
  document.getElementById('txt-pdf').value  = '';
  document.getElementById('txt-json').value = '';
  obraAtual = todasObras.find(o => o.id === idObra);
  mostrarPainel('checklist');
  renderizarObras();
  await carregarItens();
}

function cancelarImportacao() {
  itensPrevImport = [];
  document.getElementById('ext-prev-card').style.display = 'none';
}
