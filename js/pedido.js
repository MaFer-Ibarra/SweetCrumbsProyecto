document.addEventListener('DOMContentLoaded', () => {
  // La fecha mínima de recogida es dentro de 2 días
  porId('clienteFecha').min = fechaMinimaEntrega();

  mostrarResumen();
  document.addEventListener('carrito:cambio', mostrarResumen);

  porId('formularioPedido').addEventListener('submit', confirmarPedido);
});

/* Resumen del carrito */
function mostrarResumen() {
  const articulos = Carrito.leer();
  const hayArticulos = articulos.length > 0;

  porId('pedidoVacio').classList.toggle('d-none', hayArticulos);
  porId('pedidoActivo').classList.toggle('d-none', !hayArticulos);

  porId('articulosPedido').innerHTML = articulos.map((a) => `
    <article class="resumen-pedido__articulo">
      <div class="articulo-carrito__arte">${arteArticulo(a)}</div>
      <div>
        <h3 class="articulo-carrito__nombre">${escaparHtml(a.nombre)}</h3>
        <p class="articulo-carrito__detalle">${escaparHtml(a.detalle || '')} · ${a.cantidad} pza.</p>
      </div>
      <strong class="articulo-carrito__precio">${formatearMoneda(a.precio * a.cantidad)}</strong>
    </article>`).join('');

  porId('subtotalPedido').textContent = formatearMoneda(Carrito.total());
  porId('totalPedido').textContent = formatearMoneda(Carrito.total());
}

/* Formulario*/
function confirmarPedido(evento) {
  evento.preventDefault();
  const formulario = evento.target;
  const mensajeOk = porId('mensajePedidoOk');
  formulario.classList.add('was-validated');

  if (!formulario.checkValidity()) {
    mensajeOk.classList.add('d-none');
    mostrarAviso('Revisa los campos marcados en rojo');
    return;
  }
  mensajeOk.classList.remove('d-none');
  formulario.reset();
  formulario.classList.remove('was-validated');
  Carrito.vaciar();
  mensajeOk.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
