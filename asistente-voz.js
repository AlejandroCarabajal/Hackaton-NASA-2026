// asistente-voz.js — Asistente por voz de AgroNasa (sin IA externa).
// Guía paso a paso, hablando: ubicación del campo, cultivo, cultivo anterior, análisis,
// lectura de resultados, carga de los datos del terreno e informe PDF.
// Usa las funciones del navegador: speechSynthesis (hablar) y SpeechRecognition (escuchar).
// Solo dice datos que calculó AgroNasa: no inventa respuestas.
// Si el navegador no puede escuchar (Firefox, sin micrófono), se responde escribiendo.

(function(){
  'use strict';

  const $ = id => document.getElementById(id);
  const Reconocedor = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  const voz = ('speechSynthesis' in window) ? window.speechSynthesis : null;

  // Estado del asistente (accesibilidad.js lo consulta para no duplicar avisos)
  const A = window.AgroNasaAsistente = {
    activo: false,
    paso: null,
    ultimo: '',
    conVoz: true,
    sinMicrofono: !Reconocedor,
    escuchaActual: null,
    campo: 0,
  };

  /* =================== Texto: normalizar y reconocer frases =================== */
  const norm = t => String(t || '').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[¿?¡!.,;:"'()]/g, ' ').replace(/\s+/g, ' ').trim();
  const dice = (t, frases) => frases.some(f => (' ' + t + ' ').includes(' ' + f + ' '));

  const SI = ['si', 'correcto', 'dale', 'exacto', 'ok', 'okey', 'esta bien', 'bueno', 'afirmativo', 'claro', 'eso'];
  const NO = ['no', 'incorrecto', 'otro', 'otra', 'negativo', 'cambiar'];
  const SALTAR = ['saltar', 'salteo', 'siguiente', 'paso', 'no se', 'no lo se', 'ninguno', 'nada', 'vacio'];

  const textoPlano = id => ($(id) ? $(id).textContent : '').replace(/\s+/g, ' ').trim();

  // Números dichos con palabras ("seis coma cinco", "treinta y cinco", "dos y medio")
  const NUM = { cero:0, un:1, uno:1, una:1, dos:2, tres:3, cuatro:4, cinco:5, seis:6, siete:7, ocho:8, nueve:9,
    diez:10, once:11, doce:12, trece:13, catorce:14, quince:15, dieciseis:16, diecisiete:17, dieciocho:18, diecinueve:19,
    veinte:20, veintiuno:21, veintiun:21, veintidos:22, veintitres:23, veinticuatro:24, veinticinco:25, veintiseis:26,
    veintisiete:27, veintiocho:28, veintinueve:29, treinta:30, cuarenta:40, cincuenta:50, sesenta:60, setenta:70,
    ochenta:80, noventa:90, cien:100, ciento:100, doscientos:200, trescientos:300, cuatrocientos:400, quinientos:500,
    seiscientos:600, setecientos:700, ochocientos:800, novecientos:900, mil:1000 };
  function numero(t){
    const n = norm(t).replace(/(\d) (?:coma|punto) (\d)/g, '$1.$2');
    const d = String(t).replace(/(\d),(\d)/g, '$1.$2').match(/-?\d+(\.\d+)?/) || n.match(/-?\d+(\.\d+)?/);
    if(d) return Number(d[0]);
    const convertir = s => {
      let total = 0, hay = false;
      s.split(' ').forEach(w => {
        if(!(w in NUM)) return;
        hay = true;
        total = w === 'mil' ? (total || 1) * 1000 : total + NUM[w];
      });
      return hay ? total : null;
    };
    const [entera, decimal] = n.split(/ (?:coma|punto) /);
    let v = convertir(entera);
    if(v === null) return null;
    if(decimal){ const dd = convertir(decimal); if(dd !== null) v = Number(`${v}.${dd}`); }
    if(/\by medio\b/.test(n)) v += 0.5;
    return v;
  }

  // Busca en un <select> la opción que coincide con lo dicho (sin tildes ni mayúsculas)
  function buscarOpcion(select, alternativas){
    const opciones = [...select.options].filter(o => o.value && o.value !== 'ninguno');
    for(const alt of alternativas.map(norm)){
      for(const o of opciones){
        const nombres = norm(o.textContent).split('/').map(x => x.trim()).filter(Boolean);
        if(nombres.some(nm => dice(alt, [nm]) || (alt.length >= 3 && nm.startsWith(alt)))) return o;
      }
    }
    return null;
  }
  const listaOpciones = (select, max) => [...select.options]
    .filter(o => o.value && o.value !== 'ninguno').slice(0, max || 99).map(o => o.textContent.trim());

  /* =================== Interfaz: registro de la conversación =================== */
  function registrar(quien, texto){
    const li = document.createElement('p');
    li.className = quien === 'asistente' ? 'msg-asistente' : 'msg-usuario';
    const q = document.createElement('span');
    q.className = 'msg-quien';
    q.textContent = quien === 'asistente' ? 'Asistente: ' : 'Vos: ';
    li.append(q, document.createTextNode(texto));
    $('asistenteLog').appendChild(li);
    li.scrollIntoView({ block: 'nearest' });
  }
  function indicador(estado){
    const el = $('asistenteEstado');
    el.dataset.estado = estado || '';
    el.textContent = estado === 'escuchando' ? '🎤 Escuchando… hablá ahora'
                   : estado === 'hablando'   ? '🔊 Hablando…'
                   : estado === 'pensando'   ? '⏳ Trabajando…' : '';
    $('asistenteHablar').disabled = estado === 'escuchando';
  }

  // Pitido corto para avisar que puede hablar (las personas ciegas no ven el indicador)
  let audio = null;
  function pitido(){
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const o = audio.createOscillator(), g = audio.createGain();
      o.frequency.value = 880; g.gain.value = 0.08;
      o.connect(g); g.connect(audio.destination);
      o.start(); o.stop(audio.currentTime + 0.12);
    } catch(e){ /* sin audio: no pasa nada */ }
  }

  /* =================== Hablar =================== */
  function vozEnEspanol(){
    if(!voz) return null;
    const vs = voz.getVoices();
    return vs.find(v => /^es[-_]AR/i.test(v.lang)) || vs.find(v => /^es[-_](419|MX|US|CL|UY|CO)/i.test(v.lang))
        || vs.find(v => /^es/i.test(v.lang)) || null;
  }
  // Los textos largos se dicen por partes (algunos navegadores cortan frases de más de ~15 segundos)
  const partes = t => (t.match(/[^.!?]+[.!?]*/g) || [t]).map(x => x.trim()).filter(Boolean);

  function decir(texto, opciones){
    const escucharDespues = !(opciones && opciones.escuchar === false);
    A.ultimo = texto;
    registrar('asistente', texto);
    detenerEscucha();
    if(!A.conVoz || !voz){
      indicador('');
      // Con lector de pantalla, el registro se lee solo; la persona responde con "Hablar" o escribiendo
      return Promise.resolve();
    }
    voz.cancel();
    return new Promise(resolve => {
      const trozos = partes(texto);
      const v = vozEnEspanol();
      indicador('hablando');
      trozos.forEach((tr, i) => {
        const u = new SpeechSynthesisUtterance(tr);
        if(v) u.voice = v;
        u.lang = v ? v.lang : 'es-AR';
        u.rate = 1;
        if(i === trozos.length - 1){
          u.onend = u.onerror = () => {
            indicador('');
            resolve();
            if(A.activo && escucharDespues) setTimeout(escuchar, 250);
          };
        }
        voz.speak(u);
      });
    });
  }

  /* =================== Escuchar =================== */
  function detenerEscucha(){
    if(A.escuchaActual){ try { A.escuchaActual.abort(); } catch(e){} A.escuchaActual = null; }
  }
  function escuchar(){
    if(!A.activo) return;
    if(A.sinMicrofono){ $('asistenteTexto').focus(); return; }
    detenerEscucha();
    const r = new Reconocedor();
    r.lang = 'es-AR';
    r.interimResults = false;
    r.maxAlternatives = 3;
    r.continuous = false;
    A.escuchaActual = r;
    r.onstart = () => { indicador('escuchando'); pitido(); };
    r.onresult = e => {
      const alts = [...e.results[0]].map(a => a.transcript).filter(Boolean);
      if(alts.length) procesar(alts);
    };
    r.onerror = e => {
      indicador('');
      if(e.error === 'not-allowed' || e.error === 'service-not-allowed'){
        A.sinMicrofono = true;
        decir('No tengo permiso para usar el micrófono. Podés escribir tus respuestas en el cuadro de texto y presionar Enter.', { escuchar: false });
        $('asistenteTexto').focus();
      } else if(e.error === 'no-speech'){
        decir('No te escuché. Tocá el botón Hablar, o presioná la barra espaciadora sobre él, para intentar de nuevo.', { escuchar: false });
      } else if(e.error === 'network'){
        decir('Para entender tu voz hace falta conexión a internet. Podés escribir tus respuestas en el cuadro de texto.', { escuchar: false });
      }
    };
    r.onend = () => { if(A.escuchaActual === r) A.escuchaActual = null; if($('asistenteEstado').dataset.estado === 'escuchando') indicador(''); };
    try { r.start(); } catch(e){ indicador(''); }
  }

  /* =================== Esperas sobre la página =================== */
  const pausa = ms => new Promise(r => setTimeout(r, ms));

  // Espera a que la página termine de ubicar el punto (marcador movido y nombre del lugar detectado)
  // minMs: si el punto no se movió (mismo lugar que antes), se acepta después de ese tiempo
  async function esperarUbicacion(latAntes, lonAntes, maxMs, minMs){
    const inicio = Date.now(), fin = inicio + maxMs;
    while(Date.now() < fin){
      await pausa(250);
      const estado = textoPlano('searchStatus');
      if(estado) return { error: estado };
      const movido = $('lat').value !== latAntes || $('lon').value !== lonAntes;
      const badge = textoPlano('countryBadge');
      const listo = badge && !/^Detectando/.test(badge);
      if(listo && (movido || (minMs && Date.now() - inicio > minMs))) return { nombre: $('locationName').value || badge };
    }
    return { error: 'No pude confirmar el lugar a tiempo.' };
  }

  // Espera el fin del análisis (evento de la página) o un error en el mensaje de estado
  function esperarAnalisis(maxMs){
    return new Promise(resolve => {
      let listo = false;
      const fin = () => { listo = true; resolve({ ok: true }); };
      document.addEventListener('agrovista:analisis-listo', fin, { once: true });
      const inicio = Date.now();
      (function revisar(){
        if(listo) return;
        const st = textoPlano('status');
        if(/^Error/i.test(st)){ document.removeEventListener('agrovista:analisis-listo', fin); return resolve({ error: st }); }
        if(Date.now() - inicio > maxMs){ document.removeEventListener('agrovista:analisis-listo', fin); return resolve({ error: 'El análisis está tardando demasiado. Revisá la conexión a internet.' }); }
        setTimeout(revisar, 300);
      })();
    });
  }

  /* =================== Lectura de resultados =================== */
  const MENU = 'Podés decir: resumen, detalles, mejores meses, otras opciones, números, qué no sabemos, datos del terreno, descargar informe, otro cultivo, otro lugar, o terminar.';

  function leerEstrategias(){
    const tarjetas = [...document.querySelectorAll('#strategyGrid .strat')];
    if(!tarjetas.length) return 'Todavía no hay estrategias para comparar.';
    return 'Comparación de cultivos, con un puntaje de 0 a 100: ' + tarjetas.map(t => {
      const tag = t.querySelector('.strat-tag') ? t.querySelector('.strat-tag').textContent.trim() : '';
      const cultivo = t.querySelector('.strat-crop') ? t.querySelector('.strat-crop').textContent.trim() : '';
      const pts = t.querySelector('.strat-score') ? parseInt(t.querySelector('.strat-score').textContent, 10) : '';
      return `${tag}: ${cultivo}, ${pts} puntos.`;
    }).join(' ');
  }
  function leerNumeros(){
    const stats = [...document.querySelectorAll('#statsGrid .stat')];
    if(!stats.length) return 'Todavía no hay números para leer.';
    return stats.map(s => {
      const et = s.querySelector('.label') ? s.querySelector('.label').textContent.trim() : '';
      const v = s.querySelector('.value') ? s.querySelector('.value').textContent.replace(/\s+/g, ' ').trim() : '';
      return `${et}: ${v.replace(/%/g, ' por ciento').replace(/°C/g, ' grados').replace(/\bmm\b/g, ' milímetros')}.`;
    }).join(' ');
  }
  function leerLimitaciones(){
    const items = [...document.querySelectorAll('#gapsList li')].slice(0, 4).map(li => li.textContent.trim());
    return items.length ? 'Lo que este análisis no sabe: ' + items.join(' ') : 'No hay limitaciones para leer.';
  }

  /* =================== Datos del terreno (formulario) =================== */
  const CAMPOS = ['terrenoNombre', 'terrenoSuperficie', 'terrenoTextura', 'terrenoPh', 'terrenoN', 'terrenoP', 'terrenoK',
                  'terrenoRiego', 'terrenoLamina', 'terrenoFrecuencia', 'terrenoRendimiento', 'terrenoPlagas', 'terrenoNotas'];
  const etiqueta = id => { const l = document.querySelector(`label[for="${id}"]`); return l ? l.textContent.trim() : id; };

  function preguntarCampo(){
    const id = CAMPOS[A.campo];
    const el = $(id);
    let ayuda;
    if(el.tagName === 'SELECT') ayuda = 'Las opciones son: ' + listaOpciones(el).join(', ') + '.';
    else if(el.type === 'number') ayuda = 'Decí un número.';
    else ayuda = 'Decí el texto.';
    decir(`Dato ${A.campo + 1} de ${CAMPOS.length}: ${etiqueta(id)}. ${ayuda} Si no lo sabés, decí saltar. Para terminar antes, decí calcular.`);
  }
  function siguienteCampo(){
    A.campo++;
    if(A.campo >= CAMPOS.length) return preguntarCalcular();
    preguntarCampo();
  }
  function preguntarCalcular(){
    A.paso = 'confirmarTerreno';
    decir('Terminamos los datos del terreno. ¿Calculo el análisis personalizado? Decí sí o no.');
  }
  function responderCampo(t, alts, original){
    if(dice(t, ['calcular', 'terminar formulario', 'terminar', 'listo', 'ya esta', 'fin'])) return preguntarCalcular();
    if(dice(t, SALTAR)){ return siguienteCampo(); }
    const id = CAMPOS[A.campo], el = $(id);
    if(el.tagName === 'SELECT'){
      const op = buscarOpcion(el, alts);
      if(!op) return decir(`No encontré esa opción. ${listaOpciones(el).join(', ')}. O decí saltar.`);
      el.value = op.value;
    } else if(el.type === 'number'){
      const v = numero(original);
      const min = el.min !== '' ? Number(el.min) : -Infinity, max = el.max !== '' ? Number(el.max) : Infinity;
      if(v === null || isNaN(v)) return decir('No entendí el número. Decilo de nuevo, por ejemplo: seis coma cinco. O decí saltar.');
      if(v < min || v > max) return decir(`El valor tiene que estar entre ${min} y ${max}. Decilo de nuevo o decí saltar.`);
      el.value = String(v);
    } else {
      el.value = original.trim().slice(0, el.maxLength > 0 ? el.maxLength : 500);
    }
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    registrar('asistente', `Anotado: ${etiqueta(id)} = ${el.tagName === 'SELECT' ? el.selectedOptions[0].textContent : el.value}.`);
    siguienteCampo();
  }

  /* =================== Pasos de la conversación =================== */
  function irA(paso, texto){
    A.paso = paso;
    const preguntas = {
      lugar: '¿Dónde está tu campo? Decí la localidad y la provincia, por ejemplo: La Banda, Santiago del Estero. O decí: mi ubicación.',
      cultivo: () => `¿Qué querés sembrar? Por ejemplo: ${listaOpciones($('crop'), 4).join(', ')}. Para escuchar todos, decí: lista.`,
      anterior: '¿Qué se sembró antes en esa parcela? Si no sabés, decí: no sé.',
      resultados: MENU,
    };
    const p = typeof preguntas[paso] === 'function' ? preguntas[paso]() : preguntas[paso];
    return decir((texto ? texto + ' ' : '') + (p || ''));
  }

  async function analizar(){
    A.paso = 'analizando';
    const cultivo = $('crop').selectedOptions[0] ? $('crop').selectedOptions[0].textContent : 'el cultivo';
    await decir(`Perfecto. Analizo ${cultivo.toLowerCase()} en ${$('locationName').value}. Consulto los datos de la NASA; tarda unos segundos.`, { escuchar: false });
    indicador('pensando');
    const espera = esperarAnalisis(60000);
    $('run').click();
    const r = await espera;
    indicador('');
    if(r.error) return irA('lugar', 'No se pudo hacer el análisis. ' + r.error);
    await pausa(200);
    irA('resultados', 'Análisis listo. ' + textoPlano('resumenTexto'));
  }

  const PASOS = {
    async lugar(t, alts, original){
      if(dice(t, ['mi ubicacion', 'donde estoy', 'ubicacion actual', 'aca', 'aqui'])){
        const lat = $('lat').value, lon = $('lon').value;
        $('searchStatus').textContent = '';
        indicador('pensando');
        $('miUbicacion').click();
        const r = await esperarUbicacion(lat, lon, 20000);
        indicador('');
        if(r.error) return decir(r.error + ' Decí el nombre de la localidad.');
        A.paso = 'confirmarLugar';
        return decir(`Estás en ${r.nombre}. ¿Uso este lugar? Decí sí o no.`);
      }
      const lat = $('lat').value, lon = $('lon').value;
      $('searchInput').value = original;
      $('searchStatus').textContent = '';
      indicador('pensando');
      if(typeof searchLocation === 'function') await searchLocation();
      const r = await esperarUbicacion(lat, lon, 10000, 1800);
      indicador('');
      if(r.error) return decir(`No encontré "${original}". Probá con la localidad y la provincia, por ejemplo: La Banda, Santiago del Estero.`);
      A.paso = 'confirmarLugar';
      decir(`Encontré ${r.nombre}. ¿Es correcto? Decí sí o no.`);
    },
    confirmarLugar(t){
      if(dice(t, NO)) return irA('lugar', 'Bien, probemos de nuevo.');
      if(dice(t, SI)) return irA('cultivo', 'Listo.');
      decir('Decí sí si el lugar es correcto, o no para buscar otro.');
    },
    cultivo(t, alts){
      if(dice(t, ['lista', 'opciones', 'cuales', 'cuales hay', 'todos'])){
        return decir('Los cultivos disponibles para tu zona son: ' + listaOpciones($('crop')).join(', ') + '. ¿Cuál querés sembrar?');
      }
      const op = buscarOpcion($('crop'), alts);
      if(!op) return decir('No encontré ese cultivo. Para escuchar los disponibles, decí: lista.');
      $('crop').value = op.value;
      $('crop').dispatchEvent(new Event('change', { bubbles: true }));
      irA('anterior', `Elegiste ${op.textContent.trim().toLowerCase()}.`);
    },
    anterior(t, alts){
      let elegido = null;
      if(dice(t, ['no se', 'no lo se', 'ninguno', 'nada', 'barbecho', 'no', 'saltar'])) elegido = 'ninguno';
      else { const op = buscarOpcion($('prevCrop'), alts); if(op) elegido = op.value; }
      if(!elegido) return decir('No encontré ese cultivo. Decí el nombre de nuevo, o decí: no sé.');
      $('prevCrop').value = elegido;
      $('prevCrop').dispatchEvent(new Event('change', { bubbles: true }));
      analizar();
    },
    resultados(t){
      if(dice(t, ['resumen'])) return decir(textoPlano('resumenTexto') + ' ' + MENU);
      if(dice(t, ['terreno', 'datos del terreno', 'formulario', 'campos', 'completar'])){
        A.paso = 'terreno'; A.campo = 0;
        registrar('asistente', 'Vamos a completar los datos del terreno, de a uno.');
        return preguntarCampo();
      }
      if(dice(t, ['opciones', 'otras opciones', 'alternativas', 'estrategias', 'comparar', 'otros cultivos'])) return decir(leerEstrategias() + ' ¿Qué más querés saber?');
      if(dice(t, ['que no sabemos', 'limitaciones', 'no sabemos'])) return decir(leerLimitaciones() + ' ¿Qué más querés saber?');
      if(dice(t, ['meses', 'mejores meses', 'calendario', 'cuando sembrar', 'cuando'])) return decir(textoPlano('annualNote') + ' ¿Qué más querés saber?');
      if(dice(t, ['numeros', 'estadisticas', 'datos', 'cifras'])) return decir(leerNumeros() + ' ¿Qué más querés saber?');
      if(dice(t, ['detalles', 'detalle', 'explicame', 'mas informacion', 'mas'])){
        return decir(textoPlano('verdictText') + ' ' + textoPlano('cropVerdictText') + ' ' + textoPlano('rotationNote') + ' ¿Qué más querés saber?');
      }
      if(dice(t, ['informe', 'pdf', 'descargar', 'reporte'])){
        const b = $('terrenoPdf');
        if(!b || b.disabled) return decir('El informe todavía no está disponible. ¿Qué más querés hacer?');
        b.click();
        return decir('Generando el informe en PDF. Se va a descargar en tu equipo. ¿Qué más querés hacer?');
      }
      if(dice(t, ['whatsapp', 'compartir'])){
        const b = $('terrenoWhatsapp');
        if(!b || b.disabled) return decir('Todavía no se puede compartir. ¿Qué más querés hacer?');
        b.click();
        return decir('Abriendo WhatsApp para compartir el informe.', { escuchar: false });
      }
      if(dice(t, ['otro cultivo', 'cambiar cultivo', 'cultivo'])) return irA('cultivo');
      if(dice(t, ['otro lugar', 'otra ubicacion', 'cambiar lugar', 'lugar'])) return irA('lugar');
      decir('No entendí. ' + MENU);
    },
    terreno: responderCampo,
    confirmarTerreno(t){
      if(dice(t, NO)) return irA('resultados', 'Bien, no lo calculo.');
      if(dice(t, SI)){
        const form = $('terrenoForm');
        if(form.requestSubmit) form.requestSubmit(); else form.querySelector('[type="submit"]').click();
        setTimeout(() => {
          const res = textoPlano('terrenoResultados').replace(/^Resultados del análisis manual/, '');
          irA('resultados', res ? 'Resultados de los datos del terreno: ' + res : 'Listo.');
        }, 400);
        return;
      }
      decir('Decí sí para calcular, o no para volver a los resultados.');
    },
    analizando(){ decir('Estoy analizando, esperá un momento.', { escuchar: false }); },
  };

  function ayuda(){
    const porPaso = {
      lugar: 'Ahora tenés que decir dónde está tu campo: la localidad y la provincia, o: mi ubicación.',
      confirmarLugar: 'Decí sí si el lugar es correcto, o no para buscar otro.',
      cultivo: 'Decí el cultivo que querés sembrar, o: lista, para escuchar los disponibles.',
      anterior: 'Decí qué se sembró antes en la parcela, o: no sé.',
      resultados: MENU,
      terreno: 'Respondé el dato que te pregunto, o decí: saltar. Para terminar, decí: calcular.',
      confirmarTerreno: 'Decí sí para calcular el análisis personalizado, o no.',
    };
    decir((porPaso[A.paso] || '') + ' En cualquier momento podés decir: repetir, empezar de nuevo, o terminar.');
  }

  function procesar(alternativas){
    const original = alternativas[0];
    const t = norm(original);
    registrar('usuario', original);
    if(!t) return decir('No te entendí. Decilo de nuevo.');
    if(dice(t, ['empezar de nuevo', 'reiniciar', 'volver a empezar'])) return irA('lugar', 'Empecemos de nuevo.');
    if(dice(t, ['ayuda', 'que puedo decir', 'opciones de voz'])) return ayuda();
    if(dice(t, ['repetir', 'repeti', 'repetilo', 'repetime'])) return decir(A.ultimo);
    if(dice(t, ['terminar asistente', 'salir', 'cerrar', 'chau', 'detener']) || (t === 'terminar' && A.paso !== 'terreno')) return terminar(true);
    const fn = PASOS[A.paso];
    if(fn) fn(t, alternativas, original);
  }

  /* =================== Iniciar y terminar =================== */
  function iniciar(){
    A.activo = true;
    A.conVoz = $('asistenteConVoz').checked;
    $('asistenteLog').setAttribute('aria-live', A.conVoz ? 'off' : 'polite');
    $('asistenteCuerpo').hidden = false;
    $('asistenteIniciar').textContent = 'Reiniciar asistente';
    $('asistenteLog').innerHTML = '';
    const modo = A.sinMicrofono
      ? 'Tu navegador no puede escucharte, así que escribí tus respuestas en el cuadro de texto y presioná Enter.'
      : 'Después de cada pregunta vas a escuchar un pitido: ahí podés hablar.';
    irA('lugar', `Hola, soy el asistente de AgroNasa. Te voy a guiar paso a paso. ${modo} En cualquier momento podés decir: ayuda, repetir o terminar.`);
    if(A.sinMicrofono) $('asistenteTexto').focus();
  }
  function terminar(despedirse){
    detenerEscucha();
    if(despedirse && A.conVoz && voz){
      decir('Asistente terminado. Podés volver a iniciarlo cuando quieras.', { escuchar: false })
        .then(() => { A.activo = false; });
    } else {
      if(voz) voz.cancel();
      A.activo = false;
    }
    indicador('');
    A.paso = null;
    $('asistenteIniciar').textContent = 'Iniciar asistente por voz';
    $('asistenteIniciar').focus();
  }

  document.addEventListener('DOMContentLoaded', () => {
    if(!$('asistente')) return;
    if(!voz && A.sinMicrofono){
      $('asistenteConVoz').checked = false;
      $('asistenteConVoz').disabled = true;
    }
    $('asistenteIniciar').addEventListener('click', iniciar);
    $('asistenteTerminar').addEventListener('click', () => terminar(false));
    $('asistenteHablar').addEventListener('click', () => { if(!A.activo) return iniciar(); if(voz) voz.cancel(); escuchar(); });
    $('asistenteRepetir').addEventListener('click', () => { if(A.activo && A.ultimo) decir(A.ultimo); });
    $('asistenteConVoz').addEventListener('change', e => {
      A.conVoz = e.target.checked;
      $('asistenteLog').setAttribute('aria-live', A.conVoz ? 'off' : 'polite');
      if(!A.conVoz && voz) voz.cancel();
    });
    $('asistenteForm').addEventListener('submit', e => {
      e.preventDefault();
      const campo = $('asistenteTexto');
      const texto = campo.value.trim();
      if(!texto) return;
      campo.value = '';
      if(!A.activo) iniciar();
      if(voz) voz.cancel();
      detenerEscucha();
      procesar([texto]);
    });
    // Escape: deja de hablar y de escuchar (sin cerrar el asistente)
    document.addEventListener('keydown', e => {
      if(e.key === 'Escape' && A.activo){ if(voz) voz.cancel(); detenerEscucha(); indicador(''); }
    });
    if(!Reconocedor) $('asistenteHablar').hidden = true;
  });
})();
