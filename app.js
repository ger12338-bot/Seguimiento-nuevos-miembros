// app.js

// ✏️ CAMBIAR AQUÍ: Coloca la URL de tu última implementación de Google Apps Script
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

// Evento Login - Restaurado al formato nativo original funcional
document.getElementById('formLogin').addEventListener('submit', async (e) => {
  e.preventDefault();
  const usuario = document.getElementById('usuario').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    // Retorno al formato exacto de tu URL original con parámetro action adjunto
    const res = await fetch(SCRIPT_URL + '?action=login', {
      method: 'POST',
      body: JSON.stringify({ usuario, password })
    });
    const data = await res.json();

    if (data.success) {
      usuarioLogueado = data.usuario;
      rolUsuario = data.rol;
      document.getElementById('loginScreen').classList.add('hidden');
      document.getElementById('appScreen').classList.remove('hidden');
      document.getElementById('infoUsuario').textContent = `${usuarioLogueado} (${rolUsuario})`;
      
      if (rolUsuario === 'admin') {
        await cargarListaUsuarios();
      }
      
      cargarMiembros();
    } else {
      document.getElementById('loginError').classList.remove('hidden');
    }
  } catch(err) {
    alert("Error de comunicación con el servidor. Verifica tu SCRIPT_URL.");
  }
});

async function cargarListaUsuarios() {
  try {
    const res = await fetch(`${SCRIPT_URL}?action=getUsuarios`);
    listaUsuariosGlobal = await res.json();
  } catch (err) {
    console.log("Error descargando líderes: ", err);
  }
}

function cerrarSesion() {
  usuarioLogueado = null;
  rolUsuario = null;
  familiasGlobal = {};
  datosSeguimiento = [];
  listaUsuariosGlobal = [];
  document.getElementById('appScreen').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('formLogin').reset();
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
      <input type="text" value="${nombre}" class="hijo-nombre w-full px-3 py-2 text-sm border border-slate-300 rounded-lg" placeholder="Nombre del hijo/a">
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

  const hijos = [];
  document.querySelectorAll('[id^="hijo"]').forEach(div => {
    const nombre = div.querySelector('.hijo-nombre').value;
    const cumpleanos = div.querySelector('.hijo-cumpleanos').value;
    if (nombre) hijos.push({ nombre, cumpleanos });
  });

  const datos = {
    idFamilia: document.getElementById('editIdFamilia').value || null,
    usuarioRegistro: usuarioLogueado,
    titular: {
      nombre: document.getElementById('nombreTitular').value,
      whatsapp: document.getElementById('whatsappTitular').value,
      cumpleanos: document.getElementById('cumpleanosTitular').value,
      fechaVisita: document.getElementById('fechaVisita').value,
      comoSeEntero: document.getElementById('comoSeEntero').value,
      quienAtendio: document.getElementById('quienAtendio').value,
      direccion: document.getElementById('direccion').value,
      asisteMiercoles: document.getElementById('asisteMiercoles').checked,
      asisteDomingo: document.getElementById('asisteDomingo').checked,
      observaciones: document.getElementById('observaciones').value
    },
    conyuge: document.getElementById('checkConyuge').checked ? {
      nombre: document.getElementById('nombreConyuge').value,
      whatsapp: document.getElementById('whatsappConyuge').value,
      cumpleanos: document.getElementById('cumpleanosConyuge').value
    } : null,
    hijos: hijos
  };

  const action = editandoFamilia ? 'updateFamilia' : 'saveFamilia';
  const res = await fetch(SCRIPT_URL + '?action=' + action, {
    method: 'POST',
    body: JSON.stringify(datos)
  });
  const data = await res.json();

  if (data.success) {
    alert(editandoFamilia ? 'Familia actualizada' : 'Familia registrada con éxito');
    cancelarEdicion();
    cargarMiembros();
    cambiarPestana('lista');
  }
});

