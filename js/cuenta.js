const CLAVE_USUARIOS = 'sweetcrumbs_usuarios_v1';
const CLAVE_SESION = 'sweetcrumbs_sesion_v1';

/* ---------- Utilidades ---------- */

function leerObjeto(clave) {
  try {
    const guardado = localStorage.getItem(clave);
    return guardado ? JSON.parse(guardado) : null;
  } catch (error) {
    return null;
  }
}

function iniciales(nombre) {
  const partes = String(nombre || '?')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return (
    (partes[0] || '?')[0] +
    (partes[1] ? partes[1][0] : '')
  ).toUpperCase();
}

/* ---------- "Servicio" de cuentas ---------- */

const Cuenta = {
  usuarios() {
    return leerObjeto(CLAVE_USUARIOS) || [];
  },

  sesion() {
    return leerObjeto(CLAVE_SESION);
  },

  async registrar({ nombre, correo, telefono, clave }) {
    const usuarios = Cuenta.usuarios();
    const correoNormal = correo.trim().toLowerCase();

    if (usuarios.some((u) => u.correo === correoNormal)) {
      return {
        ok: false,
        error: 'Ya existe una cuenta con ese correo. Prueba iniciar sesión.'
      };
    }

    const usuario = {
      id: `u-${Date.now()}`,
      nombre: nombre.trim(),
      correo: correoNormal,
      telefono: (telefono || '').replace(/\D/g, ''),
      clave: clave,
      creado: new Date().toISOString(),
    };

    usuarios.push(usuario);

    try {
      localStorage.setItem(
        CLAVE_USUARIOS,
        JSON.stringify(usuarios)
      );
    } catch (error) {
      return {
        ok: false,
        error: 'Tu navegador no permite guardar la cuenta (modo privado o almacenamiento bloqueado).'
      };
    }

    Cuenta.abrirSesion(usuario);

    return {
      ok: true,
      usuario
    };
  },

  async ingresar({ correo, clave }) {
    const usuario = Cuenta.usuarios().find(
      (u) =>
        u.correo === correo.trim().toLowerCase() &&
        u.clave === clave
    );

    if (!usuario) {
      return {
        ok: false,
        error: 'Correo o contraseña incorrectos. Este navegador solo reconoce las cuentas creadas aquí.'
      };
    }

    Cuenta.abrirSesion(usuario);

    return {
      ok: true,
      usuario
    };
  },

  abrirSesion(usuario) {
    const sesion = {
      nombre: usuario.nombre,
      correo: usuario.correo,
      telefono: usuario.telefono,
      desde: new Date().toISOString()
    };

    try {
      localStorage.setItem(
        CLAVE_SESION,
        JSON.stringify(sesion)
      );
    } catch (error) {
      /* sin almacenamiento */
    }

    document.dispatchEvent(
      new CustomEvent('cuenta:cambio')
    );
  },

  salir() {
    try {
      localStorage.removeItem(CLAVE_SESION);
    } catch (error) {
      /* sin almacenamiento */
    }

    document.dispatchEvent(
      new CustomEvent('cuenta:cambio')
    );
  },

  /** Pedidos guardados en este navegador que coinciden con el correo de la cuenta. */
  pedidosDe(correo) {
    return (leerObjeto(CLAVE_PEDIDOS) || [])
      .filter(
        (p) =>
          p.cliente &&
          p.cliente.correo.toLowerCase() === correo.toLowerCase()
      )
      .reverse();
  },
};

/* ---------- Botón de cuenta en el encabezado (todas las páginas) ---------- */

function dibujarMenuCuenta() {
  const contenedor = document.getElementById('menuCuenta');

  if (!contenedor) return;

  const sesion = Cuenta.sesion();
  const paginaCuenta = rutaCliente('cuenta.html');

  if (!sesion) {
    contenedor.innerHTML = `
      <a
        class="btn btn-light boton-cuenta"
        href="${paginaCuenta}"
        aria-label="Iniciar sesión o registrarse"
        title="Iniciar sesión o registrarse"
      >
        <svg
          class="icono"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>
        </svg>
      </a>`;

    return;
  }

  contenedor.innerHTML = `
    <div class="dropdown">
      <button
        class="btn boton-cuenta-sesion"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        aria-label="Menú de ${escaparHtml(sesion.nombre)}"
        title="${escaparHtml(sesion.nombre)}"
      >
        <span class="avatar-cuenta" aria-hidden="true">
          ${escaparHtml(iniciales(sesion.nombre))}
        </span>
      </button>

      <ul class="dropdown-menu dropdown-menu-end menu-cuenta__lista">
        <li class="menu-cuenta__cabecera">
          <strong>${escaparHtml(sesion.nombre)}</strong>
          <small>${escaparHtml(sesion.correo)}</small>
        </li>

        <li>
          <a class="dropdown-item" href="${paginaCuenta}">
            Mi cuenta
          </a>
        </li>

        <li>
          <a
            class="dropdown-item"
            href="${rutaCliente('pedido.html')}"
          >
            Mi pedido
          </a>
        </li>

        <li>
          <hr class="dropdown-divider">
        </li>

        <li>
          <button
            class="dropdown-item text-danger"
            type="button"
            id="botonSalirMenu"
          >
            Cerrar sesión
          </button>
        </li>
      </ul>
    </div>`;

  document
    .getElementById('botonSalirMenu')
    .addEventListener(
      'click',
      cerrarSesionDesdeMenu
    );
}

