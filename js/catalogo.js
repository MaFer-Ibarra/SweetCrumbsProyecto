let idProductoEnDetalle = null;

document.addEventListener('DOMContentLoaded', () => {
  dibujarFiltros();
  porId('campoBusqueda').addEventListener('input', dibujarCatalogo);
  enlazarAccionesTarjetas(porId('cuadriculaCatalogo'), abrirDetalleProducto);

  // Boton "Agregar al carrito" dentro del modal
  porId('modalProductoAgregar').addEventListener('click', () => {
    if (idProductoEnDetalle) agregarProductoAlCarrito(idProductoEnDetalle);
    bootstrap.Modal.getInstance(porId('modalProducto')).hide();
  });
  dibujarCatalogo();
});

/** Crea un botn por categoría y marca "Todos" como activo. */
function dibujarFiltros() {
  const grupo = porId('pildorasFiltro');

  grupo.innerHTML = CATEGORIAS.map((c, i) => `
    <button type="button" class="pildora${i === 0 ? ' activo' : ''}"
            data-filtro="${c.id}" aria-pressed="${i === 0}">${c.etiqueta}</button>`
  ).join('');

  grupo.addEventListener('click', (evento) => {
    const boton = evento.target.closest('.pildora');
    if (!boton) return;
    grupo.querySelectorAll('.pildora').forEach((p) => {
      p.classList.toggle('activo', p === boton);
      p.setAttribute('aria-pressed', String(p === boton));
    });
    dibujarCatalogo();
  });
}

/** Aplica categoria y búsqueda, y vuelve a dibujar las tarjetas. */
function dibujarCatalogo() {
  const categoriaActiva = document.querySelector('#pildorasFiltro .pildora.activo').dataset.filtro;
  const consulta = porId('campoBusqueda').value.trim().toLowerCase();

  const productos = PRODUCTOS.filter((p) => {
    const coincideCategoria = categoriaActiva === 'todos' || p.categoria === categoriaActiva;
    const coincideConsulta =
      !consulta ||
      p.nombre.toLowerCase().includes(consulta) ||
      p.descripcion.toLowerCase().includes(consulta);
    return coincideCategoria && coincideConsulta;
  });

  porId('cuadriculaCatalogo').innerHTML = productos.map((p) => htmlTarjetaProducto(p, true)).join('');
  porId('contadorCatalogo').textContent =
    `${productos.length} ${productos.length === 1 ? 'producto' : 'productos'}`;
  porId('catalogoVacio').classList.toggle('d-none', productos.length > 0);
}

/** Llena y abre el cuadro modal con los datos del producto elegido. */
function abrirDetalleProducto(idProducto) {
  const producto = PRODUCTOS.find((p) => p.id === idProducto);

  if (!producto) return;
  idProductoEnDetalle = producto.id;
  porId('modalProductoTitulo').textContent = producto.nombre;
  porId('modalProductoDescripcion').textContent = producto.descripcion;
  porId('modalProductoPrecio').textContent = `${formatearMoneda(producto.precio)} · ${producto.unidad}`;

  const arte = porId('modalProductoArte');
  arte.className = `tarjeta-producto__arte tarjeta-producto__arte--${producto.categoria} mb-3`;
  arte.innerHTML = arteProducto(producto);
  bootstrap.Modal.getOrCreateInstance(porId('modalProducto')).show();
}