async function cargarMiembros() {
  document.getElementById('loadingLista').classList.remove('hidden');
  document.getElementById('listaFamilias').innerHTML = '';

  const res = await fetch(`${SCRIPT_URL}?action=getMiembros&usuarioActivo=${usuarioLogueado}&rolActivo=${rolUsuario}`);
  const miembros = await res.json();

  familiasGlobal = {};
  miembros.forEach(m => {
    if (!familiasGlobal[m.idFamilia]) familiasGlobal[m.idFamilia] = [];
    familiasGlobal[m.idFamilia].push(m);
  });

  document.getElementById('loadingLista').classList.add('hidden');
  renderizarFamilias();
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
    const titular = familia.find(m => m.tipoMiembro === 'Titular');
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

    return `
      <div class="bg-white rounded-xl shadow-sm p-5 border border-slate-200">
        <div class="flex justify-between items-start mb-3">
          <div class="flex-1">
            <h3 class="font-bold text-slate-800 text-lg">${titular.nombre}</h3>
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
            <span class="text-slate-600">📱 ${titular.whatsapp}</span>
          </div>
          ${conyuge ? `<div class="flex items-center gap-2"><span class="text-xs font-semibold bg-pink-100 text-pink-700 px-2 py-0.5 rounded">Cónyuge</span><span class="text-slate-600">${conyuge.nombre}</span></div>` : ''}
          ${hijos.length > 0 ? `<div class="flex items-start gap-2"><span class="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded">Hijos</span><span class="text-slate-600">${hijos.map(h => h.nombre).join(', ')}</span></div>` : ''}
          <div class="pt-2 border-t border-slate-100 text-xs text-slate-500">Visita: ${formatearFecha(titular.fechaVisita)} | Atendió: ${titular.quienAtendio}</div>
        </div>
        ${controlReasignacionHTML}
      </div>`;
  }).join('');
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
      alert(`Familia reasignada con éxito.`);
      cargarMiembros();
    }
  } catch (err) {
    alert("Error de conexión al procesar la reasignación.");
  }
}

function editarFamilia(idFamilia) {
  const familia = familiasGlobal[idFamilia];
  if (!familia) return;

  const titular = familia.find(m => m.tipoMiembro === 'Titular');
  const conyuge = familia.find(m => m.tipoMiembro === 'Conyuge');
  const hijos = familia.filter(m => m.tipoMiembro === 'Hijo');

  editandoFamilia = true;
  document.getElementById('editIdFamilia').value = idFamilia;
  document.getElementById('tituloForm').textContent = '✏ Editando Familia';

  document.getElementById('nombreTitular').value = titular.nombre;
  document.getElementById('whatsappTitular').value = titular.whatsapp;
  document.getElementById('cumpleanosTitular').value = formatearFechaParaInput(titular.cumpleanos);
  document.getElementById('fechaVisita').value = formatearFechaParaInput(titular.fechaVisita);
  document.getElementById('comoSeEntero').value = titular.comoSeEntero;
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

  document.getElementById('btnGuardar').textContent = 'Actualizar Familia';
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
  document.getElementById('btnGuardar').textContent = 'Guardar Familia Completa';
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

  const res = await fetch(SCRIPT_URL + '?action=deleteFamilia', {
    method: 'POST',
    body: JSON.stringify({ idFamilia: idFamiliaABorrar })
  });
  const data = await res.json();

  cerrarModalBorrar();
  if (data.success) {
    cargarMiembros();
  } else {
    alert('Error al borrar: ' + data.msg);
  }
}

async function cargarSeguimiento() {
  document.getElementById('loadingSeguimiento').classList.remove('hidden');
  document.getElementById('listaSeguimiento').innerHTML = '';

  const res = await fetch(`${SCRIPT_URL}?action=getSeguimiento&usuarioActivo=${usuarioLogueado}&rolActivo=${rolUsuario}`);
  datosSeguimiento = await res.json();
  document.getElementById('loadingSeguimiento').classList.add('hidden');
  renderizarSeguimiento();
}

