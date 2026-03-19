/* ═══════════════════════════════════════════════════════════════
   Fercayo · Levantamento · Geração de PDF (jsPDF)
   Depende de: jsPDF (CDN), levantamento/state.js,
               levantamento/logo-data.js, levantamento/navigation.js
   ═══════════════════════════════════════════════════════════════ */

async function downloadPDF(){
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF({orientation:'p',unit:'mm',format:'a4'});
  const W=210, H=297;
  const WHITE=[255,255,255];
  const CER=[175,124,52];
  const DARK=[51,62,72];
  const MID=[106,112,121];
  const LIGHT=[164,169,173];
  const PANEL=[242,240,237];
  const LINE=[216,212,204];

  const ML=15, MR=15, MT=20, MB=8;
  const CW=W-ML-MR;

  const sf=(r,g,b)=>doc.setFillColor(r,g,b);
  const ss=(r,g,b,lw=0.3)=>{doc.setDrawColor(r,g,b);doc.setLineWidth(lw);};
  const st=(r,g,b)=>doc.setTextColor(r,g,b);

  async function drawLogo(yy){
    return new Promise(resolve=>{
      const tmp=new Image();
      tmp.onload=()=>{
        const lw=62, lh=lw*(364/1455);
        doc.addImage(LOGO_B64,'PNG',ML,yy,lw,lh);
        resolve(lh);
      };
      tmp.onerror=()=>{ st(...DARK); doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.text('FERCAYO CARPINTARIAS',ML,yy+8); resolve(10); };
      tmp.src=LOGO_B64;
    });
  }

  function drawFooter(){
    const fy=H-12;
    ss(...CER,0.5); doc.line(ML,fy-2,W-MR,fy-2);
    doc.setFont('helvetica','normal'); doc.setFontSize(7); st(...MID);
    const info='geral@fercayo.pt   |   (+351) 252 601 189   |   Rua Manuel José Moreira, nº835, 4570-366 Laundos, Póvoa de Varzim   |   FERCAYO.PT';
    doc.text(info,W/2,fy+2,{align:'center'});
  }

  async function drawPageHeader(pageLabel,extra=''){
    sf(...WHITE); doc.rect(0,0,W,H,'F');
    const lh = await drawLogo(4);
    ss(...CER,0.6); doc.line(ML,MT-1,W-MR,MT-1);
    st(...MID); doc.setFont('helvetica','normal'); doc.setFontSize(7.5);
    doc.text(pageLabel,W-MR,MT-3,{align:'right'});
    if(extra){ doc.text(extra,W-MR,MT+1.5,{align:'right'}); }
    drawFooter();
    return MT+4;
  }

  function drawFieldPDF(label,value,x,w,yy){
    st(...LIGHT); doc.setFont('helvetica','bold'); doc.setFontSize(6.5);
    doc.text(label.toUpperCase(),x,yy);
    st(...DARK); doc.setFont('helvetica','normal'); doc.setFontSize(10);
    doc.text(String(value||'—'),x,yy+5);
    ss(...LINE,0.25); doc.line(x,yy+7,x+w,yy+7);
  }

  function sectionHeader(label,x,w,yy){
    ss(...CER,0.4); doc.line(x,yy,x+w,yy);
    st(...CER); doc.setFont('helvetica','bold'); doc.setFontSize(7.5);
    doc.text(label.toUpperCase(),x,yy-1.5);
    return yy+4;
  }

  function tagBox(label,x,yy){
    ss(...CER,0.5); doc.roundedRect(x,yy,50,7,1,1,'S');
    st(...CER); doc.setFont('helvetica','bold'); doc.setFontSize(9);
    doc.text(label,x+4,yy+5);
  }

  // ── PAGE 1: INFORMAÇÕES ──
  let y = await drawPageHeader('Ficha de Levantamento em Obra');
  y += 2;

  st(...DARK); doc.setFont('helvetica','bold'); doc.setFontSize(14);
  doc.text('INFORMAÇÕES DA OBRA',ML,y); y+=2;
  sf(...CER); doc.rect(ML,y,20,1,'F'); y+=6;

  drawFieldPDF('Código da Obra',document.getElementById('cod-obra').value,ML,CW,y); y+=14;
  drawFieldPDF('Morada / Local da Obra',document.getElementById('morada').value,ML,CW,y); y+=14;
  drawFieldPDF('Cliente',document.getElementById('cliente').value,ML,CW,y); y+=16;
  drawFieldPDF('Medidor',getMedidor(),ML,CW/2-4,y);
  drawFieldPDF('Data',document.getElementById('data-lev').value,ML+CW/2+4,CW/2-4,y); y+=14;
  drawFieldPDF('Diretor de Obra',getDiretor(),ML,CW/2-4,y);
  drawFieldPDF('Código de Revisão',document.getElementById('revisao').value,ML+CW/2+4,CW/2-4,y); y+=18;

  y = sectionHeader('Tipo de Intervenção e Fase',ML,CW,y); y+=4;
  tagBox(selections['tipo']||'—',ML,y);
  tagBox(selections['fase']||'—',ML+58,y); y+=16;

  y = sectionHeader('Acesso à Obra',ML,CW,y); y+=4;
  drawFieldPDF('Encarregado de Obra',document.getElementById('encarregado').value,ML,CW/2-4,y);
  drawFieldPDF('Contacto',document.getElementById('contacto').value,ML+CW/2+4,CW/2-4,y); y+=14;
  drawFieldPDF('Horário de Acesso',document.getElementById('horario').value,ML,CW,y); y+=14;

  const obsA=document.getElementById('obs-acesso').value;
  if(obsA){
    st(...LIGHT); doc.setFont('helvetica','bold'); doc.setFontSize(6.5);
    doc.text('OBSERVAÇÕES DE ACESSO',ML,y); y+=5;
    st(...DARK); doc.setFont('helvetica','normal'); doc.setFontSize(9);
    y = await writeWrapped(doc,obsA,ML,CW,y,5,drawPageHeader,'Identificação e Acesso',''); y+=8;
  }
  const obsG=document.getElementById('obs-gerais').value;
  if(obsG){
    y = sectionHeader('Observações Gerais',ML,CW,y); y+=4;
    st(...DARK); doc.setFont('helvetica','normal'); doc.setFontSize(9);
    y = await writeWrapped(doc,obsG,ML,CW,y,5,drawPageHeader,'Identificação e Acesso',''); y+=3;
  }
  st(...LIGHT); doc.setFont('helvetica','normal'); doc.setFontSize(7);
  doc.text('01',W-MR,H-MB,{align:'right'});

  // ── FOTO PAGES ──
  for(let i=0;i<fotos.length;i++){
    const f=fotos[i];
    doc.addPage();
    const extra=`Foto ${String(i+1).padStart(2,'0')} / ${String(fotos.length).padStart(2,'0')}  ·  ${document.getElementById('cod-obra').value||'—'}`;
    let py = await drawPageHeader('Registo Fotográfico',extra);
    py+=2;

    const half=CW/2-3;
    drawFieldPDF('Referência',f.ref,ML,half,py);
    drawFieldPDF('Ambiente',f.ambiente,ML+half+6,half,py); py+=16;
    drawFieldPDF('Descrição / Elemento',f.desc,ML,CW,py); py+=16;

    if(f.imgData){
      await new Promise(resolve=>{
        const tmp=new Image();
        tmp.onload=()=>{
          const mW=CW, mH=H-py-28;
          const r=Math.min(mW/tmp.naturalWidth,mH/tmp.naturalHeight);
          const dw=tmp.naturalWidth*r, dh=tmp.naturalHeight*r;
          const dx=ML+(mW-dw)/2;
          ss(...LINE,0.3); doc.rect(dx-1,py-1,dw+2,dh+2,'S');
          doc.addImage(f.imgData,'JPEG',dx,py,dw,dh);
          py+=dh+6; resolve();
        };
        tmp.onerror=resolve; tmp.src=f.imgData;
      });
    } else {
      ss(...LINE,0.4); doc.rect(ML,py,CW,60,'S');
      st(...LIGHT); doc.setFont('helvetica','italic'); doc.setFontSize(10);
      doc.text('[Sem fotografia]',W/2,py+32,{align:'center'}); py+=66;
    }

    if(f.notas){
      py = sectionHeader('Notas e Observações',ML,CW,py); py+=4;
      st(...DARK); doc.setFont('helvetica','normal'); doc.setFontSize(9);
      py = await writeWrapped(doc,f.notas,ML,CW,py,5,drawPageHeader,'Registo Fotográfico',`Foto ${String(i+1).padStart(2,'0')} / ${String(fotos.length).padStart(2,'0')}  ·  ${document.getElementById('cod-obra').value||'—'}`);
    }

    const curPage = doc.internal.getCurrentPageInfo().pageNumber;
    doc.setPage(curPage);
    st(...LIGHT); doc.setFont('helvetica','normal'); doc.setFontSize(7);
    doc.text(String(i+2).padStart(2,'0'),W-MR,H-MB,{align:'right'});
  }

  const cod=(document.getElementById('cod-obra').value||'obra').replace(/\s+/g,'_');
  const dir=getDiretor().replace(/\s+/g,'_').replace(/[^a-zA-Z\u00C0-\u00FF0-9_]/g,'');
  const dt=(document.getElementById('data-lev').value||'data').replace(/-/g,'');
  doc.save(`${cod}-${dir}-${dt}.pdf`);
  await limparRascunho();
}

async function writeWrapped(doc, txt, x, maxW, y, lineH, drawHeaderFn, headerLabel, headerExtra){
  const MB_SAFE = 22;
  const H = doc.internal.pageSize.getHeight();
  const lines = doc.splitTextToSize(txt, maxW);
  for(let i=0; i<lines.length; i++){
    if(y + lineH > H - MB_SAFE){
      doc.addPage();
      y = await drawHeaderFn(headerLabel, headerExtra);
      y += 4;
    }
    doc.text(lines[i], x, y);
    y += lineH;
  }
  return y;
}

function shareWhatsApp(){
  const obra=document.getElementById('cod-obra').value||'obra';
  const texto=`Levantamento em obra — ${obra}\nMedidor: ${getMedidor()}\nData: ${document.getElementById('data-lev').value||''}\n\nFercayo Carpintarias`;
  window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`);
}
