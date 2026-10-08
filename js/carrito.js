const CLAVE_CARRITO = 'sweetcrumbs_carrito_v1';

function rutaCliente(archivo) {
  return `${document.body.dataset.raiz || ''}cliente/${archivo}`;
}

/** Lee un valor de localStorage. Si no existe o falla, devuelve el valor por defecto. */
function leerAlmacenamiento(clave, valorPorDefecto = []) {
  try {
    const guardado = localStorage.getItem(clave);
    return guardado ? JSON.parse(guardado) : valorPorDefecto;
  } catch (error) {
    return valorPorDefecto;
  }
}

/** Guarda un valor en localStorage. Si el navegador lo impide, la página sigue funcionando. */
function guardarAlmacenamiento(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch (error) {
    // Ignorar error
    }
}

/* ---------- Carrito ---------- */
const Carrito = {
  leer() {
    return leerAlmacenamiento(CLAVE_CARRITO);
  },

  escribir(articulos) {
    guardarAlmacenamiento(CLAVE_CARRITO, articulos);
    document.dispatchEvent(new CustomEvent('carrito:cambio'));
  },

  /** Si  producto ya está en el carrito, solo aumenta la cantidad. */
  agregar(articulo) {
    const articulos = Carrito.leer();
    const existente = articulos.find((a) => a.id === articulo.id);

    if (existente) {
      existente.cantidad += articulo.cantidad || 1;
    } else {
      const idLinea = `linea-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      articulos.push({ ...articulo, idLinea, cantidad: articulo.cantidad || 1 });
    }
    Carrito.escribir(articulos);
  },

  quitar(idLinea) {
    Carrito.escribir(Carrito.leer().filter((a) => a.idLinea !== idLinea));
  },

  cambiarCantidad(idLinea, cantidad) {
    const articulos = Carrito.leer();
    const linea = articulos.find((a) => a.idLinea === idLinea);
    if (!linea) return;
    linea.cantidad = Math.max(1, cantidad);
    Carrito.escribir(articulos);
  },

  vaciar() {
    Carrito.escribir([]);
  },

  total() {
    return Carrito.leer().reduce((suma, a) => suma + a.precio * a.cantidad, 0);
  },

  cantidad() {
    return Carrito.leer().reduce((suma, a) => suma + a.cantidad, 0);
  },
};

/* ---------- Panel lateral del carrito ---------- */
function dibujarCajonCarrito() {
  const cuerpo = porId('cuerpoCajonCarrito');
  const pie = porId('pieCajonCarrito');

  if (!cuerpo) return;

  const articulos = Carrito.leer();
  const cantidad = Carrito.cantidad();

  // numero rojo sobre el icono del carrito
  document.querySelectorAll('.js-contador-carrito').forEach((insignia) => {
    insignia.textContent = String(cantidad);
    insignia.classList.toggle('d-none', cantidad === 0);
  });

  if (articulos.length === 0) {
    cuerpo.innerHTML = `
      <div class="carrito-vacio text-center">
        <svg class="icono" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 8H6"/></svg>
        <p>Tu carrito está vacío.</p>
        <a class="btn btn-outline-primary btn-sm" href="${rutaCliente('catalogo.html')}">Ver catálogo</a>
      </div>`;
    pie.innerHTML = '';
    return;
  }

  cuerpo.innerHTML = articulos.map((a) => `
    <article class="articulo-carrito">
      <div class="articulo-carrito__arte">${arteArticulo(a)}</div>
      <div>
        <h3 class="articulo-carrito__nombre">${escaparHtml(a.nombre)}</h3>
        <p class="articulo-carrito__detalle">${escaparHtml(a.detalle || '')} · ${a.cantidad} pza.</p>
        <button type="button" class="btn btn-link btn-sm p-0 text-danger" data-quitar="${a.idLinea}">Quitar</button>
      </div>
      <strong class="articulo-carrito__precio">${formatearMoneda(a.precio * a.cantidad)}</strong>
    </article>`).join('');
  pie.innerHTML = `
    <div class="fila-total"><span>Total</span><strong>${formatearMoneda(Carrito.total())}</strong></div>
    <a href="${rutaCliente('pedido.html')}" class="btn btn-primary w-100">Ir a pagar</a>
    <p class="aviso-solo-local">Entrega solo en el local · Lerdo, Dgo.</p>`;
}

// Un solo escuchador para quitar artículos, aunque el carrito se vuelva a dibujar.
document.addEventListener('click', (evento) => {
  const botonQuitar = evento.target.closest('[data-quitar]');

  if (botonQuitar && botonQuitar.closest('#cuerpoCajonCarrito')) {
    Carrito.quitar(botonQuitar.dataset.quitar);
  }
});

document.addEventListener('carrito:cambio', dibujarCajonCarrito);
document.addEventListener('DOMContentLoaded', dibujarCajonCarrito);
