// app.js

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby-lr5tFYdnR7SG6Q1PVSyf3T18ygosjaRndF-JAalHl58Ikz8Lry93o60E5LeR9zo5Xw/exec';

let usuarioLogueado = null;
let rolUsuario = null;
let familiasGlobal = {};
let datosSeguimiento = [];
let listaUsuariosGlobal = [];
let contadorHijos = 0;
let editandoFamilia = false;
let idFamiliaABorrar = null;
let filtroAsistenciaActual = 'todos';

// ==========================================
// NOTIFICACIONES TOAST MEJORADAS
// ==========================================
function mostrarToast(mensaje, tipo = 'exito') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  
  const toast = document.createElement('div');
  const colorBg = tipo === 'exito' ? 'bg-emerald-600' : tipo === 'error' ? 'bg-red-600' : 'bg-blue-600';
  
  toast.className = `${colorBg} text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all duration-300 transform translate-y-2 opacity-0 flex items-center gap-2 pointer-events-auto`;
  toast.innerHTML = `<span>${tipo === 'exito' ? '✅' : tipo === 'error' ? '⚠️' : 'ℹ️'}</span><span>${mensaje}</span>`;
  
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0', '-translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================
// AUTOLOGIN CON LOCALSTORAGE
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  const sesionGuardada = localStorage.getItem('sesionIglesia');
  if (sesionGuardada) {
    try {
      const { usuario, rol } = JSON.parse(sesionGuardada);
      iniciarSesionExitoso(usuario, rol, false);
    } catch(e) {
      localStorage.removeItem('sesionIglesia');
    }
  }
});

document.getElementById('formLogin').addEventListener('submit', async (e) => {
  e.preventDefault();
  const usuario = document.getElementById('usuario').value.trim();
  const password = document.getElementById('password').value.trim();

  const btn = document.getElementById('btnLogin');
  const btnText = document.getElementById('btnLoginText');
  const btnSpinner = document.getElementById('btnLoginSpinner');
  const errorMsg = document.getElementById('loginError');

  btn.disabled = true;
  btnText.textContent = 'Verificando...';
  btnSpinner.classList.remove('hidden');
  errorMsg.classList.add('hidden');

  try {
    const res = await fetch(SCRIPT_URL + '?action=login', {
      method: 'POST',
      body: JSON.stringify({ usuario, password })
    });
    const data = await res.json();

    if (data.success) {
      localStorage.setItem('sesionIglesia', JSON.stringify({ usuario: data.usuario, rol: data.rol }));
      iniciarSesionExitoso(data.usuario, data.rol);
    } else {
      errorMsg.classList.remove('hidden');
    }
  } catch(err) {
    mostrarToast("Error de comunicación con el servidor.", "error");
  } finally {
    btn.disabled = false;
    btnText.textContent = 'Iniciar Sesión';
    btnSpinner.classList.add('hidden');
  }
});

async function iniciarSesionExitoso(usuario, rol, conToast = true) {
  usuarioLogueado = usuario;
  rolUsuario = rol;
  
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('appScreen').classList.remove('hidden');
  document.getElementById('infoUsuario').textContent = `${usuarioLogueado} (${rolUsuario})`;
  
  if (conToast) mostrarToast(`¡Bienvenido/a, ${usuarioLogueado}!`);

  if (rolUsuario === 'admin') {
    await cargarListaUsuarios();
  }
  
  cargarMiembros();
}

async function cargarListaUsuarios() {
  try {
    const res = await fetch(`${SCRIPT_URL}?action=getUsuarios`);
    listaUsuariosGlobal = await res.json();
  } catch (err) {
    console.log("Error descargando líderes: ", err);
  }
}

function cerrarSesion() {
  localStorage.removeItem('sesionIglesia');
  usuarioLogueado = null;
  rolUsuario = null;
  familiasGlobal = {};
  datosSeguimiento = [];
  listaUsuariosGlobal = [];
  document.getElementById('appScreen').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('formLogin').reset();
  mostrarToast("Sesión cerrada correctamente", "info");
}

function cambiarPestana(pestana) {
  document.querySelectorAll('[id^="pestana"]').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('[id^="tab"]').forEach(t => {
    t.classList.remove('border-blue-600', 'text-blue-600');
    t.classList.add('border-transparent', 'text-slate-500');
  });

  document.getElementById('pestana' + pestana.charAt(0).toUpperCase() + pestana.slice(1)).classList.remove('hidden');
  const tab = document.getElementById('tab' + pestana.charAt(0).toUpperCase() + pestana.slice(1));
  
  tab.classList.add('border-blue-600', 'text-blue-600');
  tab.classList.remove('border-transparent', 'text-slate-500');

  if (pestana === 'seguimiento') cargarSeguimiento();
  if (pestana === 'lista') cargarMiembros();
}

function toggleConyuge() {
  const checked = document.getElementById('checkConyuge').checked;
  document.getElementById('datosConyuge').classList.toggle('hidden', !checked);
}

function agregarHijo(nombre = '', cumpleanos = '') {
  contadorHijos++;
  const div = document.createElement('div');
  div.className = 'flex gap-2 items-end';
  div.id = 'hijo' + contadorHijos;
  div.innerHTML = `
    <div class="flex-1">
      <label class="block text-xs font-medium text-slate-700 mb-1">Nombre</label>
      <input type="text" value="${escapeHTML(nombre)}" class="hijo-nombre w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" placeholder="Nombre del hijo/a">
    </div>
    <div class="flex-1">
      <label class="block text-xs font-medium text-slate-700 mb-1">Cumpleaños</label>
      <input type="date" value="${cumpleanos}" class="hijo-cumpleanos w-full px-3 py-2 text-sm border border-slate-300 rounded-lg">
    </div>
    <button type="button" onclick="eliminarHijo(${contadorHijos})" class="px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">✕</button>
  `;
  document.getElementById('listaHijos').appendChild(div);
}

