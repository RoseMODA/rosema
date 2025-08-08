/**
 * POS Dashboard - Página principal del sistema POS
 * Basado en la maqueta visual proporcionada
 */

import { getProducts, getLowStockProducts } from "./firebase-products.js";

// Funciones auxiliares para formateo
function formatNumber(num) {
  return new Intl.NumberFormat('es-ES').format(num || 0);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'ARS'
  }).format(amount || 0);
}

/**
 * Inicializa el dashboard principal
 */
async function initDashboard(container) {
  try {
    // Mostrar loading
    container.innerHTML = `
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <span class="ml-3 text-gray-600">Cargando dashboard...</span>
      </div>
    `;

    // Cargar datos
    const products = await getProducts();
    const lowStockProducts = await getLowStockProducts();

    // Calcular estadísticas básicas
    const stats = calculateDashboardStats(products);

    // Renderizar dashboard
    container.innerHTML = createDashboardHTML(stats, lowStockProducts);

    // Configurar event listeners
    setupDashboardEvents();
  } catch (error) {
    console.error("❌ Error al cargar dashboard:", error);
    showNotification("Error al cargar el dashboard", "error");

    container.innerHTML = `
      <div class="text-center py-12">
        <h3 class="text-xl font-semibold text-red-600 mb-2">Error al cargar dashboard</h3>
        <p class="text-gray-500 mb-4">No se pudieron cargar los datos</p>
        <button onclick="location.reload()" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
          Reintentar
        </button>
      </div>
    `;
  }
}

/**
 * Calcula estadísticas para el dashboard
 */
function calculateDashboardStats(products) {
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const totalValue = products.reduce(
    (sum, p) => sum + (p.price || 0) * (p.stock || 0),
    0
  );
  const featuredProducts = products.filter((p) => p.featured).length;
  const onSaleProducts = products.filter((p) => p.onSale).length;
  const outOfStock = products.filter((p) => (p.stock || 0) === 0).length;

  // Estadísticas por categoría
  const categoryStats = {};
  products.forEach((product) => {
    const category = product.category || "sin-categoria";
    if (!categoryStats[category]) {
      categoryStats[category] = { count: 0, stock: 0, value: 0 };
    }
    categoryStats[category].count++;
    categoryStats[category].stock += product.stock || 0;
    categoryStats[category].value +=
      (product.price || 0) * (product.stock || 0);
  });

  return {
    totalProducts,
    totalStock,
    totalValue,
    featuredProducts,
    onSaleProducts,
    outOfStock,
    categoryStats,
  };
}

/**
 * Crea el HTML del dashboard
 */
