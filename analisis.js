// analisis.js — climatología NASA POWER, comparación de estrategias de rotación,
// escenarios, calendario anual, límites del análisis y capas NASA GIBS.
// Usa CROP_DB, FAMILY_LABEL, fmtDate, evaluateCrop y drawChart definidos en script.js.

// Años de climatología y días del período reciente: los elige el usuario (panel 03)
const FROST_C = 2;          // T mín <= 2 °C se considera riesgo de helada
const HEAT_C = 35;          // T máx >= 35 °C se considera calor extremo
const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

// Rasgos agronómicos generales (reglas del prototipo, NO datos medidos)
const TRAITS = {
  deepRoot: ['girasol','alfalfa','colza','yuca','algodon','sorgo','remolacha','zanahoria'],
  cover: ['alfalfa','avena','cebada','trigo','colza','palma','cafe','te','coco','banano','cacao','oliva','uva','manzana','naranja','aguacate','cana','caucho','cardamomo'],
};
const ROT_GOOD_AFTER_LEGUME = ['maiz','trigo','cebada','girasol','sorgo','cana','tomate','papa','cebolla','ajo','pimiento','zanahoria','sandia','melon','calabaza','tabaco','cafe','aguacate','naranja','manzana'];

const PRIORITY_WEIGHTS = {
  equilibrado: { clima: 0.40, rot: 0.25, agua: 0.15,  suelo: 0.10,  erosion: 0.10 },
  agua:        { clima: 0.30, rot: 0.15, agua: 0.40,  suelo: 0.075, erosion: 0.075 },
  suelo:       { clima: 0.30, rot: 0.25, agua: 0.10,  suelo: 0.25,  erosion: 0.10 },
  erosion:     { clima: 0.30, rot: 0.15, agua: 0.10,  suelo: 0.10,  erosion: 0.35 },
  ingreso:     { clima: 0.40, rot: 0.25, agua: 0.15,  suelo: 0.10,  erosion: 0.10 }, // sin datos de mercado: criterio equilibrado
};

let lastAnalysis = null;
let lastCropKey = null;
let lastPrevKey = null;

/* ---------- utilidades ---------- */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const pct = x => Math.round(x * 100);
const meanOf = a => a.reduce((x, y) => x + y, 0) / a.length;
const stdOf = a => { const m = meanOf(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) * (v - m), 0) / a.length); };

function numAt(obj, k){
  const v = obj ? obj[k] : undefined;
  return (typeof v === 'number' && v > -900) ? v : null;
}
function statsOver(obj, keys){
  const vals = keys.map(k => numAt(obj, k)).filter(v => v !== null);
  const sum = vals.reduce((a, b) => a + b, 0);
  return { n: vals.length, vals, sum, avg: vals.length ? sum / vals.length : null };
}
function shiftKey(key, years){ return String(parseInt(key.slice(0, 4), 10) + years) + key.slice(4); }

