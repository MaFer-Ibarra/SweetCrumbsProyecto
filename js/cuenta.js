const CLAVE_USUARIOS = 'sweetcrumbs_usuarios_v1';
const CLAVE_SESION = 'sweetcrumbs_sesion_v1';

/** Iniciales para el perfil */
function iniciales(nombre) {
  const partes = String(nombre || '?').trim().split(/\s+/).filter(Boolean);
  const primera = (partes[0] || '?')[0];
  const segunda = partes[1] ? partes[1][0] : '';
  return (primera + segunda).toUpperCase();
}

const Cuenta = {
  usuarios() {
    return leerAlmacenamiento(CLAVE_USUARIOS);
  },

  sesion() {
    return leerAlmacenamiento(CLAVE_SESION, null);
  },

  registrar({ nombre, correo, telefono, clave }) {
    const usuarios = Cuenta.usuarios();
    const correoNormal = correo.trim().toLowerCase();
    if (usuarios.some((u) => u.correo === correoNormal)) {
      return { ok: false, error: 'Ya existe una cuenta con ese correo. Prueba iniciar sesión.' };
    }
    const usuario = {
      id: `u-${Date.now()}`,
      nombre: nombre.trim(),
      correo: correoNormal,
      telefono: (telefono || '').replace(/\D/g, ''),
      clave,
      creado: new Date().toISOString(),
    };

    usuarios.push(usuario);
    try {
      localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
    } catch (error) {
      return {
        ok: false,
        error: 'Tu navegador no permite guardar la cuenta (modo privado o almacenamiento bloqueado).',
      };
    }
    Cuenta.abrirSesion(usuario);
    return { ok: true, usuario };
  },

  ingresar({ correo, clave }) {
    const correoNormal = correo.trim().toLowerCase();
    const usuario = Cuenta.usuarios().find((u) => u.correo === correoNormal && u.clave === clave);

    if (!usuario) {
      return {
        ok: false,
        error: 'Correo o contraseña incorrectos. Este navegador solo reconoce las cuentas creadas aquí.',
      };
    }
    Cuenta.abrirSesion(usuario);
    return { ok: true, usuario };
  },

  /** Guarda los datos públicos del usuario como sesión activa (sin la contraseña). */
  abrirSesion(usuario) {
    guardarAlmacenamiento(CLAVE_SESION, {
      nombre: usuario.nombre,
      correo: usuario.correo,
      telefono: usuario.telefono,
      desde: new Date().toISOString(),
    });
    document.dispatchEvent(new CustomEvent('cuenta:cambio'));
  },

  salir() {
    try {
      localStorage.removeItem(CLAVE_SESION);
    } catch (error) {
      // Almacenamiento bloqueado: no hay nada que borrar
    }
    document.dispatchEvent(new CustomEvent('cuenta:cambio'));
  },
};

/*btn de cuenta en el encabezado  */
function dibujarMenuCuenta() {
  const contenedor = porId('menuCuenta');

  if (!contenedor) return;
  const sesion = Cuenta.sesion();
  const paginaCuenta = rutaCliente('cuenta.html');

  // Sin sesión
  if (!sesion) {
    contenedor.innerHTML = `
      <a class="btn btn-light boton-cuenta" href="${paginaCuenta}"
         aria-label="Iniciar sesión o registrarse" title="Iniciar sesión o registrarse">
        <svg class="icono" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>
        </svg>
      </a>`;
    return;
  }

  // Con sesión avatar con menú desplegable
  contenedor.innerHTML = `
    <div class="dropdown">
      <button class="btn boton-cuenta-sesion" type="button" data-bs-toggle="dropdown"
              aria-expanded="false" aria-label="Menú de ${escaparHtml(sesion.nombre)}"
              title="${escaparHtml(sesion.nombre)}">
        <span class="avatar-cuenta" aria-hidden="true">${escaparHtml(iniciales(sesion.nombre))}</span>
      </button>
      <ul class="dropdown-menu dropdown-menu-end menu-cuenta__lista">
        <li class="menu-cuenta__cabecera">
          <strong>${escaparHtml(sesion.nombre)}</strong>
          <small>${escaparHtml(sesion.correo)}</small>
        </li>
        <li><a class="dropdown-item" href="${paginaCuenta}">Mi cuenta</a></li>
        <li><a class="dropdown-item" href="${rutaCliente('pedido.html')}">Mi pedido</a></li>
        <li><hr class="dropdown-divider"></li>
        <li>
          <button class="dropdown-item text-danger" type="button" id="botonSalirMenu">
            Cerrar sesión
          </button>
        </li>
      </ul>
    </div>`;
  porId('botonSalirMenu').addEventListener('click', cerrarSesionDesdeMenu);
}