function createDashboardHTML(stats, lowStockProducts) {
  return `
    <!-- Métricas principales -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Visitas (simulado) -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Visitas</p>
            <p class="text-2xl font-bold text-gray-900">0</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <span class="text-blue-600 text-xl">👥</span>
          </div>
        </div>
      </div>

      <!-- Ventas (simulado) -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Ventas</p>
            <p class="text-2xl font-bold text-gray-900">0</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <span class="text-green-600 text-xl">💰</span>
          </div>
        </div>
      </div>

      <!-- Facturación (simulado) -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Facturación</p>
            <p class="text-2xl font-bold text-gray-900">$ 0,00</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <span class="text-purple-600 text-xl">📊</span>
          </div>
        </div>
      </div>

      <!-- Ticket promedio (simulado) -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Ticket promedio</p>
            <p class="text-2xl font-bold text-gray-900">$ 0,00</p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <span class="text-yellow-600 text-xl">🎫</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Botón VENDER prominente -->
    <div class="mb-8">
      <button id="btn-vender" class="w-full md:w-auto bg-[#d63629] hover:bg-[#b22a26] text-white text-xl font-bold py-6 px-12 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105">
        VENDER
      </button>
    </div>

    <!-- Estadísticas de inventario -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Resumen de inventario -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Resumen de Inventario</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Total de productos:</span>
            <span class="font-semibold">${formatNumber(
              stats.totalProducts
            )}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Stock total:</span>
            <span class="font-semibold">${formatNumber(
              stats.totalStock
            )} unidades</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Valor del inventario:</span>
            <span class="font-semibold">${formatCurrency(
              stats.totalValue
            )}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Productos destacados:</span>
            <span class="font-semibold">${stats.featuredProducts}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Productos en oferta:</span>
            <span class="font-semibold">${stats.onSaleProducts}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Sin stock:</span>
            <span class="font-semibold text-red-600">${stats.outOfStock}</span>
          </div>
        </div>
      </div>

      <!-- Productos con stock bajo -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Stock Bajo</h3>
          <span class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            ${lowStockProducts.length} productos
          </span>
        </div>
        <div class="space-y-3 max-h-64 overflow-y-auto">
          ${
            lowStockProducts.length > 0
              ? lowStockProducts
                  .slice(0, 10)
                  .map(
                    (product) => `
              <div class="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div class="flex-1">
                  <p class="font-medium text-gray-900 text-sm">${
                    product.name
                  }</p>
                  <p class="text-xs text-gray-500">${
                    product.sku || "Sin SKU"
                  }</p>
                </div>
                <div class="text-right">
                  <span class="text-sm font-semibold text-red-600">${
                    product.stock || 0
                  } unidades</span>
                </div>
              </div>
            `
                  )
                  .join("")
              : `<div class="text-center py-4 text-gray-500">
              <span class="text-2xl">✅</span>
              <p class="mt-2">No hay productos con stock bajo</p>
            </div>`
          }
        </div>
        ${
          lowStockProducts.length > 10
            ? `<div class="mt-3 text-center">
            <button class="text-red-600 text-sm hover:underline">Ver todos (${lowStockProducts.length})</button>
          </div>`
            : ""
        }
      </div>
    </div>

    <!-- Estadísticas por categoría -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Inventario por Categoría</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${Object.entries(stats.categoryStats)
          .map(
            ([category, data]) => `
          <div class="border border-gray-200 rounded-lg p-4">
            <h4 class="font-medium text-gray-900 capitalize mb-2">${category.replace(
              "-",
              " "
            )}</h4>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Productos:</span>
                <span class="font-medium">${data.count}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Stock:</span>
                <span class="font-medium">${formatNumber(data.stock)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Valor:</span>
                <span class="font-medium">${formatCurrency(data.value)}</span>
              </div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    </div>

    <!-- Acciones rápidas -->
    <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
      <button id="btn-agregar-producto" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
        Agregar Producto
      </button>
      <button id="btn-ver-ventas" class="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
        Ver Ventas
      </button>
      <button id="btn-reportes" class="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
        Generar Reporte
      </button>
    </div>
  `;
}

/**
 * Configura los event listeners del dashboard
 */
function setupDashboardEvents() {
  // Botón VENDER principal
  const btnVender = document.getElementById("btn-vender");
  if (btnVender) {
    btnVender.addEventListener("click", () => {
      // Navegar a la página de ventas
      if (window.POS && window.POS.loadPage) {
        window.POS.loadPage("ventas");
      }
    });
  }

  // Botón agregar producto
  const btnAgregarProducto = document.getElementById("btn-agregar-producto");
  if (btnAgregarProducto) {
    btnAgregarProducto.addEventListener("click", () => {
      if (window.POS && window.POS.loadPage) {
        window.POS.loadPage("productos");
      }
    });
  }

  // Botón ver ventas
  const btnVerVentas = document.getElementById("btn-ver-ventas");
  if (btnVerVentas) {
    btnVerVentas.addEventListener("click", () => {
      if (window.POS && window.POS.loadPage) {
        window.POS.loadPage("ventas");
      }
    });
  }

  // Botón reportes
  const btnReportes = document.getElementById("btn-reportes");
  if (btnReportes) {
    btnReportes.addEventListener("click", () => {
      if (window.POS && window.POS.loadPage) {
        window.POS.loadPage("estadisticas");
      }
    });
  }
}
