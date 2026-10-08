(function montarEstructuraComun() {
  const raiz = document.body.dataset.raiz || '';
  const inicio = `${raiz}index.html`;
  const cliente = (archivo) => `${raiz}cliente/${archivo}`;
  const logo = `${raiz}img/logo/logo-pastelito.png`;

  /*  Encabezado  */
  const encabezado = `
    <header class="encabezado-sitio sticky-top">
      <nav class="navbar navbar-expand-lg" aria-label="Navegación principal">
        <div class="container">
          <a class="navbar-brand marca" href="${inicio}">
            <img class="marca__logo img-fluid" src="${logo}" alt="Logotipo de Sweet Crumbs: un cupcake" width="44" height="44">
            <span class="marca__nombre">Sweet Crumbs</span>
          </a>

          <div class="d-flex align-items-center gap-2 order-lg-last">
            <div class="menu-cuenta" id="menuCuenta"></div>

            <button class="btn btn-light position-relative boton-carrito" type="button"
                    data-bs-toggle="offcanvas" data-bs-target="#cajonCarrito"
                    aria-controls="cajonCarrito" aria-label="Abrir carrito">
              <svg class="icono" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 8H6"/>
              </svg>
              <span class="badge rounded-pill insignia-carrito position-absolute top-0 start-100 translate-middle d-none js-contador-carrito">0</span>
            </button>

            <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                    data-bs-target="#menuPrincipal" aria-controls="menuPrincipal"
                    aria-expanded="false" aria-label="Abrir menú">
              <span class="navbar-toggler-icon"></span>
            </button>
          </div>

          <div class="collapse navbar-collapse" id="menuPrincipal">
            <ul class="navbar-nav ms-lg-auto me-lg-4 gap-lg-3">
              <li class="nav-item">
                <a class="nav-link" href="${inicio}" data-pagina="index.html">Inicio</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="${cliente('catalogo.html')}" data-pagina="catalogo.html">Catálogo</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="${cliente('pedido.html')}" data-pagina="pedido.html">Mi pedido</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>`;

  /*  Pie de página  */
  const pie = `
    <footer class="pie-sitio">
      <div class="container">
        <div class="row gy-5 gx-lg-5 pb-5">
          <div class="col-lg-5">
            <a class="marca marca--pie" href="${inicio}">
              <img class="marca__logo img-fluid" src="${logo}" alt="Logotipo de Sweet Crumbs: un cupcake" width="44" height="44">
              <span class="marca__nombre">Sweet Crumbs</span>
            </a>
            <p class="pie-sitio__texto">
              Repostería pensada para ti, hasta el último detalle.
              Cada pedido se hornea el mismo día que se recoge:
              nada se congela, nada se apura.
            </p>
          </div>

          <div class="col-6 col-lg-3">
            <h2 class="pie-sitio__titulo">Explorar</h2>
            <ul class="list-unstyled d-grid gap-2">
              <li><a href="${cliente('catalogo.html')}">Catálogo</a></li>
              <li><a href="${cliente('pedido.html')}">Mi pedido</a></li>
              <li><a href="${cliente('cuenta.html')}">Mi cuenta</a></li>
            </ul>
          </div>

          <div class="col-6 col-lg-4">
            <h2 class="pie-sitio__titulo">Visítanos</h2>
            <address class="list-unstyled d-grid gap-2 mb-0">
              <span>Av. Reforma 214, Centro, Lerdo, Dgo.</span>
              <span>+52 871 123 4567</span>
              <span>sweetcrumbs.contacto@gmail.com</span>
              <span>Mar–Dom, 9:00–20:00</span>
            </address>
          </div>
        </div>

        <div class="pie-inferior d-flex flex-wrap justify-content-between gap-2">
          <small>© 2026 Sweet Crumbs · Repostería.</small>
          <small>Hecho con azúcar, mantequilla y mucho cariño.</small>
        </div>
      </div>
    </footer>`;

  /* Carrito lateral  */
  const carrito = `
    <aside class="offcanvas offcanvas-end cajon-carrito" tabindex="-1" id="cajonCarrito" aria-labelledby="tituloCarrito">
      <div class="offcanvas-header">
        <h2 class="offcanvas-title h4" id="tituloCarrito">Tu carrito</h2>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Cerrar carrito"></button>
      </div>
      <div class="offcanvas-body" id="cuerpoCajonCarrito"></div>
      <div class="cajon-carrito__pie" id="pieCajonCarrito"></div>
    </aside>`;

  /* Aviso (toast) */
  const aviso = `
    <div class="toast-container position-fixed bottom-0 start-50 translate-middle-x p-3">
      <div class="toast align-items-center text-bg-dark border-0" id="avisoToast"
           role="status" aria-live="polite" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body" id="textoAviso"></div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto"
                  data-bs-dismiss="toast" aria-label="Cerrar aviso"></button>
        </div>
      </div>
    </div>`;

  /** Reemplaza un marcador por su HTML (así el elemento queda como hijo directo de <body>). */
  function colocar(idMarcador, html) {
    const marcador = document.getElementById(idMarcador);
    if (!marcador) return;
    marcador.insertAdjacentHTML('beforebegin', html.trim());
    marcador.remove();
  }
  colocar('sc-encabezado', encabezado);
  colocar('sc-pie', pie);
  document.body.insertAdjacentHTML('beforeend', carrito.trim() + aviso.trim());
})();
