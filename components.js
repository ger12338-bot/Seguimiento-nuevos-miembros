// components.js

// ==========================================
// 1. PANTALLA DE INICIAR SESIÓN
// ==========================================
document.getElementById('loginScreen').innerHTML = `
  <div class="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-sm border border-slate-100">
    <div class="text-center mb-6">
      <div class="mb-3 flex items-center justify-center">
        <img src="https://i.postimg.cc/zvL3HZvk/Diseno-sin-titulo.png" alt="Logo Iglesia" class="w-20 h-20 sm:w-24 sm:h-24 object-contain mx-auto">
      </div>
      <h1 class="text-xl sm:text-2xl font-bold text-slate-800 leading-tight">Centro de Fe, Esperanza y Amor</h1>
      <p class="text-xs sm:text-sm text-slate-500 mt-1">Sistema de Registro</p>
    </div>
    <form id="formLogin" class="space-y-4">
      <div>
        <label class="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Usuario</label>
        <input type="text" id="usuario" required class="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
      </div>
      <div>
        <label class="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Contraseña</label>
        <input type="password" id="password" required class="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
      </div>
      <button type="submit" id="btnLogin" class="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold text-sm hover:from-blue-700 hover:to-blue-800 transition-all shadow-md flex items-center justify-center gap-2 mt-2">
        <span id="btnLoginText">Iniciar Sesión</span>
        <div id="btnLoginSpinner" class="hidden animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      </button>
      <p id="loginError" class="text-red-600 text-xs text-center hidden mt-2">Usuario o contraseña incorrectos</p>
    </form>
  </div>
`;

