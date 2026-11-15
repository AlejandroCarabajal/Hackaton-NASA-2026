/* Módulo independiente: mediciones y cálculos orientativos de parcela. */
(() => {
  'use strict';
  const LOGO_PDF = 'data:image/jpeg;base64,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';
  const form = document.getElementById('terrenoForm');
  if (!form) return;
  const ids = ['terrenoNombre','terrenoSuperficie','terrenoTextura','terrenoPh','terrenoN','terrenoP','terrenoK','terrenoRiego','terrenoLamina','terrenoFrecuencia','terrenoRendimiento','terrenoPlagas','terrenoNotas'];
  const storageKey = 'agrovista-terreno-v1';
  const message = document.getElementById('terrenoMensaje');
  const results = document.getElementById('terrenoResultados');
  const pdfButton = document.getElementById('terrenoPdf');
  const whatsappButton = document.getElementById('terrenoWhatsapp');
  let report = null;
  
function hayAnalisisParcela() {
  return typeof lastAnalysis !== 'undefined' && !!lastAnalysis;
}

function actualizarBotones() {
  const disponible = hayAnalisisParcela();
  pdfButton.disabled = !disponible;
  whatsappButton.disabled = !disponible;
}

function invalidateReport() {
  report = null;
  actualizarBotones();
}

document.addEventListener('agrovista:analisis-listo', actualizarBotones);

  const escapeHtml = (v) => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const value = (id) => document.getElementById(id).value.trim();
  const number = (id) => value(id) === '' ? null : Number(value(id));
  const fmt = n => new Intl.NumberFormat((window.AgroI18n ? AgroI18n.locale() : 'es-AR'), {maximumFractionDigits:2}).format(n);
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
    if (nutrients.length) items.push(`Nutrientes registrados: ${nutrients.map(([id,label]) => `${label}: ${fmt(number(id))} ppm`).join('; ')}. Sin método analítico y cultivo no se determina suficiencia ni dosis de fertilización.`);
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
    terrenoPh:'pH del suelo', terrenoN:'Nitrógeno (ppm)', terrenoP:'Fósforo (ppm)',
    terrenoK:'Potasio (ppm)', terrenoRiego:'Sistema de riego', terrenoLamina:'Lámina de riego (mm/evento)',
    terrenoFrecuencia:'Intervalo entre riegos (días)', terrenoRendimiento:'Rendimiento esperado (t/ha)',
    terrenoPlagas:'Plagas y enfermedades', terrenoNotas:'Observaciones'
  };

  const pdfText = s => String(window.AgroI18n ? AgroI18n.traducir(String(s)) : s).replace(/\s+/g, ' ').trim()
    .replace(/≤/g, '<=').replace(/≥/g, '>=').replace(/→/g, '->')
    .replace(/[−–—]/g, '-').replace(/[•·]/g, '-')
    .replace(/[^\x20-\x7E -ÿ]/g, '');
  const domText = el => el ? pdfText(el.textContent) : '';
  function collectApp() {
    const $ = id => document.getElementById(id);
    const val = id => pdfText($(id) ? $(id).value : '');
    const sel = id => { const s = $(id); return s && s.selectedIndex >= 0 ? pdfText(s.options[s.selectedIndex].textContent) : ''; };
    const A = (typeof lastAnalysis !== 'undefined') ? lastAnalysis : null;
    const inicio = [
      { title: 'UBICACIÓN DE LA PARCELA', rows: [
        ['Parcela', val('terrenoNombre') || 'sin nombre'],
        ['Localidad', val('locationName')], ['País', domText($('countryBadge'))],
        ['Latitud', val('lat')], ['Longitud', val('lon')],
        ...(A && A.elev !== null ? [['Elevación (grilla NASA POWER)', Math.round(A.elev) + ' m']] : [])
      ] },
      { title: 'CULTIVO Y CONFIGURACIÓN DEL ANÁLISIS', rows: [
        ['Cultivo a sembrar', sel('crop')],
        ['Duración del cultivo', val('cropDuration')],
        ['Fecha de inicio', val('startDate').split('-').reverse().join('/') || 'no indicada'],
        ['Fecha de finalización', val('startDate') || val('endDate') === 'No aplica' ? val('endDate') : 'no calculada (falta fecha de inicio)'],
        ['Cultivo anterior', sel('prevCrop')], ['Prioridad', sel('priority')],
        ['Promedio histórico', val('climYears') + ' año(s) y ' + val('climMonths') + ' mes(es)'],
        ['Período reciente', sel('windowDays')],
        ['Escenario', 'lluvia ' + val('rainAdj') + '%, temperatura ' + val('tempAdj') + ' °C'],
        ['Capa satelital NASA seleccionada', sel('gibsLayer') || 'ninguna']
      ] }
    ];
    if (!A) return { inicio, analisis: [{ title: 'ANÁLISIS CLIMÁTICO NASA POWER', rows: ['No se ejecutó «Analizar parcela»: este PDF incluye solo los datos manuales.'] }] };
    const stats = [...document.querySelectorAll('#statsGrid .stat')].map(s => [domText(s.querySelector('.label')), domText(s.querySelector('.value'))]);
    const checks = [...document.querySelectorAll('#cropChecklist .verdict-text')].map(e => domText(e).replace(/^-\s*/, ''));
    const paramRows = [...document.querySelectorAll('#cropChecklist .param-table tbody tr')].map(tr => [...tr.cells].map(domText));
    const cards = [...document.querySelectorAll('#strategyGrid .strat')];
    const stratTable = cards.map(c => [domText(c.querySelector('.strat-tag')), domText(c.querySelector('.strat-crop')), domText(c.querySelector('.strat-score')), ...[...c.querySelectorAll('.bar i')].map(i => i.style.width)]);
    const stratDetail = cards.flatMap(c => [
      domText(c.querySelector('.strat-tag')) + ' - ' + domText(c.querySelector('.strat-crop')),
      ...[...c.querySelectorAll('h4')].map(h => '   ' + domText(h) + ': ' + [...h.nextElementSibling.children].map(domText).join(' / '))
    ]);
    const gaps = [...document.querySelectorAll('#gapsList li')].map(domText);
    return { inicio, analisis: [
      { title: 'ESTADO HÍDRICO GENERAL', rows: [domText($('dot')) + ': ' + domText($('verdictText'))] },
      { title: 'ÚLTIMOS ' + A.windowDays + ' DÍAS VS. CLIMATOLOGÍA (' + A.spanLabel + ')', rows: stats },
      { title: 'RECOMENDACIÓN PARA TU CULTIVO', rows: [domText($('cropDot')) + ': ' + domText($('cropVerdictText')), ...checks, domText($('rotationNote'))].filter(Boolean),
        table: { head: ['Parámetro', 'Actual', 'Ideal'], widths: [70, 34, 70], body: paramRows } },
      { title: 'COMPARACIÓN DE ESTRATEGIAS DE ROTACIÓN', rows: [domText($('strategyNote'))].filter(Boolean),
        table: { head: ['Estrategia', 'Cultivo', 'Puntaje', 'Clima', 'Rotación', 'Agua', 'Suelo', 'Erosión'], widths: [44, 28, 16, 17, 18, 17, 17, 17], body: stratTable } },
      { title: 'DETALLE DE LAS ESTRATEGIAS', rows: stratDetail },
      { title: 'CALENDARIO CLIMÁTICO ANUAL', rows: $('annualNote').innerHTML.split(/<br\s*\/?>/i).map(h => { const t = document.createElement('div'); t.innerHTML = h; return domText(t); }).filter(Boolean) },
      { title: 'QUÉ NO SABEMOS Y DÓNDE SE NECESITA CRITERIO LOCAL', rows: gaps }
    ] };
  }
  function gestionAgricola() {
    let d;
    try { d = JSON.parse(localStorage.getItem('agrovista_gestion_v1')); } catch (e) { return []; }
    if (!d || !Array.isArray(d.maquinas) || !Array.isArray(d.servicios) || !Array.isArray(d.gastos)) return [];
    const arr = k => Array.isArray(d[k]) ? d[k] : [];
    const trabajos = arr('trabajos'), combustible = arr('combustible'), fijos = arr('fijos');
    if (![d.maquinas, d.servicios, d.gastos, trabajos, combustible, fijos].some(a => a.length)) return [];
    const num = n => Number(n) || 0;
    const suma = (a, k) => a.reduce((t, x) => t + num(x[k]), 0);
    const money = n => new Intl.NumberFormat((window.AgroI18n ? AgroI18n.locale() : 'es-AR'), { style: 'currency', currency: 'ARS' }).format(num(n));
    const fmtN = (n, dec) => num(n).toLocaleString((window.AgroI18n ? AgroI18n.locale() : 'es-AR'), { maximumFractionDigits: dec });
    const fecha = f => String(f || '').split('-').reverse().join('/') || 's/f';
    const filas = (a, fn, n) => {
      const rows = a.slice(0, 40).map(fn);
      if (a.length > 40) rows.push(['... y ' + (a.length - 40) + ' más', ...Array(n - 1).fill('')]);
      return rows;
    };
    const nombreMaq = id => (d.maquinas.find(m => m.id === id) || {}).nombre || 'Máquina eliminada';
    const compras = suma(combustible.filter(c => c.tipo === 'Ingreso'), 'importe');
    const totalG = suma(d.gastos, 'importe'), totalS = suma(d.servicios, 'costo'), totalF = suma(fijos, 'importe'), totalT = suma(trabajos, 'costo');
    const litros = combustible.reduce((t, c) => t + (c.tipo === 'Ajuste negativo' ? -num(c.litros) : num(c.litros)), 0) - suma(trabajos, 'litros');
    return [
      { title: 'GESTIÓN AGRÍCOLA - RESUMEN', rows: [
        ['Máquinas registradas', d.maquinas.length],
        ['Mantenimientos pendientes', d.servicios.filter(s => s.estado === 'Pendiente').length],
        ['Servicios registrados', d.servicios.length],
        ['Gastos generales', money(totalG)],
        ['Costos de mantenimiento', money(totalS)],
        ['Compras de combustible', money(compras)],
        ['Gastos fijos', money(totalF)],
        ['Costo de trabajos', money(totalT)],
        ['Total de costos registrados', money(totalG + totalS + compras + totalF + totalT)],
        ['Combustible disponible', fmtN(litros, 2) + ' L'],
        ['Horas trabajadas', fmtN(suma(trabajos, 'horas'), 1) + ' h']
      ] },
      { title: 'GESTIÓN AGRÍCOLA - MAQUINARIA', rows: [], table: { head: ['Máquina', 'Tipo', 'Marca / modelo', 'Año', 'Estado', 'Notas'], widths: [34, 24, 32, 12, 24, 48],
        body: filas(d.maquinas, m => [m.nombre, m.tipo, [m.marca, m.modelo].filter(Boolean).join(' / ') || '-', m.anio || '-', m.estado, m.notas || '-'], 6) } },
      { title: 'GESTIÓN AGRÍCOLA - MANTENIMIENTOS', rows: [], table: { head: ['Máquina', 'Trabajo', 'Fecha', 'Estado', 'Costo', 'Detalle'], widths: [34, 30, 20, 20, 28, 42],
        body: filas(d.servicios, s => [nombreMaq(s.maquina), s.tipo, fecha(s.fecha), s.estado, money(s.costo), s.detalle || '-'], 6) } },
      { title: 'GESTIÓN AGRÍCOLA - GASTOS', rows: [], table: { head: ['Fecha', 'Categoría', 'Parcela', 'Descripción', 'Importe'], widths: [20, 28, 32, 60, 34],
        body: filas(d.gastos, g => [fecha(g.fecha), g.categoria, g.parcela || 'sin parcela', g.detalle || '-', money(g.importe)], 5) } },
      { title: 'GESTIÓN AGRÍCOLA - TRABAJOS', rows: [], table: { head: ['Fecha', 'Máquina', 'Parcela / tarea', 'Horas / km', 'Ha', 'Litros', 'Costo'], widths: [20, 30, 40, 24, 12, 18, 30],
        body: filas(trabajos, t => [fecha(t.fecha), nombreMaq(t.maquina), (t.parcela || '-') + ' / ' + (t.tarea || '-'), fmtN(t.horas, 1) + ' h / ' + fmtN(t.km, 1) + ' km', fmtN(t.ha, 2), fmtN(t.litros, 2) + ' L', money(t.costo)], 7) } },
      { title: 'GESTIÓN AGRÍCOLA - COMBUSTIBLE', rows: [], table: { head: ['Fecha', 'Tipo', 'Litros', 'Importe', 'Detalle'], widths: [22, 32, 22, 34, 64],
        body: filas(combustible, c => [fecha(c.fecha), c.tipo || '-', fmtN(c.litros, 2) + ' L', money(c.importe), c.detalle || '-'], 5) } },
      { title: 'GESTIÓN AGRÍCOLA - GASTOS FIJOS', rows: [], table: { head: ['Mes', 'Categoría', 'Detalle', 'Importe'], widths: [22, 40, 76, 36],
        body: filas(fijos, f => [String(f.mes || '-').split('-').reverse().join('/'), f.categoria || '-', f.detalle || '-', money(f.importe)], 4) } }
    ];
  }
  async function satelliteImage() {
    try {
      const lat = parseFloat(document.getElementById('lat').value), lon = parseFloat(document.getElementById('lon').value);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
      const R = 6378137, k = 1 / Math.cos(lat * Math.PI / 180);
      const x = R * lon * Math.PI / 180, y = R * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
      const hw = 1000 * k, hh = 625 * k;   // ~2 km x 1,25 km en el terreno
      const url = 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/export?bbox=' + [x - hw, y - hh, x + hw, y + hh].join(',') + '&bboxSR=3857&imageSR=3857&size=800,500&format=jpg&f=image';
      const img = await new Promise((ok, fail) => {
        const i = new Image(); i.crossOrigin = 'anonymous';
        i.onload = () => ok(i); i.onerror = () => fail(new Error('imagen no disponible'));
        setTimeout(() => fail(new Error('tiempo agotado')), 10000);
        i.src = url;
      });
      const c = document.createElement('canvas'); c.width = 800; c.height = 500;
      const g = c.getContext('2d');
      g.drawImage(img, 0, 0, 800, 500);
      g.lineWidth = 4; g.strokeStyle = '#ffffff'; g.fillStyle = '#e2312d';
      g.beginPath(); g.arc(400, 250, 9, 0, Math.PI * 2); g.fill(); g.stroke();
      g.beginPath(); g.arc(400, 250, 22, 0, Math.PI * 2); g.stroke();
      return c.toDataURL('image/jpeg', 0.85);
    } catch (e) { console.error('No se pudo obtener la vista satelital:', e); return null; }
  }
  async function buildPdf() {
    
if (!hayAnalisisParcela()) {
  message.textContent = 'Primero seleccioná una parcela, elegí un cultivo y presioná «Analizar parcela».';
  return null;
}

const informe = report || {
  date: new Date(),
  fields: {},
  lines: []
};

    if (!window.jspdf?.jsPDF) { message.textContent = 'No se pudo cargar jsPDF. Revisá tu conexión a Internet.';
      console.error('La biblioteca jsPDF no está disponible.');
      return null;
    }

    const doc = new window.jspdf.jsPDF({unit:'mm',format:'a4'});
    const margin = 18, maxWidth = 174, bottom = 276;
    let y = 20, page = 1;
    function nextPage() { doc.addPage(); page++; y = 20; }
    function line(text, options = {}) {
      const size = options.size || 10;
      doc.setFont('helvetica', options.bold ? 'bold' : 'normal'); doc.setFontSize(size);
      const chunks = doc.splitTextToSize(pdfText(text), maxWidth);
      const step = size * .48;
      for (const chunk of chunks) { if (y + step > bottom) nextPage(); doc.text(chunk, margin, y); y += step; }
      y += options.after ?? 2;
    }
    function table(head, body, widths) {
      const pad = 1.8, size = 8.5, lh = 3.6;
      const measure = (cells, bold) => {
        doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(size);
        const ls = cells.map((c, i) => doc.splitTextToSize(pdfText(c), widths[i] - 2 * pad));
        return { ls, h: Math.max(...ls.map(l => l.length)) * lh + 2 * pad };
      };
      const draw = (cells, mode) => {
        const m = measure(cells, mode === 'head');
        if (y + m.h > bottom) { nextPage(); if (mode !== 'head') draw(head, 'head'); }
        let x = margin;
        m.ls.forEach((l, i) => {
          if (mode === 'head') doc.setFillColor(22, 98, 61); else if (mode === 'even') doc.setFillColor(238, 244, 240); else doc.setFillColor(255, 255, 255);
          doc.setDrawColor(190, 200, 194); doc.rect(x, y, widths[i], m.h, 'FD');
          if (mode === 'head') doc.setTextColor(255, 255, 255); else doc.setTextColor(40, 47, 48);
          doc.setFont('helvetica', mode === 'head' ? 'bold' : 'normal'); doc.setFontSize(size);
          doc.text(l, x + pad, y + pad + 2.4);
          x += widths[i];
        });
        y += m.h;
      };
      draw(head, 'head');
      body.forEach((r, i) => draw(r, i % 2 ? 'even' : 'odd'));
      doc.setTextColor(40, 47, 48); doc.setFont('helvetica', 'normal');
    }
    doc.addImage(LOGO_PDF, 'JPEG', margin, 10, 24, 24);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(22); doc.setTextColor(22, 98, 61);
    doc.text('AgroNasa', margin + 29, 21);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(40, 47, 48);
    doc.text(pdfText('Informe de análisis de parcela'), margin + 29, 29);
    const val2 = id => pdfText(document.getElementById(id) ? document.getElementById(id).value : '');
    const nombreParcela = val2('terrenoNombre');
    if (nombreParcela) { doc.setFont('helvetica', 'bold'); doc.text(pdfText('Parcela: ' + nombreParcela.slice(0, 60)), margin + 29, 35.5); doc.setFont('helvetica', 'normal'); }
    y = 40;
    line('Fecha: ' + informe.date.toLocaleString((window.AgroI18n ? AgroI18n.locale() : 'es-AR'), { hourCycle: 'h23' }), {after:5});
    const app = collectApp();
    const block = s => {
      if (y + 30 > bottom) nextPage();
      line(s.title, {size:11,bold:true,after:3});
      const rows = s.rows || [];
      if (rows.length && rows.every(Array.isArray)) { table(['Dato', 'Valor'], rows, [62, 112]); y += 3; }
      else rows.forEach(r => line('- ' + r, {after:1.5}));
      if (s.table) { if (s.table.body.length) { table(s.table.head, s.table.body, s.table.widths); y += 4; } else line('- Sin registros', {after:1.5}); }
      y += 4;
    };
    app.inicio.forEach(block);
    const sat = await satelliteImage();
    if (sat) {
      const iw = 130, ih = iw * 500 / 800;
      if (y + ih + 8 > bottom) nextPage();
      doc.addImage(sat, 'JPEG', margin, y, iw, ih); y += ih + 7;
      line('Vista satelital de la zona elegida (Esri World Imagery; Esri, Maxar, Earthstar Geographics). Área aproximada de 2 km x 1,25 km; el marcador rojo indica el punto.', {size:8,after:5});
    } else {
      line('No se pudo incluir la vista satelital (sin conexión o servicio no disponible).', {size:9,after:5});
    }
    
const camposManuales = Object.entries(labels)
  .filter(([key]) => key !== 'terrenoNombre' && informe.fields[key]);

if (camposManuales.length) {
  block({ title: 'DATOS DECLARADOS POR EL AGRICULTOR', rows: camposManuales.map(([key, label]) => [label, informe.fields[key]]) });
}

app.analisis.forEach(block);
gestionAgricola().forEach(block);

if (report && informe.lines.length) {
  line('RESULTADOS DEL ANÁLISIS MANUAL', {
    size: 11,
    bold: true,
    after: 4
  });

  informe.lines.forEach((item, i) => {
    line((i + 1) + '. ' + item, { after: 4 });
  });
}

    y += 3;
    line('ALCANCE Y LIMITACIONES', {size:11,bold:true,after:3});
    line('Los resultados del terreno se calculan solo con los datos manuales ingresados; las secciones climáticas provienen de NASA POWER y de las reglas del prototipo. Son estimaciones orientativas: no son un diagnóstico agronómico, una predicción de cosecha ni una recomendación de fertilización. Validar con un técnico local.', {after:3});
    for (let i=1;i<=doc.getNumberOfPages();i++) {
      doc.setPage(i);
      if (i > 1) { doc.addImage(LOGO_PDF, 'JPEG', margin, 7, 8, 8); doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(22, 98, 61); doc.text('AgroNasa', margin + 10, 13); }
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(100); doc.text(pdfText('AgroNasa - Página '+i+' de '+doc.getNumberOfPages()), margin, 290);
    }
    return doc;
  }
  function fileName() {
    const n = (document.getElementById('terrenoNombre').value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30);
    return 'AgroNasa_analisis_' + (n ? n + '_' : '') + new Date().toISOString().slice(0,10) + '.pdf';
  }
  pdfButton.addEventListener('click', async () => { message.textContent = 'Generando PDF…'; const doc = await buildPdf(); if (doc) { doc.save(fileName()); message.textContent = 'PDF generado y descargado.'; } });
  
whatsappButton.addEventListener('click', async () => {
  message.textContent = 'Generando PDF…';
  const doc = await buildPdf();
  if (!doc) return;

  const nombre = fileName();
  const archivo = new File(
    [doc.output('blob')],
    nombre,
    { type: 'application/pdf' }
  );

  try {
    if (
      navigator.share &&
      navigator.canShare?.({ files: [archivo] })
    ) {
      await navigator.share({
        files: [archivo],
        title: 'Análisis AgroNasa',
        text: 'Análisis personalizado de mi parcela'
      });

      message.textContent =
        'Seleccioná WhatsApp para enviar el documento.';
    } else {
      doc.save(nombre);

      const texto = encodeURIComponent(
        'Te comparto mi análisis personalizado ' +
        'de AgroNasa. Adjunto el informe en PDF.'
      );

      window.open(
        'https://wa.me/?text=' + texto,
        '_blank',
        'noopener,noreferrer'
      );

      message.textContent =
        'Se descargó el PDF. Adjuntalo como documento ' +
        'en la conversación de WhatsApp.';
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error(error);
      message.textContent =
        'No se pudo compartir. Descargá el PDF ' +
        'y adjuntalo manualmente en WhatsApp.';
    }
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