function eliminarHijo(id) {
  document.getElementById('hijo' + id).remove();
}

document.getElementById('formRegistro').addEventListener('submit', async (e) => {
  e.preventDefault();

  const btn = document.getElementById('btnGuardar');
  const btnText = document.getElementById('btnGuardarText');
  const btnSpinner = document.getElementById('btnGuardarSpinner');

  btn.disabled = true;
  btnText.textContent = editandoFamilia ? 'Actualizando...' : 'Guardando...';
  btnSpinner.classList.remove('hidden');

  const hijos = [];
  document.querySelectorAll('[id^="hijo"]').forEach(div => {
    const nombre = div.querySelector('.hijo-nombre').value;
    const cumpleanos = div.querySelector('.hijo-cumpleanos').value;
    if (nombre) hijos.push({ nombre, cumpleanos: cumpleanos || '' });
  });

  const datos = {
    idFamilia: document.getElementById('editIdFamilia').value || null,
    usuarioRegistro: usuarioLogueado,
    titular: {
      nombre: document.getElementById('nombreTitular').value,
      whatsapp: document.getElementById('whatsappTitular').value,
      cumpleanos: document.getElementById('cumpleanosTitular').value || '',
      fechaVisita: document.getElementById('fechaVisita').value,
      comoSeEntero: document.getElementById('comoSeEntero').value || '',
      quienAtendio: document.getElementById('quienAtendio').value,
      direccion: document.getElementById('direccion').value || '',
      asisteMiercoles: document.getElementById('asisteMiercoles').checked,
      asisteDomingo: document.getElementById('asisteDomingo').checked,
      observaciones: document.getElementById('observaciones').value || ''
    },
    conyuge: document.getElementById('checkConyuge').checked ? {
      nombre: document.getElementById('nombreConyuge').value,
      whatsapp: document.getElementById('whatsappConyuge').value || '',
      cumpleanos: document.getElementById('cumpleanosConyuge').value || ''
    } : null,
    hijos: hijos
  };

  try {
    const action = editandoFamilia ? 'updateFamilia' : 'saveFamilia';
    const res = await fetch(SCRIPT_URL + '?action=' + action, {
      method: 'POST',
      body: JSON.stringify(datos)
    });
    const data = await res.json();

    if (data.success) {
      mostrarToast(editandoFamilia ? 'Familia actualizada correctamente' : 'Familia registrada con éxito');
      cancelarEdicion();
      cargarMiembros();
      cambiarPestana('lista');
    }
  } catch(err) {
    mostrarToast("Error al procesar el registro", "error");
  } finally {
    btn.disabled = false;
    btnText.textContent = 'Guardar Familia Completa';
    btnSpinner.classList.add('hidden');
  }
});

async function cargarMiembros() {
  document.getElementById('loadingLista').classList.remove('hidden');
  document.getElementById('listaFamilias').innerHTML = '';

  try {
    const res = await fetch(`${SCRIPT_URL}?action=getMiembros&usuarioActivo=${usuarioLogueado}&rolActivo=${rolUsuario}`);
    const miembros = await res.json();

    familiasGlobal = {};
    miembros.forEach(m => {
      if (!familiasGlobal[m.idFamilia]) familiasGlobal[m.idFamilia] = [];
      familiasGlobal[m.idFamilia].push(m);
    });

    renderizarFamilias();
  } catch(err) {
    mostrarToast("Error cargando lista de familias", "error");
  } finally {
    document.getElementById('loadingLista').classList.add('hidden');
  }
}