function filtrarAsistencia(tipo) {
  filtroAsistenciaActual = tipo;
  document.getElementById('filtroTodos').className = tipo === 'todos' ? 'px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white' : 'px-3 py-1.5 text-sm rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200';
  document.getElementById('filtroPendientes').className = tipo === 'pendientes' ? 'px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white' : 'px-3 py-1.5 text-sm rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200';
  document.getElementById('filtroAsistieron').className = tipo === 'asistieron' ? 'px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white' : 'px-3 py-1.5 text-sm rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200';
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
    let colorFondo = miembro.nivelAlerta === 'rojo' ? 'bg-red-50' : miembro.nivelAlerta === 'amarillo' ? 'bg-yellow-50' : 'bg-green-50';
    let colorBadge = miembro.nivelAlerta === 'rojo' ? 'bg-red-100 text-red-800' : miembro.nivelAlerta === 'amarillo' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';

    let badgeTipo = miembro.tipoMiembro === 'Conyuge' ? '<span class="bg-pink-100 text-pink-800 text-xs font-semibold px-2.5 py-1 rounded-full">Cónyuge</span>' : '<span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">Titular</span>';

    const fechasHTML = miembro.fechas.map(f => `
      <label class="flex-1 min-w border-2 rounded-lg p-3 text-center ${f.asistio ? 'bg-green-100 border-green-300' : 'bg-white border-slate-300'} cursor-pointer hover:border-blue-400 transition-colors">
        <div class="flex items-center justify-center gap-1 mb-1">
          <input type="checkbox" ${f.asistio ? 'checked' : ''} onchange="marcarAsistencia('${miembro.idMiembro}', '${f.fecha}', this.checked)" class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer">
          <span class="text-xs font-semibold text-slate-700">${f.diaSemana}</span>
        </div>
        <div class="text-xs text-slate-600">${f.fechaCorta}</div>
      </label>`).join('');

    return `
      <div class="bg-white border-l-4 ${colorBorde} rounded-lg p-4 shadow-sm mb-3">
        <div class="flex items-start justify-between mb-3 gap-3">
          <div class="flex items-center gap-2 flex-wrap">${badgeTipo}<h3 class="font-bold text-slate-800">${miembro.nombre}</h3></div>
          <div class="flex items-center gap-2">
            <button onclick="abrirBitacora('${miembro.idMiembro}', '${miembro.nombre}')" class="px-2.5 py-1 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold transition-colors flex items-center gap-1">
              📝 Bitácora
            </button>
            <div class="${colorBadge} px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
              <span class="w-2 h-2 rounded-full ${miembro.nivelAlerta === 'rojo' ? 'bg-red-600' : miembro.nivelAlerta === 'amarillo' ? 'bg-yellow-600' : 'bg-green-600'}"></span>${miembro.textoAlerta}
            </div>
          </div>
        </div>
        <div class="flex gap-2 overflow-x-auto pb-1">${fechasHTML}</div>
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

  cargarSeguimiento();
}

// ==========================================
// LOGICA PARA LA BITÁCORA PASTORAL
// ==========================================
let idMiembroBitacoraActivo = null;

async function abrirBitacora(idMiembro, nombreMiembro) {
  idMiembroBitacoraActivo = idMiembro;
  document.getElementById('bitacoraIdMiembro').value = idMiembro;
  document.getElementById('bitacoraNombreMiembro').textContent = `Miembro: ${nombreMiembro}`;
  
  const contenedorHistorial = document.getElementById('historialComentarios');
  contenedorHistorial.innerHTML = `
    <div class="text-center py-6 text-slate-400 text-sm">
      <div class="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-slate-500 mb-1"></div>
      <p>Cargando historial de cuidado...</p>
    </div>`;
  
  const modal = document.getElementById('modalBitacora');
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
        <span class="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">👤 Atendió: ${nota.usuario}</span>
        <span class="text-[11px] text-slate-400 font-medium">${nota.fechaCorta || nota.fecha}</span>
      </div>
      <p class="text-sm text-slate-700 leading-relaxed">${nota.comentario}</p>
    </div>`).join('');
  
  contenedor.scrollTop = contenedor.scrollHeight;
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
      const resRefresh = await fetch(`${SCRIPT_URL}?action=getBitacora&idMiembro=${idMiembro}&usuarioActivo=${usuarioLogueado}&rolActivo=${rolUsuario}`);
      const notasActualizadas = await resRefresh.json();
      renderizarHistorialBitacora(notasActualizadas);
    }
  } catch (error) {
    alert("Error de conexión al guardar nota.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Guardar Nota";
  }
});

