const ESTADOS_PEDIDO = [
  { id: 'recibido', etiqueta: 'Recibido' },
  { id: 'preparacion', etiqueta: 'En preparación' },
  { id: 'listo', etiqueta: 'Listo para recoger' },
];

const formulario = () =>
  document.getElementById('formularioPedido');

/* Regla de validación de cada campo: recibe el campo y devuelve true si su valor es correcto. */
const REGLAS_VALIDACION = {
  clienteNombre: (campo) =>
    campo.value.trim().length >= 3,

  clienteTelefono: (campo) =>
    /^\d{10}$/.test(
      campo.value.replace(/[\s\-()]/g, '')
    ),

  clienteCorreo: (campo) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(
      campo.value.trim()
    ),

  clienteFecha: (campo) =>
    campo.value !== '' &&
    campo.value >= fechaMinimaEntrega(),

  clienteHorario: (campo) =>
    campo.value !== '',

  clientePago: (campo) =>
    campo.value !== '',

  clienteAcepto: (campo) =>
    campo.checked,
};

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('clienteFecha').min =
    fechaMinimaEntrega();
  dibujarResumenPedido();

  document.addEventListener(
    'carrito:cambio',
    dibujarResumenPedido
  );

  configurarCantidades();
  rellenarDatosDeCuenta();
  configurarValidacion();

  formulario().addEventListener(
    'submit',
    confirmarPedido
  );
  configurarSeguimiento();

});

/* Resumen del pedido */
function dibujarResumenPedido() {
  if (
    !document
      .getElementById('confirmacionPedido')
      .classList.contains('d-none')
  ) {
    return; // el pedido ya se confirmó
  }

  const articulos = Carrito.leer();

  document
    .getElementById('pedidoVacio')
    .classList.toggle(
      'd-none',
      articulos.length > 0
    );

  document
    .getElementById('pedidoActivo')
    .classList.toggle(
      'd-none',
      articulos.length === 0
    );

  if (articulos.length === 0) return;

  document.getElementById(
    'articulosPedido'
  ).innerHTML = articulos
    .map(
      (a) => `
    <article class="resumen-pedido__articulo">
      <div class="articulo-carrito__arte">${iconoPara(a.icono)}</div>
      <div>
        <h3 class="articulo-carrito__nombre">
          ${escaparHtml(a.nombre)}
        </h3>
        <p class="articulo-carrito__detalle">
          ${escaparHtml(a.detalle || '')}
        </p>
        ${
          a.tipo === 'catalogo'
            ? `
        <div class="selector-cantidad">
          <button
            type="button"
            class="btn btn-light btn-sm"
            data-restar="${a.idLinea}"
            aria-label="Quitar una pieza"
          >
            −
          </button>
          <span>
            ${a.cantidad}
          </span>
          <button
            type="button"
            class="btn btn-light btn-sm"
            data-sumar="${a.idLinea}"
            aria-label="Agregar una pieza"
          >
            +
          </button>
        </div>`
            : `
        <button
          type="button"
          class="btn btn-link btn-sm p-0 text-danger"
          data-quitar-linea="${a.idLinea}"
        >
          Quitar
        </button>`
        }
      </div>
      <strong class="articulo-carrito__precio">
        ${formatearMoneda(a.precio * a.cantidad)}
      </strong>
    </article>`
    )
    .join('');

  document.getElementById(
    'subtotalPedido'
  ).textContent = formatearMoneda(
    Carrito.total()
  );

  document.getElementById(
    'totalPedido'
  ).textContent = formatearMoneda(
    Carrito.total()
  );
}

/** Un solo escuchador para los botones +, − y Quitar del resumen. */
function configurarCantidades() {
  document
    .getElementById('articulosPedido')
    .addEventListener('click', (evento) => {

      const boton = evento.target.closest(
        '[data-sumar], [data-restar], [data-quitar-linea]'
      );

      if (!boton) return;

      const idLinea =
        boton.dataset.sumar ||
        boton.dataset.restar ||
        boton.dataset.quitarLinea;

      const articulo = Carrito
        .leer()
        .find((a) => a.idLinea === idLinea);

      if (!articulo) return;

      if (boton.dataset.sumar) {
        Carrito.cambiarCantidad(
          idLinea,
          articulo.cantidad + 1
        );
      } else if (
        boton.dataset.restar &&
        articulo.cantidad > 1
      ) {
        Carrito.cambiarCantidad(
          idLinea,
          articulo.cantidad - 1
        );
      } else {
        Carrito.quitar(idLinea);
      }

    });

}

