/** HTML de una tarjeta. conDetalle agrega el botón que abre el modal. */
function htmlTarjetaProducto(producto, conDetalle = false) {
  const categoria = CATEGORIAS.find((c) => c.id === producto.categoria);
  const insignia = producto.destacado
    ? '<span class="badge tarjeta-producto__insignia">Destacado</span>'
    : '';
  const botonDetalle = conDetalle
    ? `<button type="button" class="btn btn-outline-primary btn-sm" data-detalle="${producto.id}">Ver detalle</button>`
    : '';

  return `
    <div class="col">
      <article class="card h-100 tarjeta-producto">
        <div class="tarjeta-producto__arte tarjeta-producto__arte--${producto.categoria}">
          ${insignia}
          ${arteProducto(producto)}
        </div>
        <div class="card-body d-flex flex-column px-0 pb-0">
          <p class="tarjeta-producto__categoria">${categoria ? categoria.etiqueta : producto.categoria}</p>
          <h3 class="card-title h5">${producto.nombre}</h3>
          <p class="card-text tarjeta-producto__descripcion">${producto.descripcion}</p>
          <p class="precio">${formatearMoneda(producto.precio)} <small>· ${producto.unidad}</small></p>
          <div class="d-grid gap-2 mt-auto">
            <button type="button" class="btn btn-primary" data-agregar="${producto.id}">Agregar al carrito</button>
            ${botonDetalle}
          </div>
        </div>
      </article>
    </div>`;
}

/** Agrega un producto del catálogo al carrito y avisa al cliente. */
function agregarProductoAlCarrito(idProducto) {
  const producto = PRODUCTOS.find((p) => p.id === idProducto);

  if (!producto) return;

  Carrito.agregar({
    id: producto.id,
    nombre: producto.nombre,
    precio: producto.precio,
    icono: producto.icono,
    detalle: producto.unidad,
    cantidad: 1,
  });

  mostrarAviso(`${producto.nombre} se agregó al carrito`);
}

/** Conecta los botones de una cuadrícula de tarjetas (un solo escuchador por contenedor). */
function enlazarAccionesTarjetas(contenedor, alVerDetalle) {
  contenedor.addEventListener('click', (evento) => {
    const botonAgregar = evento.target.closest('[data-agregar]');
    if (botonAgregar) {
      agregarProductoAlCarrito(botonAgregar.dataset.agregar);
      return;
    }
    const botonDetalle = evento.target.closest('[data-detalle]');
    if (botonDetalle && alVerDetalle) {
      alVerDetalle(botonDetalle.dataset.detalle);
    }
  });
}
