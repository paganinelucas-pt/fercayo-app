/* ═══════════════════════════════════════════════════════════════
   Fercayo · Levantamento · Gestão de Fotos + Resumo
   Depende de: levantamento/state.js, levantamento/navigation.js
   ═══════════════════════════════════════════════════════════════ */

function addFoto() {
  fotoCount++;
  const id = fotoCount;
  fotos.push({ id, ref: '', ambiente: '', desc: '', notas: '', imgData: null });
  const item = document.createElement('div');
  item.className = 'foto-item';
  item.id = `foto-item-${id}`;
  item.innerHTML = `<div class="foto-item-header"><span class="foto-item-num">Fotografia ${String(fotos.length).padStart(2, '0')}</span><button class="foto-item-remove" onclick="removeFoto(${id})">✕</button></div><div class="foto-item-body"><div class="field-row" style="margin-bottom:10px"><div class="field" style="margin:0"><label>Referência</label><input type="text" placeholder="231_coz_01" oninput="updateFoto(${id},'ref',this.value)"></div><div class="field" style="margin:0"><label>Ambiente</label><input type="text" placeholder="Cozinha..." oninput="updateFoto(${id},'ambiente',this.value)"></div></div><div class="field" style="margin-bottom:10px"><label>Descrição / Elemento</label><input type="text" placeholder="O que a foto mostra..." oninput="updateFoto(${id},'desc',this.value)"></div><div class="photo-upload" id="upload-${id}" onclick="triggerUpload(${id})"><input type="file" id="file-${id}" accept="image/*" onchange="handlePhoto(${id},this)"><div class="upload-icon">📷</div><div class="upload-text">Selecionar ou tirar fotografia</div><div class="upload-sub">Câmara ou galeria</div><img class="photo-preview" id="preview-${id}"><button class="photo-remove" id="remove-${id}" onclick="removePhoto(event,${id})">✕</button></div><div class="field" style="margin-top:10px;margin-bottom:0"><label>Notas / Interferências</label><textarea placeholder="Observações, interferências..." rows="2" oninput="updateFoto(${id},'notas',this.value)"></textarea></div></div>`;
  document.getElementById('foto-list').appendChild(item);
  item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function removeFoto(id) {
  autoSave();
  if (fotos.length <= 1) return;
  fotos = fotos.filter(f => f.id !== id);
  document.getElementById(`foto-item-${id}`).remove();
  document.querySelectorAll('.foto-item-num').forEach((el, i) => {
    el.textContent = `Fotografia ${String(i + 1).padStart(2, '0')}`;
  });
}

function updateFoto(id, field, val) {
  autoSave();
  const f = fotos.find(f => f.id === id);
  if (f) f[field] = val;
}

function triggerUpload(id) {
  document.getElementById(`file-${id}`).click();
}

function handlePhoto(id, input) {
  if (!input.files || !input.files[0]) return;
  const reader = new FileReader();
  reader.onload = e => {
    const data = e.target.result;
    const f = fotos.find(f => f.id === id);
    if (f) f.imgData = data;
    const upload = document.getElementById(`upload-${id}`);
    document.getElementById(`preview-${id}`).src = data;
    document.getElementById(`preview-${id}`).classList.add('visible');
    document.getElementById(`remove-${id}`).classList.add('visible');
    upload.classList.add('has-photo');
    upload.querySelector('.upload-icon').style.display = 'none';
    upload.querySelector('.upload-text').style.display = 'none';
    upload.querySelector('.upload-sub').style.display = 'none';
  };
  reader.readAsDataURL(input.files[0]);
}

function removePhoto(e, id) {
  e.stopPropagation();
  const f = fotos.find(f => f.id === id);
  if (f) f.imgData = null;
  const upload = document.getElementById(`upload-${id}`);
  document.getElementById(`preview-${id}`).src = '';
  document.getElementById(`preview-${id}`).classList.remove('visible');
  document.getElementById(`remove-${id}`).classList.remove('visible');
  upload.classList.remove('has-photo');
  upload.querySelector('.upload-icon').style.display = '';
  upload.querySelector('.upload-text').style.display = '';
  upload.querySelector('.upload-sub').style.display = '';
  document.getElementById(`file-${id}`).value = '';
}

function renderFotos() {
  const lista = document.getElementById('foto-list');
  lista.innerHTML = '';
  fotos.forEach(f => {
    const item = document.createElement('div');
    item.className = 'foto-item';
    item.id = `foto-item-${f.id}`;
    item.innerHTML = `<div class="foto-item-header"><span class="foto-item-num">Fotografia ${String(fotos.indexOf(f) + 1).padStart(2, '0')}</span><button class="foto-item-remove" onclick="removeFoto(${f.id})">✕</button></div><div class="foto-item-body"><div class="field-row" style="margin-bottom:10px"><div class="field" style="flex:1"><label>Referência</label><input type="text" id="ref-${f.id}" value="${escHtml(f.ref || '')}" oninput="updateFoto(${f.id},'ref',this.value)" placeholder="ex: 231_cozinha_01"></div><div class="field" style="flex:1"><label>Ambiente</label><input type="text" id="amb-${f.id}" value="${escHtml(f.ambiente || '')}" oninput="updateFoto(${f.id},'ambiente',this.value)" placeholder="ex: Cozinha"></div></div><div class="field"><label>Descrição / Elemento</label><input type="text" id="desc-${f.id}" value="${escHtml(f.desc || '')}" oninput="updateFoto(${f.id},'desc',this.value)" placeholder="ex: Parede lateral com tomada"></div><div class="field" style="margin-top:6px"><label>Notas</label><textarea id="notas-${f.id}" oninput="updateFoto(${f.id},'notas',this.value)" placeholder="Observações sobre esta fotografia..." style="min-height:56px">${escHtml(f.notas || '')}</textarea></div>${f.imgData ? `<div class="foto-preview-wrap" style="position:relative;margin-top:8px"><img src="${f.imgData}" class="photo-preview" style="display:block"><button class="photo-remove" style="display:flex" onclick="removeImg(${f.id})">✕</button></div>` : `<button class="add-foto-btn" onclick="triggerCamera(${f.id})">📷 Adicionar Fotografia</button><input type="file" id="file-${f.id}" accept="image/*" capture="environment" style="display:none" onchange="handleFile(${f.id},this)">`}</div>`;
    lista.appendChild(item);
  });
}

function buildSummary() {
  const vals = {
    'Código da Obra': document.getElementById('cod-obra').value || '—',
    'Morada': document.getElementById('morada').value || '—',
    'Cliente': document.getElementById('cliente').value || '—',
    'Medidor': getMedidor(),
    'Data': document.getElementById('data-lev').value || '—',
    'Diretor de Obra': getDiretor(),
    'Revisão': document.getElementById('revisao').value || '—',
    'Tipo': selections['tipo'] || '—',
    'Fase': selections['fase'] || '—'
  };
  document.getElementById('summary-content').innerHTML = `<div class="summary-block"><div class="summary-head">Identificação <span class="summary-edit" onclick="goToStep(0)">Editar</span></div><div class="summary-body">${Object.entries(vals).map(([k, v]) => `<div class="summary-row"><span class="s-label">${escHtml(k)}</span><span class="s-val">${escHtml(v)}</span></div>`).join('')}</div></div><div class="summary-block"><div class="summary-head">Acesso <span class="summary-edit" onclick="goToStep(1)">Editar</span></div><div class="summary-body"><div class="summary-row"><span class="s-label">Encarregado</span><span class="s-val">${document.getElementById('encarregado').value || '—'}</span></div><div class="summary-row"><span class="s-label">Horário</span><span class="s-val">${document.getElementById('horario').value || '—'}</span></div></div></div><div class="summary-block"><div class="summary-head">Fotografias — ${fotos.length} registo(s) <span class="summary-edit" onclick="goToStep(2)">Editar</span></div><div class="summary-body">${fotos.map((f, i) => `<div class="summary-row"><span class="s-label">${f.ref || `Foto ${i + 1}`}</span><span class="s-val">${f.ambiente || '—'} ${f.imgData ? '📷' : '⚠ Sem foto'}</span></div>`).join('')}</div></div>`;
}
