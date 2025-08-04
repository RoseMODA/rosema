/**
 * POS Main - Controlador principal del sistema POS Rosema
 * Maneja la navegación y carga de módulos
 */

// Estado global del POS
let currentPage = 'inicio';
let currentUser = 'Administrador';

// Referencias DOM
let mainContent, pageTitle, pageDate, navItems;

/**
 * Inicializa el sistema POS
 */
async function initPOS() {
  try {
    console.log('🚀 Iniciando sistema POS Rosema...');
    
    // Obtener referencias DOM
    mainContent = document.getElementById('main-content');
    pageTitle = document.getElementById('page-title');
    pageDate = document.getElementById('page-date');
    navItems = document.querySelectorAll('.nav-item');
    
    // Actualizar fecha
    updatePageDate();
    
    // Configurar navegación
    setupNavigation();
    
    // Cargar página inicial
    await loadPage('inicio');
    
    console.log('✅ Sistema POS iniciado correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar POS:', error);
    showNotification('Error al inicializar el sistema POS', 'error');
  }
}

/**
 * Configura la navegación del sidebar
 */
function setupNavigation() {
  navItems.forEach(item => {
    item.addEventListener('click', async (e) => {
      e.preventDefault();
      
      const pageId = item.id.replace('nav-', '');
      
      // Actualizar estado visual
      navItems.forEach(nav => nav.classList.remove('sidebar-active'));
      item.classList.add('sidebar-active');
      
      // Cargar página
      await loadPage(pageId);
    });
  });
}

/**
 * Carga una página específica del POS
 */
async function loadPage(pageId) {
  try {
    showLoading(true);
    currentPage = pageId;
    
    // Actualizar título
    const titles = {
      'inicio': 'INICIO',
      'estadisticas': 'ESTADÍSTICAS', 
      'ventas': 'VENTAS',
      'productos': 'PRODUCTOS',
      'proveedores': 'PROVEEDORES',
      'facturas': 'FACTURAS ARCA'
    };
    
    pageTitle.textContent = titles[pageId] || pageId.toUpperCase();
    
    // Cargar contenido según la página
    switch(pageId) {
      case 'inicio':
        await loadDashboard();
        break;
      case 'estadisticas':
        await loadEstadisticas();
        break;
      case 'ventas':
        await loadVentas();
        break;
      case 'productos':
        await loadProductos();
        break;
      case 'proveedores':
        await loadProveedores();
        break;
      case 'facturas':
        await loadFacturas();
        break;
      default:
        mainContent.innerHTML = `
          <div class="text-center py-12">
            <h3 class="text-xl font-semibold text-gray-600 mb-2">Página en desarrollo</h3>
            <p class="text-gray-500">Esta funcionalidad estará disponible pronto</p>
          </div>
        `;
    }
    
  } catch (error) {
    console.error(`❌ Error al cargar página ${pageId}:`, error);
    showNotification(`Error al cargar ${pageId}`, 'error');
    
    mainContent.innerHTML = `
      <div class="text-center py-12">
        <h3 class="text-xl font-semibold text-red-600 mb-2">Error al cargar la página</h3>
        <p class="text-gray-500">Por favor, intenta nuevamente</p>
        <button onclick="location.reload()" class="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
          Recargar
        </button>
      </div>
    `;
  } finally {
    showLoading(false);
  }
}

/**
 * Carga el dashboard principal (basado en la maqueta)
 */
async function loadDashboard() {
  if (typeof initDashboard === 'function') {
    await initDashboard(mainContent);
  } else {
    mainContent.innerHTML = `
      <div class="text-center py-12">
        <h3 class="text-xl font-semibold text-gray-600 mb-2">Dashboard</h3>
        <p class="text-gray-500">Cargando dashboard...</p>
      </div>
    `;
  }
}

/**
 * Carga la página de estadísticas
 */
async function loadEstadisticas() {
  if (typeof initEstadisticas === 'function') {
    await initEstadisticas(mainContent);
  } else {
    mainContent.innerHTML = `
      <div class="text-center py-12">
        <h3 class="text-xl font-semibold text-gray-600 mb-2">Estadísticas</h3>
        <p class="text-gray-500">Funcionalidad en desarrollo</p>
      </div>
    `;
  }
}

/**
 * Carga la página de ventas
 */
async function loadVentas() {
  if (typeof initVentas === 'function') {
    await initVentas(mainContent);
  } else {
    mainContent.innerHTML = `
      <div class="text-center py-12">
        <h3 class="text-xl font-semibold text-gray-600 mb-2">Ventas</h3>
        <p class="text-gray-500">Funcionalidad en desarrollo</p>
      </div>
    `;
  }
}

/**
 * Carga la página de productos
 */
async function loadProductos() {
  if (typeof initProductos === 'function') {
    await initProductos(mainContent);
  } else {
    mainContent.innerHTML = `
      <div class="text-center py-12">
        <h3 class="text-xl font-semibold text-gray-600 mb-2">Productos</h3>
        <p class="text-gray-500">Funcionalidad en desarrollo</p>
      </div>
    `;
  }
}

/**
 * Carga la página de proveedores
 */
async function loadProveedores() {
  mainContent.innerHTML = `
    <div class="text-center py-12">
      <h3 class="text-xl font-semibold text-gray-600 mb-2">Proveedores</h3>
      <p class="text-gray-500">Funcionalidad en desarrollo</p>
    </div>
  `;
}

/**
 * Carga la página de facturas ARCA
 */
async function loadFacturas() {
  mainContent.innerHTML = `
    <div class="text-center py-12">
      <h3 class="text-xl font-semibold text-gray-600 mb-2">Facturas ARCA</h3>
      <p class="text-gray-500">Funcionalidad en desarrollo</p>
    </div>
  `;
}

/**
 * Muestra/oculta el overlay de carga
 */
function showLoading(show) {
  const overlay = document.getElementById('loading-overlay');
  if (show) {
    overlay.classList.remove('hidden');
  } else {
    overlay.classList.add('hidden');
  }
}

/**
 * Actualiza la fecha en el header
 */
function updatePageDate() {
  if (!pageDate) return;

  const now = new Date();
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  const dateString = now.toLocaleDateString('es-ES', options);
  pageDate.textContent = `Hoy ${dateString}`;
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initPOS);

// Exportar funciones para uso global
window.POS = {
  loadPage,
  showLoading,
  currentPage: () => currentPage,
  currentUser: () => currentUser
};