/* ---------- análisis de datos NASA POWER ---------- */
function buildAnalysis(data, endDate, recentStart, years, months){
  const P = data && data.properties && data.properties.parameter;
  if(!P || !P.PRECTOTCORR || !P.T2M) return null;
  months = months || 0;

  // Lapso del promedio histórico: años + meses hacia atrás desde la fecha final
  const spanStart = histSpanStart(endDate, years, months);
  const winLen = Math.round((endDate - recentStart) / 86400000) + 1;
  const dataStart = new Date(spanStart); dataStart.setDate(dataStart.getDate() - winLen);
  const ds = fmtDate(dataStart), ss = fmtDate(spanStart);
  const all = Object.keys(P.PRECTOTCORR).filter(k => k >= ds).sort();
  const rs = fmtDate(recentStart), re = fmtDate(endDate);
  const rk = all.filter(k => k >= rs && k <= re);

  const rain = statsOver(P.PRECTOTCORR, rk);
  const temp = statsOver(P.T2M, rk);
  if(rain.n < 7 || temp.n < 7) return null;   // punto sin datos válidos (océano / fuera de cobertura)

  const hum  = statsOver(P.RH2M, rk);
  const root = statsOver(P.GWETROOT, rk);
  const top  = statsOver(P.GWETTOP, rk);
  const tmin = statsOver(P.T2M_MIN, rk);
  const tmax = statsOver(P.T2M_MAX, rk);
  const frostDays = tmin.vals.filter(v => v <= FROST_C).length;
  const heatDays  = tmax.vals.filter(v => v >= HEAT_C).length;

  // Climatología del mismo período calendario en los años previos
  const yearsRain = [], yearsRoot = [];
  for(let y = 1; y <= years; y++){
    const ks = rk.map(k => shiftKey(k, -y));
    const r = statsOver(P.PRECTOTCORR, ks);
    if(r.n >= rk.length - 1) yearsRain.push(r.sum);
    const g = statsOver(P.GWETROOT, ks);
    if(g.n >= rk.length - 1) yearsRoot.push(g.avg);
  }
  // Con menos de 3 años no alcanza para comparar "mismas fechas": se usan períodos
  // consecutivos del mismo largo dentro del lapso histórico (sin corrección estacional).
  let mode = 'anual';
  if(yearsRain.length < 3){
    mode = 'bloques';
    yearsRain.length = 0; yearsRoot.length = 0;
    const prior = all.filter(k => k >= ss && k < rs);
    for(let e = prior.length; e - rk.length >= 0; e -= rk.length){
      const ks = prior.slice(e - rk.length, e);
      const r = statsOver(P.PRECTOTCORR, ks);
      if(r.n >= rk.length - 1) yearsRain.push(r.sum);
      const g = statsOver(P.GWETROOT, ks);
      if(g.n >= rk.length - 1) yearsRoot.push(g.avg);
    }
  }
  const span = spanLabel(years, months);
  const clim = {
    n: yearsRain.length, mode,
    refShort: mode === 'anual' ? `${yearsRain.length} años` : span,
    refLong: mode === 'anual'
      ? `el promedio de ${yearsRain.length} años para estas fechas`
      : `el promedio de ${yearsRain.length} períodos de ${rk.length} días en ${lastSpanLabel(years, months)}`,
  };
  if(yearsRain.length >= 3){
    clim.rainMean = meanOf(yearsRain);
    clim.rainStd = stdOf(yearsRain);
    clim.rainDiffPct = clim.rainMean > 0 ? Math.round((rain.sum - clim.rainMean) / clim.rainMean * 100) : null;
    clim.rainPctile = Math.round((yearsRain.filter(v => v < rain.sum).length + 0.5 * yearsRain.filter(v => v === rain.sum).length) / yearsRain.length * 100);
  }
  if(yearsRoot.length >= 3 && root.avg !== null){
    clim.rootMean = meanOf(yearsRoot);
    clim.rootDiff = root.avg - clim.rootMean;
  }

  // Climatología mensual (promedio de años completos)
  const byYM = {};
  all.forEach(k => {
    const ym = k.slice(0, 6);
    if(!byYM[ym]) byYM[ym] = { rain: [], temp: [], tmin: [] };
    const r = numAt(P.PRECTOTCORR, k), t = numAt(P.T2M, k), tm = numAt(P.T2M_MIN, k);
    if(r !== null) byYM[ym].rain.push(r);
    if(t !== null) byYM[ym].temp.push(t);
    if(tm !== null) byYM[ym].tmin.push(tm);
  });
  const curYM = re.slice(0, 6);
  const buckets = Array.from({ length: 12 }, () => ({ rains: [], temps: [], frost: [] }));
  Object.keys(byYM).forEach(ym => {
    if(ym === curYM) return;                       // mes actual incompleto
    const o = byYM[ym], m = parseInt(ym.slice(4), 10) - 1;
    if(o.rain.length >= 20) buckets[m].rains.push(meanOf(o.rain) * 30.4);
    if(o.temp.length >= 20) buckets[m].temps.push(meanOf(o.temp));
    if(o.tmin.length >= 20) buckets[m].frost.push(Math.min.apply(null, o.tmin) <= FROST_C ? 1 : 0);
  });
  const monthly = buckets.map((b, i) => ({
    m: i + 1,
    rain: b.rains.length ? meanOf(b.rains) : null,
    temp: b.temps.length ? meanOf(b.temps) : null,
    frostProb: b.frost.length ? meanOf(b.frost) : null,
    n: b.temps.length,
  }));

  const series = {};
  rk.forEach(k => { const v = numAt(P.PRECTOTCORR, k); series[k] = v === null ? 0 : v; });

  const coords = data.geometry && data.geometry.coordinates;
  return {
    recent: {
      days: rk.length, rain: rain.sum, rainN: rain.n, temp: temp.avg, hum: hum.avg,
      root: root.avg, top: top.avg, tmin: tmin.avg, tmax: tmax.avg,
      frostDays, heatDays, series,
    },
    clim, monthly, years, months, spanLabel: span, windowDays: rk.length,
    elev: coords && typeof coords[2] === 'number' ? coords[2] : null,
  };
}

/* ---------- escenario y prioridades ---------- */
function getScenario(){
  return {
    rainAdj: parseFloat(document.getElementById('rainAdj').value) || 0,
    tempAdj: parseFloat(document.getElementById('tempAdj').value) || 0,
    priority: document.getElementById('priority').value || 'equilibrado',
  };
}
function adjustedConditions(rec, sc){
  // Ajuste simple: cada +/-10% de lluvia mueve la humedad de raíces ~ +/-5% (relativo).
  const root = rec.root !== null ? clamp(rec.root * (1 + sc.rainAdj / 100 * 0.5), 0, 1) : null;
  return { root, temp: rec.temp + sc.tempAdj };
}

