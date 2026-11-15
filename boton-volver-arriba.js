(() => {
  const boton = document.getElementById('botonVolverArriba');

  if (!boton) return;

  function actualizarBoton() {
    boton.hidden = window.scrollY <= 300;
  }

  window.addEventListener('scroll', actualizarBoton, {
    passive: true
  });

  actualizarBoton();

  boton.addEventListener('click', () => {
    const reducirMovimiento = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: reducirMovimiento ? 'auto' : 'smooth'
    });
  });
})();