// ==========================================
// 2. PANTALLA PRINCIPAL (SISTEMA ACTIVO)
// ==========================================
document.getElementById('appScreen').innerHTML = `
  <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 sm:p-4 shadow-lg sticky top-0 z-20">
    <div class="max-w-6xl mx-auto flex justify-between items-center gap-2">
      <div class="flex items-center gap-2.5 min-w-0">
        <img src="https://i.postimg.cc/zvL3HZvk/Diseno-sin-titulo.png" alt="Logo" class="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-full flex-shrink-0">
        <div class="min-w-0">
          <h1 class="text-base sm:text-xl font-bold truncate leading-tight">Centro de Fe, Esperanza y Amor</h1>
          <p class="text-[11px] sm:text-xs text-blue-100 truncate" id="infoUsuario"></p>
        </div>
      </div>
      <button onclick="cerrarSesion()" class="bg-white/20 hover:bg-white/30 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex-shrink-0">Salir</button>
    </div>
  </div>

  <div class="bg-white border-b border-slate-200 sticky top-[53px] sm:top-[64px] z-10 shadow-sm">
    <div class="max-w-6xl mx-auto flex">
      <button onclick="cambiarPestana('registro')" id="tabRegistro" class="flex-1 py-3 text-xs sm:text-sm font-semibold border-b-2 border-blue-600 text-blue-600">Registro</button>
      <button onclick="cambiarPestana('lista')" id="tabLista" class="flex-1 py-3 text-xs sm:text-sm font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-700">Familias</button>
      <button onclick="cambiarPestana('seguimiento')" id="tabSeguimiento" class="flex-1 py-3 text-xs sm:text-sm font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-700">Seguimiento</button>
    </div>
  </div>

  <div class="max-w-6xl mx-auto p-3 sm:p-4 pb-20">
    <div id="pestanaRegistro" class="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 border border-slate-100">
      <h2 class="text-base sm:text-lg font-semibold text-slate-800 mb-4" id="tituloForm">➕ Registrar Familia</h2>
      <form id="formRegistro" class="space-y-4">
        <input type="hidden" id="editIdFamilia" value="">

        <div class="bg-blue-50/60 p-3.5 sm:p-4 rounded-xl border border-blue-100">
          <h3 class="text-xs sm:text-sm font-bold text-blue-900 mb-3">👤 TITULAR</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label class="block text-xs font-medium text-slate-700 mb-1">Nombre completo *</label><input type="text" id="nombreTitular" required class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"></div>
            <div><label class="block text-xs font-medium text-slate-700 mb-1">WhatsApp *</label><input type="tel" id="whatsappTitular" required class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"></div>
            
            <div><label class="block text-xs font-medium text-slate-700 mb-1">Cumpleaños</label><input type="date" id="cumpleanosTitular" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"></div>
            
            <div><label class="block text-xs font-medium text-slate-700 mb-1">Fecha visita *</label><input type="date" id="fechaVisita" required class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"></div>
            
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">¿Cómo se enteró?</label>
              <select id="comoSeEntero" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Seleccionar (Opcional)</option>
                <option>Invitación</option>
                <option>Facebook</option>
                <option>Instagram</option>
                <option>Página web</option>
                <option>Familiar/Amigo</option>
                <option>Otro</option>
              </select>
            </div>
            
            <div><label class="block text-xs font-medium text-slate-700 mb-1">¿Quién atendió? *</label><input type="text" id="quienAtendio" required class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"></div>
            <div class="sm:col-span-2"><label class="block text-xs font-medium text-slate-700 mb-1">Dirección</label><input type="text" id="direccion" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"></div>
            
            <div class="sm:col-span-2 flex gap-4 pt-1">
              <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="asisteMiercoles" class="w-4 h-4 text-blue-600 rounded"><span class="text-xs text-slate-700">Asiste Miércoles</span></label>
              <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="asisteDomingo" class="w-4 h-4 text-blue-600 rounded"><span class="text-xs text-slate-700">Asiste Domingo</span></label>
            </div>
            
            <div class="sm:col-span-2"><label class="block text-xs font-medium text-slate-700 mb-1">Observaciones</label><textarea id="observaciones" rows="2" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea></div>
          </div>
        </div>

        <div class="bg-pink-50/60 p-3.5 sm:p-4 rounded-xl border border-pink-100">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs sm:text-sm font-bold text-pink-900">💑 CÓNYUGE</h3>
            <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="checkConyuge" onchange="toggleConyuge()" class="w-4 h-4 text-pink-600 rounded"><span class="text-xs text-slate-700">Agregar cónyuge</span></label>
          </div>
          <div id="datosConyuge" class="hidden grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><label class="block text-xs font-medium text-slate-700 mb-1">Nombre</label><input type="text" id="nombreConyuge" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"></div>
            <div><label class="block text-xs font-medium text-slate-700 mb-1">WhatsApp</label><input type="tel" id="whatsappConyuge" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"></div>
            <div><label class="block text-xs font-medium text-slate-700 mb-1">Cumpleaños</label><input type="date" id="cumpleanosConyuge" class="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"></div>
          </div>
        </div>

        <div class="bg-green-50/60 p-3.5 sm:p-4 rounded-xl border border-green-100">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs sm:text-sm font-bold text-green-900">👶 HIJOS</h3>
            <button type="button" onclick="agregarHijo()" class="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors">+ Agregar</button>
          </div>
          <div id="listaHijos" class="space-y-2"></div>
        </div>

        <div class="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button type="submit" id="btnGuardar" class="w-full sm:flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold text-sm hover:from-blue-700 hover:to-blue-800 transition-all shadow-md flex items-center justify-center gap-2">
            <span id="btnGuardarText">Guardar Familia Completa</span>
            <div id="btnGuardarSpinner" class="hidden animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          </button>
          <button type="button" onclick="cancelarEdicion()" id="btnCancelar" class="hidden w-full sm:w-auto px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-300 transition-colors">Cancelar</button>
        </div>
      </form>
    </div>

    <div id="pestanaLista" class="hidden space-y-3">
      <div class="flex gap-2 flex-col sm:flex-row sm:items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div class="relative flex-1">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">🔍</span>
          <input type="text" id="inputBuscarFamilias" onkeyup="filtrarFamilias()" placeholder="Buscar por nombre o WhatsApp..." class="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
        </div>
        <button onclick="exportarCSV()" class="w-full sm:w-auto justify-center px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5">
          📊 Exportar a Excel
        </button>
      </div>

      <div id="loadingLista" class="text-center py-12"><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
      <div id="listaFamilias" class="space-y-3"></div>
    </div>

    <div id="pestanaSeguimiento" class="hidden space-y-3">
      <div class="flex justify-between items-start sm:items-center mb-3 flex-col sm:flex-row gap-3">
        <div>
          <h2 class="text-base sm:text-lg font-semibold text-slate-800">📋 Seguimiento de Asistencia</h2>
          <p class="text-xs text-slate-500">Gestión de alertas y asistencia activa</p>
        </div>
        <div class="flex gap-1.5 flex-wrap items-center w-full sm:w-auto justify-between sm:justify-end">
          <div class="flex gap-1 bg-slate-200/60 p-1 rounded-xl">
            <button onclick="filtrarAsistencia('todos')" id="filtroTodos" class="px-2.5 py-1 text-xs rounded-lg bg-blue-600 text-white font-medium">Todos</button>
            <button onclick="filtrarAsistencia('pendientes')" id="filtroPendientes" class="px-2.5 py-1 text-xs rounded-lg text-slate-700 font-medium">Faltas</button>
            <button onclick="filtrarAsistencia('asistieron')" id="filtroAsistieron" class="px-2.5 py-1 text-xs rounded-lg text-slate-700 font-medium">Asistieron</button>
          </div>
          
          <button onclick="generarReportePastoral()" class="px-3 py-1.5 text-xs sm:text-sm rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold hover:from-amber-600 hover:to-amber-700 transition-all shadow-sm flex items-center gap-1.5">
            👑 Reporte PDF
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
  <div class="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-sm shadow-2xl relative" onclick="event.stopPropagation()">
    <div class="text-center">
      <div class="w-12 h-12 bg-red-100 rounded-full mx-auto mb-3 flex items-center justify-center"><span class="text-2xl">⚠</span></div>
      <h3 class="text-base sm:text-lg font-bold text-slate-800 mb-1.5">¿Borrar familia completa?</h3>
      <p class="text-xs sm:text-sm text-slate-600 mb-5">Se eliminarán todos los miembros de esta familia. Esta acción no se puede deshacer.</p>
      <div class="flex gap-2">
        <button onclick="cerrarModalBorrar()" class="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold text-xs sm:text-sm hover:bg-slate-200">Cancelar</button>
        <button onclick="confirmarBorrar()" class="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold text-xs sm:text-sm hover:bg-red-700">Borrar</button>
      </div>
    </div>
  </div>
`;

document.getElementById('modalBorrar').addEventListener('click', cerrarModalBorrar);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    cerrarModalBorrar();
    cerrarBitacora();
    cerrarModalEditarNota();
  }
});