/* ---------- puntaje de estrategias ---------- */
function scoreCrop(key, prevKey, soil, temp, priority){
  const c = CROP_DB[key];
  const m0 = c.gwetRange[0], m1 = c.gwetRange[1], t0 = c.tempRange[0], t1 = c.tempRange[1];
  const dm = soil < m0 ? m0 - soil : (soil > m1 ? soil - m1 : 0);
  const dt = temp < t0 ? t0 - temp : (temp > t1 ? temp - t1 : 0);
  const clima = 0.5 * clamp(1 - dm / 0.3, 0, 1) + 0.5 * clamp(1 - dt / 8, 0, 1);
  const legume = c.family === 'leguminosa';

  let rot = 0.5;
  if(prevKey && prevKey !== 'ninguno' && CROP_DB[prevKey]){
    const p = CROP_DB[prevKey];
    if(prevKey === key) rot = 0.05;
    else if(p.family === c.family) rot = 0.15;
    else if(p.family === 'leguminosa' && ROT_GOOD_AFTER_LEGUME.indexOf(key) >= 0) rot = 1;
    else if(legume) rot = 0.9;
    else rot = 0.6;
  }
  const mid = (m0 + m1) / 2;
  const agua = clamp(1 - (mid - 0.25) / 0.6, 0, 1);
  const suelo = clamp(0.1 + (legume ? 0.5 : 0) + (TRAITS.deepRoot.indexOf(key) >= 0 ? 0.4 : 0) + (TRAITS.cover.indexOf(key) >= 0 ? 0.2 : 0), 0, 1);
  const erosion = TRAITS.cover.indexOf(key) >= 0 ? 0.9 : 0.3;

  const w = PRIORITY_WEIGHTS[priority] || PRIORITY_WEIGHTS.equilibrado;
  const total = clima * w.clima + rot * w.rot + agua * w.agua + suelo * w.suelo + erosion * w.erosion;
  return { total, parts: { clima, rot, agua, suelo, erosion }, dm, dt, legume, mid };
}

function rotationText(prevKey, key){
  if(!prevKey || prevKey === 'ninguno' || !CROP_DB[prevKey]) return 'Sin cultivo anterior informado: no se puede evaluar la rotación.';
  const p = CROP_DB[prevKey], c = CROP_DB[key];
  const pf = FAMILY_LABEL[p.family] || p.family, cf = FAMILY_LABEL[c.family] || c.family;
  if(prevKey === key) return `Repetir ${c.label} (monocultivo): acumula plagas y enfermedades del suelo y agota los mismos nutrientes.`;
  if(p.family === c.family) return `${p.label} y ${c.label} son de la misma familia (${cf}): comparten plagas y enfermedades.`;
  if(p.family === 'leguminosa' && ROT_GOOD_AFTER_LEGUME.indexOf(key) >= 0) return `${p.label} (leguminosa) deja nitrógeno disponible que ${c.label} aprovecha.`;
  if(c.family === 'leguminosa') return `${c.label} es leguminosa: fija nitrógeno y mejora el suelo para el cultivo siguiente.`;
  return `Familias distintas (${pf} → ${cf}): ayuda a cortar el ciclo de plagas específicas de ${p.label}.`;
}

function buildStrategyCard(title, key, prevKey, A, adj, sc, highlight){
  const c = CROP_DB[key];
  const rec = A.recent;
  const soil = adj.root !== null ? adj.root : 0.5;
  const s = scoreCrop(key, prevKey, soil, adj.temp, sc.priority);
  const m0 = c.gwetRange[0], m1 = c.gwetRange[1], t0 = c.tempRange[0], t1 = c.tempRange[1];

  const why = [rotationText(prevKey, key)];
  const climaTxt = (s.dm === 0 && s.dt === 0)
    ? 'Humedad de suelo y temperatura actuales dentro del rango del cultivo.'
    : 'Las condiciones actuales se alejan del rango ideal del cultivo (ver riesgos).';
  why.push(climaTxt);

  const evidence = [];
  if(adj.root !== null) evidence.push(`Humedad de suelo (raíces, NASA POWER GWETROOT): ${pct(adj.root)}% — rango de ${c.label}: ${pct(m0)}–${pct(m1)}%.`);
  evidence.push(`Temperatura media (NASA POWER T2M): ${adj.temp.toFixed(1)} °C — rango: ${t0}–${t1} °C.`);
  if(A.clim.rainDiffPct !== undefined && A.clim.rainDiffPct !== null){
    evidence.push(`Lluvia ${rec.days} d: ${rec.rain.toFixed(0)} mm (${A.clim.rainDiffPct >= 0 ? '+' : ''}${A.clim.rainDiffPct}% vs media de ${A.clim.refShort}).`);
  }
  if(rec.frostDays > 0) evidence.push(`${rec.frostDays} día(s) con T mín ≤ ${FROST_C} °C en los últimos ${rec.days} días.`);

  const benefits = [];
  if(s.legume) benefits.push('Fija nitrógeno: reduce la necesidad de fertilizante en el cultivo siguiente.');
  if(TRAITS.deepRoot.indexOf(key) >= 0) benefits.push('Raíz profunda: mejora la infiltración y la estructura del suelo.');
  if(TRAITS.cover.indexOf(key) >= 0) benefits.push('Cobertura densa o perenne: reduce el riesgo de erosión.');
  if(s.mid < 0.45) benefits.push('Demanda hídrica baja a moderada (tolera suelos más secos).');
  if(s.parts.rot >= 0.9) benefits.push('Rotación favorable respecto del cultivo anterior.');
  if(!benefits.length) benefits.push('Sin beneficios de suelo destacados según las reglas del prototipo.');

  const gaps = [
    'Sin datos de suelo de la parcela (textura, materia orgánica, compactación).',
    'Sin precios ni mercado local: el ingreso potencial no está evaluado.',
    'La humedad de suelo es modelada (NASA POWER), no una medición SMAP puntual.',
  ];
  if(adj.root === null) gaps.unshift('NASA POWER no devolvió humedad de suelo válida: el ajuste por humedad no es confiable.');

  const risks = [];
  if(s.dm > 0) risks.push(soil < m0 ? 'Suelo más seco que el rango ideal: puede requerir riego o esperar lluvia.' : 'Suelo más húmedo que el rango ideal: riesgo de anegamiento y enfermedades.');
  if(s.dt > 0) risks.push(adj.temp < t0 ? 'Temperatura por debajo del rango ideal: crecimiento lento.' : 'Temperatura por encima del rango ideal: posible estrés térmico.');
  if(rec.frostDays > 0 && t0 >= 15) risks.push('Hubo temperaturas de helada recientes: riesgo para un cultivo sensible al frío.');
  if(rec.heatDays > 0 && t1 <= 27) risks.push('Hubo días de calor extremo recientes: riesgo para un cultivo de clima templado.');
  if(prevKey && CROP_DB[prevKey] && (prevKey === key || CROP_DB[prevKey].family === c.family)) risks.push('Misma familia que el cultivo anterior: mayor presión de plagas y enfermedades.');
  if(s.legume) risks.push('Conviene validar inoculante y cepa de rizobios adecuados para la zona.');
  risks.push('Validar con un agrónomo o técnico local antes de decidir.');

  const bar = (label, v) => `<div class="bar"><span>${label}</span><div class="bar-track"><i style="width:${pct(v)}%"></i></div></div>`;
  const li = arr => '<ul>' + arr.map(t => `<li>${t}</li>`).join('') + '</ul>';

  return `<div class="strat${highlight ? ' strat-main' : ''}">
    <div class="strat-head">
      <span class="strat-tag">${title}</span>
      <div class="strat-crop">${c.label}</div>
      <div class="strat-score">${pct(s.total)}<small>/100</small></div>
    </div>
    <div class="bars">${bar('Clima', s.parts.clima)}${bar('Rotación', s.parts.rot)}${bar('Agua', s.parts.agua)}${bar('Suelo', s.parts.suelo)}${bar('Erosión', s.parts.erosion)}</div>
    <h4>Por qué</h4>${li(why)}
    <h4>Evidencia</h4>${li(evidence)}
    <h4>Beneficios posibles</h4>${li(benefits)}
    <h4>Lagunas de información</h4>${li(gaps)}
    <h4>Riesgos a revisar</h4>${li(risks)}
  </div>`;
}