// ==========================================
// FUNCIÓN PARA GENERAR REPORTE PASTORAL
// ==========================================
async function generarReportePastoral() {
  if (!datosSeguimiento || datosSeguimiento.length === 0) {
    alert("Amigo, primero asegúrate de que los datos de seguimiento estén cargados en la pantalla.");
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
    if (!miembro.fechas || miembro.fechas.length === 0) {
      return { faltas: 0, ultimaVisita: 'Sin registros' };
    }
    const faltas = miembro.fechas.filter(f => !f.asistio).length;
    let ultimaVisita = 'Sin asistencia registrada';
    for (let i = miembro.fechas.length - 1; i >= 0; i--) {
      if (miembro.fechas[i].asistio) {
        ultimaVisita = miembro.fechas[i].fechaCorta;
        break;
      }
    }
    return { faltas, ultimaVisita };
  }

  const filasRojasHTML = rojas.map(m => {
    const metrics = obtenerMetricasAsistencia(m);
    const notasMiembro = todaLaBitacora.filter(n => n.idMiembro.toString() === m.idMiembro.toString());
    let subFilaBitacoraHTML = '';
    
    if (notasMiembro.length > 0) {
      subFilaBitacoraHTML = `
        <tr>
          <td colspan="5" style="padding: 6px 12px; background: #fef2f2; border-bottom: 1px solid #fee2e2; font-size: 11px; color: #7f1d1d; font-style: italic;">
            <strong>💬 Último Seguimiento (${notasMiembro[0].fechaCorta}) - Atendió ${notasMiembro[0].usuario}:</strong> "${notasMiembro[0].comentario}"
          </td>
        </tr>`;
    } else {
      subFilaBitacoraHTML = `<tr><td colspan="5" style="padding: 6px 12px; background: #fafafa; border-bottom: 1px solid #fee2e2; font-size: 11px; color: #71717a; font-style: italic;">⚠️ Sin registros de cuidado en bitácora.</td></tr>`;
    }

    return `
      <tr>
        <td style="padding: 8px; border-bottom: none; font-weight: bold;">${m.nombre}</td>
        <td style="padding: 8px; border-bottom: none; font-family: monospace;">${m.tipoMiembro}</td>
        <td style="padding: 8px; border-bottom: none; text-align: center; color: #dc2626; font-weight: bold; font-size: 14px;">${metrics.faltas}</td>
        <td style="padding: 8px; border-bottom: none; color: #7f1d1d; font-weight: 500;">${metrics.ultimaVisita}</td>
        <td style="padding: 8px; border-bottom: none;"><span style="background: #fef2f2; color: #991b1b; padding: 2px 8px; font-size: 11px; font-weight: bold; border-radius: 4px;">${m.textoAlerta}</span></td>
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
        <td style="padding: 6px; border-bottom: 1px solid #e2e8f0;">${m.nombre}</td>
        <td style="padding: 6px; border-bottom: 1px solid #e2e8f0; font-size: 12px;">${m.tipoMiembro}</td>
        <td style="padding: 6px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: 600;">${metrics.faltas}</td>
        <td style="padding: 6px; border-bottom: 1px solid #e2e8f0; color: #475569;">${metrics.ultimaVisita}</td>
        <td style="padding: 6px; border-bottom: 1px solid #e2e8f0;"><span style="${badgeColor} padding: 2px 6px; font-size: 11px; font-weight: bold; border-radius: 4px;">${m.textoAlerta || 'Estable'}</span></td>
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
          <td style="padding: 6px; border-bottom: 1px solid #e2e8f0; white-space: nowrap;">${n.fecha}</td>
          <td style="padding: 6px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #1e293b;">${nombreMostrar}</td>
          <td style="padding: 6px; border-bottom: 1px solid #e2e8f0; font-weight: 500; color: #2563eb;">${n.usuario}</td>
          <td style="padding: 6px; border-bottom: 1px solid #e2e8f0; color: #4b5563;">${n.comentario}</td>
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
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
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
              <th style="width: 35%;">Nombre del Miembro</th>
              <th style="width: 15%;">Rol Familiar</th>
              <th style="width: 12%; text-align: center;">Total Faltas</th>
              <th style="width: 20%;">Última Asistencia</th>
              <th style="width: 18%;">Estatus de Alerta</th>
            </tr>
          </thead>
          <tbody>${filasRojasHTML}</tbody>
        </table>`
      }

      <div class="seccion-titulo">📋 Estado General de Asistencia de Miembros</div>
      <table>
        <thead>
          <tr>
            <th style="width: 35%;">Nombre Completo</th>
            <th style="width: 15%;">Rol Familiar</th>
            <th style="width: 12%; text-align: center;">Total Faltas</th>
            <th style="width: 20%;">Última Asistencia</th>
            <th style="width: 18%;">Estatus de Alerta</th>
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

function cerrarSesion() {
  usuarioLogueado = null;
  rolUsuario = null;
  familiasGlobal = {};
  datosSeguimiento = [];
  listaUsuariosGlobal = [];
  document.getElementById('appScreen').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('formLogin').reset();
}