function renderizarFamilias() {
  const lista = document.getElementById('listaFamilias');
  const ids = Object.keys(familiasGlobal);

  if (ids.length === 0) {
    lista.innerHTML = '<div class="text-center py-12 bg-white rounded-xl"><p class="text-slate-500 text-sm">No tienes familias asignadas en este momento.</p></div>';
    return;
  }

  lista.innerHTML = ids.map(idFamilia => {
    const familia = familiasGlobal[idFamilia];
    const titular = familia.find(m => m.tipoMiembro === 'Titular') || familia[0];
    const conyuge = familia.find(m => m.tipoMiembro === 'Conyuge');
    const hijos = familia.filter(m => m.tipoMiembro === 'Hijo');
    
    const liderActual = titular.usuarioRegistro || 'Sin asignar';
    let controlReasignacionHTML = `<div class="text-xs text-slate-500 font-medium">Líder asignado: <span class="text-slate-700 font-bold">${liderActual}</span></div>`;
    
    if (rolUsuario === 'admin') {
      const opcionesUsuarios = listaUsuariosGlobal.map(u => `
        <option value="${u.usuario}" ${u.usuario === liderActual ? 'selected' : ''}>${u.usuario} (${u.rol})</option>
      `).join('');
      
      controlReasignacionHTML = `
        <div class="flex items-center gap-1.5 mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
          <label class="text-xs font-bold text-slate-600 whitespace-nowrap">👑 Asignar a:</label>
          <select onchange="ejecutarReasignación('${idFamilia}', this.value)" class="text-xs px-2 py-1 bg-white border border-slate-200 rounded font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500">
            ${opcionesUsuarios}
          </select>
        </div>`;
    }

    const cleanWs = titular.whatsapp ? String(titular.whatsapp).replace(/\D/g,'') : '';
    const wsLink = cleanWs ? `https://wa.me/${cleanWs}` : '#';

    return `
      <div class="bg-white rounded-xl shadow-sm p-5 border border-slate-200 tarjeta-familia" data-busqueda="${escapeHTML(titular.nombre).toLowerCase()} ${cleanWs}">
        <div class="flex justify-between items-start mb-3">
          <div class="flex-1">
            <h3 class="font-bold text-slate-800 text-lg">${escapeHTML(titular.nombre)}</h3>
            <p class="text-xs text-slate-500">Familia de ${familia.length} miembro${familia.length > 1 ? 's' : ''}</p>
          </div>
          <div class="flex gap-2">
            <button onclick="editarFamilia('${idFamilia}')" class="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-200">Editar</button>
            <button onclick="abrirModalBorrar('${idFamilia}')" class="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200">Borrar</button>
          </div>
        </div>
        <div class="space-y-2 text-sm mb-3">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Titular</span>
            <a href="${wsLink}" target="_blank" class="text-slate-600 hover:text-green-600 hover:underline flex items-center gap-1">
              📱 ${escapeHTML(titular.whatsapp)}
            </a>
          </div>
          ${conyuge ? `<div class="flex items-center gap-2"><span class="text-xs font-semibold bg-pink-100 text-pink-700 px-2 py-0.5 rounded">Cónyuge</span><span class="text-slate-600">${escapeHTML(conyuge.nombre)}</span></div>` : ''}
          ${hijos.length > 0 ? `<div class="flex items-start gap-2"><span class="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded">Hijos</span><span class="text-slate-600">${hijos.map(h => escapeHTML(h.nombre)).join(', ')}</span></div>` : ''}
          <div class="pt-2 border-t border-slate-100 text-xs text-slate-500">Visita: ${formatearFecha(titular.fechaVisita)} | Atendió: ${escapeHTML(titular.quienAtendio)}</div>
        </div>
        ${controlReasignacionHTML}
      </div>`;
  }).join('');
}

