/* DATOS (SUSTIYE AL BASE DE DATOS POR EL MOMENTO) */
// Iconos SVG para cada tipo de producto.
const ICONOS = {
  pastel: `<svg viewBox="0 0 120 120" fill="currentColor" fill-opacity="0.14" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 66c0-7 9-12 20-12s20 5 20 12" stroke-linecap="round"/><path d="M60 66c0-7 9-12 20-12s20 5 20 12" stroke-linecap="round"/><rect x="20" y="66" width="80" height="30" rx="6"/><rect x="14" y="90" width="92" height="12" rx="4"/><path d="M40 54V38M60 54V32M80 54V38" stroke-linecap="round"/><circle cx="40" cy="30" r="4"/><circle cx="60" cy="24" r="4"/><circle cx="80" cy="30" r="4"/></svg>`,
  cupcake: `<svg viewBox="0 0 120 120" fill="currentColor" fill-opacity="0.14" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M34 58c-6-8-4-20 6-25 3-9 13-15 20-11 8-6 20-2 21 8 10 2 15 14 8 22" stroke-linecap="round" stroke-linejoin="round"/><path d="M30 58h60l-7 42a6 6 0 0 1-6 5H43a6 6 0 0 1-6-5z"/><path d="M36 58l24 20 24-20" /></svg>`,
  tarta: `<svg viewBox="0 0 120 120" fill="currentColor" fill-opacity="0.14" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="60" cy="64" r="38"/><path d="M22 64a38 38 0 0 1 76 0" fill="none"/><circle cx="45" cy="58" r="6"/><circle cx="68" cy="50" r="6"/><circle cx="80" cy="66" r="6"/><circle cx="55" cy="74" r="6"/></svg>`,
  galleta: `<svg viewBox="0 0 120 120" fill="currentColor" fill-opacity="0.14" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M60 22c10 0 16 8 25 9 9 1 17 8 16 18-1 8 4 13 3 21-2 10-10 14-15 21-6 8-14 10-22 9-9 1-14 6-23 3-11-3-15-12-18-22-3-9-9-12-8-22 1-9 8-12 11-20 4-10 14-8 22-12 3-2 6-5 9-5z"/><circle cx="46" cy="50" r="4.5"/><circle cx="72" cy="46" r="4.5"/><circle cx="82" cy="68" r="4.5"/><circle cx="52" cy="76" r="4.5"/><circle cx="64" cy="62" r="3.5"/><circle cx="36" cy="68" r="3.5"/></svg>`,
};

function iconoPara(type) {
  return ICONOS[type] || ICONOS.pastel;
}

