/* ═══════════════════════════════════════════════════════════════
   Fercayo · Checklist · Ata de Reunião
   Depende de: checklist/state.js, checklist/itens.js
   ═══════════════════════════════════════════════════════════════ */

let ataParticipantes  = [];
let ataApenasComNotas = false;
let ataEstados = new Set(['pendente','conferido','alteracao','anulado','extra']);

function toggleAtaEstado(estado, btn) {
  if (ataEstados.has(estado)) {
    ataEstados.delete(estado);
    btn.classList.remove('active');
  } else {
    ataEstados.add(estado);
    btn.classList.add('active');
  }
  atualizarPreviewAta();
}

async function atualizarOrcObra(valor) {
  if (!obraAtual) return;
  obraAtual.orc = valor.trim();
  await dbEscrever(db, 'obras', obraAtual);
  /* atualizar lista local */
  const idx = todasObras.findIndex(o => o.id === obraAtual.id);
  if (idx !== -1) todasObras[idx].orc = obraAtual.orc;
  atualizarPreviewAta();
}

function abrirAta() {
  mostrarPainel('ata');

  /* restaurar campos guardados ou aplicar defaults */
  const saved = JSON.parse(localStorage.getItem('ck_ata') || '{}');
  const hoje  = new Date();
  const dataEl = document.getElementById('ata-data');
  const horaEl = document.getElementById('ata-hora');
  if (saved.data)    dataEl.value = saved.data;
  else if (!dataEl.value) dataEl.value = hoje.toISOString().slice(0, 10);
  if (saved.hora)    horaEl.value = saved.hora;
  else if (!horaEl.value) horaEl.value = '10:00';
  if (saved.local)   document.getElementById('ata-local').value   = saved.local;
  if (saved.assunto) document.getElementById('ata-assunto').value = saved.assunto;
  if (saved.obs)     document.getElementById('ata-obs').value     = saved.obs;
  if (saved.participantes) {
    ataParticipantes = saved.participantes;
    renderizarParticipantes();
  }

  /* preencher ORC com o valor da obra */
  const orcEl = document.getElementById('ata-orc-edit');
  if (orcEl) orcEl.value = obraAtual?.orc || '';

  renderizarAtaObra();
  atualizarPreviewAta();
}

function renderizarAtaObra() {
  const el = document.getElementById('ata-obra-info');
  if (!obraAtual) {
    el.innerHTML = `<div style="font-size:11px;color:var(--text3)">
      Nenhuma obra seleccionada — vai ao Checklist e selecciona uma obra primeiro.
    </div>`;
    return;
  }
  el.innerHTML = `
    <div class="obra-tag">
      <span class="cod">${obraAtual.codigo}</span>
      <span class="nm">${obraAtual.nome}</span>
    </div>`;
}

function adicionarParticipante() {
  const inp  = document.getElementById('ata-part-inp');
  const nome = inp.value.trim();
  if (!nome) return;
  ataParticipantes.push(nome);
  inp.value = '';
  renderizarParticipantes();
  atualizarPreviewAta();
}

function removerParticipante(idx) {
  ataParticipantes.splice(idx, 1);
  renderizarParticipantes();
  atualizarPreviewAta();
}

function renderizarParticipantes() {
  document.getElementById('ata-part-tags').innerHTML =
    ataParticipantes.map((n, i) => `
      <div class="part-tag">
        ${n}
        <span class="rm" onclick="removerParticipante(${i})">✕</span>
      </div>
    `).join('');
}

function atualizarPreviewAta() {
  const data      = document.getElementById('ata-data')?.value     || '';
  const hora      = document.getElementById('ata-hora')?.value     || '';
  const local     = document.getElementById('ata-local')?.value    || '';
  const assunto   = document.getElementById('ata-assunto')?.value  || '';
  const obsGerais = document.getElementById('ata-obs')?.value      || '';

  /* format date */
  let dataFmt = '—';
  if (data) {
    const d = new Date(data + 'T12:00:00');
    dataFmt = d.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  /* filter items */
  let itens = [...(itensObra || [])];
  itens = itens.filter(i => ataEstados.has(i.estado));
  if (ataApenasComNotas) itens = itens.filter(i => i.nota_reuniao || i.nota);

  const estadoLabel = {
    pendente:  '○ Pendente',
    conferido: '✔ Conferido',
    alteracao: '⚠ Alteração',
    anulado:   '✕ Anulado',
    extra:     '＋ Extra',
  };
  const estadoCor = {
    pendente:  '#6A7079',
    conferido: '#4caf7d',
    alteracao: '#e08a3c',
    anulado:   '#e05252',
    extra:     '#4a9eff',
  };

  /* guardar estado */
  localStorage.setItem('ck_ata', JSON.stringify({
    data: data, hora: hora, local: local, assunto: assunto,
    obs: obsGerais, participantes: ataParticipantes,
  }));

  /* update preview fields */
  document.getElementById('ata-prev-data').textContent     = dataFmt;
  document.getElementById('ata-prev-hora').textContent     = hora || '—';
  document.getElementById('ata-prev-local').textContent    = local || '—';
  document.getElementById('ata-prev-assunto').textContent  = assunto || 'Conferência de Orçamento';
  document.getElementById('ata-prev-obra').textContent     =
    obraAtual ? `${obraAtual.codigo} · ${obraAtual.nome}` : '—';
  const orcAtual = document.getElementById('ata-orc-edit')?.value || obraAtual?.orc || '';
  document.getElementById('ata-prev-orc').textContent      = orcAtual || '—';
  document.getElementById('ata-prev-partic').textContent   =
    ataParticipantes.length ? ataParticipantes.join(' · ') : '—';

  /* itens */
  document.getElementById('ata-prev-itens').innerHTML = itens.length
    ? itens.map(item => `
        <div class="ata-item-row">
          <div class="ata-item-art">${item.artigo || 'Extra'}</div>
          <div class="ata-item-desc">
            ${item.descricao || item.nome || '—'}
            ${item.dims ? ' · ' + item.dims : ''}
          </div>
          <div class="ata-item-estado" style="color:${estadoCor[item.estado] || '#999'}">
            ${estadoLabel[item.estado] || item.estado}
          </div>
        </div>
        ${(item.nota_reuniao || item.nota)
          ? `<div class="ata-item-nota">${item.nota_reuniao || item.nota}</div>`
          : ''}
      `).join('')
    : '<div style="color:#aaa;font-size:11px;padding:8px 0">Sem itens carregados</div>';

  /* observações */
  const obsWrap = document.getElementById('ata-prev-obs-wrap');
  const obsEl   = document.getElementById('ata-prev-obs');
  if (obsGerais) {
    obsWrap.style.display = 'block';
    obsEl.textContent     = obsGerais;
  } else {
    obsWrap.style.display = 'none';
  }

  /* assinaturas */
  const parts = ataParticipantes.length
    ? ataParticipantes
    : ['_________________________', '_________________________'];
  document.getElementById('ata-assinaturas').innerHTML =
    parts.map(n => `
      <div class="ata-ass-box">
        <div class="ata-ass-nome">${n}</div>
      </div>
    `).join('');
}

function imprimirAta() {
  window.print();
}