function renderStrategies(A, adj, sc){
  const cropKey = lastCropKey, prevKey = lastPrevKey;
  const known = prevKey && prevKey !== 'ninguno' && CROP_DB[prevKey];
  const soil = adj.root !== null ? adj.root : 0.5;
  const prevForRank = known ? prevKey : 'ninguno';

  const picks = [];
  picks.push({ title: known ? 'Actual · repetir cultivo anterior' : 'Actual · sin rotación', key: known ? prevKey : cropKey, prev: known ? prevKey : cropKey });
  picks.push({ title: 'Tu opción elegida', key: cropKey, prev: prevKey, main: true });

  const optionKeys = Array.prototype.map.call(document.getElementById('crop').options, o => o.value).filter(k => CROP_DB[k]);
  const used = new Set([picks[0].key, cropKey]);
  const ranked = optionKeys.filter(k => !used.has(k))
    .map(k => ({ k, s: scoreCrop(k, prevForRank, soil, adj.temp, sc.priority).total }))
    .sort((a, b) => b.s - a.s);
  if(ranked.length){
    const A1 = ranked[0].k;
    picks.push({ title: 'Alternativa A', key: A1, prev: prevForRank });
    const famA = CROP_DB[A1].family;
    const B = ranked.slice(1).find(r => CROP_DB[r.k].family !== famA) || ranked[1];
    if(B) picks.push({ title: 'Alternativa B', key: B.k, prev: prevForRank });
  }

  const prioNote = sc.priority === 'ingreso'
    ? 'Prioridad «ingreso extra»: este prototipo no tiene datos de mercado, por lo que se usa el criterio equilibrado.'
    : 'Prioridad aplicada: ' + document.getElementById('priority').selectedOptions[0].textContent + '.';
  document.getElementById('strategyNote').textContent = prioNote;
  document.getElementById('strategyGrid').innerHTML = picks.map(p => buildStrategyCard(p.title, p.key, p.prev, A, adj, sc, p.main)).join('');
}

