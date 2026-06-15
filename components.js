// components.js

// ==========================================
// 1. PANTALLA DE INICIAR SESIÓN
// ==========================================
document.getElementById('loginScreen').innerHTML = `
  <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
    <div class="text-center mb-6">
      
      <div class="mb-3 flex items-center justify-center">
        <img src="https://i.postimg.cc/zvL3HZvk/Diseno-sin-titulo.png" alt="Logo Iglesia" class="w-24 h-24 object-contain mx-auto">
      </div>
      
      <h1 class="text-2xl font-bold text-slate-800">Centro de Fe, Esperanza y Amor</h1>
      <p class="text-sm text-slate-500">Sistema de Registro</p>
    </div>
    <form id="formLogin" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1.5">Usuario</label>
        <input type="text" id="usuario" required class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
        <input type="password" id="password" required class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
      </div>
      <button type="submit" class="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md">
        Iniciar Sesión
      </button>
      <p id="loginError" class="text-red-600 text-sm text-center hidden">Usuario o contraseña incorrectos</p>
    </form>
  </div>
`;

// ==========================================
// 2. PANTALLA PRINCIPAL (SISTEMA ACTIVO)
// ==========================================
document.getElementById('appScreen').innerHTML = `
  <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg">
    <div class="max-w-6xl mx-auto flex justify-between items-center">
      <div class="flex items-center gap-3">
      <img src="https://i.postimg.cc/zvL3HZvk/Diseno-sin-titulo.png" alt="Logo" class="w-10 h-10 object-contain rounded-full">
        <div>
          <h1 class="text-xl font-bold">Centro de Fe, Esperanza y Amor</h1>
          <p class="text-xs text-blue-100" id="infoUsuario"></p>
        </div>
      </div>
      <button onclick="cerrarSesion()" class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">Salir</button>
    </div>
  </div>

  <div class="bg-white border-b border-slate-200 sticky top-0 z-10">
    <div class="max-w-6xl mx-auto flex">
      <button onclick="cambiarPestana('registro')" id="tabRegistro" class="flex-1 py-3 text-sm font-semibold border-b-2 border-blue-600 text-blue-600">Registro</button>
      <button onclick="cambiarPestana('lista')" id="tabLista" class="flex-1 py-3 text-sm font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-700">Familias</button>
      <button onclick="cambiarPestana('seguimiento')" id="tabSeguimiento" class="flex-1 py-3 text-sm font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-700">Seguimiento</button>
    </div>
  </div>

  <div class="max-w-6xl mx-auto p-4 pb-20">
    <div id="pestanaRegistro" class="bg-white rounded-xl shadow-sm p-5">
      <h2 class="text-lg font-semibold text-slate-800 mb-4" id="tituloForm">➕ Registrar Familia</h2>
      <form id="formRegistro" class="space-y-4">
        <input type="hidden" id="editIdFamilia" value="">

        <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 class="text-sm font-bold text-blue-900 mb-3">👤 TITULAR</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><label class="block text-xs font-medium text-slate-700 mb-1">Nombre completo *</label><input type="text" id="nombreTitular" required class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"></div>
            <div><label class="block text-xs font-medium text-slate-700 mb-1">WhatsApp *</label><input type="tel" id="whatsappTitular" required class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"></div>
            <div><label class="block text-xs font-medium text-slate-700 mb-1">Cumpleaños *</label><input type="date" id="cumpleanosTitular" required class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"></div>
            <div><label class="block text-xs font-medium text-slate-700 mb-1">Fecha visita *</label><input type="date" id="fechaVisita" required class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"></div>
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">¿Cómo se enteró? *</label>
              <select id="comoSeEntero" required class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar</option>
                <option>Invitación</option>
                <option>Facebook</option>
                <option>Instagram</option>
                <option>Página web</option>
                <option>Familiar/Amigo</option>
                <option>Otro</option>
              </select>
            </div>
            <div><label class="block text-xs font-medium text-slate-700 mb-1">¿Quién atendió? *</label><input type="text" id="quienAtendio" required class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"></div>
            <div class="md:col-span-2"><label class="block text-xs font-medium text-slate-700 mb-1">Dirección</label><input type="text" id="direccion" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"></div>
            
            <div class="md:col-span-2 flex gap-4">
              <label class="flex items-center gap-2"><input type="checkbox" id="asisteMiercoles" class="w-4 h-4 text-blue-600"><span class="text-xs text-slate-700">Asiste Miércoles</span></label>
              <label class="flex items-center gap-2"><input type="checkbox" id="asisteDomingo" class="w-4 h-4 text-blue-600"><span class="text-xs text-slate-700">Asiste Domingo</span></label>
            </div>
            
            <div class="md:col-span-2"><label class="block text-xs font-medium text-slate-700 mb-1">Observaciones</label><textarea id="observaciones" rows="2" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea></div>
          </div>
        </div>

        <div class="bg-pink-50 p-4 rounded-lg border border-pink-200">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-bold text-pink-900">💑 CÓNYUGE</h3>
            <label class="flex items-center gap-2"><input type="checkbox" id="checkConyuge" onchange="toggleConyuge()" class="w-4 h-4 text-pink-600"><span class="text-xs text-slate-700">Agregar cónyuge</span></label>
          </div>
          <div id="datosConyuge" class="hidden grid grid-cols-1 md:grid-cols-3 gap-3">
            <div><label class="block text-xs font-medium text-slate-700 mb-1">Nombre</label><input type="text" id="nombreConyuge" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500"></div>
            <div><label class="block text-xs font-medium text-slate-700 mb-1">WhatsApp</label><input type="tel" id="whatsappConyuge" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500"></div>
            <div><label class="block text-xs font-medium text-slate-700 mb-1">Cumpleaños</label><input type="date" id="cumpleanosConyuge" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:pink-500"></div>
          </div>
        </div>

        <div class="bg-green-50 p-4 rounded-lg border border-green-200">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-bold text-green-900">👶 HIJOS</h3>
            <button type="button" onclick="agregarHijo()" class="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-700">+ Agregar</button>
          </div>
          <div id="listaHijos" class="space-y-2"></div>
        </div>

        <div class="flex gap-3 pt-2">
          <button type="submit" id="btnGuardar" class="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md">Guardar Familia Completa</button>
          <button type="button" onclick="cancelarEdicion()" id="btnCancelar" class="hidden px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300">Cancelar</button>
        </div>
      </form>
    </div>

    <div id="pestanaLista" class="hidden space-y-3">
      <div id="loadingLista" class="text-center py-12"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
      <div id="listaFamilias"></div>
    </div>

    <div id="pestanaSeguimiento" class="hidden space-y-3">
      <div class="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 class="text-lg font-semibold text-slate-800">📋 Seguimiento de Asistencia</h2>
          <p class="text-xs text-slate-500">Gestión de alertas y asistencia activa</p>
        </div>
        <div class="flex gap-2 flex-wrap items-center">
          <button onclick="filtrarAsistencia('todos')" id="filtroTodos" class="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white">Todos</button>
          <button onclick="filtrarAsistencia('pendientes')" id="filtroPendientes" class="px-3 py-1.5 text-sm rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200">Pendientes</button>
          <button onclick="filtrarAsistencia('asistieron')" id="filtroAsistieron" class="px-3 py-1.5 text-sm rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200">Asistieron</button>
          
          <button onclick="generarReportePastoral()" class="ml-2 px-4 py-1.5 text-sm rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold hover:from-amber-600 hover:to-amber-700 transition-all shadow-sm flex items-center gap-1.5">
            👑 Generar Reporte Pastoral
          </button>
        </div>
      </div>
      <div id="loadingSeguimiento" class="text-center py-12"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
      <div id="listaSeguimiento"></div>
    </div>
  </div>
`;

