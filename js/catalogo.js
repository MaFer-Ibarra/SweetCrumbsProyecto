let idProductoEnDetalle = null;

document.addEventListener('DOMContentLoaded', () => {
    dibujarFiltros();

    document.getElementById('campoBusqueda').addEventListener('input', dibujarCatalogo);

    enlazarAccionesTarjetas(
        document.getElementById('cuadriculaCatalogo'),
        abrirDetalleProducto
    );

    document.getElementById('modalProductoAgregar').addEventListener('click', () => {
        if (idProductoEnDetalle) agregarProductoAlCarrito(idProductoEnDetalle);
        bootstrap.Modal
            .getInstance(document.getElementById('modalProducto'))
            .hide();
    });

    dibujarCatalogo();
});

/** Crea un boton por categoría y marca "Todos" como activo. */
function dibujarFiltros() {
    const grupo = document.getElementById('pildorasFiltro');

    grupo.innerHTML = CATEGORIAS.map((c, i) =>
        `<button type="button" class="pildora${i === 0 ? ' activo' : ''}" data-filtro="${c.id}" aria-pressed="${i === 0}">${c.etiqueta}</button>`
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

/** Aplica categoría y busqueda, y vuelve a dibujar las tarjetas. */
function dibujarCatalogo() {
    const categoriaActiva = document.querySelector('#pildorasFiltro .pildora.activo').dataset.filtro;
    const consulta = document.getElementById('campoBusqueda').value.trim().toLowerCase();

    const productos = PRODUCTOS.filter((p) => {
        const coincideCategoria =
            categoriaActiva === 'todos' || p.categoria === categoriaActiva;

        const coincideConsulta =
            !consulta ||
            p.nombre.toLowerCase().includes(consulta) ||
            p.descripcion.toLowerCase().includes(consulta);

        return coincideCategoria && coincideConsulta;
    });

    document.getElementById('cuadriculaCatalogo').innerHTML =
        productos.map((p) => htmlTarjetaProducto(p, true)).join('');

    document.getElementById('contadorCatalogo').textContent =
        `${productos.length} ${productos.length === 1 ? 'producto' : 'productos'}`;

    document.getElementById('catalogoVacio').classList.toggle(
        'd-none',
        productos.length > 0
    );
}

/** Llena y abre el cuadro modal con los datos del producto elegido. DETALLES PRODUCTO*/
function abrirDetalleProducto(idProducto) {
    const producto = PRODUCTOS.find((p) => p.id === idProducto);

    if (!producto) return;

    idProductoEnDetalle = producto.id;
    document.getElementById('modalProductoTitulo').textContent = producto.nombre;
    document.getElementById('modalProductoDescripcion').textContent = producto.descripcion;
    document.getElementById('modalProductoPrecio').textContent =
        `${formatearMoneda(producto.precio)} · ${producto.unidad}`;

    const arte = document.getElementById('modalProductoArte');

    arte.className =
        `tarjeta-producto__arte tarjeta-producto__arte--${producto.categoria} mb-3`;

    arte.innerHTML = iconoPara(producto.icono);

    bootstrap.Modal
        .getOrCreateInstance(document.getElementById('modalProducto'))
        .show();
}