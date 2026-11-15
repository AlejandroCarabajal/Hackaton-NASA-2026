// accesibilidad.js — AgroNasa para personas ciegas o con baja visión.
// - Resumen del análisis en palabras simples, con lectura en voz alta.
// - Avisos para lectores de pantalla (NVDA, JAWS, TalkBack, VoiceOver).
// - Gráficos con descripción y botón "Ver como tabla".
// - Semáforos en palabras, deslizadores que se leen bien y "Usar mi ubicación".
// Depende de los datos globales de analisis.js (lastAnalysis, lastCropKey) y script.js (map, setMarker, CROP_DB).

(function(){

  const $ = id => document.getElementById(id);

  /* ---------- Avisos para lectores de pantalla ---------- */
  // Se vacía y se vuelve a escribir para que el lector anuncie aunque el texto se repita.
  let avisoTimer = null;
  // Mientras el asistente por voz está activo, él mismo habla: se evitan avisos duplicados
  const asistenteActivo = () => !!(window.AgroNasaAsistente && window.AgroNasaAsistente.activo);

  function anunciar(texto){
    if(asistenteActivo()) return;
    const zona = $('anuncios');
    if(!zona) return;
    zona.textContent = '';
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(() => { zona.textContent = texto; }, 120);
  }

  /* ---------- Utilidades de texto ---------- */
  const textoPlano = id => ($(id) ? $(id).textContent : '').replace(/\s+/g, ' ').trim();
  const primeraOracion = t => { const m = t.match(/^.*?[.!?](\s|$)/); return (m ? m[0] : t).trim(); };
  const mm = v => `${Math.round(v)} milímetro${Math.round(v) === 1 ? '' : 's'}`;
  const fechaCorta = k => `${k.slice(6, 8)}/${k.slice(4, 6)}`;          // 20261104 -> 04/11
  const MESES_LARGOS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

  /* ---------- Semáforos en palabras ---------- */
  const SIGNIFICADO = {
    'SECO':     'seco, color rojo',
    'ATENCIÓN': 'atención, color amarillo',
    'OK':       'bien, color verde',
    'S/D':      'sin datos suficientes',
    'SEMBRAR':  'sembrar, color verde',
    'ESPERAR':  'esperar, color amarillo',
    'RIESGO':   'riesgo, color rojo',
    'CAMBIAR':  'conviene cambiar de cultivo, color rojo',
  };
  function semaforosEnPalabras(){
    const agua = $('dot'), cultivo = $('cropDot');
    if(agua){
      agua.setAttribute('role', 'img');
      agua.setAttribute('aria-label', 'Estado hídrico: ' + (SIGNIFICADO[agua.textContent.trim()] || agua.textContent.trim()));
    }
    if(cultivo){
      cultivo.setAttribute('role', 'img');
      cultivo.setAttribute('aria-label', 'Recomendación: ' + (SIGNIFICADO[cultivo.textContent.trim()] || cultivo.textContent.trim()));
    }
  }

  /* ---------- Resumen en palabras simples ---------- */
  function armarResumen(){
    if(typeof lastAnalysis === 'undefined' || !lastAnalysis) return '';
    const A = lastAnalysis, rec = A.recent, clim = A.clim;
    const crop = (typeof CROP_DB !== 'undefined' && CROP_DB[lastCropKey]) ? CROP_DB[lastCropKey].label : 'tu cultivo';
    const partes = [];
    const lugar = ($('locationName') && $('locationName').value) ? ` en ${$('locationName').value}` : '';

    partes.push(`En los últimos ${rec.days} días llovieron ${mm(rec.rain)}${lugar}.`);
    const rd = clim.rainDiffPct;
    if(rd !== undefined && rd !== null){
      if(Math.abs(rd) < 5) partes.push('Es casi lo mismo que llueve normalmente en esta época.');
      else partes.push(`Es un ${Math.abs(rd)}% ${rd < 0 ? 'menos' : 'más'} de lo que llueve normalmente en esta época.`);
    } else {
      partes.push('No hay suficientes años de datos para comparar con lo normal.');
    }
    if(rec.temp !== null && rec.temp !== undefined) partes.push(`La temperatura promedio fue de ${Math.round(rec.temp)} grados.`);
    if(clim.rootDiff !== undefined && clim.rootDiff !== null){
      if(clim.rootDiff <= -0.1) partes.push('El suelo está más seco que lo normal.');
      else if(clim.rootDiff >= 0.1) partes.push('El suelo está más húmedo que lo normal.');
    }
    const agua = $('dot') ? $('dot').textContent.trim() : '';
    if(agua === 'SECO') partes.push('Estado del agua: seco. Conviene revisar el riego.');
    else if(agua === 'ATENCIÓN') partes.push('Estado del agua: atención. Conviene vigilar los próximos días.');
    else if(agua === 'OK') partes.push('Estado del agua: bien, sin señales de falta de agua.');

    const rotulo = $('cropDot') ? $('cropDot').textContent.trim() : '';
    const recomendacion = {
      'SEMBRAR': 'es un buen momento para sembrar',
      'ESPERAR': 'conviene esperar antes de sembrar',
      'RIESGO':  'hay riesgo si se siembra ahora',
      'CAMBIAR': 'las condiciones no son buenas; conviene pensar en otro cultivo',
    }[rotulo];
    if(recomendacion){
      partes.push(`Para ${crop.toLowerCase()}: ${recomendacion}.`);
      const detalle = primeraOracion(textoPlano('cropVerdictText'));
      if(detalle) partes.push(detalle);
    }
    return partes.join(' ');
  }

  function mostrarResumen(){
    const caja = $('resumenSimple');
    const texto = armarResumen();
    if(!caja || !texto) return '';
    $('resumenTexto').textContent = texto;
    caja.hidden = false;
    return texto;
  }

  /* ---------- Lectura en voz alta (Web Speech API del navegador) ---------- */
  const voz = ('speechSynthesis' in window) ? window.speechSynthesis : null;
  function vozEnEspanol(){
    if(!voz) return null;
    const voces = voz.getVoices();
    return voces.find(v => /^es[-_]AR/i.test(v.lang))
        || voces.find(v => /^es[-_](419|MX|US|CL|UY|CO)/i.test(v.lang))
        || voces.find(v => /^es/i.test(v.lang))
        || null;
  }
  function detenerLectura(){
    if(voz && !asistenteActivo()) voz.cancel();
    if($('detenerResumen')) $('detenerResumen').hidden = true;
  }
  function leerEnVozAlta(texto){
    if(!voz){
      $('resumenNota').textContent = 'Este navegador no puede leer en voz alta. Probá con Chrome o Edge, o usá tu lector de pantalla.';
      return;
    }
    detenerLectura();
    const u = new SpeechSynthesisUtterance(texto);
    const v = vozEnEspanol();
    if(v) u.voice = v;
    u.lang = v ? v.lang : 'es-AR';
    u.rate = 0.95;
    u.onend = u.onerror = () => { $('detenerResumen').hidden = true; };
    $('detenerResumen').hidden = false;
    $('resumenNota').textContent = v ? '' : 'No se encontró una voz en español en este equipo; se usa la voz disponible.';
    voz.speak(u);
  }

  /* ---------- Gráficos legibles: descripción + tabla ---------- */
  function tablaEn(panelId, idTabla, titulo, encabezados, filas){
    const panel = $(panelId);
    if(!panel) return;
    let det = $(idTabla);
    if(!det){
      det = document.createElement('details');
      det.className = 'tabla-datos';
      det.id = idTabla;
      const wrap = panel.querySelector('.chart-wrap');
      wrap.insertAdjacentElement('afterend', det);
    }
    const abierto = det.open;
    det.innerHTML = '';
    const sum = document.createElement('summary');
    sum.textContent = 'Ver como tabla';
    det.appendChild(sum);
    const t = document.createElement('table');
    const cap = document.createElement('caption'); cap.textContent = titulo; t.appendChild(cap);
    const thead = t.createTHead().insertRow();
    encabezados.forEach(e => { const th = document.createElement('th'); th.scope = 'col'; th.textContent = e; thead.appendChild(th); });
    const tb = t.createTBody();
    filas.forEach(f => {
      const tr = tb.insertRow();
      f.forEach((c, i) => {
        const cel = i === 0 ? document.createElement('th') : document.createElement('td');
        if(i === 0) cel.scope = 'row';
        cel.textContent = c;
        tr.appendChild(cel);
      });
    });
    det.appendChild(t);
    det.open = abierto;
  }

  function graficosLegibles(){
    if(typeof lastAnalysis === 'undefined' || !lastAnalysis) return;
    const A = lastAnalysis;

    // 09 — Lluvia diaria
    const serie = Object.entries(A.recent.series || {});
    const conLluvia = serie.filter(([, v]) => v > 0);
    const total = serie.reduce((s, [, v]) => s + (v || 0), 0);
    const max = conLluvia.reduce((m, e) => (e[1] > m[1] ? e : m), ['', 0]);
    const descDiaria = conLluvia.length
      ? `Gráfico de lluvia diaria de los últimos ${serie.length} días: llovió ${conLluvia.length} día${conLluvia.length === 1 ? '' : 's'}, en total ${mm(total)}. El día de más lluvia fue el ${fechaCorta(max[0])}, con ${mm(max[1])}.`
      : `Gráfico de lluvia diaria de los últimos ${serie.length} días: no llovió ningún día.`;
    const svgD = $('chart');
    svgD.setAttribute('role', 'img');
    svgD.setAttribute('aria-label', descDiaria);
    tablaEn('chartPanel', 'tablaLluviaDiaria', 'Lluvia diaria (mm)', ['Fecha', 'Lluvia (mm)'],
      serie.map(([k, v]) => [fechaCorta(k), (v || 0).toFixed(1)]));

    // 08 — Calendario anual
    const M = A.monthly || [];
    const crop = CROP_DB[lastCropKey];
    const masLluvioso = M.reduce((b, x, i) => (x.rain !== null && (b < 0 || x.rain > M[b].rain) ? i : b), -1);
    const masCalido = M.reduce((b, x, i) => (x.temp !== null && (b < 0 || x.temp > M[b].temp) ? i : b), -1);
    let descAnual = 'Gráfico del calendario climático anual, con la lluvia y la temperatura promedio de cada mes.';
    if(masLluvioso >= 0) descAnual += ` El mes más lluvioso es ${MESES_LARGOS[masLluvioso]}, con ${mm(M[masLluvioso].rain)}.`;
    if(masCalido >= 0) descAnual += ` El más cálido es ${MESES_LARGOS[masCalido]}, con ${Math.round(M[masCalido].temp)} grados.`;
    const nota = textoPlano('annualNote');
    if(nota) descAnual += ' ' + nota;
    const svgA = $('annualChart');
    svgA.setAttribute('role', 'img');
    svgA.setAttribute('aria-label', descAnual);
    tablaEn('annualPanel', 'tablaCalendario', `Clima promedio por mes${crop ? ' y ventana para ' + crop.label.toLowerCase() : ''}`,
      ['Mes', 'Lluvia (mm)', 'Temperatura media (°C)', 'Para el cultivo'],
      M.map((x, i) => {
        let estado = 'Sin datos';
        if(x.temp !== null && crop){
          const tOk = x.temp >= crop.tempRange[0] && x.temp <= crop.tempRange[1];
          const rOk = x.rain !== null && x.rain >= 30;
          estado = tOk && rOk ? 'Favorable' : (!tOk ? 'Temperatura fuera de rango' : 'Poca lluvia');
        }
        return [MESES_LARGOS[i].charAt(0).toUpperCase() + MESES_LARGOS[i].slice(1),
                x.rain === null ? '—' : x.rain.toFixed(0),
                x.temp === null ? '—' : x.temp.toFixed(1),
                estado];
      }));
  }

  /* ---------- Deslizadores de escenario con texto claro ---------- */
  function textoDeslizadores(){
    const lluvia = $('rainAdj'), temp = $('tempAdj');
    if(lluvia){
      const v = Number(lluvia.value);
      lluvia.setAttribute('aria-valuetext', v === 0 ? 'Lluvia real, sin cambios' : `Lluvia ${Math.abs(v)}% ${v < 0 ? 'menos' : 'más'} que la real`);
    }
    if(temp){
      const v = Number(temp.value);
      temp.setAttribute('aria-valuetext', v === 0 ? 'Temperatura real, sin cambios' : `Temperatura ${String(Math.abs(v)).replace('.', ',')} grados ${v < 0 ? 'menos' : 'más'} que la real`);
    }
  }

  /* ---------- Usar mi ubicación ---------- */
  function usarMiUbicacion(){
    const btn = $('miUbicacion');
    const estado = $('searchStatus');
    if(!('geolocation' in navigator)){
      if(estado) estado.textContent = 'Este navegador no permite obtener tu ubicación. Buscá tu localidad por nombre.';
      return;
    }
    // Los navegadores solo dan la ubicación en direcciones seguras (https o localhost)
    if(window.isSecureContext === false){
      const msg = 'Para usar tu ubicación, la página tiene que abrirse desde una dirección segura (https). Mientras tanto, buscá tu localidad por nombre.';
      if(estado) estado.textContent = msg;
      anunciar(msg);
      return;
    }
    btn.disabled = true;
    anunciar('Buscando tu ubicación…');
    navigator.geolocation.getCurrentPosition(pos => {
      btn.disabled = false;
      const lat = pos.coords.latitude, lon = pos.coords.longitude;
      if(typeof map !== 'undefined' && map) map.setView([lat, lon], 13);
      if(typeof setMarker === 'function') setMarker(lat, lon);
      if(estado) estado.textContent = '';
    }, err => {
      btn.disabled = false;
      const msg = err.code === 1
        ? 'No diste permiso para usar tu ubicación. Podés buscar tu localidad por nombre.'
        : 'No se pudo obtener tu ubicación. Podés buscar tu localidad por nombre.';
      if(estado) estado.textContent = msg;
      anunciar(msg);
    }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 });
  }

  /* ---------- Anunciar la ubicación elegida ---------- */
  function vigilarUbicacion(){
    const badge = $('countryBadge');
    if(!badge || !('MutationObserver' in window)) return;
    let ultimo = '';
    new MutationObserver(() => {
      const t = badge.textContent.trim();
      if(/^Detectando/.test(t)){ ultimo = ''; return; }   // empieza una búsqueda nueva
      if(!t || t === ultimo) return;
      ultimo = t;
      const nombre = ($('locationName') && $('locationName').value) || t;
      anunciar(`Ubicación elegida: ${nombre}. Ahora elegí el cultivo y tocá Analizar parcela.`);
    }).observe(badge, { childList: true, characterData: true, subtree: true });
  }

  /* ---------- Conexión con el resto de la página ---------- */
  document.addEventListener('agronasa:resultados', () => {
    semaforosEnPalabras();
    graficosLegibles();
    mostrarResumen();
  });

  // Al terminar un análisis nuevo: el lector de pantalla anuncia el resumen
  document.addEventListener('agrovista:analisis-listo', () => {
    detenerLectura();
    const texto = mostrarResumen();
    if(texto) anunciar('Análisis listo. ' + texto);
  });

  document.addEventListener('DOMContentLoaded', () => {
    textoDeslizadores();
    ['rainAdj', 'tempAdj'].forEach(id => $(id) && $(id).addEventListener('input', textoDeslizadores));
    if($('resetScenario')) $('resetScenario').addEventListener('click', () => setTimeout(textoDeslizadores, 0));

    if($('miUbicacion')) $('miUbicacion').addEventListener('click', usarMiUbicacion);
    vigilarUbicacion();

    if($('escucharResumen')) $('escucharResumen').addEventListener('click', () => {
      const texto = $('resumenTexto').textContent;
      if(texto) leerEnVozAlta(texto);
    });
    if($('detenerResumen')) $('detenerResumen').addEventListener('click', detenerLectura);
    if(!voz && $('escucharResumen')) $('escucharResumen').hidden = true;

    // Al pedir un análisis nuevo, el resumen anterior se oculta hasta que llegan los datos
    if($('run')) $('run').addEventListener('click', () => {
      detenerLectura();
      if($('resumenSimple')) $('resumenSimple').hidden = true;
    });
  });

  // Al cambiar de ubicación se ocultan los resultados (invalidateAnalysis): también el resumen
  const original = window.invalidateAnalysis;
  if(typeof original === 'function'){
    window.invalidateAnalysis = function(){
      original.apply(this, arguments);
      if($('resumenSimple')) $('resumenSimple').hidden = true;
      detenerLectura();
    };
  }
})();