/* ---------- paneles 04 a 06 ---------- */
function renderWater(A){
  const rec = A.recent, clim = A.clim;
  let color, label, text;
  const rd = clim.rainDiffPct;
  const tempTxt = rec.temp.toFixed(1);
  if(rd !== undefined && rd !== null){
    const base = `Tu zona recibió <b>${rec.rain.toFixed(0)} mm</b> en ${rec.days} días (${rd >= 0 ? '+' : ''}${rd}% vs ${clim.refLong}; percentil ${clim.rainPctile}).`;
    if(rd <= -40){ color = 'var(--red)'; label = 'SECO'; text = `${base} Con temperatura media de ${tempTxt} °C, conviene revisar el riego esta semana.`; }
    else if(rd <= -15){ color = 'var(--amber)'; label = 'ATENCIÓN'; text = `${base} Vale la pena monitorear los próximos días.`; }
    else { color = 'var(--leaf)'; label = 'OK'; text = `${base} Sin señales de estrés hídrico por ahora.`; }
    if(clim.rootDiff !== undefined && clim.rootDiff <= -0.1){
      text += ` La humedad de suelo en raíces está ${Math.abs(clim.rootDiff * 100).toFixed(0)} puntos por debajo de lo normal.`;
      if(label === 'OK'){ color = 'var(--amber)'; label = 'ATENCIÓN'; }
    }
  } else {
    color = 'var(--amber)'; label = 'S/D';
    text = `No hay suficiente historia de lluvia para comparar. Temperatura media reciente: ${tempTxt} °C.`;
  }
  const dot = document.getElementById('dot');
  dot.style.background = color; dot.style.color = '#0c1712'; dot.textContent = label;
  document.getElementById('verdictText').innerHTML = text;
  document.getElementById('resultPanel').style.display = 'block';
}

function renderStats(A){
  const rec = A.recent, clim = A.clim;
  const f1 = v => v === null || v === undefined ? 's/d' : v.toFixed(1);
  const pctTxt = v => v === null || v === undefined ? 's/d' : (v * 100).toFixed(0);
  const diff = clim.rainDiffPct;
  const cell = (label, value, unit, color) =>
    `<div class="stat"><div class="label">${label}</div><div class="value"${color ? ` style="color:${color}"` : ''}>${value}<span class="unit"> ${unit || ''}</span></div></div>`;
  let h = '';
  h += cell(`Lluvia acumulada (${rec.days} d)`, rec.rain.toFixed(1), 'mm');
  h += cell(`Lluvia media (${clim.rainMean !== undefined ? clim.refShort : 's/d'})`, clim.rainMean !== undefined ? clim.rainMean.toFixed(1) : 's/d', 'mm');
  h += cell('Anomalía de lluvia', diff === undefined || diff === null ? 's/d' : (diff >= 0 ? '+' : '') + diff + '%', '', diff !== undefined && diff !== null && diff < 0 ? 'var(--red)' : 'var(--leaf)');
  h += cell('Percentil de lluvia', clim.rainPctile !== undefined ? clim.rainPctile : 's/d', '');
  h += cell('Temp. promedio', f1(rec.temp), '°C');
  h += cell('Temp. mín. / máx.', `${f1(rec.tmin)} / ${f1(rec.tmax)}`, '°C');
  h += cell(`Días con helada (≤${FROST_C} °C)`, rec.frostDays, 'd', rec.frostDays > 0 ? 'var(--amber)' : '');
  h += cell(`Días de calor (≥${HEAT_C} °C)`, rec.heatDays, 'd', rec.heatDays > 0 ? 'var(--amber)' : '');
  h += cell('Humedad relativa', rec.hum === null ? 's/d' : rec.hum.toFixed(0), '%');
  h += cell('Humedad suelo (raíces)', pctTxt(rec.root), '%');
  h += cell('Anomalía humedad suelo', clim.rootDiff !== undefined ? (clim.rootDiff >= 0 ? '+' : '') + (clim.rootDiff * 100).toFixed(0) : 's/d', 'pts');
  h += cell('Humedad suelo (superficie)', pctTxt(rec.top), '%');
  if(A.elev !== null) h += cell('Elevación (grilla POWER)', A.elev.toFixed(0), 'm');
  document.getElementById('statsGrid').innerHTML = h;
  document.getElementById('statsPanel').style.display = 'block';
}

function renderCrop(A, adj, sc){
  const dot = document.getElementById('cropDot');
  const scenarioTxt = (sc.rainAdj !== 0 || sc.tempAdj !== 0)
    ? `<div class="scenario-flag">Escenario aplicado: lluvia ${sc.rainAdj >= 0 ? '+' : ''}${sc.rainAdj}%, temperatura ${sc.tempAdj >= 0 ? '+' : ''}${sc.tempAdj} °C (ajuste simple, no es un pronóstico).</div>` : '';
  if(adj.root === null){
    dot.style.background = 'var(--amber)'; dot.style.color = '#0c1712'; dot.textContent = 'S/D';
    document.getElementById('cropVerdictText').innerHTML = 'NASA POWER no devolvió humedad de suelo para este punto, por lo que no se puede evaluar la siembra.';
    document.getElementById('cropChecklist').innerHTML = '';
    document.getElementById('rotationNote').innerHTML = '';
  } else {
    const r = evaluateCrop(lastCropKey, lastPrevKey, adj.root, adj.temp);
    dot.style.background = r.dotColor; dot.style.color = '#0c1712'; dot.textContent = r.dotLabel;
    document.getElementById('cropVerdictText').innerHTML = r.verdict;
    document.getElementById('cropChecklist').innerHTML = r.checklist.map(c => `<div class="verdict-text" style="margin-bottom:6px;">• ${c}</div>`).join('') + scenarioTxt;
    document.getElementById('rotationNote').innerHTML = r.rotationHtml;
  }
  document.getElementById('cropPanel').style.display = 'block';
}