/* Formulario */
/** Si la persona inició sesión, se rellenan sus datos y se le avisa */
function rellenarDatosDeCuenta() {
  const aviso =
    document.getElementById('avisoCuentaPedido');

  const sesion =
    typeof Cuenta !== 'undefined'
      ? Cuenta.sesion()
      : null;

  aviso.hidden = false;

  if (!sesion) {

    aviso.innerHTML = `
      Puedes pedir sin cuenta. Si prefieres,
      <a href="cuenta.html?volver=pedido.html">
        inicia sesión o regístrate
      </a>
      para rellenar tus datos más rápido.`;
    return;
  }

  aviso.classList.add(
    'aviso-cuenta--activa'
  );

  aviso.innerHTML = `
    Sesión iniciada como
    <strong>${escaparHtml(sesion.nombre)}</strong>.
    Rellenamos tus datos por ti.`;

  const poner = (id, valor) => {
    const c =
      document.getElementById(id);

    if (c && valor && !c.value) {
      c.value = valor;
    }
  };

  poner(
    'clienteNombre',
    sesion.nombre
  );

  poner(
    'clienteCorreo',
    sesion.correo
  );

  poner(
    'clienteTelefono',
    sesion.telefono
  );

}

/** Marca un campo como valido o invalido. Devuelve true si es correcto. */
function validarCampo(campo) {
  const esCorrecto =
    REGLAS_VALIDACION[campo.id](campo);

  const tieneValor =
    campo.type === 'checkbox'
      ? campo.checked
      : campo.value.trim() !== '';

  campo.classList.toggle(
    'is-invalid',
    !esCorrecto
  );

  campo.classList.toggle(
    'is-valid',
    esCorrecto && tieneValor
  ); // los opcionales vacíos no se marcan en verde

  return esCorrecto;
}

/** Valida cada campo al salir de él y, una vez revisado, mientras el cliente corrige. */
function configurarValidacion() {
  Object.keys(REGLAS_VALIDACION).forEach(
    (id) => {
      const campo =
        document.getElementById(id);

      campo.addEventListener(
        'blur',
        () => validarCampo(campo)
      );

      campo.addEventListener(
        'change',
        () => validarCampo(campo)
      );

      campo.addEventListener(
        'input',
        () => {
          if (
            campo.classList.contains(
              'is-invalid'
            )
          ) {
            validarCampo(campo);
          }
        }
      );
    }
  );
}

function confirmarPedido(evento) {
  evento.preventDefault();
  const camposActivos =
    Object.keys(REGLAS_VALIDACION)
      .map((id) =>
        document.getElementById(id)
      );

  const camposInvalidos =
    camposActivos.filter(
      (campo) => !validarCampo(campo)
    );

  if (camposInvalidos.length > 0) {
    camposInvalidos[0].focus();

    mostrarAviso(
      'Revisa los campos marcados en rojo'
    );
    return;
  }

  const pedido = {
    folio: generarFolio(),

    fechaPedido:
      new Date().toISOString(),

    cliente: {
      nombre:
        document
          .getElementById('clienteNombre')
          .value
          .trim(),

      telefono:
        document
          .getElementById('clienteTelefono')
          .value
          .trim(),

      correo:
        document
          .getElementById('clienteCorreo')
          .value
          .trim(),

      tipoEntrega: 'recoger',

      fechaEntrega:
        document
          .getElementById('clienteFecha')
          .value,

      horario:
        document
          .getElementById('clienteHorario')
          .selectedOptions[0]
          .textContent,

      pago:
        document
          .getElementById('clientePago')
          .selectedOptions[0]
          .textContent,

      notas:
        document
          .getElementById('clienteNotas')
          .value
          .trim(),

    },
    articulos: Carrito.leer(),
    total: Carrito.total(),
    estado: 'recibido',
  };

  Pedidos.guardar(pedido);
  Carrito.vaciar();
  mostrarConfirmacion(pedido);
}

