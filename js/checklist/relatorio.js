/* ═══════════════════════════════════════════════════════════════
   Fercayo · Checklist · Relatório de Campo + Geração PDF
   Depende de: shared/db.js, checklist/state.js
   ═══════════════════════════════════════════════════════════════ */

async function renderizarResumoRelatorio() {
  if (!obraRelatorio) return;
  const itens = await dbLerPorIndice(db, 'itens', 'obraId', obraRelatorio.id);
  const contadores = { pendente: 0, conferido: 0, alteracao: 0, anulado: 0, extra: 0 };
  itens.forEach(i => { if (contadores[i.estado] !== undefined) contadores[i.estado]++; });
  document.getElementById('rel-resumo-card').style.display = 'block';
  document.getElementById('rel-acao').style.display = 'flex';
  document.getElementById('rel-resumo-body').innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:12px">
      <div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:10px">
        <div style="font-size:20px;font-weight:700;color:var(--estado-pendente)">${contadores.pendente}</div>
        <div style="font-size:10px;color:var(--text3)">Pendente</div>
      </div>
      <div style="background:var(--bg3);border:1px solid rgba(76,175,125,.3);border-radius:8px;padding:10px">
        <div style="font-size:20px;font-weight:700;color:var(--estado-conferido)">${contadores.conferido}</div>
        <div style="font-size:10px;color:var(--text3)">Conferido</div>
      </div>
      <div style="background:var(--bg3);border:1px solid rgba(224,138,60,.3);border-radius:8px;padding:10px">
        <div style="font-size:20px;font-weight:700;color:var(--estado-alteracao)">${contadores.alteracao}</div>
        <div style="font-size:10px;color:var(--text3)">Alteração</div>
      </div>
      <div style="background:var(--bg3);border:1px solid rgba(224,82,82,.3);border-radius:8px;padding:10px">
        <div style="font-size:20px;font-weight:700;color:var(--estado-anulado)">${contadores.anulado}</div>
        <div style="font-size:10px;color:var(--text3)">Anulado</div>
      </div>
      <div style="background:var(--bg3);border:1px solid rgba(74,158,255,.3);border-radius:8px;padding:10px">
        <div style="font-size:20px;font-weight:700;color:var(--estado-extra)">${contadores.extra}</div>
        <div style="font-size:10px;color:var(--text3)">Extra</div>
      </div>
    </div>
    <div style="font-size:12px;color:var(--text2)">
      <b>${itens.length}</b> itens ·
      <b style="color:var(--estado-conferido)">${contadores.conferido} Conferidos</b> ·
      <b style="color:var(--estado-alteracao)">${contadores.alteracao} Alterações</b> ·
      <b style="color:var(--estado-anulado)">${contadores.anulado} Anulados</b> ·
      <b style="color:var(--estado-extra)">${contadores.extra} Extra</b>
    </div>`;
}

async function gerarPDF() {
  if (!obraRelatorio) return;
  const obra  = obraRelatorio;
  const itens = await dbLerPorIndice(db, 'itens', 'obraId', obra.id);
  const hoje  = new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const cont = { pendente: 0, conferido: 0, alteracao: 0, anulado: 0, extra: 0 };
  itens.forEach(i => { if (cont[i.estado] !== undefined) cont[i.estado]++; });
  const simbolo = { pendente: '○', conferido: '✓', alteracao: '△', anulado: '✕', extra: '+' };
  const etiqueta = { pendente: 'Pendente', conferido: 'Conferido', alteracao: 'Alteração', anulado: 'Anulado', extra: 'Extra' };
  const corPDF   = { pendente: '#aaa', conferido: '#4caf7d', alteracao: '#e08a3c', anulado: '#e05252', extra: '#4a9eff' };
  const seccoes = {};
  itens.forEach(i => {
    const s = i.seccao || 'Geral';
    if (!seccoes[s]) seccoes[s] = [];
    seccoes[s].push(i);
  });
  let linhasTabela = '';
  Object.entries(seccoes).forEach(([seccao, itensSeccao]) => {
    linhasTabela += `<tr><td colspan="6" class="sec-hdr">${seccao}</td></tr>`;
    itensSeccao.forEach((item, idx) => {
      const isConferido = item.estado === 'conferido';
      const isAnulado   = item.estado === 'anulado';
      const isExtra     = item.estado === 'extra';
      const classeRow   = isAnulado ? 'row-anulado' : isConferido ? 'row-conferido' : isExtra ? 'row-extra' : '';
      linhasTabela += `
        <tr class="${classeRow}">
          <td class="td-num">${idx + 1}</td>
          <td class="td-art">${item.artigo || '—'}</td>
          <td class="td-desc">
            <div class="desc-princ">${item.descricao || item.nome || '—'}</div>
            <div class="desc-meta">
              ${[item.tipo, item.dims, item.ref, item.material].filter(Boolean).join(' · ')}
            </div>
            ${item.nota ? `<div class="desc-nota nota-${item.estado}">📝 ${item.nota}</div>` : ''}
          </td>
          <td class="td-qt">${item.quant || '—'} ${item.unid || ''}</td>
          <td class="td-est" style="color:${corPDF[item.estado] || '#aaa'}">
            ${simbolo[item.estado] || '○'} ${etiqueta[item.estado] || ''}
          </td>
          <td class="td-check">
            <div class="chk">○ Conf.</div>
            <div class="chk">○ Alt.</div>
            <div class="chk">○ Anul.</div>
          </td>
        </tr>
        <tr class="linha-nota">
          <td colspan="6">
            ${item.nota
              ? `<div class="nota-impressa nota-${item.estado}">📝 ${item.nota}</div>`
              : `<div class="linha-ms">Nota: ___________________________________________________________________________________________________________</div>`
            }
          </td>
        </tr>`;
    });
  });
  const htmlPDF = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  @page { size: A4; margin: 12mm 10mm 14mm 10mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Calibri, Arial, sans-serif; font-size: 9pt; color: #111; background: #fff; }
  .cabecalho { border-bottom: 2px solid #333E48; padding-bottom: 8px; margin-bottom: 8px; }
  .cab-top   { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
  .cab-logo  { font-size: 14pt; font-weight: 700; color: #333E48; letter-spacing: 2px; }
  .cab-sub   { font-size: 7pt; color: #6A7079; letter-spacing: 2px; }
  .cab-obra  { font-size: 12pt; font-weight: 700; color: #333E48; margin-bottom: 2px; }
  .cab-meta  { font-size: 8pt; color: #6A7079; display: flex; gap: 16px; flex-wrap: wrap; }
  .resumo { display: flex; gap: 6px; margin-bottom: 8px; }
  .res    { flex: 1; border: 1px solid #ddd; border-radius: 4px; padding: 5px 8px; text-align: center; }
  .res-n  { font-size: 14pt; font-weight: 700; }
  .res-l  { font-size: 7pt; color: #888; text-transform: uppercase; }
  table { width: 100%; border-collapse: collapse; }
  th    { background: #333E48; color: #fff; font-size: 7.5pt; padding: 4px 5px; text-align: left; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
  td    { border-bottom: 1px solid #e8e8e8; padding: 3px 5px; vertical-align: top; font-size: 8.5pt; }
  .sec-hdr  { background: #AF7C34; color: #fff; font-size: 8pt; font-weight: 700; padding: 4px 8px; letter-spacing: 1px; text-transform: uppercase; }
  .td-num   { color: #aaa; font-size: 7.5pt; width: 18px; text-align: center; }
  .td-art   { font-family: monospace; font-size: 7.5pt; color: #AF7C34; width: 70px; white-space: nowrap; }
  .td-qt    { font-family: monospace; font-size: 7.5pt; color: #555; width: 45px; text-align: center; white-space: nowrap; }
  .td-est   { font-size: 7.5pt; font-weight: 600; width: 60px; text-align: center; white-space: nowrap; }
  .td-check { width: 72px; padding: 2px 4px; }
  .desc-princ { font-size: 8.5pt; font-weight: 500; line-height: 1.3; }
  .desc-meta  { font-size: 7.5pt; color: #888; margin-top: 1px; font-family: monospace; }
  .chk { font-size: 7pt; color: #555; line-height: 1.5; }
  .linha-nota td { padding: 1px 5px 4px; border-bottom: 1px solid #f0f0f0; }
  .linha-ms   { font-size: 7.5pt; color: #ccc; }
  .nota-impressa  { font-size: 7.5pt; font-style: italic; padding: 2px 6px; border-radius: 2px; margin-top: 1px; }
  .nota-alteracao { color: #e08a3c; border-left: 2px solid #e08a3c; background: #fff8f0; }
  .nota-extra     { color: #4a9eff; border-left: 2px solid #4a9eff; background: #f0f7ff; }
  .nota-conferido { color: #4caf7d; border-left: 2px solid #4caf7d; background: #f0fff5; }
  .row-conferido .desc-princ { color: #aaa; }
  .row-conferido .td-art     { color: #ccc; }
  .row-conferido              { background: #f9fff9; }
  .row-anulado                { background: #fff5f5; opacity: .7; }
  .row-anulado .desc-princ   { text-decoration: line-through; color: #aaa; }
  .row-extra                  { background: #f5f9ff; }
  .row-extra .desc-princ     { color: #2a5f9f; font-weight: 600; }
  .assinaturas   { margin-top: 16px; border-top: 1px solid #333E48; padding-top: 10px; }
  .ass-titulo    { font-size: 8pt; font-weight: 700; color: #333E48; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; }
  .ass-grid      { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
  .ass-item      { display: flex; flex-direction: column; gap: 4px; }
  .ass-papel     { font-size: 7.5pt; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 1px; }
  .ass-linha     { border-bottom: 1px solid #333; height: 24px; margin: 12px 0 3px; }
  .ass-data      { font-size: 7pt; color: #aaa; }
  .rodape { margin-top: 10px; border-top: 1px solid #eee; padding-top: 5px; display: flex; justify-content: space-between; font-size: 7pt; color: #bbb; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
  <div class="cabecalho">
    <div class="cab-top">
      <span class="cab-logo">FERCAYO</span>
      <span class="cab-sub">CARPINTARIAS</span>
    </div>
    <div class="cab-obra">${obra.codigo} · ${obra.nome}</div>
    <div class="cab-meta">
      ${obra.orc ? `<span>ORC: <b>${obra.orc}</b></span>` : ''}
      <span>Data: <b>${hoje}</b></span>
    </div>
  </div>
  <div class="resumo">
    <div class="res"><div class="res-n" style="color:#aaa">${cont.pendente}</div><div class="res-l">Pendente</div></div>
    <div class="res"><div class="res-n" style="color:#4caf7d">${cont.conferido}</div><div class="res-l">Conferido</div></div>
    <div class="res"><div class="res-n" style="color:#e08a3c">${cont.alteracao}</div><div class="res-l">Alteração</div></div>
    <div class="res"><div class="res-n" style="color:#e05252">${cont.anulado}</div><div class="res-l">Anulado</div></div>
    <div class="res"><div class="res-n" style="color:#4a9eff">${cont.extra}</div><div class="res-l">Extra</div></div>
    <div class="res"><div class="res-n" style="color:#333E48">${itens.length}</div><div class="res-l">Total</div></div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width:18px">#</th>
        <th style="width:70px">Artigo</th>
        <th>Descrição / Especificação</th>
        <th style="width:45px;text-align:center">Qt/Un</th>
        <th style="width:60px;text-align:center">Estado</th>
        <th style="width:72px;text-align:center">Verificação</th>
      </tr>
    </thead>
    <tbody>${linhasTabela}</tbody>
  </table>
  <div class="assinaturas">
    <div class="ass-titulo">Assinaturas</div>
    <div class="ass-grid">
      <div class="ass-item">
        <div class="ass-papel">Representante Fercayo</div>
        <div class="ass-linha"></div>
        <div class="ass-data">Data: _____ / _____ / _______</div>
      </div>
      <div class="ass-item">
        <div class="ass-papel">Responsável de Obra</div>
        <div class="ass-linha"></div>
        <div class="ass-data">Data: _____ / _____ / _______</div>
      </div>
    </div>
  </div>
  <div class="rodape">
    <span>Fercayo · Carpintarias, Lda · NIPC 517 016 338</span>
    <span>Rua Manuel José Moreira, 835 · 4570-366 Laúndos, Póvoa de Varzim</span>
    <span>geral@fercayo.pt · 252 601 189</span>
  </div>
</body></html>`;
  const janela = window.open('', '_blank');
  janela.document.write(htmlPDF);
  janela.document.close();
  setTimeout(() => janela.print(), 600);
}