/* ---------- calendario climático anual ---------- */
function renderAnnual(A){
  const svg = document.getElementById('annualChart');
  svg.innerHTML = '';
  const crop = CROP_DB[lastCropKey];
  const ns = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs, txt) => { const e = document.createElementNS(ns, tag); Object.keys(attrs).forEach(k => e.setAttribute(k, attrs[k])); if(txt !== undefined) e.textContent = txt; svg.appendChild(e); return e; };

  const w = 800, h = 270, padL = 40, padR = 40, padT = 14, padB = 44;
  const M = A.monthly;
  const rains = M.map(x => x.rain || 0);
  const maxR = Math.max(60, Math.max.apply(null, rains));
  const temps = M.map(x => x.temp).filter(v => v !== null);
  if(!temps.length){ document.getElementById('annualNote').textContent = 'Sin datos mensuales suficientes para este punto.'; return; }
  const tLo = Math.floor(Math.min(Math.min.apply(null, temps), crop.tempRange[0]) - 2);
  const tHi = Math.ceil(Math.max(Math.max.apply(null, temps), crop.tempRange[1]) + 2);
  const plotH = h - padT - padB;
  const yT = t => padT + plotH * (1 - (t - tLo) / (tHi - tLo));
  const yR = r => padT + plotH * (1 - r / maxR);
  const colW = (w - padL - padR) / 12;

  mk('rect', { x: padL, y: yT(crop.tempRange[1]), width: w - padL - padR, height: Math.max(2, yT(crop.tempRange[0]) - yT(crop.tempRange[1])), fill: '#5fd48a', opacity: 0.12 });
  mk('line', { x1: padL, x2: w - padR, y1: padT + plotH, y2: padT + plotH, stroke: '#24392e' });

  const okMonths = [], vulMonths = [], frostMonths = [];
  M.forEach((x, i) => {
    const cx = padL + colW * i + colW / 2;
    if(x.rain !== null){
      const bh = plotH * (x.rain / maxR);
      mk('rect', { x: cx - colW * 0.28, y: padT + plotH - bh, width: colW * 0.56, height: Math.max(bh, 1), fill: '#4aa3df', opacity: 0.55, rx: 2 });
    }
    mk('text', { x: cx, y: h - 24, 'font-size': 10, 'text-anchor': 'middle' }, MESES[i]);

    let status = 'nd';
    if(x.temp !== null){
      const tOk = x.temp >= crop.tempRange[0] && x.temp <= crop.tempRange[1];
      const rOk = x.rain !== null && x.rain >= 30;
      if(tOk && rOk){ status = 'ok'; okMonths.push(MESES[i]); }
      else { status = (!tOk) ? 'red' : 'amber'; vulMonths.push(MESES[i]); }
    }
    const col = status === 'ok' ? '#5fd48a' : status === 'red' ? '#e2624f' : status === 'amber' ? '#e8b34d' : '#24392e';
    mk('circle', { cx, cy: h - 10, r: 4, fill: col });
    if(x.frostProb !== null && x.frostProb >= 0.3) frostMonths.push(MESES[i]);
  });

  const pts = M.map((x, i) => x.temp === null ? null : `${(padL + colW * i + colW / 2).toFixed(1)},${yT(x.temp).toFixed(1)}`).filter(Boolean).join(' ');
  mk('polyline', { points: pts, fill: 'none', stroke: '#e8b34d', 'stroke-width': 2 });

  mk('text', { x: 4, y: padT + 8, 'font-size': 9 }, 'mm');
  mk('text', { x: w - 4, y: padT + 8, 'font-size': 9, 'text-anchor': 'end' }, '°C');
  mk('text', { x: padL - 4, y: yR(maxR) + 8, 'font-size': 9, 'text-anchor': 'end' }, Math.round(maxR));
  mk('text', { x: w - padR + 4, y: yT(tHi) + 8, 'font-size': 9 }, tHi);
  mk('text', { x: w - padR + 4, y: yT(tLo), 'font-size': 9 }, tLo);

  const parts = [];
  parts.push(okMonths.length ? `Meses con ventana climática favorable para <b>${crop.label.toLowerCase()}</b> (temperatura media dentro del rango y ≥30 mm): <b>${okMonths.join(', ')}</b>.` : `Ningún mes cumple a la vez el rango de temperatura y ≥30 mm de lluvia para ${crop.label.toLowerCase()}.`);
  if(vulMonths.length) parts.push(`Meses más vulnerables (temperatura fuera de rango o lluvia escasa; posibles períodos de barbecho): ${vulMonths.join(', ')}.`);
  if(frostMonths.length) parts.push(`Riesgo de helada (T mín ≤ ${FROST_C} °C en al menos 30% de los años): ${frostMonths.join(', ')}.`);
  document.getElementById('annualNote').innerHTML = parts.join('<br>');
}

