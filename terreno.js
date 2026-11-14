/* Módulo independiente: mediciones y cálculos orientativos de parcela. */
(() => {
  'use strict';
  const form = document.getElementById('terrenoForm');
  if (!form) return;
  const ids = ['terrenoNombre','terrenoSuperficie','terrenoTextura','terrenoPh','terrenoN','terrenoP','terrenoK','terrenoRiego','terrenoLamina','terrenoFrecuencia','terrenoRendimiento','terrenoPlagas','terrenoNotas'];
  const storageKey = 'agrovista-terreno-v1';
  const message = document.getElementById('terrenoMensaje');
  const results = document.getElementById('terrenoResultados');
  const pdfButton = document.getElementById('terrenoPdf');
  const whatsappButton = document.getElementById('terrenoWhatsapp');
  let report = null;
  function invalidateReport() { report = null; pdfButton.disabled = true; whatsappButton.disabled = true; }
  const escapeHtml = (v) => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const value = (id) => document.getElementById(id).value.trim();
  const number = (id) => value(id) === '' ? null : Number(value(id));
  const fmt = n => new Intl.NumberFormat('es-AR', {maximumFractionDigits:2}).format(n);
  function collect() { return Object.fromEntries(ids.map(id => [id, value(id)])); }
  function analyze(e) {
    if (e) e.preventDefault();
    if (!form.reportValidity()) return;
    const area = number('terrenoSuperficie'), ph = number('terrenoPh');
    const mm = number('terrenoLamina'), days = number('terrenoFrecuencia');
    const yieldHa = number('terrenoRendimiento');
    const items = [];
    if (ph !== null) {
      const label = ph < 6 ? 'ácido' : ph > 7.5 ? 'alcalino' : 'cercano a neutro';
      items.push(`pH medido: <strong>${fmt(ph)}</strong> (${label}). La adecuación depende del cultivo y de un análisis local.`);
    }
    if (value('terrenoTextura')) items.push(`Textura declarada: <strong>${escapeHtml(value('terrenoTextura'))}</strong>. La retención y el drenaje del agua dependen también de la estructura y materia orgánica.`);
    const nutrients = [['terrenoN','N'],['terrenoP','P'],['terrenoK','K']].filter(([id]) => number(id) !== null);
    if (nutrients.length) items.push(`Nutrientes registrados: ${nutrients.map(([id,label]) => `${label}: ${fmt(number(id))} mg/kg`).join('; ')}. Sin método analítico y cultivo no se determina suficiencia ni dosis de fertilización.`);
    if (mm !== null && days !== null) {
      const perDay = mm / days;
      items.push(`Riego declarado: <strong>${fmt(perDay)} mm/día</strong> en promedio (${fmt(mm)} mm cada ${fmt(days)} días). Equivale a ${fmt(perDay * 7)} mm en 7 días, suponiendo aplicación uniforme. No incluye lluvia ni pérdidas.`);
      if (area !== null) items.push(`Volumen bruto por evento: <strong>${fmt(mm * area * 10000 / 1000)} m³</strong> sobre ${fmt(area)} ha (1 mm sobre 1 ha = 10 m³). No considera eficiencia del sistema.`);
    } else if (mm !== null || days !== null) items.push('Para estimar el riego promedio, completá tanto la lámina como el intervalo entre riegos.');
    if (area !== null && yieldHa !== null) items.push(`Producción hipotética: <strong>${fmt(area * yieldHa)} toneladas</strong> (${fmt(area)} ha × ${fmt(yieldHa)} t/ha). No representa una predicción de cosecha.`);
    if (value('terrenoPlagas')) items.push(`Observación de plagas o enfermedades: <strong>${escapeHtml(value('terrenoPlagas'))}</strong>. Se recomienda verificar la identificación y consultar manejo local.`);
    if (value('terrenoNotas')) items.push(`Observaciones: ${escapeHtml(value('terrenoNotas'))}`);
    if (!items.length) items.push('Completá al menos un dato para obtener resultados.');
    results.innerHTML = `<h3>Resultados del análisis manual</h3><ul>${items.map(i => `<li>${i}</li>`).join('')}</ul><p class="source">Este cálculo usa solamente los datos manuales ingresados. No modifica ni recalcula las recomendaciones climáticas de NASA POWER.</p>`;
    results.hidden = false;
    report = { date: new Date(), fields: collect(), lines: items.map(item => { const el = document.createElement('div'); el.innerHTML = item; return el.textContent || ''; }) };
    pdfButton.disabled = false; whatsappButton.disabled = false;
    message.textContent = 'Análisis actualizado.';
  }
  form.addEventListener('submit', analyze);
  document.getElementById('terrenoGuardar').addEventListener('click', () => {
    if (!form.reportValidity()) return;
    try { localStorage.setItem(storageKey, JSON.stringify(collect())); message.textContent = 'Datos guardados en este navegador.'; }
    catch { message.textContent = 'No fue posible guardar los datos en este navegador.'; }
  });
  document.getElementById('terrenoLimpiar').addEventListener('click', () => {
    form.reset(); results.hidden = true; results.textContent = ''; invalidateReport();
    try { localStorage.removeItem(storageKey); } catch {}
    message.textContent = 'Formulario limpio y datos locales eliminados.';
  });

  form.addEventListener('input', invalidateReport);
  form.addEventListener('change', invalidateReport);
  const labels = {
    terrenoNombre:'Parcela', terrenoSuperficie:'Superficie (ha)', terrenoTextura:'Textura del suelo',
    terrenoPh:'pH del suelo', terrenoN:'Nitrógeno (mg/kg)', terrenoP:'Fósforo (mg/kg)',
    terrenoK:'Potasio (mg/kg)', terrenoRiego:'Sistema de riego', terrenoLamina:'Lámina de riego (mm/evento)',
    terrenoFrecuencia:'Intervalo entre riegos (días)', terrenoRendimiento:'Rendimiento esperado (t/ha)',
    terrenoPlagas:'Plagas y enfermedades', terrenoNotas:'Observaciones'
  };
  function buildPdf() {
    if (!report) { message.textContent = 'Primero calculá el análisis personalizado.'; return null; }
    if (!window.jspdf || !window.jspdf.jsPDF) { message.textContent = 'No se pudo cargar el generador de PDF. Comprobá tu conexión a Internet.'; return null; }
    const doc = new window.jspdf.jsPDF({unit:'mm',format:'a4'});
    const margin = 18, maxWidth = 174, bottom = 276;
    let y = 20, page = 1;
    function nextPage() { doc.addPage(); page++; y = 20; }
    function line(text, options = {}) {
      const size = options.size || 10;
      doc.setFont('helvetica', options.bold ? 'bold' : 'normal'); doc.setFontSize(size);
      const chunks = doc.splitTextToSize(String(text), maxWidth);
      const step = size * .48;
      for (const chunk of chunks) { if (y + step > bottom) nextPage(); doc.text(chunk, margin, y); y += step; }
      y += options.after ?? 2;
    }
    doc.setTextColor(22, 98, 61);
    line('AgroVista | Análisis personalizado de parcela', {size:16,bold:true,after:5});
    doc.setTextColor(40, 47, 48);
    line('Fecha: ' + report.date.toLocaleString('es-AR'), {after:5});
    line('DATOS DECLARADOS POR EL AGRICULTOR', {size:11,bold:true,after:3});
    for (const [key,label] of Object.entries(labels)) if (report.fields[key]) line(label + ': ' + report.fields[key], {after:1});
    y += 5;
    line('RESULTADOS DEL ANÁLISIS', {size:11,bold:true,after:4});
    report.lines.forEach((item,i) => line((i+1) + '. ' + item, {after:4}));
    y += 3;
    line('ALCANCE Y LIMITACIONES', {size:11,bold:true,after:3});
    line('Estimaciones orientativas calculadas exclusivamente a partir de los datos manuales ingresados. No son un diagnóstico agronómico, una predicción de cosecha ni una recomendación de fertilización. No modifican los análisis climáticos de NASA POWER.', {after:3});
    for (let i=1;i<=doc.getNumberOfPages();i++) { doc.setPage(i); doc.setFontSize(8); doc.setTextColor(100); doc.text('AgroVista - Página '+i+' de '+doc.getNumberOfPages(), margin, 290); }
    return doc;
  }
  function fileName() { return 'AgroVista_analisis_' + new Date().toISOString().slice(0,10) + '.pdf'; }
  pdfButton.addEventListener('click', () => { const doc = buildPdf(); if (doc) { doc.save(fileName()); message.textContent = 'PDF generado y descargado.'; } });
  whatsappButton.addEventListener('click', async () => {
    const doc = buildPdf(); if (!doc) return;
    const file = new File([doc.output('blob')], fileName(), {type:'application/pdf'});
    if (navigator.share && navigator.canShare && navigator.canShare({files:[file]})) {
      try { await navigator.share({files:[file],title:'Análisis de parcela - AgroVista',text:'Adjunto el análisis personalizado de la parcela.'}); message.textContent = 'Se abrió el menú para compartir. Seleccioná WhatsApp para enviar el PDF.'; }
      catch (err) { if (err.name !== 'AbortError') message.textContent = 'No se pudo compartir. Descargá el PDF y adjuntalo en WhatsApp.'; }
    } else {
      doc.save(fileName());
      message.textContent = 'Tu navegador no permite adjuntar directamente el PDF. Se descargó el archivo: abrí WhatsApp y envialo como documento.';
    }
  });

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (saved && typeof saved === 'object') {
      for (const id of ids) if (typeof saved[id] === 'string') document.getElementById(id).value = saved[id];
      message.textContent = 'Se recuperaron los datos guardados en este navegador.';
    }
  } catch { message.textContent = 'No se pudieron recuperar los datos guardados.'; }
})();
