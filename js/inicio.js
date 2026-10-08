document.addEventListener('DOMContentLoaded', dibujarDestacados);

/** Muestra en la portada los productos marcados como destacados. */
function dibujarDestacados() {
  const cuadricula = porId('cuadriculaDestacados');

  if (!cuadricula) return;

  cuadricula.innerHTML = PRODUCTOS
    .filter((p) => p.destacado)
    .map((p) => htmlTarjetaProducto(p))
    .join('');
  enlazarAccionesTarjetas(cuadricula);
}