function cerrarSesionDesdeMenu() {
  Cuenta.salir();
  if (!porId('paginaCuenta')) location.reload();
}

/*  Validaciones de cuenta.html */
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const REGLAS_CUENTA = {
  loginCorreo: (c) => REGEX_CORREO.test(c.value.trim()),
  loginClave: (c) => c.value.length >= 1,
  regNombre: (c) => c.value.trim().length >= 3,
  regCorreo: (c) => REGEX_CORREO.test(c.value.trim()),
  regTelefono: (c) => c.value.trim() === '' || /^\d{10}$/.test(c.value.replace(/[\s\-()]/g, '')),
  regClave: (c) => c.value.length >= 8 && /[A-Za-z]/.test(c.value) && /\d/.test(c.value),
  regClave2: (c) => c.value !== '' && c.value === porId('regClave').value,
  regAcepto: (c) => c.checked,
};

/** Valida un campo y le pone el estilo de válido / inválido. */
function validarCampoCuenta(campo) {
  const correcto = REGLAS_CUENTA[campo.id](campo);
  const tieneValor = campo.type === 'checkbox' ? campo.checked : campo.value.trim() !== '';
  campo.classList.toggle('is-invalid', !correcto);
  campo.classList.toggle('is-valid', correcto && tieneValor);
  return correcto;
}

/** Valida todos los campos de un formulario; devuelve true si todos son correctos. */
function validarFormularioCuenta(formulario) {
  const campos = Array.from(formulario.querySelectorAll('[id]')).filter((c) => REGLAS_CUENTA[c.id]);
  const invalidos = campos.filter((c) => !validarCampoCuenta(c));
  if (invalidos.length) invalidos[0].focus();
  return invalidos.length === 0;
}

function mostrarErrorFormulario(idCaja, mensaje) {
  const caja = porId(idCaja);
  caja.textContent = mensaje;
  caja.classList.toggle('d-none', !mensaje);
}

function destinoSeguro() {
  const volver = new URLSearchParams(location.search).get('volver');
  return volver && /^[a-z]+\.html$/.test(volver) ? volver : null;
}

function dibujarVistaCuenta() {
  const sesion = Cuenta.sesion();
  porId('vistaVisitante').classList.toggle('d-none', Boolean(sesion));
  porId('vistaSesion').classList.toggle('d-none', !sesion);
  if (!sesion) return;
  porId('perfilAvatar').textContent = iniciales(sesion.nombre);
  porId('perfilNombre').textContent = sesion.nombre;
  porId('perfilDatos').innerHTML = `
    <div>
      <dt>Correo</dt>
      <dd>${escaparHtml(sesion.correo)}</dd>
    </div>
    <div>
      <dt>Teléfono</dt>
      <dd>${sesion.telefono ? escaparHtml(sesion.telefono) : 'Sin registrar'}</dd>
    </div>
    <div>
      <dt>Sesión desde</dt>
      <dd>${formatearFecha(sesion.desde.slice(0, 10), 'long')}</dd>
    </div>`;
}

/** Después de entrar o registrarse avisa y vuelve a la página de origen  */
function despuesDeEntrar(mensaje) {
  mostrarAviso(mensaje);
  const destino = destinoSeguro();

  if (destino) {
    setTimeout(() => {
      location.href = destino;
    }, 700);
    return;
  }
  dibujarVistaCuenta();
}

