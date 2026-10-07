document.addEventListener('DOMContentLoaded', () => {
  activarSombraEncabezado();
  marcarEnlaceActivo();
  activarAparicionAlDesplazar();
});

/** Agrega una sombra al encabezado cuando la página deja de estar arriba. */
function activarSombraEncabezado() {
  const encabezado = document.querySelector(
    '.encabezado-sitio'
  );

  if (!encabezado) return;

  const actualizar = () =>
    encabezado.classList.toggle(
      'con-scroll',
      window.scrollY > 8
    );
  actualizar();

  window.addEventListener(
    'scroll',
    actualizar,
    { passive: true }
  );
}

/** Resalta en el menu el enlace de la página actual. */
function marcarEnlaceActivo() {
  const paginaActual =
    location.pathname.split('/').pop() ||
    'index.html';

  document
    .querySelectorAll(
      '.navbar-nav .nav-link[data-pagina]'
    )
    .forEach((enlace) => {
      const esActual =
        enlace.dataset.pagina === paginaActual;

      enlace.classList.toggle(
        'active',
        esActual
      );

      if (esActual) {
        enlace.setAttribute(
          'aria-current',
          'page'
        );
      }
    });
}

/** Animación suave los elementos .aparecer al entrar en pantalla. */
function activarAparicionAlDesplazar() {
  const elementos =
    document.querySelectorAll('.aparecer');

  if (!('IntersectionObserver' in window)) {
    elementos.forEach((el) =>
      el.classList.add('visible')
    );
    return;
  }

  const observador =
    new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return;

          entrada.target.classList.add(
            'visible'
          );

          observador.unobserve(
            entrada.target
          );
        });
      },
      {
        threshold: 0.16
      }
    );

  elementos.forEach((el) =>
    observador.observe(el)
  );
}

/** Notificación la parte baja de la pantalla . */
function mostrarAviso(mensaje) {
  const aviso =
    document.getElementById('avisoToast');

  document.getElementById(
    'textoAviso'
  ).textContent = mensaje;

  bootstrap.Toast
    .getOrCreateInstance(
      aviso,
      { delay: 2600 }
    )
    .show();
}

/** Abre el carrito lateral */
function abrirCarrito() {
  bootstrap.Offcanvas
    .getOrCreateInstance(
      document.getElementById(
        'cajonCarrito'
      )
    )
    .show();
}