// ==========================================
// 3. MODAL CONFIRMACIÓN PARA BORRAR
// ==========================================
document.getElementById('modalBorrar').innerHTML = `
  <div class="bg-white rounded-2xl p-6 w-full max-w-sm">
    <div class="text-center">
      <div class="w-12 h-12 bg-red-100 rounded-full mx-auto mb-3 flex items-center justify-center"><span class="text-2xl">⚠</span></div>
      <h3 class="text-lg font-bold text-slate-800 mb-2">¿Borrar familia completa?</h3>
      <p class="text-sm text-slate-600 mb-6">Se eliminarán todos los miembros de esta familia. Esta acción no se puede deshacer.</p>
      <div class="flex gap-3">
        <button onclick="cerrarModalBorrar()" class="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200">Cancelar</button>
        <button onclick="confirmarBorrar()" class="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">Borrar</button>
      </div>
    </div>
  </div>
`;

// ==========================================
// 4. MODAL DE BITÁCORA PASTORAL (COMENTARIOS)
// ==========================================
const modalBitacoraDiv = document.createElement('div');
modalBitacoraDiv.id = 'modalBitacora';
modalBitacoraDiv.className = 'hidden fixed inset-0 bg-black/50 items-center justify-center z-50 p-4';
modalBitacoraDiv.innerHTML = `
  <div class="bg-white rounded-2xl w-full max-w-lg flex flex-col max-h-[85vh] shadow-2xl">
    <div class="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
      <div>
        <h3 class="text-lg font-bold text-slate-800">📝 Bitácora de Cuidado Pastoral</h3>
        <p class="text-xs text-slate-500" id="bitacoraNombreMiembro">Miembro: </p>
      </div>
      <button onclick="cerrarBitacora()" class="text-slate-400 hover:text-slate-600 text-xl font-bold px-2">✕</button>
    </div>
    
    <div class="p-5 overflow-y-auto flex-1 space-y-3 bg-slate-50/50" id="historialComentarios"></div>
    
    <form id="formNuevaNota" class="p-4 border-t border-slate-100 bg-white rounded-b-2xl">
      <input type="hidden" id="bitacoraIdMiembro" value="">
      <div class="flex gap-2">
        <input type="text" id="nuevaNotaTexto" required placeholder="Escribe qué acción se tomó (ej: Se le llamó, se agendó visita)..." 
               class="flex-1 px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
        <button type="submit" id="btnGuardarNota" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm whitespace-nowrap">
          Guardar Nota
        </button>
      </div>
    </form>
  </div>
`;
document.body.appendChild(modalBitacoraDiv);
