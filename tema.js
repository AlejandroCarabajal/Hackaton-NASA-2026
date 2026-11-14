// tema.js — selector de contraste: oscuro (original), claro y alto contraste.
// Se carga en <head> para aplicar el tema guardado antes de que se dibuje la página.

(function(){
  const CLAVE = 'agronasa-tema';
  const TEMAS = ['oscuro', 'claro', 'alto'];

  function leerTema(){
    try {
      const t = localStorage.getItem(CLAVE);
      return TEMAS.indexOf(t) >= 0 ? t : 'oscuro';
    } catch(e){ return 'oscuro'; }        // navegador sin almacenamiento disponible
  }

  function guardarTema(t){
    try { localStorage.setItem(CLAVE, t); } catch(e){ /* sin almacenamiento: solo dura esta visita */ }
  }

  function aplicarTema(t){
    // El modo oscuro es el diseño original: se quita el atributo
    if(t === 'oscuro') document.documentElement.removeAttribute('data-tema');
    else document.documentElement.setAttribute('data-tema', t);
  }

  // 1) Lo antes posible: evita que la página aparezca un instante en otro tema
  aplicarTema(leerTema());

  // 2) Botones del selector
  document.addEventListener('DOMContentLoaded', () => {
    const botones = document.querySelectorAll('.tema-selector [data-tema-opcion]');
    const marcar = t => botones.forEach(b => b.setAttribute('aria-pressed', b.dataset.temaOpcion === t ? 'true' : 'false'));
    marcar(leerTema());

    botones.forEach(b => b.addEventListener('click', () => {
      const t = b.dataset.temaOpcion;
      aplicarTema(t);
      guardarTema(t);
      marcar(t);
      // Los gráficos toman sus colores del tema: se vuelven a dibujar si ya hay un análisis
      if(typeof renderAll === 'function') renderAll();
    }));
  });
})();