function cerrarSesionDesdeMenu() {
  Cuenta.salir();

  if (document.getElementById('paginaCuenta')) {
    return; // la página de cuenta se redibuja sola
  }

  location.reload();
}

/* ---------- Página cuenta.html ---------- */

const REGLAS_CUENTA = {
  loginCorreo: (c) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(
      c.value.trim()
    ),

  loginClave: (c) =>
    c.value.length >= 1,

  regNombre: (c) =>
    c.value.trim().length >= 3,

  regCorreo: (c) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(
      c.value.trim()
    ),

  regTelefono: (c) =>
    c.value.trim() === '' ||
    /^\d{10}$/.test(
      c.value.replace(/[\s\-()]/g, '')
    ),

  regClave: (c) =>
    c.value.length >= 8 &&
    /[A-Za-z]/.test(c.value) &&
    /\d/.test(c.value),

  regClave2: (c) =>
    c.value !== '' &&
    c.value === document.getElementById('regClave').value,

  regAcepto: (c) =>
    c.checked,
};

function validarCampoCuenta(campo) {
  const correcto = REGLAS_CUENTA[campo.id](campo);

  const tieneValor =
    campo.type === 'checkbox'
      ? campo.checked
      : campo.value.trim() !== '';

  campo.classList.toggle(
    'is-invalid',
    !correcto
  );

  campo.classList.toggle(
    'is-valid',
    correcto && tieneValor
  );

  return correcto;
}

/** Valida todos los campos de un formulario; devuelve true si todos son correctos. */
function validarFormularioCuenta(formulario) {
  const campos = Array.from(
    formulario.querySelectorAll('[id]')
  ).filter((c) => REGLAS_CUENTA[c.id]);

  const invalidos = campos.filter(
    (c) => !validarCampoCuenta(c)
  );

  if (invalidos.length) {
    invalidos[0].focus();
  }

  return invalidos.length === 0;
}

function mostrarErrorFormulario(idCaja, mensaje) {
  const caja = document.getElementById(idCaja);

  caja.textContent = mensaje;

  caja.classList.toggle(
    'd-none',
    !mensaje
  );
}

/** Solo se permite volver a páginas internas simples (por ejemplo "pedido.html"). */
function destinoSeguro() {
  const volver = new URLSearchParams(
    location.search
  ).get('volver');

  return volver &&
    /^[a-z]+\.html$/.test(volver)
    ? volver
    : null;
}

function dibujarVistaCuenta() {
  const sesion = Cuenta.sesion();

  document
    .getElementById('vistaVisitante')
    .classList.toggle(
      'd-none',
      Boolean(sesion)
    );

  document
    .getElementById('vistaSesion')
    .classList.toggle(
      'd-none',
      !sesion
    );

  if (!sesion) return;

  document.getElementById(
    'perfilAvatar'
  ).textContent = iniciales(
    sesion.nombre
  );

  document.getElementById(
    'perfilNombre'
  ).textContent = sesion.nombre;

  document.getElementById(
    'perfilDatos'
  ).innerHTML = `
    <div>
      <dt>Correo</dt>
      <dd>${escaparHtml(sesion.correo)}</dd>
    </div>

    <div>
      <dt>Teléfono</dt>
      <dd>
        ${
          sesion.telefono
            ? escaparHtml(sesion.telefono)
            : 'Sin registrar'
        }
      </dd>
    </div>

    <div>
      <dt>Sesión desde</dt>
      <dd>
        ${formatearFecha(
          sesion.desde.slice(0, 10),
          'long'
        )}
      </dd>
    </div>`;

  const pedidos = Cuenta.pedidosDe(
    sesion.correo
  );

  document.getElementById(
    'perfilPedidos'
  ).innerHTML = pedidos.length
    ? pedidos
        .slice(0, 5)
        .map(
          (p) => `
            <li class="pedido-previo">
              <span class="pedido-previo__folio">
                ${escaparHtml(p.folio)}
              </span>

              <span>
                Recoger el
                ${formatearFecha(
                  p.cliente.fechaEntrega,
                  'long'
                )}
              </span>

              <strong>
                ${formatearMoneda(p.total)}
              </strong>
            </li>`
        )
        .join('')
    : `
      <li class="pedido-previo pedido-previo--vacio">
        Aún no tienes pedidos en este navegador.
      </li>`;
}

