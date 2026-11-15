// i18n.js — selector de idioma ES / EN para AgroNasa.
// El español es el idioma original de todos los textos. En inglés, el diccionario
// (i18n-en.js: window.I18N_EN) traduce lo que aparece en pantalla: se recorre el DOM,
// se traducen los nodos de texto y los atributos (placeholder, title, aria-label, alt)
// y un observador traduce lo que el código agrega después. Al volver a español se
// restauran los textos originales. La elección se guarda en el navegador.
//
// Para sumar o corregir una traducción: editar i18n-en.js ("texto en español": "English text").
// Las claves pueden llevar {0}, {1}... para las partes variables (números, nombres).

(function(){
  'use strict';

  const CLAVE = 'agronasa-idioma';
  const ATRIBUTOS = ['placeholder', 'title', 'aria-label', 'alt', 'aria-description'];
  const OMITIR = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, NOSCRIPT: 1, CODE: 1 };

  let idioma = 'es';
  try {
    const g = localStorage.getItem(CLAVE);
    if(g === 'en' || g === 'es') idioma = g;
  } catch(e){ /* sin almacenamiento: solo dura esta visita */ }

  /* ---------- diccionario ---------- */
  let exacto = null, patrones = null;
  const cache = new Map();

  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const norm = s => s.replace(/\s+/g, ' ').trim();

  function construir(){
    exacto = new Map(); patrones = [];
    const dic = window.I18N_EN || {};
    Object.keys(dic).forEach(es => {
      const clave = norm(es), en = dic[es];
      if(/\{\d+\}/.test(clave)){
        const orden = [];
        const partes = clave.split(/\{(\d+)\}/);
        let re = '^';
        partes.forEach((p, i) => {
          if(i % 2 === 0) re += esc(p).replace(/ /g, '\\s+');
          else { orden.push(p); re += '([\\s\\S]*?)'; }
        });
        patrones.push({ re: new RegExp(re + '$'), orden, en, largo: clave.replace(/\{\d+\}/g, '').length });
      } else {
        exacto.set(clave, en);
      }
    });
    patrones.sort((a, b) => b.largo - a.largo);
  }

  // Búsqueda exacta; "maíz" también encuentra "Maíz" (nombres de cultivos dentro de frases)
  function buscarExacto(s){
    if(exacto.has(s)) return exacto.get(s);
    const c = s.charAt(0);
    if(c && c !== c.toUpperCase()){
      const cap = c.toUpperCase() + s.slice(1);
      if(exacto.has(cap)){ const e = exacto.get(cap); return e.charAt(0).toLowerCase() + e.slice(1); }
    }
    if(c && c !== c.toLowerCase()){            // "Enero" también encuentra la clave "enero"
      const min = c.toLowerCase() + s.slice(1);
      if(exacto.has(min)){ const e = exacto.get(min); return e.charAt(0).toUpperCase() + e.slice(1); }
    }
    return null;
  }

  function trozo(v){
    const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(v);
    if(!m[2]) return v;
    let t = traducirNucleo(m[2]);
    if(t === null && !/[.!?:]$/.test(m[2])){         // la clave termina en punto y el trozo no
      t = traducirNucleo(m[2] + '.');
      if(t !== null) t = t.replace(/\.$/, '');
    }
    return t !== null ? m[1] + t + m[3] : v;
  }

  function patronDirecto(s){
    for(const p of patrones){
      const m = p.re.exec(s);
      if(!m) continue;
      return p.en.replace(/\{(\d+)\}/g, (x, n) => {
        const i = p.orden.indexOf(n);
        return i < 0 ? x : trozo(m[i + 1]);
      });
    }
    return null;
  }

  function buscarPatron(s){
    const r = patronDirecto(s);
    if(r !== null) return r;
    const c = s.charAt(0);
    if(c && c !== c.toLowerCase()){            // "El suelo…" también encuentra la clave "el suelo…"
      const r2 = patronDirecto(c.toLowerCase() + s.slice(1));
      if(r2 !== null) return r2.charAt(0).toUpperCase() + r2.slice(1);
    }
    return null;
  }

  const CORTE = /(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ¿¡<])/;
  function porOraciones(s){
    const oraciones = s.split(CORTE);
    if(oraciones.length < 2) return null;
    let alguna = false;
    const out = oraciones.map(o => {
      const t = buscarExacto(o) ?? buscarPatron(o);
      if(t !== null){ alguna = true; return t; }
      return o;
    });
    return alguna ? out.join(' ') : null;
  }

  // Devuelve la traducción de un texto completo o null si no hay
  function traducirNucleo(s){
    if(!/[A-Za-zÁÉÍÓÚáéíóúñÑ]/.test(s)) return null;
    const num = /^(\d+\.\s+|[-•]\s+)([\s\S]+)$/.exec(s);          // "1. texto" o "- texto"
    if(num){ const r0 = traducirNucleo(num[2]); return r0 === null ? null : num[1] + r0; }
    let r = buscarExacto(s);
    if(r !== null) return r;
    r = porOraciones(s);
    if(r !== null) return r;
    r = buscarPatron(s);
    if(r !== null) return r;
    // Lista separada por comas (por ejemplo, meses o cultivos)
    if(s.indexOf(', ') > 0){
      const items = s.split(', ');
      let alguna = false;
      const out = items.map(it => { const t = buscarExacto(it); if(t !== null){ alguna = true; return t; } return it; });
      if(alguna) return out.join(', ');
    }
    return null;
  }

  function traducir(texto){
    if(idioma !== 'en' || typeof texto !== 'string' || !texto) return texto;
    if(!exacto) construir();
    if(cache.has(texto)) return cache.get(texto);
    const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(texto);
    const n = traducirNucleo(norm(m[2]));
    const res = n === null ? texto : m[1] + n + m[3];
    if(cache.size > 5000) cache.clear();
    cache.set(texto, res);
    return res;
  }

  /* ---------- t(): para textos que arma el código ---------- */
  function formato(s, args){ return s.replace(/\{(\d+)\}/g, (x, n) => (args[n] !== undefined ? args[n] : x)); }
  function t(es, ...args){
    if(idioma !== 'en') return formato(es, args);
    const dic = window.I18N_EN || {};
    const e = dic[es] !== undefined ? dic[es] : dic[norm(es)];
    if(e !== undefined) return formato(e, args.map(a => (typeof a === 'string' ? traducir(a) : a)));
    return traducir(formato(es, args));
  }

  /* ---------- DOM ---------- */
  const nodos = new WeakMap();     // nodo de texto -> { es, en }
  const attrs = new WeakMap();     // elemento -> { atributo: { es, en } }

  function nodoTexto(n){
    const r = nodos.get(n);
    if(idioma === 'en'){
      const orig = (r && n.nodeValue === r.en) ? r.es : n.nodeValue;
      const tr = traducir(orig);
      if(tr !== orig){ nodos.set(n, { es: orig, en: tr }); if(n.nodeValue !== tr) n.nodeValue = tr; }
      else if(r) nodos.delete(n);
    } else if(r){
      if(n.nodeValue === r.en) n.nodeValue = r.es;
      nodos.delete(n);
    }
  }

  function atributo(el, a){
    if(!el.hasAttribute(a)) return;
    const mapa = attrs.get(el) || {};
    const r = mapa[a];
    const actual = el.getAttribute(a);
    if(idioma === 'en'){
      const orig = (r && actual === r.en) ? r.es : actual;
      const tr = traducir(orig);
      if(tr !== orig){ mapa[a] = { es: orig, en: tr }; attrs.set(el, mapa); if(actual !== tr) el.setAttribute(a, tr); }
      else if(r){ delete mapa[a]; }
    } else if(r){
      if(actual === r.en) el.setAttribute(a, r.es);
      delete mapa[a];
    }
  }

  function omitido(el){
    return !el || OMITIR[el.nodeName] || (el.nodeType === 1 && (el.getAttribute('translate') === 'no' || el.hasAttribute('data-no-i18n')));
  }

  function recorrer(raiz){
    if(!raiz) return;
    if(raiz.nodeType === 3){ if(!omitido(raiz.parentNode)) nodoTexto(raiz); return; }
    if(raiz.nodeType !== 1 && raiz.nodeType !== 9 && raiz.nodeType !== 11) return;
    if(raiz.nodeType === 1){
      if(omitido(raiz)){
        // El contenido de un <textarea> es del usuario, pero su placeholder sí se traduce
        if(raiz.nodeName === 'TEXTAREA') ATRIBUTOS.forEach(a => atributo(raiz, a));
        return;
      }
      ATRIBUTOS.forEach(a => atributo(raiz, a));
    }
    if(raiz.nodeType === 1 && htmlMixto(raiz)) return;
    for(let h = raiz.firstChild; h; h = h.nextSibling) recorrer(h);
  }

  // Frases con partes en negrita u otras etiquetas en línea (<b>, <strong>, <span>…):
  // se traduce el contenido completo del elemento de una vez.
  const EN_LINEA = { B: 1, STRONG: 1, EM: 1, I: 1, SPAN: 1, SMALL: 1, BR: 1, CODE: 1, A: 1, MARK: 1, SUP: 1, SUB: 1 };
  const htmls = new WeakMap();
  function htmlMixto(el){
    const r = htmls.get(el);
    if(idioma !== 'en'){
      if(r){ if(el.innerHTML === r.en) el.innerHTML = r.es; htmls.delete(el); return !!r; }
      return false;
    }
    if(r && el.innerHTML === r.en) return true;
    let hayElem = false, hayTexto = false;
    for(let h = el.firstChild; h; h = h.nextSibling){
      if(h.nodeType === 1){ if(!EN_LINEA[h.nodeName]) return false; hayElem = true; }
      else if(h.nodeType === 3 && h.nodeValue.trim()) hayTexto = true;
    }
    if(!hayElem || !hayTexto) return false;
    if(!exacto) construir();
    const orig = el.innerHTML;
    const k = norm(orig);
    const tr = buscarExacto(k) ?? porOraciones(k) ?? buscarPatron(k);
    if(tr === null || tr === k) return false;
    htmls.set(el, { es: orig, en: tr });
    el.innerHTML = tr;
    return true;
  }

  let observador = null;
  function observar(){
    if(observador || !('MutationObserver' in window)) return;
    observador = new MutationObserver(lista => {
      // Primero se mira el elemento que recibió contenido nuevo (frases con <b>, <strong>…)
      const vistos = new Set();
      for(const m of lista){
        if(m.type === 'childList' && m.target.nodeType === 1 && !vistos.has(m.target)){
          vistos.add(m.target);
          if(!omitido(m.target)) htmlMixto(m.target);
        }
      }
      for(const m of lista){
        if(m.type === 'characterData'){
          if(!omitido(m.target.parentNode)) nodoTexto(m.target);
        } else if(m.type === 'attributes'){
          if(!omitido(m.target) || m.target.nodeName === 'TEXTAREA') atributo(m.target, m.attributeName);
        } else {
          m.addedNodes.forEach(n => { if(n.isConnected) recorrer(n); });
        }
      }
    });
    observador.observe(document.documentElement, {
      childList: true, subtree: true, characterData: true,
      attributes: true, attributeFilter: ATRIBUTOS
    });
  }

  /* ---------- confirm y alert ---------- */
  const confirmar = window.confirm.bind(window), avisar = window.alert.bind(window);
  window.confirm = m => confirmar(traducir(String(m)));
  window.alert = m => avisar(traducir(String(m)));

  /* ---------- campos de fecha ---------- */
  // El selector de fecha nativo muestra el formato del navegador y no se puede cambiar desde la página.
  // En inglés se usa un campo de texto con formato yyyy-mm-dd (el valor interno es el mismo: ISO).
  function camposFecha(){
    document.querySelectorAll('input[type="date"]:not(.i18n-fecha-nativo), input[data-i18n-fecha]').forEach(el => {
      if(idioma === 'en' && el.type === 'date'){
        el.setAttribute('data-i18n-fecha', '');
        el.type = 'text';
        el.placeholder = 'yyyy-mm-dd'; el.maxLength = 10; el.inputMode = 'numeric';
        el.setAttribute('pattern', '\\d{4}-\\d{2}-\\d{2}'); el.title = 'yyyy-mm-dd';
        // Botón de calendario: abre el selector nativo (oculto) y copia la fecha elegida al campo
        const caja = document.createElement('span');
        caja.className = 'i18n-fecha-caja';
        el.parentNode.insertBefore(caja, el);
        caja.appendChild(el);
        const nativo = document.createElement('input');
        nativo.type = 'date'; nativo.className = 'i18n-fecha-nativo'; nativo.tabIndex = -1;
        nativo.setAttribute('aria-hidden', 'true'); nativo.setAttribute('data-no-i18n', '');
        const boton = document.createElement('button');
        boton.type = 'button'; boton.className = 'i18n-fecha-boton'; boton.textContent = '📅';
        boton.setAttribute('aria-label', 'Open calendar'); boton.title = 'Open calendar';
        boton.setAttribute('data-no-i18n', '');
        boton.addEventListener('click', () => {
          nativo.min = el.min || ''; nativo.max = el.max || '';
          nativo.value = /^\d{4}-\d{2}-\d{2}$/.test(el.value) ? el.value : '';
          try { nativo.showPicker(); } catch(e){ nativo.focus(); nativo.click(); }
        });
        nativo.addEventListener('change', () => {
          if(!nativo.value) return;
          el.value = nativo.value;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        });
        caja.append(nativo, boton);
      } else if(idioma === 'es' && el.hasAttribute('data-i18n-fecha')){
        el.removeAttribute('data-i18n-fecha');
        el.type = 'date';
        ['placeholder', 'maxlength', 'inputmode', 'pattern', 'title'].forEach(a => el.removeAttribute(a));
        const caja = el.parentNode;
        if(caja && caja.classList && caja.classList.contains('i18n-fecha-caja')){
          caja.parentNode.insertBefore(el, caja);
          caja.remove();
        }
      }
    });
  }

  /* ---------- botón ES / EN ---------- */
  const estilo = '.idioma-selector{display:inline-flex;gap:4px;margin-left:6px;padding-left:8px;border-left:1px solid rgba(255,255,255,.25)}' +
    'html[data-tema="claro"] .idioma-selector{border-left-color:rgba(0,0,0,.25)}' +
    '.i18n-fecha-caja{position:relative;display:block}.i18n-fecha-caja>input[data-i18n-fecha]{width:100%;box-sizing:border-box;padding-right:2.4rem}' +
    '.i18n-fecha-nativo{position:absolute;right:0;bottom:0;width:1px;height:1px;opacity:0;pointer-events:none;border:0;padding:0}' +
    '.i18n-fecha-boton{position:absolute;right:.5rem;top:50%;transform:translateY(-50%);background:none;border:0;padding:.15rem .25rem;cursor:pointer;font-size:1.05rem;line-height:1;color:inherit;width:auto;min-height:0}';

  function marcarBotones(){
    document.querySelectorAll('.idioma-selector [data-idioma]').forEach(b =>
      b.setAttribute('aria-pressed', b.dataset.idioma === idioma ? 'true' : 'false'));
  }

  function crearBotones(){
    if(!document.getElementById('i18nEstilo')){
      const s = document.createElement('style'); s.id = 'i18nEstilo'; s.textContent = estilo;
      document.head.appendChild(s);
    }
    document.querySelectorAll('.tema-selector').forEach(sel => {
      if(sel.querySelector('.idioma-selector')) return;
      const g = document.createElement('span');
      g.className = 'idioma-selector'; g.setAttribute('role', 'group'); g.setAttribute('aria-label', 'Idioma / Language');
      g.setAttribute('data-no-i18n', '');
      [['es', 'ES', 'Español'], ['en', 'EN', 'English']].forEach(([cod, txt, nombre]) => {
        const b = document.createElement('button');
        b.type = 'button'; b.textContent = txt; b.dataset.idioma = cod; b.lang = cod; b.title = nombre;
        b.setAttribute('aria-label', nombre); b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', () => cambiar(cod));
        g.appendChild(b);
      });
      sel.appendChild(g);
    });
    marcarBotones();
  }

  /* ---------- cambio de idioma ---------- */
  function cambiar(nuevo){
    if(nuevo !== 'es' && nuevo !== 'en') return;
    const cambio = nuevo !== idioma;
    idioma = nuevo;
    try { localStorage.setItem(CLAVE, idioma); } catch(e){ /* sin almacenamiento */ }
    cache.clear();
    document.documentElement.lang = idioma;
    camposFecha();
    recorrer(document.documentElement);
    marcarBotones();
    if(cambio){
      // Los gráficos (SVG/canvas) y los textos armados por el código se vuelven a dibujar
      try { if(typeof renderAll === 'function' && typeof lastAnalysis !== 'undefined' && lastAnalysis) renderAll(); } catch(e){ /* sin análisis todavía */ }
      document.dispatchEvent(new CustomEvent('agronasa:idioma', { detail: { idioma } }));
    }
  }

  const api = {
    idioma: () => idioma,
    locale: () => (idioma === 'en' ? 'en-US' : 'es-AR'),
    t, traducir, cambiar,
    onCambio: fn => document.addEventListener('agronasa:idioma', fn)
  };
  window.AgroI18n = api;

  document.documentElement.lang = idioma;
  observar();
  document.addEventListener('DOMContentLoaded', () => {
    crearBotones();
    camposFecha();
    recorrer(document.documentElement);
  });
})();