/* ---------- límites del análisis ---------- */
function renderGaps(A){
  const items = [
    'Humedad de suelo: es la modelada por NASA POWER (GWETROOT/GWETTOP), no una medición satelital puntual de SMAP. Las capas SMAP del mapa sirven como referencia visual.',
    'Suelo de la parcela (textura, materia orgánica, drenaje, compactación): no está incluido. Requiere análisis local o bases como Web Soil Survey/SSURGO (EE. UU.).',
    'Erosión y pendiente: no se calcula con SRTM; la erosión se estima solo por el tipo de cultivo (cobertura/perennes).',
    'Mercado e ingresos: sin datos de precios ni demanda local.',
    'Resolución: NASA POWER usa una grilla de ~50 km; las condiciones de una parcela concreta pueden diferir.',
    'Las reglas de rotación y los rangos de humedad/temperatura de cada cultivo son aproximados, no un modelo de rendimiento.',
    'Dónde hace falta criterio humano: decisión final de siembra, elección de variedad, manejo del riego y sanidad.',
  ];
  if(A.clim.mode === 'anual' && A.clim.n < A.years) items.unshift(`Climatología con solo ${A.clim.n} años válidos (se pidieron ${A.years}): menor confianza en las anomalías.`);
  if(A.clim.n < 3) items.unshift(`El promedio histórico (${A.spanLabel}) es demasiado corto para compararlo con los últimos ${A.windowDays} días: agregá más meses o años.`);
  else if(A.clim.mode === 'bloques') items.unshift(`El promedio histórico (${A.spanLabel}) no llega a 3 años: se compara contra períodos consecutivos de ${A.windowDays} días dentro de ese lapso, sin corregir por la época del año. Refleja el clima reciente pero es poco estable.`);
  else if(A.years < 5) items.unshift(`El promedio usa solo ${A.spanLabel}: refleja el clima reciente pero es poco estable. Probá con 10 años o más.`);
  if(A.recent.rainN < A.recent.days) items.unshift(`Faltan ${A.recent.days - A.recent.rainN} día(s) de lluvia en el período reciente.`);
  document.getElementById('gapsList').innerHTML = items.map(t => `<li>${t}</li>`).join('');
  document.getElementById('gapsPanel').style.display = 'block';
}

/* ---------- orquestación ---------- */
function renderAll(){
  if(!lastAnalysis) return;
  const A = lastAnalysis;
  const sc = getScenario();
  const adj = adjustedConditions(A.recent, sc);
  renderWater(A);
  renderStats(A);
  renderCrop(A, adj, sc);
  renderStrategies(A, adj, sc);
  document.getElementById('strategyPanel').style.display = 'block';
  renderAnnual(A);
  document.getElementById('annualPanel').style.display = 'block';
  drawChart(A.recent.series);
  document.getElementById('chartPanel').style.display = 'block';
  renderGaps(A);
}

function setAnalysis(A, cropKey, prevKey){
  lastAnalysis = A; lastCropKey = cropKey; lastPrevKey = prevKey;
  updatePeriodLabels(A.spanLabel, A.windowDays);
  renderAll();
}

/* ---------- período del promedio configurable ---------- */
let lastRaw = null;   // { data, end, start }: respuesta de NASA POWER en memoria

const CLIM_HELP = 'Ejemplo: 5 año/s y 6 mes/es = el histórico de los últimos 5 años y 6 meses. Año/s: de 0 a 30 · Mes/es: de 0 a 11; con 0 años, indicá al menos 1 mes.';

function spanLabel(years, months){
  const y = years ? `${years} ${years === 1 ? 'año' : 'años'}` : '';
  const m = months ? `${months} ${months === 1 ? 'mes' : 'meses'}` : '';
  return y && m ? `${y} y ${m}` : (y || m);
}
function lastSpanLabel(years, months){
  if(years === 1 && !months) return 'el último año';
  if(!years && months === 1) return 'el último mes';
  return 'los últimos ' + spanLabel(years, months);
}

function getAverageSettings(){
  const yearEl = document.getElementById('climYears');
  const monthEl = document.getElementById('climMonths');
  const helpEl = document.getElementById('climHelp');
  const parse = el => { const v = el.value.trim(); return v === '' ? 0 : (/^\d+$/.test(v) ? Number(v) : NaN); };
  const years = parse(yearEl), months = parse(monthEl);
  const badY = !(years >= 0 && years <= 30), badM = !(months >= 0 && months <= 11);
  const none = !badY && !badM && years === 0 && months === 0;
  let msg = '';
  if(badY) msg = 'Los años del promedio histórico deben ser un número entre 0 y 30.';
  else if(badM) msg = 'Los meses del promedio histórico deben ser un número entre 0 y 11.';
  else if(none) msg = 'Con 0 años tenés que indicar al menos 1 mes de promedio histórico.';
  yearEl.classList.toggle('invalid', badY);
  monthEl.classList.toggle('invalid', badM || none);
  // Leyenda: qué histórico se va a usar con los valores cargados, más un ejemplo
  helpEl.textContent = msg || `Se usa el histórico de ${lastSpanLabel(years, months)}. ${CLIM_HELP}`;
  helpEl.classList.toggle('error', !!msg);
  if(msg) throw new Error(msg);
  const days = parseInt(document.getElementById('windowDays').value, 10) || 14;
  return { years, months, days };
}
function cacheRaw(data, end, start){ lastRaw = { data, end, start }; }