function configurarPaginaCuenta() {
  // Mostrar / ocultar contraseña
  document
    .querySelectorAll('[data-ver-clave]')
    .forEach((boton) =>
      boton.addEventListener(
        'click',
        () => {
          const campo =
            document.getElementById(
              boton.dataset.verClave
            );

          const visible =
            campo.type === 'text';

          campo.type = visible
            ? 'password'
            : 'text';

          boton.textContent = visible
            ? 'Mostrar'
            : 'Ocultar';

          boton.setAttribute(
            'aria-pressed',
            String(!visible)
          );
        }
      )
    );

  // Validación en vivo
  Object.keys(REGLAS_CUENTA).forEach(
    (id) => {
      const campo =
        document.getElementById(id);

      if (!campo) return;

      campo.addEventListener(
        'blur',
        () => validarCampoCuenta(campo)
      );

      campo.addEventListener(
        'change',
        () => validarCampoCuenta(campo)
      );

      campo.addEventListener(
        'input',
        () => {
          if (
            campo.classList.contains(
              'is-invalid'
            )
          ) {
            validarCampoCuenta(campo);
          }

          if (
            id === 'regClave' &&
            document.getElementById(
              'regClave2'
            ).value
          ) {
            validarCampoCuenta(
              document.getElementById(
                'regClave2'
              )
            );
          }
        }
      );
    }
  );

  const despuesDeEntrar = (
    mensaje
  ) => {
    mostrarAviso(mensaje);

    const destino =
      destinoSeguro();

    if (destino) {
      setTimeout(() => {
        location.href = destino;
      }, 700);

      return;
    }

    dibujarVistaCuenta();
  };

  document
    .getElementById('formularioLogin')
    .addEventListener(
      'submit',
      async (evento) => {
        evento.preventDefault();

        mostrarErrorFormulario(
          'errorLogin',
          ''
        );

        const formulario =
          evento.currentTarget;

        if (
          !validarFormularioCuenta(
            formulario
          )
        ) {
          return;
        }

        const resultado =
          await Cuenta.ingresar({
            correo:
              document.getElementById(
                'loginCorreo'
              ).value,

            clave:
              document.getElementById(
                'loginClave'
              ).value,
          });

        if (!resultado.ok) {
          return mostrarErrorFormulario(
            'errorLogin',
            resultado.error
          );
        }

        formulario.reset();

        despuesDeEntrar(
          `¡Hola de nuevo, ${
            resultado.usuario.nombre.split(
              ' '
            )[0]
          }!`
        );
      }
    );

  document
    .getElementById('formularioRegistro')
    .addEventListener(
      'submit',
      async (evento) => {
        evento.preventDefault();

        mostrarErrorFormulario(
          'errorRegistro',
          ''
        );

        const formulario =
          evento.currentTarget;

        if (
          !validarFormularioCuenta(
            formulario
          )
        ) {
          return;
        }

        const resultado =
          await Cuenta.registrar({
            nombre:
              document.getElementById(
                'regNombre'
              ).value,

            correo:
              document.getElementById(
                'regCorreo'
              ).value,

            telefono:
              document.getElementById(
                'regTelefono'
              ).value,

            clave:
              document.getElementById(
                'regClave'
              ).value,
          });

        if (!resultado.ok) {
          return mostrarErrorFormulario(
            'errorRegistro',
            resultado.error
          );
        }

        formulario.reset();

        formulario
          .querySelectorAll(
            '.is-valid, .is-invalid'
          )
          .forEach((c) =>
            c.classList.remove(
              'is-valid',
              'is-invalid'
            )
          );

        despuesDeEntrar(
          `¡Cuenta creada! Bienvenida(o), ${
            resultado.usuario.nombre.split(
              ' '
            )[0]
          }.`
        );
      }
    );

  document
    .getElementById(
      'botonSalirPerfil'
    )
    .addEventListener(
      'click',
      () => {
        Cuenta.salir();
        mostrarAviso(
          'Cerraste sesión'
        );
      }
    );

  // Enlaces de texto que cambian de pestaña (¿Aún no tienes cuenta? / ¿Ya tienes cuenta?)
  document
    .querySelectorAll(
      '[data-cambiar-pestana]'
    )
    .forEach((boton) =>
      boton.addEventListener(
        'click',
        () => {
          bootstrap.Tab
            .getOrCreateInstance(
              document.getElementById(
                boton.dataset
                  .cambiarPestana
              )
            )
            .show();
        }
      )
    );

  // Si viene de "?registro", abre directamente la pestaña de registro
  if (
    new URLSearchParams(
      location.search
    ).has('registro')
  ) {
    bootstrap.Tab
      .getOrCreateInstance(
        document.getElementById(
          'pestanaRegistro'
        )
      )
      .show();
  }

  document.addEventListener(
    'cuenta:cambio',
    dibujarVistaCuenta
  );

  dibujarVistaCuenta();
}

document.addEventListener(
  'DOMContentLoaded',
  () => {
    dibujarMenuCuenta();

    document.addEventListener(
      'cuenta:cambio',
      dibujarMenuCuenta
    );

    if (
      document.getElementById(
        'paginaCuenta'
      )
    ) {
      configurarPaginaCuenta();
    }
  }
);