// ARREGLO DE PRODUCTOS 
const PRODUCTOS = [
  { id: 'p01', nombre: 'Tres Leches Clásico', categoria: 'pasteles', precio: 420, unidad: '8 porciones', icono: 'pastel', destacado: true, descripcion: 'Bizcocho ligero bañado en tres leches, con un toque de canela.' },
  { id: 'p02', nombre: 'Red Velvet de Autor', categoria: 'pasteles', precio: 480, unidad: '8 porciones', icono: 'pastel', destacado: true, descripcion: 'Terciopelo rojo con queso crema batido a mano.' },
  { id: 'p03', nombre: 'Chocolate Belga 70%', categoria: 'pasteles', precio: 460, unidad: '8 porciones', icono: 'pastel', destacado: true, descripcion: 'Capas húmedas de chocolate intenso, ganache espejo.' },
  { id: 'p04', nombre: 'Zanahoria y Nuez', categoria: 'pasteles', precio: 440, unidad: '8 porciones', icono: 'pastel', destacado: false, descripcion: 'Especiado, con nuez tostada y frosting de queso crema.' },
  { id: 'p05', nombre: 'Pistache Real', categoria: 'pasteles', precio: 520, unidad: '8 porciones', icono: 'pastel', destacado: true, descripcion: 'Pistache molido en piedra, relleno de mazapán ligero.' },
  { id: 'p06', nombre: 'Cupcakes Vainilla Bean', categoria: 'cupcakes', precio: 180, unidad: 'caja de 6', icono: 'cupcake', destacado: false, descripcion: 'Vainilla de Papantla, betún merengue suizo.' },
  { id: 'p07', nombre: 'Cupcakes Red Velvet', categoria: 'cupcakes', precio: 195, unidad: 'caja de 6', icono: 'cupcake', destacado: false, descripcion: 'Mini versión de nuestro clásico, en caja para compartir.' },
  { id: 'p08', nombre: 'Cupcakes Limón y Amapola', categoria: 'cupcakes', precio: 190, unidad: 'caja de 6', icono: 'cupcake', destacado: false, descripcion: 'Ralladura fresca, semillas de amapola, glaseado cítrico.' },
  { id: 'p09', nombre: 'Cheesecake de Zarzamora', categoria: 'postres', precio: 380, unidad: 'redondo, 10 cm', icono: 'tarta', destacado: true, descripcion: 'Horneado lento, coulis de zarzamora de temporada.' },
  { id: 'p10', nombre: 'Tartaleta de Frutas', categoria: 'postres', precio: 175, unidad: 'redondo, 12 cm', icono: 'tarta', destacado: true, descripcion: 'Base crujiente, relleno de frutas de temporada.' },
  { id: 'p11', nombre: 'Cheesecake de Mango', categoria: 'postres', precio: 350, unidad: 'redonda, 18 cm', icono: 'tarta', destacado: false, descripcion: 'Costra crocante, curd de mango, trozos de fruta.' },
  { id: 'p12', nombre: 'Galleta de Chispas de Chocolate', categoria: 'galletas', precio: 80, unidad: 'caja de 6', icono: 'galleta', destacado: false, descripcion: 'Mantequilla dorada, chispas de chocolate semiamargo y sal de mar.' },
  { id: 'p13', nombre: 'Galletas de Chocolate Amargo', categoria: 'galletas', precio: 160, unidad: 'caja de 6', icono: 'galleta', destacado: false, descripcion: 'A base de chocolate amargo, crujiente y deliciosa.' },
  { id: 'p14', nombre: 'Galleta Red Velvet Rellena', categoria: 'galletas', precio: 100, unidad: 'caja de 6', icono: 'galleta', destacado: false, descripcion: 'Masa de terciopelo rojo rellena de queso crema.' },
  { id: 'p15', nombre: 'Alfajores de Dulce de Leche', categoria: 'galletas', precio: 130, unidad: 'caja de 6', icono: 'galleta', destacado: false, descripcion: 'Dos galletas suaves, dulce de leche cremoso y coco rallado.' },
  { id: 'p16', nombre: 'Galleta de Avena y Arándano', categoria: 'galletas', precio: 65, unidad: 'caja de 6', icono: 'galleta', destacado: false, descripcion: 'Avena entera, arándano deshidratado y un toque de canela.' },
];

const CATEGORIAS = [
  { id: 'todos', etiqueta: 'Todos' },
  { id: 'pasteles', etiqueta: 'Pasteles' },
  { id: 'cupcakes', etiqueta: 'Cupcakes' },
  { id: 'postres', etiqueta: 'Postres individuales' },
  { id: 'galletas', etiqueta: 'Galletas' },
];

const formatoMoneda = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
function formatearMoneda(n) { return formatoMoneda.format(n); }

/** Convierte texto del usuario en texto seguro para insertarlo con innerHTML. */
function escaparHtml(texto) {
  return String(texto).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Fecha mínima de entrega (hoy + 2 días) en formato AAAA-MM-DD, en hora local. */
function fechaMinimaEntrega() {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + 2);
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

/** Da formato legible a una fecha AAAA-MM-DD. El mes puede ser 'short' o 'long'. */
function formatearFecha(iso, mes = 'short') {
  if (!iso) return '—';
  const fecha = new Date(`${iso}T00:00:00`);
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: mes, year: 'numeric' }).format(fecha);
}