function histSpanStart(end, years, months){
  // Años + meses calendario hacia atrás desde la fecha final.
  const start = new Date(end);
  const day = start.getDate();
  start.setDate(1);
  start.setMonth(start.getMonth() - (years * 12 + months));
  // Si el mes no tiene ese día, usar su último día.
  const lastDay = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
  start.setDate(Math.min(day, lastDay));
  return start;
}
function recentStartFor(end, days){
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  return start;
}
function fetchStartFor(end, st){
  // Primer día que hay que pedirle a NASA POWER: inicio del lapso histórico menos una ventana reciente.
  const start = histSpanStart(end, st.years, st.months);
  start.setDate(start.getDate() - st.days);
  return start;
}
function analyzeRaw(raw, st){
  return buildAnalysis(raw.data, raw.end, recentStartFor(raw.end, st.days), st.years, st.months);
}
function updatePeriodLabels(span, days){
  document.querySelectorAll('.clim-span').forEach(e => { e.textContent = span; });
  if(days != null) document.querySelectorAll('.win-days').forEach(e => { e.textContent = days; });
}
function onAverageSettingsChange(){
  const statusEl = document.getElementById('status');
  let st;
  try { st = getAverageSettings(); }
  catch(err){ statusEl.textContent = err.message; return; }
  const span = spanLabel(st.years, st.months);
  updatePeriodLabels(span, st.days);
  if(!lastRaw){ statusEl.textContent = ''; return; }
  if(fetchStartFor(lastRaw.end, st) < lastRaw.start){
    document.getElementById('run').click();
    return;
  }
  const A = analyzeRaw(lastRaw, st);
  if(!A){ statusEl.textContent = 'No hay datos válidos para ese período.'; return; }
  setAnalysis(A, lastCropKey, lastPrevKey);
  statusEl.textContent = `Recalculado con promedio histórico de ${span} y últimos ${st.days} días (sin nueva consulta).`;
}

/* ---------- capas NASA GIBS ---------- */
const GIBS_LAYERS = {
  ndvi:  { id: 'MODIS_Terra_NDVI_8Day', level: 9, label: 'Índice de vegetación NDVI (MODIS Terra, 8 días)' },
  smap:  { id: 'SMAP_L3_Passive_Enhanced_Day_Soil_Moisture', level: 6, label: 'Humedad del suelo (SMAP, diaria)' },
  imerg: { id: 'IMERG_Precipitation_Rate', level: 6, label: 'Tasa de precipitación (GPM IMERG)' },
  lst:   { id: 'MODIS_Terra_L3_Land_Surface_Temp_Daily_Day', level: 7, label: 'Temperatura superficial diurna (MODIS Terra)' },
};
let gibsLayer = null;

function setGibsLayer(key){
  const note = document.getElementById('gibsNote');
  if(gibsLayer){ map.removeLayer(gibsLayer); gibsLayer = null; }
  const cfg = GIBS_LAYERS[key];
  if(!cfg){ note.textContent = ''; return; }
  if(!map.getPane('gibsPane')){
    map.createPane('gibsPane');
    map.getPane('gibsPane').style.zIndex = 250;
  }
  const url = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${cfg.id}/default/default/GoogleMapsCompatible_Level${cfg.level}/{z}/{y}/{x}.png`;
  let errors = 0;
  gibsLayer = L.tileLayer(url, { pane: 'gibsPane', maxNativeZoom: cfg.level, maxZoom: 18, opacity: 0.75, attribution: 'NASA GIBS' });
  gibsLayer.on('tileerror', () => {
    errors++;
    if(errors === 6) note.textContent = cfg.label + ' · NASA GIBS (última fecha disponible). Algunas teselas no cargaron: la capa puede no tener datos en esta zona o fecha.';
  });
  gibsLayer.addTo(map);
  note.textContent = cfg.label + ' · NASA GIBS (última fecha disponible).';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('gibsLayer').addEventListener('change', e => setGibsLayer(e.target.value));

  const rainEl = document.getElementById('rainAdj'), tempEl = document.getElementById('tempAdj');
  const refreshLabels = () => {
    document.getElementById('rainAdjVal').textContent = (rainEl.value >= 0 ? '+' : '') + rainEl.value + '%';
    document.getElementById('tempAdjVal').textContent = (tempEl.value >= 0 ? '+' : '') + tempEl.value + ' °C';
  };
  [rainEl, tempEl].forEach(el => el.addEventListener('input', () => { refreshLabels(); renderAll(); }));
  document.getElementById('priority').addEventListener('change', renderAll);
  ['climYears', 'climMonths'].forEach(id => {
    const el = document.getElementById(id);
    // Solo números: se descarta cualquier otro carácter mientras se escribe o se pega
    el.addEventListener('input', () => { const v = el.value.replace(/\D/g, ''); if(v !== el.value) el.value = v; });
    el.addEventListener('change', onAverageSettingsChange);
  });
  document.getElementById('windowDays').addEventListener('change', onAverageSettingsChange);
  document.getElementById('resetScenario').addEventListener('click', () => {
    rainEl.value = 0; tempEl.value = 0; refreshLabels(); renderAll();
  });
  refreshLabels();
  const st0 = getAverageSettings();
  updatePeriodLabels(spanLabel(st0.years, st0.months), st0.days);
});
