/* ═══════════════════════════════════════════════════════════════
   Fercayo · Levantamento · Ficha de Levantamento PDF
   ═══════════════════════════════════════════════════════════════ */

function exportarFichaLevantamento() {
  if (!obraAtual) { mostrarToast('Selecciona uma obra primeiro'); return; }
  if (!artigos.length) { mostrarToast('Sem artigos para exportar'); return; }

  const hoje = new Date().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' });

  const TIPO_LABEL = {
    porta: '🚪 Porta', apainelado: '🪟 Apainelado',
    lambrim: '▬ Lambrim', roupeiro: '🗄 Roupeiro',
    cozinha: '🍳 Cozinha / Móvel', outro: '📦 Outro',
  };
  const ESTADO_LABEL = {
    pendente: 'Pendente', conferido: 'Conferido',
    alteracao: 'Alteração', anulado: 'Anulado', extra: 'Extra',
  };
  const ESTADO_COR = {
    pendente: '#888', conferido: '#4caf7d',
    alteracao: '#e08a3c', anulado: '#e05252', extra: '#4a9eff',
  };

  function formatarMedicaoPDF(artigo) {
    const med  = artigo.medicao || {};
    const txt  = [artigo.descricao, artigo.tipo, artigo.nome].filter(Boolean).join(' ').toLowerCase();
    let tipo   = 'outro';
    if      (/apainelado|painel.*madei|revestim.*madei/.test(txt)) tipo = 'apainelado';
    else if (/lambrim|rodap/.test(txt))                            tipo = 'lambrim';
    else if (/roup[ae]iro/.test(txt))                              tipo = 'roupeiro';
    else if (/cozinha|m[oó]vel.*complex|bancada/.test(txt))        tipo = 'cozinha';
    else if (/port[ao]|batente|correr|sanfona|folha.*abri|aro.*porta/.test(txt)) tipo = 'porta';

    const campos = [];
    if (tipo === 'porta') {
      if (med.altura       != null && med.altura       !== '') campos.push(['Altura',       med.altura       + ' mm']);
      if (med.largura      != null && med.largura      !== '') campos.push(['Largura',      med.largura      + ' mm']);
      if (med.profundidade != null && med.profundidade !== '') campos.push(['Profundidade', med.profundidade + ' mm']);
      if (med.sentido)    campos.push(['Sentido',    med.sentido.charAt(0).toUpperCase() + med.sentido.slice(1)]);
      if (med.tipo_porta)  campos.push(['Tipo',       med.tipo_porta.charAt(0).toUpperCase() + med.tipo_porta.slice(1)]);
    } else if (tipo === 'apainelado') {
      if (med.comprimento != null && med.comprimento !== '') campos.push(['Comprimento', med.comprimento + ' mm']);
      if (med.altura      != null && med.altura      !== '') campos.push(['Altura',      med.altura      + ' mm']);
      const extr = ['esq','dir','cima','baixo'].filter(e => med['extrem_' + e]).join(', ');
      if (extr) campos.push(['Extremidades', extr]);
    } else if (tipo === 'lambrim') {
      if (med.metros != null && med.metros !== '') campos.push(['Metros lineares', med.metros + ' m']);
      if (med.altura != null && med.altura !== '') campos.push(['Altura',          med.altura + ' mm']);
    }
    return { tipo, campos };
  }

  const artigosComDados = artigos.filter(a =>
    (a.medicao && Object.keys(a.medicao).some(k => a.medicao[k] !== '' && a.medicao[k] != null)) ||
    a.nota_levantamento ||
    (a.fotos && a.fotos.length)
  );

  const blocos = (artigosComDados.length ? artigosComDados : artigos).map(artigo => {
    const { tipo, campos } = formatarMedicaoPDF(artigo);
    const estadoCor = ESTADO_COR[artigo.estado] || '#888';

    const camposHTML = campos.length
      ? `<div class="campo-grid">${campos.map(([l, v]) =>
          `<div class="campo-lbl">${l}</div><div class="campo-val">${v}</div>`
        ).join('')}</div>`
      : '';

    const notaLevHTML = artigo.nota_levantamento
      ? `<div class="nota-lev"><b>Nota levantamento:</b><br>${artigo.nota_levantamento.replace(/\n/g, '<br>')}</div>`
      : '';

    const fotosHTML = (artigo.fotos || []).length
      ? `<div class="fotos-grid">${artigo.fotos.map(url =>
          `<img src="${url}" class="foto-thumb">`
        ).join('')}</div>`
      : '';

    return `
      <div class="artigo">
        <div class="artigo-hdr">
          <span class="artigo-cod">${artigo._simbolo || ''}</span>
          <span class="artigo-cod2">${artigo.artigo || '—'}</span>
          <span class="artigo-desc">${(artigo.descricao || artigo.nome || '—').substring(0, 80)}</span>
          <span class="artigo-tipo">${TIPO_LABEL[tipo] || tipo}</span>
          <span class="artigo-estado" style="color:${estadoCor}">${ESTADO_LABEL[artigo.estado] || '—'}</span>
        </div>
        ${camposHTML || notaLevHTML || fotosHTML
          ? `<div class="artigo-body">${camposHTML}${notaLevHTML}${fotosHTML}</div>`
          : ''}
      </div>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<title>Ficha Levantamento · ${obraAtual.codigo}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #222; background: #fff; padding: 20px; }

  .header { display: flex; justify-content: space-between; align-items: flex-start;
            border-bottom: 2px solid #AF7C34; padding-bottom: 14px; margin-bottom: 18px; }
  .logo-bloco .logo { font-size: 18px; font-weight: 700; letter-spacing: 3px; color: #AF7C34; }
  .logo-bloco .logo-sub { font-size: 8px; letter-spacing: 2px; color: #aaa; margin-top: 2px; }
  .doc-bloco { text-align: right; }
  .doc-bloco .doc-title { font-size: 13px; font-weight: 700; color: #333; margin-bottom: 4px; }
  .doc-bloco .doc-sub { font-size: 10px; color: #777; }
  .obra-tag { margin-bottom: 16px; padding: 8px 12px; border: 1px solid #eee;
              border-radius: 4px; background: #fafafa; display: flex; gap: 10px; align-items: baseline; }
  .obra-cod { font-family: monospace; font-size: 11px; color: #AF7C34; font-weight: 700; }
  .obra-nm  { font-size: 12px; font-weight: 600; color: #333; }
  .obra-orc { font-family: monospace; font-size: 10px; color: #888; }

  .artigo { margin-bottom: 10px; border: 1px solid #ddd; border-radius: 4px; page-break-inside: avoid; }
  .artigo-hdr { background: #f7f7f7; padding: 7px 10px; display: flex; gap: 8px;
                align-items: baseline; flex-wrap: wrap; }
  .artigo-cod  { font-family: monospace; font-size: 10px; color: #AF7C34; font-weight: 700;
                 background: rgba(175,124,52,.1); padding: 1px 5px; border-radius: 3px; }
  .artigo-cod2 { font-family: monospace; font-size: 9px; color: #888; }
  .artigo-desc { font-size: 11px; color: #333; font-weight: 600; flex: 1; }
  .artigo-tipo { font-size: 9px; color: #777; }
  .artigo-estado { margin-left: auto; font-size: 9px; font-weight: 600; }
  .artigo-body { padding: 8px 12px; }

  .campo-grid { display: grid; grid-template-columns: 110px 1fr; gap: 4px 10px; margin-bottom: 8px; }
  .campo-lbl { font-size: 9px; color: #999; text-transform: uppercase; letter-spacing: .5px; }
  .campo-val { font-family: monospace; font-size: 10px; color: #333; font-weight: 600; }

  .nota-lev { background: #fffbf5; border-left: 3px solid #AF7C34; padding: 6px 10px;
              font-size: 10px; color: #555; margin-top: 6px; white-space: pre-wrap; border-radius: 0 4px 4px 0; }

  .fotos-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
  .foto-thumb { width: 90px; height: 90px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd; }

  .rodape { margin-top: 24px; border-top: 1px solid #eee; padding-top: 10px;
            display: flex; justify-content: space-between; font-size: 9px; color: #aaa; }

  @media print {
    body { padding: 0; }
    @page { margin: 14mm 12mm; }
  }
</style>
</head>
<body>
  <div class="header">
    <div class="logo-bloco">
      <div class="logo">FERCAYO</div>
      <div class="logo-sub">CARPINTARIAS</div>
    </div>
    <div class="doc-bloco">
      <div class="doc-title">Ficha de Levantamento</div>
      <div class="doc-sub">Data: ${hoje}</div>
    </div>
  </div>

  <div class="obra-tag">
    <span class="obra-cod">${obraAtual.codigo}</span>
    <span class="obra-nm">${obraAtual.nome}</span>
    ${obraAtual.orc ? `<span class="obra-orc">ORC: ${obraAtual.orc}</span>` : ''}
  </div>

  ${blocos}

  <div class="rodape">
    <span>Fercayo Carpintarias · Ficha de Levantamento</span>
    <span>${obraAtual.codigo} · ${hoje}</span>
  </div>
</body>
</html>`;

  const w = window.open('', '_blank');
  w.document.write(html);
  w.document.close();
  setTimeout(() => { w.focus(); w.print(); }, 400);
}