/** Botones "Mostrar / Ocultar" de las contraseñas. */
function activarVerClave() {
  document.querySelectorAll('[data-ver-clave]').forEach((boton) => {
    boton.addEventListener('click', () => {
      const campo = porId(boton.dataset.verClave);
      const estabaVisible = campo.type === 'text';

      campo.type = estabaVisible ? 'password' : 'text';
      boton.textContent = estabaVisible ? 'Mostrar' : 'Ocultar';
      boton.setAttribute('aria-pressed', String(!estabaVisible));
    });
  });
}

function activarValidacionEnVivo() {
  Object.keys(REGLAS_CUENTA).forEach((id) => {
    const campo = porId(id);
    if (!campo) return;
    campo.addEventListener('blur', () => validarCampoCuenta(campo));
    campo.addEventListener('change', () => validarCampoCuenta(campo));
    campo.addEventListener('input', () => {
      if (campo.classList.contains('is-invalid')) validarCampoCuenta(campo);
      // Si cambia la contraseña, se vuelve a revisar que la repetición coincida
      if (id === 'regClave' && porId('regClave2').value) {
        validarCampoCuenta(porId('regClave2'));
      }
    });
  });
}

function enviarLogin(evento) {
  evento.preventDefault();
  mostrarErrorFormulario('errorLogin', '');
  const formulario = evento.currentTarget;

  if (!validarFormularioCuenta(formulario)) return;

  const resultado = Cuenta.ingresar({
    correo: porId('loginCorreo').value,
    clave: porId('loginClave').value,
  });

  if (!resultado.ok) {
    mostrarErrorFormulario('errorLogin', resultado.error);
    return;
  }
  formulario.reset();
  despuesDeEntrar(`¡Hola de nuevo, ${resultado.usuario.nombre.split(' ')[0]}!`);
}

function enviarRegistro(evento) {
  evento.preventDefault();
  mostrarErrorFormulario('errorRegistro', '');

  const formulario = evento.currentTarget;

  if (!validarFormularioCuenta(formulario)) return;

  const resultado = Cuenta.registrar({
    nombre: porId('regNombre').value,
    correo: porId('regCorreo').value,
    telefono: porId('regTelefono').value,
    clave: porId('regClave').value,
  });

  if (!resultado.ok) {
    mostrarErrorFormulario('errorRegistro', resultado.error);
    return;
  }

  // Limpia el formulario y quita los colores verde / rojo
  formulario.reset();
  formulario.querySelectorAll('.is-valid, .is-invalid').forEach((c) => {
    c.classList.remove('is-valid', 'is-invalid');
  });
  despuesDeEntrar(`¡Cuenta creada! Bienvenida(o), ${resultado.usuario.nombre.split(' ')[0]}.`);
}

function abrirPestana(idPestana) {
  bootstrap.Tab.getOrCreateInstance(porId(idPestana)).show();
}

function configurarPaginaCuenta() {
  activarVerClave();
  activarValidacionEnVivo();

  porId('formularioLogin').addEventListener('submit', enviarLogin);
  porId('formularioRegistro').addEventListener('submit', enviarRegistro);

  porId('botonSalirPerfil').addEventListener('click', () => {
    Cuenta.salir();
    mostrarAviso('Cerraste sesión');
  });

  // Enlaces de texto ¿Aún no tienes cuenta? / ¿Ya tienes cuenta?
  document.querySelectorAll('[data-cambiar-pestana]').forEach((boton) => {
    boton.addEventListener('click', () => abrirPestana(boton.dataset.cambiarPestana));
  });

  if (new URLSearchParams(location.search).has('registro')) {
    abrirPestana('pestanaRegistro');
  }
  document.addEventListener('cuenta:cambio', dibujarVistaCuenta);
  dibujarVistaCuenta();
}

document.addEventListener('DOMContentLoaded', () => {
  dibujarMenuCuenta();
  document.addEventListener('cuenta:cambio', dibujarMenuCuenta);

  if (porId('paginaCuenta')) configurarPaginaCuenta();
});