/*  Confirmación y seguimiento */
function mostrarConfirmacion(pedido) {
  document
    .getElementById('pedidoActivo')
    .classList.add('d-none');

  document
    .getElementById('pedidoVacio')
    .classList.add('d-none');

  const confirmacion =
    document.getElementById(
      'confirmacionPedido'
    );

  confirmacion.classList.remove(
    'd-none'
  );

  document.getElementById(
    'valorFolio'
  ).textContent = pedido.folio;

  document.getElementById(
    'seguimientoEstado'
  ).innerHTML =
    dibujarSeguimientoEstado(
      pedido.estado
    );

  document.getElementById(
    'detallesConfirmacion'
  ).innerHTML = `
    <div>
      <dt>Cliente</dt>
      <dd>
        ${escaparHtml(pedido.cliente.nombre)}
      </dd>
    </div>
    <div>
      <dt>Recoger en</dt>
      <dd>
        Av. Reforma 214, Centro, Lerdo, Dgo.
      </dd>
    </div>
    <div>
      <dt>Fecha</dt>
      <dd>
        ${formatearFecha(
          pedido.cliente.fechaEntrega,
          'long'
        )}
      </dd>
    </div>
    <div>
      <dt>Horario</dt>
      <dd>
        ${escaparHtml(
          pedido.cliente.horario
        )}
      </dd>
    </div>
    <div>
      <dt>Pago</dt>
      <dd>
        ${escaparHtml(
          pedido.cliente.pago
        )}
      </dd>
    </div>
    <div>
      <dt>Total</dt>
      <dd>
        ${formatearMoneda(pedido.total)}
      </dd>
    </div>`;
  confirmacion.focus();
}

/** Lista de pasos del pedido; los pasos ya alcanzados se marcan como activos. */
function dibujarSeguimientoEstado(estadoActual) {
  const indiceActual =
    ESTADOS_PEDIDO.findIndex(
      (e) => e.id === estadoActual
    );

  return ESTADOS_PEDIDO
    .map(
      (estado, i) =>
        `<li class="paso-estado${
          i <= indiceActual
            ? ' activo'
            : ''
        }">
          <span class="punto"></span>
          <span>${estado.etiqueta}</span>
        </li>`
    )
    .join('');
}

function configurarSeguimiento() {
  const campo =
    document.getElementById(
      'campoFolioSeguimiento'
    );

  const resultado =
    document.getElementById(
      'resultadoSeguimiento'
    );

  const buscarFolio = () => {
    const folio =
      campo.value.trim();

    campo.classList.remove(
      'is-invalid',
      'is-valid'
    );

    if (!folio) {
      resultado.innerHTML = '';
      return;
    }

    const pedido =
      Pedidos.buscar(folio);

    if (!pedido) {
      campo.classList.add(
        'is-invalid'
      );

      resultado.innerHTML = `
        <p class="text-danger mb-0">
          No encontramos ese folio en este navegador.
        </p>`;
      return;
    }

    campo.classList.add(
      'is-valid'
    );

    const estado =
      ESTADOS_PEDIDO.find(
        (e) => e.id === pedido.estado
      );

    resultado.innerHTML = `
      <p class="resultado-correcto mb-0">
        Pedido de
        ${escaparHtml(pedido.cliente.nombre)}:
        ${estado ? estado.etiqueta : pedido.estado}.
        Recoger el:
        ${formatearFecha(
          pedido.cliente.fechaEntrega,
          'long'
        )}.
      </p>`;
  };

  document
    .getElementById('botonSeguirFolio')
    .addEventListener(
      'click',
      buscarFolio
    );

  campo.addEventListener(
    'keydown',
    (evento) => {

      if (evento.key === 'Enter') {
        evento.preventDefault();
        buscarFolio();
      }
    }
  );
}