function filtrarFamilias() {
  const query = document.getElementById('inputBuscarFamilias').value.toLowerCase().trim();
  const tarjetas = document.querySelectorAll('.tarjeta-familia');

  tarjetas.forEach(card => {
    const data = card.getAttribute('data-busqueda') || '';
    if (data.includes(query)) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
}

function exportarCSV() {
  const ids = Object.keys(familiasGlobal);
  if (ids.length === 0) {
    mostrarToast("No hay datos para exportar", "info");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,ID Familia,Tipo,Nombre,WhatsApp,Cumpleaños,Fecha Visita,Lider\n";

  ids.forEach(id => {
    familiasGlobal[id].forEach(m => {
      const fila = [
        `"${m.idFamilia}"`,
        `"${m.tipoMiembro}"`,
        `"${m.nombre || ''}"`,
        `"${m.whatsapp || ''}"`,
        `"${m.cumpleanos || ''}"`,
        `"${m.fechaVisita || ''}"`,
        `"${m.usuarioRegistro || ''}"`
      ].join(',');
      csvContent += fila + "\n";
    });
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Miembros_Iglesia_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  mostrarToast("Archivo descargado con éxito");
}

async function ejecutarReasignación(idFamilia, nuevoLider) {
  if (!confirm(`¿Deseas reasignar esta familia completa al líder "${nuevoLider}"?`)) {
    cargarMiembros();
    return;
  }
  
  try {
    const res = await fetch(`${SCRIPT_URL}?action=reasignarFamilia`, {
      method: 'POST',
      body: JSON.stringify({ idFamilia, nuevoLider })
    });
    const data = await res.json();
    if (data.success) {
      mostrarToast(`Familia reasignada a ${nuevoLider}`);
      cargarMiembros();
    }
  } catch (err) {
    mostrarToast("Error al reasignar la familia", "error");
  }
}

function editarFamilia(idFamilia) {
  const familia = familiasGlobal[idFamilia];
  if (!familia) return;

  const titular = familia.find(m => m.tipoMiembro === 'Titular') || familia[0];
  const conyuge = familia.find(m => m.tipoMiembro === 'Conyuge');
  const hijos = familia.filter(m => m.tipoMiembro === 'Hijo');

  editandoFamilia = true;
  document.getElementById('editIdFamilia').value = idFamilia;
  document.getElementById('tituloForm').textContent = '✏ Editando Familia';

  document.getElementById('nombreTitular').value = titular.nombre;
  document.getElementById('whatsappTitular').value = titular.whatsapp;
  document.getElementById('cumpleanosTitular').value = formatearFechaParaInput(titular.cumpleanos);
  document.getElementById('fechaVisita').value = formatearFechaParaInput(titular.fechaVisita);
  document.getElementById('comoSeEntero').value = titular.comoSeEntero || '';
  document.getElementById('quienAtendio').value = titular.quienAtendio || '';
  document.getElementById('direccion').value = titular.direccion || '';
  document.getElementById('asisteMiercoles').checked = titular.asisteMiercoles === true || titular.asisteMiercoles === 'TRUE';
  document.getElementById('asisteDomingo').checked = titular.asisteDomingo === true || titular.asisteDomingo === 'TRUE';
  document.getElementById('observaciones').value = titular.observaciones || '';

  if (conyuge) {
    document.getElementById('checkConyuge').checked = true;
    toggleConyuge();
    document.getElementById('nombreConyuge').value = conyuge.nombre;
    document.getElementById('whatsappConyuge').value = conyuge.whatsapp || '';
    document.getElementById('cumpleanosConyuge').value = formatearFechaParaInput(conyuge.cumpleanos);
  } else {
    document.getElementById('checkConyuge').checked = false;
    toggleConyuge();
  }

  document.getElementById('listaHijos').innerHTML = '';
  contadorHijos = 0;
  hijos.forEach(h => agregarHijo(h.nombre, formatearFechaParaInput(h.cumpleanos)));

  document.getElementById('btnGuardarText').textContent = 'Actualizar Familia';
  document.getElementById('btnCancelar').classList.remove('hidden');
  cambiarPestana('registro');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelarEdicion() {
  editandoFamilia = false;
  document.getElementById('formRegistro').reset();
  document.getElementById('editIdFamilia').value = '';
  document.getElementById('checkConyuge').checked = false;
  toggleConyuge();
  document.getElementById('listaHijos').innerHTML = '';
  contadorHijos = 0;
  document.getElementById('tituloForm').textContent = '➕ Registrar Familia';
  document.getElementById('btnGuardarText').textContent = 'Guardar Familia Completa';
  document.getElementById('btnCancelar').classList.add('hidden');
}

function abrirModalBorrar(idFamilia) {
  idFamiliaABorrar = idFamilia;
  document.getElementById('modalBorrar').classList.remove('hidden');
  document.getElementById('modalBorrar').classList.add('flex');
}

function cerrarModalBorrar() {
  document.getElementById('modalBorrar').classList.add('hidden');
  document.getElementById('modalBorrar').classList.remove('flex');
  idFamiliaABorrar = null;
}

async function confirmarBorrar() {
  if (!idFamiliaABorrar) return;

  try {
    const res = await fetch(SCRIPT_URL + '?action=deleteFamilia', {
      method: 'POST',
      body: JSON.stringify({ idFamilia: idFamiliaABorrar })
    });
    const data = await res.json();

    cerrarModalBorrar();
    if (data.success) {
      mostrarToast('Familia eliminada correctamente');
      cargarMiembros();
    } else {
      mostrarToast('Error al borrar: ' + data.msg, "error");
    }
  } catch(e) {
    mostrarToast("Error de comunicación", "error");
  }
}

async function cargarSeguimiento() {
  document.getElementById('loadingSeguimiento').classList.remove('hidden');
  document.getElementById('listaSeguimiento').innerHTML = '';

  try {
    const res = await fetch(`${SCRIPT_URL}?action=getSeguimiento&usuarioActivo=${usuarioLogueado}&rolActivo=${rolUsuario}`);
    datosSeguimiento = await res.json();
    renderizarSeguimiento();
  } catch(e) {
    mostrarToast("Error cargando el seguimiento", "error");
  } finally {
    document.getElementById('loadingSeguimiento').classList.add('hidden');
  }
}

function filtrarAsistencia(tipo) {
  filtroAsistenciaActual = tipo;
  document.getElementById('filtroTodos').className = tipo === 'todos' ? 'px-2.5 py-1 text-xs rounded-lg bg-blue-600 text-white font-medium' : 'px-2.5 py-1 text-xs rounded-lg text-slate-700 font-medium';
  document.getElementById('filtroPendientes').className = tipo === 'pendientes' ? 'px-2.5 py-1 text-xs rounded-lg bg-blue-600 text-white font-medium' : 'px-2.5 py-1 text-xs rounded-lg text-slate-700 font-medium';
  document.getElementById('filtroAsistieron').className = tipo === 'asistieron' ? 'px-2.5 py-1 text-xs rounded-lg bg-blue-600 text-white font-medium' : 'px-2.5 py-1 text-xs rounded-lg text-slate-700 font-medium';
  renderizarSeguimiento();
}

function renderizarSeguimiento() {
  const lista = document.getElementById('listaSeguimiento');
  let datos = datosSeguimiento;

  if (filtroAsistenciaActual === 'pendientes') {
    datos = datos.filter(m => m.fechas.some(f => !f.asistio));
  } else if (filtroAsistenciaActual === 'asistieron') {
    datos = datos.filter(m => m.fechas.some(f => f.asistio));
  }

  if (datos.length === 0) {
    lista.innerHTML = '<div class="text-center py-12 text-slate-400"><div class="text-4xl mb-2">📭</div><p>No hay registros para mostrar</p></div>';
    return;
  }

  lista.innerHTML = datos.map(miembro => {
    let colorBorde = miembro.nivelAlerta === 'rojo' ? 'border-red-500' : miembro.nivelAlerta === 'amarillo' ? 'border-yellow-500' : 'border-green-500';
    let colorBadge = miembro.nivelAlerta === 'rojo' ? 'bg-red-100 text-red-800' : miembro.nivelAlerta === 'amarillo' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';

    let badgeTipo = miembro.tipoMiembro === 'Conyuge' ? '<span class="bg-pink-100 text-pink-800 text-xs font-semibold px-2 py-0.5 rounded-full">Cónyuge</span>' : '<span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">Titular</span>';

    const fechasHTML = miembro.fechas.map(f => `
      <label class="flex-1 min-w-[65px] border-2 rounded-xl p-2 sm:p-3 text-center ${f.asistio ? 'bg-green-100 border-green-300' : 'bg-white border-slate-200'} cursor-pointer hover:border-blue-400 transition-colors flex-shrink-0">
        <div class="flex items-center justify-center gap-1 mb-0.5">
          <input type="checkbox" ${f.asistio ? 'checked' : ''} onchange="marcarAsistencia('${miembro.idMiembro}', '${f.fecha}', this.checked)" class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer">
          <span class="text-[11px] sm:text-xs font-semibold text-slate-700">${escapeHTML(f.diaSemana)}</span>
        </div>
        <div class="text-[10px] sm:text-xs text-slate-600 font-medium">${escapeHTML(f.fechaCorta)}</div>
      </label>`).join('');

    return `
      <div class="bg-white border-l-4 ${colorBorde} rounded-xl p-3.5 sm:p-4 shadow-sm mb-3">
        <div class="flex items-start justify-between mb-3 gap-2">
          <div class="flex items-center gap-1.5 flex-wrap">
            ${badgeTipo}
            <h3 class="font-bold text-slate-800 text-sm sm:text-base">${escapeHTML(miembro.nombre)}</h3>
            <!-- MUESTRA EL LÍDER ASIGNADO AL LADO DEL NOMBRE -->
            <span class="bg-slate-100 text-slate-600 text-[11px] sm:text-xs font-medium px-2 py-0.5 rounded-md border border-slate-200">👑 ${escapeHTML(miembro.usuarioRegistro || 'Sin asignar')}</span>
          </div>
          <div class="flex items-center gap-1.5 flex-shrink-0">
            <button type="button" onclick="abrirBitacora('${miembro.idMiembro}', '${escapeHTML(miembro.nombre).replace(/'/g, "\\'")}')" class="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors flex items-center gap-1">
              📝 Bitácora
            </button>
            <div class="${colorBadge} px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap">
              ${escapeHTML(miembro.textoAlerta)}
            </div>
          </div>
        </div>
        <div class="flex gap-1.5 overflow-x-auto pb-1.5 -mx-1 px-1 sm:mx-0 sm:px-0">${fechasHTML}</div>
      </div>`;
  }).join('');
}

async function marcarAsistencia(idMiembro, fecha, asistio) {
  const miembro = datosSeguimiento.find(m => m.idMiembro === idMiembro);
  if (miembro) {
    const fechaObj = miembro.fechas.find(f => f.fecha === fecha);
    if (fechaObj) fechaObj.asistio = asistio;
  }

  await fetch(SCRIPT_URL + '?action=marcarAsistencia', {
    method: 'POST',
    body: JSON.stringify({ idMiembro, fecha, asistio, usuario: usuarioLogueado })
  });

  mostrarToast("Asistencia actualizada");
  cargarSeguimiento();
}

// ==========================================
// BITÁCORA PASTORAL Y EDICIÓN MEDIANTE MODAL
// ==========================================
let idMiembroBitacoraActivo = null;

async function abrirBitacora(idMiembro, nombreMiembro) {
  idMiembroBitacoraActivo = idMiembro;
  
  const modal = document.getElementById('modalBitacora');
  const contenedorHistorial = document.getElementById('historialComentarios');
  
  document.getElementById('bitacoraIdMiembro').value = idMiembro;
  document.getElementById('bitacoraNombreMiembro').textContent = `Miembro: ${nombreMiembro}`;
  
  contenedorHistorial.innerHTML = `
    <div class="text-center py-6 text-slate-400 text-sm">
      <div class="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-slate-500 mb-1"></div>
      <p>Cargando historial de cuidado...</p>
    </div>`;
  
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  
  try {
    const res = await fetch(`${SCRIPT_URL}?action=getBitacora&idMiembro=${idMiembro}&usuarioActivo=${usuarioLogueado}&rolActivo=${rolUsuario}`);
    const notas = await res.json();
    renderizarHistorialBitacora(notas);
  } catch (error) {
    contenedorHistorial.innerHTML = '<p class="text-center text-xs text-red-500 py-4">Error al conectar con el servidor.</p>';
  }
}

function cerrarBitacora() {
  const modal = document.getElementById('modalBitacora');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.getElementById('formNuevaNota').reset();
  idMiembroBitacoraActivo = null;
}

function renderizarHistorialBitacora(notas) {
  const contenedor = document.getElementById('historialComentarios');
  
  if (!notas || notas.length === 0) {
    contenedor.innerHTML = `
      <div class="text-center py-8 text-slate-400">
        <div class="text-3xl mb-1">📝</div>
        <p class="text-xs">No hay notas registradas para este miembro.</p>
      </div>`;
    return;
  }
  
  contenedor.innerHTML = notas.map(nota => `
    <div class="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-1.5">
      <div class="flex justify-between items-center border-b border-slate-50 pb-1">
        <span class="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">👤 ${escapeHTML(nota.usuario)}</span>
        <div class="flex items-center gap-2">
          <span class="text-[11px] text-slate-400 font-medium">${escapeHTML(nota.fechaCorta || nota.fecha)}</span>
          <button type="button" onclick="editarNotaBitacora(${nota.filaIndex}, '${escapeHTML(nota.comentario).replace(/'/g, "\\'")}')" class="text-xs text-blue-600 hover:text-blue-800 font-medium px-1">✏️</button>
          <button type="button" onclick="borrarNotaBitacora(${nota.filaIndex})" class="text-xs text-red-600 hover:text-red-800 font-medium px-1">🗑️</button>
        </div>
      </div>
      <p class="text-sm text-slate-700 leading-relaxed">${escapeHTML(nota.comentario)}</p>
    </div>`).join('');
  
  contenedor.scrollTop = contenedor.scrollHeight;
}

function editarNotaBitacora(filaIndex, comentarioActual) {
  document.getElementById('editNotaFilaIndex').value = filaIndex;
  document.getElementById('editNotaTexto').value = comentarioActual;
  
  const modal = document.getElementById('modalEditarNota');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function cerrarModalEditarNota() {
  const modal = document.getElementById('modalEditarNota');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.getElementById('editNotaFilaIndex').value = '';
  document.getElementById('editNotaTexto').value = '';
}

async function confirmarEdicionNotaBitacora() {
  const filaIndex = document.getElementById('editNotaFilaIndex').value;
  const nuevoTexto = document.getElementById('editNotaTexto').value.trim();
  const btn = document.getElementById('btnGuardarEdicionNota');

  if (!nuevoTexto || !filaIndex) return;

  btn.disabled = true;
  btn.textContent = "Guardando...";

  try {
    const res = await fetch(`${SCRIPT_URL}?action=updateNotaBitacora`, {
      method: 'POST',
      body: JSON.stringify({ filaIndex, nuevoComentario: nuevoTexto })
    });
    const data = await res.json();
    
    if (data.success) {
      cerrarModalEditarNota();
      mostrarToast("Nota actualizada con éxito");
      const nombreMiembro = document.getElementById('bitacoraNombreMiembro').textContent.replace('Miembro: ','');
      abrirBitacora(idMiembroBitacoraActivo, nombreMiembro);
    }
  } catch(e) {
    mostrarToast("Error al actualizar la nota", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Guardar Cambios";
  }
}

async function borrarNotaBitacora(filaIndex) {
  if (!confirm("¿Estás seguro de que deseas eliminar esta nota de la bitácora?")) return;

  try {
    const res = await fetch(`${SCRIPT_URL}?action=deleteNotaBitacora`, {
      method: 'POST',
      body: JSON.stringify({ filaIndex })
    });
    const data = await res.json();
    if (data.success) {
      mostrarToast("Nota eliminada");
      abrirBitacora(idMiembroBitacoraActivo, document.getElementById('bitacoraNombreMiembro').textContent.replace('Miembro: ',''));
    }
  } catch(e) {
    mostrarToast("Error al eliminar la nota", "error");
  }
}

document.getElementById('formNuevaNota').addEventListener('submit', async (e) => {
  e.preventDefault();
  const textoNota = document.getElementById('nuevaNotaTexto').value.trim();
  const idMiembro = document.getElementById('bitacoraIdMiembro').value;
  const btn = document.getElementById('btnGuardarNota');
  
  if (!textoNota || !idMiembro) return;
  
  btn.disabled = true;
  btn.textContent = "Guardando...";
  
  const datosNota = { idMiembro, usuario: usuarioLogueado || "Líder Autorizado", comentario: textoNota };
  
  try {
    const res = await fetch(`${SCRIPT_URL}?action=saveNotaBitacora`, {
      method: 'POST',
      body: JSON.stringify(datosNota)
    });
    const result = await res.json();
    
    if (result.success) {
      document.getElementById('nuevaNotaTexto').value = '';
      mostrarToast("Nota de bitácora añadida");
      const resRefresh = await fetch(`${SCRIPT_URL}?action=getBitacora&idMiembro=${idMiembro}&usuarioActivo=${usuarioLogueado}&rolActivo=${rolUsuario}`);
      const notasActualizadas = await resRefresh.json();
      renderizarHistorialBitacora(notasActualizadas);
    }
  } catch (error) {
    mostrarToast("Error al guardar la nota", "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Guardar Nota";
  }
});

// ==========================================
// REPORTE PASTORAL (CON FECHA 1ª VISITA Y LÍDER)
// ==========================================
async function generarReportePastoral() {
  if (!datosSeguimiento || datosSeguimiento.length === 0) {
    mostrarToast("Primero asegúrate de que los datos de seguimiento estén cargados", "info");
    return;
  }

  let todaLaBitacora = [];
  try {
    const resBitacora = await fetch(`${SCRIPT_URL}?action=getAllBitacora`);
    todaLaBitacora = await resBitacora.json();
  } catch (err) {
    console.log("No se pudo descargar la bitácora para el reporte.");
  }

  if (rolUsuario !== 'admin') {
    todaLaBitacora = todaLaBitacora.filter(n => n.usuario === usuarioLogueado);
  }

  const totalAlmas = datosSeguimiento.length;
  const rojas = datosSeguimiento.filter(m => m.nivelAlerta === 'rojo');
  const amarillas = datosSeguimiento.filter(m => m.nivelAlerta === 'amarillo');
  const verdes = datosSeguimiento.filter(m => m.nivelAlerta === 'verde' || !m.nivelAlerta);

  function obtenerMetricasAsistencia(miembro) {
    let primeraVisita = 'Sin fecha';

    if (familiasGlobal[miembro.idFamilia]) {
      const fam = familiasGlobal[miembro.idFamilia];
      const mEncontrado = fam.find(f => f.idMiembro === miembro.idMiembro) || fam[0];
      if (mEncontrado && mEncontrado.fechaVisita) {
        primeraVisita = formatearFecha(mEncontrado.fechaVisita);
      }
    }

    if (!miembro.fechas || miembro.fechas.length === 0) {
      return { faltas: 0, ultimaVisita: 'Sin registros', primeraVisita };
    }

    const faltas = miembro.fechas.filter(f => !f.asistio).length;
    let ultimaVisita = 'Sin asistencia registrada';
    for (let i = miembro.fechas.length - 1; i >= 0; i--) {
      if (miembro.fechas[i].asistio) {
        ultimaVisita = miembro.fechas[i].fechaCorta;
        break;
      }
    }
    return { faltas, ultimaVisita, primeraVisita };
  }

  const filasRojasHTML = rojas.map(m => {
    const metrics = obtenerMetricasAsistencia(m);
    const notasMiembro = todaLaBitacora.filter(n => n.idMiembro.toString() === m.idMiembro.toString());
    let subFilaBitacoraHTML = '';
    
    if (notasMiembro.length > 0) {
      subFilaBitacoraHTML = `
        <tr>
          <td colspan="7" style="padding: 6px 12px; background: #fef2f2; border-bottom: 1px solid #fee2e2; font-size: 11px; color: #7f1d1d; font-style: italic;">
            <strong>💬 Último Seguimiento (${notasMiembro[0].fechaCorta}) - Atendió ${escapeHTML(notasMiembro[0].usuario)}:</strong> "${escapeHTML(notasMiembro[0].comentario)}"
          </td>
        </tr>`;
    } else {
      subFilaBitacoraHTML = `<tr><td colspan="7" style="padding: 6px 12px; background: #fafafa; border-bottom: 1px solid #fee2e2; font-size: 11px; color: #71717a; font-style: italic;">⚠️ Sin registros de cuidado en bitácora.</td></tr>`;
    }

    return `
      <tr>
        <td style="padding: 8px; border-bottom: none; font-weight: bold;">${escapeHTML(m.nombre)}</td>
        <td style="padding: 8px; border-bottom: none; font-family: monospace;">${escapeHTML(m.tipoMiembro)}</td>
        <td style="padding: 8px; border-bottom: none; text-align: center; color: #dc2626; font-weight: bold; font-size: 14px;">${metrics.faltas}</td>
        <td style="padding: 8px; border-bottom: none; color: #1e293b; font-weight: 500;">${metrics.primeraVisita}</td>
        <td style="padding: 8px; border-bottom: none; color: #7f1d1d; font-weight: 500;">${metrics.ultimaVisita}</td>
        <td style="padding: 8px; border-bottom: none; font-weight: 600; color: #2563eb;">${escapeHTML(m.usuarioRegistro || 'Sin asignar')}</td>
        <td style="padding: 8px; border-bottom: none;"><span style="background: #fef2f2; color: #991b1b; padding: 2px 8px; font-size: 11px; font-weight: bold; border-radius: 4px;">${escapeHTML(m.textoAlerta)}</span></td>
      </tr>
      ${subFilaBitacoraHTML}`;
  }).join('');

  const filasTodasHTML = datosSeguimiento.map(m => {
    let badgeColor = "background: #f0fdf4; color: #166534;";
    if (m.nivelAlerta === 'rojo') badgeColor = "background: #fef2f2; color: #991b1b;";
    if (m.nivelAlerta === 'amarillo') badgeColor = "background: #fefce8; color: #854d0e;";
    const metrics = obtenerMetricasAsistencia(m);

    return `
      <tr>
        <td style="padding: 6px; border-bottom: 1px solid #e2e8f0;">${escapeHTML(m.nombre)}</td>
        <td style="padding: 6px; border-bottom: 1px solid #e2e8f0; font-size: 12px;">${escapeHTML(m.tipoMiembro)}</td>
        <td style="padding: 6px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: 600;">${metrics.faltas}</td>
        <td style="padding: 6px; border-bottom: 1px solid #e2e8f0; color: #334155;">${metrics.primeraVisita}</td>
        <td style="padding: 6px; border-bottom: 1px solid #e2e8f0; color: #475569;">${metrics.ultimaVisita}</td>
        <td style="padding: 6px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #2563eb;">${escapeHTML(m.usuarioRegistro || 'Sin asignar')}</td>
        <td style="padding: 6px; border-bottom: 1px solid #e2e8f0;"><span style="${badgeColor} padding: 2px 6px; font-size: 11px; font-weight: bold; border-radius: 4px;">${escapeHTML(m.textoAlerta || 'Estable')}</span></td>
      </tr>`;
  }).join('');

  const notasRecientesCuidado = todaLaBitacora.slice(0, 12);
  let tablaBitacoraGlobalHTML = '';

  if (notasRecientesCuidado.length === 0) {
    tablaBitacoraGlobalHTML = `<p style="font-size: 13px; color: #64748b; font-style: italic;">No se han registrado interacciones en la bitácora.</p>`;
  } else {
    const filasBitacoraGlobal = notasRecientesCuidado.map(n => {
      const miembroEncontrado = datosSeguimiento.find(m => m.idMiembro.toString() === n.idMiembro.toString());
      const nombreMostrar = miembroEncontrado ? miembroEncontrado.nombre : `ID: ${n.idMiembro}`;
      return `
        <tr>
          <td style="padding: 6px; border-bottom: 1px solid #e2e8f0; white-space: nowrap;">${escapeHTML(n.fecha)}</td>
          <td style="padding: 6px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #1e293b;">${escapeHTML(nombreMostrar)}</td>
          <td style="padding: 6px; border-bottom: 1px solid #e2e8f0; font-weight: 500; color: #2563eb;">${escapeHTML(n.usuario)}</td>
          <td style="padding: 6px; border-bottom: 1px solid #e2e8f0; color: #4b5563;">${escapeHTML(n.comentario)}</td>
        </tr>`;
    }).join('');

    tablaBitacoraGlobalHTML = `
      <table>
        <thead>
          <tr>
            <th style="width: 18%;">Fecha / Hora</th>
            <th style="width: 25%;">Miembro Atendido</th>
            <th style="width: 17%;">Líder Responsable</th>
            <th style="width: 40%;">Detalle de la Gestión Pastoral</th>
          </tr>
        </thead>
        <tbody>${filasBitacoraGlobal}</tbody>
      </table>`;
  }

  const tipoReporteSubtitulo = (rolUsuario === 'admin') 
    ? 'Reporte General de Control Pastoral y Cuidado de Nuevos Miembros' 
    : `Reporte de Control Pastoral - Líder Asignado: ${usuarioLogueado}`;

  const ventanaReporte = window.open('', '_blank');
  ventanaReporte.document.title = `Reporte Pastoral - Centro de Fe, Esperanza y Amor`;

  ventanaReporte.document.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Reporte Pastoral - Centro de Fe, Esperanza y Amor</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #334155; margin: 40px; line-height: 1.5; }
        .header { text-align: center; border-bottom: 3px solid #1d4ed8; padding-bottom: 20px; margin-bottom: 25px; }
        .titulo { margin: 0; color: #1e293b; font-size: 26px; font-weight: bold; }
        .subtitulo { margin: 5px 0 0 0; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
        .fecha { font-size: 12px; color: #94a3b8; margin-top: 10px; }
        
        .grid-resumen { display: flex; gap: 15px; margin-bottom: 30px; }
        .card { flex: 1; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; text-align: center; }
        .card-total { border-top: 4px solid #1d4ed8; background: #f8fafc; }
        .card-roja { border-top: 4px solid #ef4444; background: #fef2f2; }
        .card-amarilla { border-top: 4px solid #eab308; background: #fefce8; }
        .card-verde { border-top: 4px solid #22c55e; background: #f0fdf4; }
        .card-num { font-size: 24px; font-weight: bold; color: #1e293b; margin-bottom: 2px; }
        .card-lbl { font-size: 11px; color: #64748b; font-weight: 600; }

        .seccion-titulo { font-size: 15px; color: #1e293b; border-left: 4px solid #1d4ed8; padding-left: 8px; margin-top: 35px; margin-bottom: 15px; text-transform: uppercase; font-weight: bold; }
        .seccion-titulo.rojo { border-left-color: #ef4444; color: #991b1b; }
        .seccion-titulo.azul-oscuro { border-left-color: #1e3a8a; color: #1e3a8a; }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
        th { background: #f1f5f9; text-align: left; padding: 8px; color: #475569; font-weight: 600; border-bottom: 2px solid #cbd5e1; }
        
        .btn-imprimir { background: #1e293b; color: white; border: none; padding: 10px 20px; font-size: 14px; font-weight: bold; border-radius: 6px; cursor: pointer; margin-bottom: 20px; display: inline-block; }
        
        @media print {
          .btn-imprimir { display: none; }
          body { margin: 20px; }
          tr { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>

      <button class="btn-imprimir" onclick="window.print()">🖨 Imprimir o Guardar en PDF</button>

      <div class="header">
        <div style="margin-bottom: 15px; text-align: center;">
          <img src="https://i.postimg.cc/zvL3HZvk/Diseno-sin-titulo.png" alt="Logo Iglesia" style="width: 150px; height: auto; object-fit: contain;">
        </div>
        <h1 class="titulo">Centro de Fe, Esperanza y Amor</h1>
        <h2 class="subtitulo">${tipoReporteSubtitulo}</h2>
        <div class="fecha">Generado el: ${new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>

      <div class="grid-resumen">
        <div class="card card-total">
          <div class="card-num">${totalAlmas}</div>
          <div class="card-lbl">Asignados</div>
        </div>
        <div class="card card-roja">
          <div class="card-num">${rojas.length}</div>
          <div class="card-lbl">Alerta Roja</div>
        </div>
        <div class="card card-amarilla">
          <div class="card-num">${amarillas.length}</div>
          <div class="card-lbl">Alerta Amarilla</div>
        </div>
        <div class="card card-verde">
          <div class="card-num">${verdes.length}</div>
          <div class="card-lbl">Estables / Activos</div>
        </div>
      </div>

      <div class="seccion-titulo rojo">🚨 Atención Inmediata (Casos Críticos / Ausencias)</div>
      ${rojas.length === 0 ? 
        `<p style="font-size: 13px; color: #64748b; font-style: italic;">¡Gloria a Dios! No hay miembros en alerta roja bajo esta supervisión.</p>` : 
        `<table>
          <thead>
            <tr>
              <th style="width: 25%;">Nombre del Miembro</th>
              <th style="width: 12%;">Rol Familiar</th>
              <th style="width: 9%; text-align: center;">Faltas</th>
              <th style="width: 14%;">1ª Visita</th>
              <th style="width: 14%;">Última Asistencia</th>
              <th style="width: 13%;">Líder Asignado</th>
              <th style="width: 13%;">Estatus</th>
            </tr>
          </thead>
          <tbody>${filasRojasHTML}</tbody>
        </table>`
      }

      <div class="seccion-titulo">📋 Estado General de Asistencia de Miembros</div>
      <table>
        <thead>
          <tr>
            <th style="width: 25%;">Nombre Completo</th>
            <th style="width: 12%;">Rol Familiar</th>
            <th style="width: 9%; text-align: center;">Faltas</th>
            <th style="width: 14%;">1ª Visita</th>
            <th style="width: 14%;">Última Asistencia</th>
            <th style="width: 13%;">Líder Asignado</th>
            <th style="width: 13%;">Estatus</th>
          </tr>
        </thead>
        <tbody>${filasTodasHTML}</tbody>
      </table>

      <div class="seccion-titulo azul-oscuro">📝 Actividad Reciente de Consolidación y Cuidado</div>
      ${tablaBitacoraGlobalHTML}

      <div style="margin-top: 60px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px dashed #cbd5e1; padding-top: 10px;">
        "Mirad por vosotros, y por todo el rebaño en que el Espíritu Santo os ha puesto por obispos..." — Hechos 20:28
      </div>

    </body>
    </html>
  `);
  ventanaReporte.document.close();
}

function formatearFecha(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatearFechaParaInput(fecha) {
  if (!fecha) return '';
  if (typeof fecha === 'string' && fecha.includes('-')) return fecha.split('T')[0];
  const d = new Date(fecha);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}