/**
 * POS Estadísticas - Dashboard de métricas y reportes
 * Basado en la maqueta visual proporcionada
 */

import { getProducts } from "./firebase-products.js";
import { db } from "../firebase.js";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

/**
 * Inicializa la página de estadísticas
 */
async function initEstadisticas(container) {
  try {
    // Mostrar loading
    container.innerHTML = `
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <span class="ml-3 text-gray-600">Cargando estadísticas...</span>
      </div>
    `;

    // Cargar datos
    const [products, sales] = await Promise.all([getProducts(), getSales()]);

    // Calcular estadísticas
    const stats = calculateStatistics(products, sales);

    // Renderizar interfaz
    container.innerHTML = createEstadisticasHTML(stats);

    // Configurar event listeners
    setupEstadisticasEvents();
  } catch (error) {
    console.error("❌ Error al cargar estadísticas:", error);
    showNotification("Error al cargar estadísticas", "error");

    container.innerHTML = `
      <div class="text-center py-12">
        <h3 class="text-xl font-semibold text-red-600 mb-2">Error al cargar estadísticas</h3>
        <p class="text-gray-500 mb-4">No se pudieron cargar las estadísticas</p>
        <button onclick="location.reload()" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
          Reintentar
        </button>
      </div>
    `;
  }
}

/**
 * Obtiene las ventas desde Firebase
 */
async function getSales() {
  try {
    const salesRef = collection(db, "sales");
    const q = query(salesRef, orderBy("createdAt", "desc"));
    const salesSnapshot = await getDocs(q);

    const sales = [];
    salesSnapshot.forEach((doc) => {
      sales.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return sales;
  } catch (error) {
    console.error("❌ Error al obtener ventas:", error);
    return [];
  }
}

/**
 * Calcula todas las estadísticas necesarias
 */
function calculateStatistics(products, sales) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filtrar ventas del mes actual
  const currentMonthSales = sales.filter((sale) => {
    const saleDate = new Date(sale.createdAt);
    return (
      saleDate.getMonth() === currentMonth &&
      saleDate.getFullYear() === currentYear
    );
  });

  // Filtrar ventas del mes anterior
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const lastMonthSales = sales.filter((sale) => {
    const saleDate = new Date(sale.createdAt);
    return (
      saleDate.getMonth() === lastMonth &&
      saleDate.getFullYear() === lastMonthYear
    );
  });

  // Calcular métricas principales
  const totalRevenue = currentMonthSales.reduce(
    (sum, sale) => sum + (sale.total || 0),
    0
  );
  const lastMonthRevenue = lastMonthSales.reduce(
    (sum, sale) => sum + (sale.total || 0),
    0
  );
  const revenueChange = calculatePercentageChange(
    totalRevenue,
    lastMonthRevenue
  );

  const totalProfit = totalRevenue * 0.4; // Asumiendo 40% de margen
  const lastMonthProfit = lastMonthRevenue * 0.4;
  const profitChange = calculatePercentageChange(totalProfit, lastMonthProfit);

  const totalCost = totalRevenue - totalProfit;
  const lastMonthCost = lastMonthRevenue - lastMonthProfit;
  const costChange = calculatePercentageChange(totalCost, lastMonthCost);

  const totalLeads = currentMonthSales.length * 2.5; // Simulado
  const lastMonthLeads = lastMonthSales.length * 2.5;
  const leadsChange = calculatePercentageChange(totalLeads, lastMonthLeads);

  const totalSales = currentMonthSales.reduce(
    (sum, sale) => sum + (sale.total || 0),
    0
  );
  const totalVisitors = Math.floor(totalSales / 100); // Simulado
  const earningGrowth = totalRevenue * 0.25; // Simulado

  // Transacciones recientes
  const recentTransactions = sales
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4)
    .map((sale) => ({
      id: sale.id,
      customerName: sale.customerName || "Cliente General",
      amount: sale.total || 0,
      type: Math.random() > 0.5 ? "Income" : "Outcome",
      date: sale.createdAt,
    }));

  // Productos más vendidos
  const productSales = {};
  sales.forEach((sale) => {
    if (sale.items) {
      sale.items.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.name,
            totalSales: 0,
            totalQuantity: 0,
            revenue: 0,
          };
        }
        productSales[item.productId].totalSales += item.subtotal || 0;
        productSales[item.productId].totalQuantity += item.quantity || 0;
        productSales[item.productId].revenue += item.subtotal || 0;
      });
    }
  });

  const topSellingProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 3);

  return {
    totalRevenue,
    revenueChange,
    totalProfit,
    profitChange,
    totalCost,
    costChange,
    totalLeads,
    leadsChange,
    totalSales,
    totalVisitors,
    earningGrowth,
    recentTransactions,
    topSellingProducts,
    currentMonthSales: currentMonthSales.length,
    lastMonthSales: lastMonthSales.length,
  };
}

/**
 * Crea el HTML de la página de estadísticas
 */
function createEstadisticasHTML(stats) {
  return `
    <!-- Métricas principales (4 tarjetas superiores) -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total Revenue -->
      <div class="bg-[#d63629] text-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-red-100">Ingresos Totales</p>
            <p class="text-2xl font-bold">${formatCurrency(
              stats.totalRevenue
            )}</p>
            <div class="flex items-center mt-2">
              <span class="text-xs ${
                stats.revenueChange >= 0 ? "text-green-200" : "text-red-200"
              }">
                ${
                  stats.revenueChange >= 0 ? "+" : ""
                }${stats.revenueChange.toFixed(1)}%
              </span>
              <span class="text-xs text-red-100 ml-2">Del último mes</span>
            </div>
          </div>
          <div class="text-red-100">
            <span class="text-2xl">📈</span>
          </div>
        </div>
      </div>

      <!-- Total Profit -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total ganado</p>
            <p class="text-2xl font-bold text-gray-900">${formatCurrency(
              stats.totalProfit
            )}</p>
            <div class="flex items-center mt-2">
              <span class="text-xs ${
                stats.profitChange >= 0 ? "text-green-600" : "text-red-600"
              }">
                ${
                  stats.profitChange >= 0 ? "+" : ""
                }${stats.profitChange.toFixed(1)}%
              </span>
              <span class="text-xs text-gray-500 ml-2">Del último mes</span>
            </div>
          </div>
          <div class="text-gray-400">
            <span class="text-2xl">💰</span>
          </div>
        </div>
      </div>

      <!-- Total Cost -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Costo total</p>
            <p class="text-2xl font-bold text-gray-900">${formatCurrency(
              stats.totalCost
            )}</p>
            <div class="flex items-center mt-2">
              <span class="text-xs ${
                stats.costChange <= 0 ? "text-green-600" : "text-red-600"
              }">
                ${stats.costChange >= 0 ? "+" : ""}${stats.costChange.toFixed(
    1
  )}%
              </span>
              <span class="text-xs text-gray-500 ml-2">Del último mes</span>
            </div>
          </div>
          <div class="text-gray-400">
            <span class="text-2xl">💸</span>
          </div>
        </div>
      </div>


    </div>

    <!-- Gráficos y métricas secundarias -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
      <!-- Total Sales -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Ventas totales</h3>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-500">Actual</span>
            <span class="text-sm text-gray-500">Mes pasado</span>
          </div>
        </div>
        <div class="text-3xl font-bold text-gray-900 mb-2">${formatCurrency(
          stats.totalSales
        )}</div>
        <div class="h-32 bg-gray-100 rounded flex items-center justify-center">
          <span class="text-gray-500">Gráfico de líneas (simulado)</span>
        </div>
      </div>

      <!-- Total Visitors -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Visitantes totales</h3>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-500">Actual</span>
            <span class="text-sm text-gray-500">Mes pasado</span>
          </div>
        </div>
        <div class="text-3xl font-bold text-gray-900 mb-2">${formatNumber(
          stats.totalVisitors
        )}</div>
        <div class="h-32 bg-gray-100 rounded flex items-center justify-center">
          <span class="text-gray-500">Gráfico de barras (simulado)</span>
        </div>
      </div>

      <!-- Earning Growth -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Crecimiento de ganancias</h3>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-500">Actual</span>
            <span class="text-sm text-gray-500">Semana pasada</span>
          </div>
        </div>
        <div class="text-3xl font-bold text-gray-900 mb-2">${formatCurrency(
          stats.earningGrowth
        )}</div>
        <div class="h-32 bg-gray-100 rounded flex items-center justify-center">
          <span class="text-gray-500">Gráfico de área (simulado)</span>
        </div>
      </div>
    </div>

    <!-- Sección inferior con transacciones y productos -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Recent Transactions -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Transacciones recientes</h3>
          <button class="text-red-600 text-sm hover:underline">Ver todas las transacciones</button>
        </div>
        <div class="space-y-4">
          ${
            stats.recentTransactions.length > 0
              ? stats.recentTransactions
                  .map(
                    (transaction) => `
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-full flex items-center justify-center ${
                  transaction.type === "Income" ? "bg-green-100" : "bg-red-100"
                }">
                  <span class="text-sm">${
                    transaction.type === "Income" ? "💰" : "💸"
                  }</span>
                </div>
                <div class="flex-1">
                  <p class="font-medium text-gray-900">${
                    transaction.customerName
                  }</p>
                  <p class="text-sm text-gray-500">${formatDate(
                    transaction.date
                  )}</p>
                </div>
                <div class="text-right">
                  <p class="font-semibold ${
                    transaction.type === "Income"
                      ? "text-green-600"
                      : "text-red-600"
                  }">
                    ${
                      transaction.type === "Income" ? "+" : "-"
                    }${formatCurrency(Math.abs(transaction.amount))}
                  </p>
                  <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    transaction.type === "Income"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }">
                    ${transaction.type}
                  </span>
                </div>
              </div>
            `
                  )
                  .join("")
              : `<div class="text-center py-8 text-gray-500">
              <span class="text-4xl">📊</span>
              <p class="mt-2">No hay transacciones recientes</p>
            </div>`
          }
        </div>
      </div>

      <!-- Top Selling Products -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Producto más vendido</h3>
          <button class="text-red-600 text-sm hover:underline">Ver todos los productos</button>
        </div>
        <div class="space-y-4">
          ${
            stats.topSellingProducts.length > 0
              ? stats.topSellingProducts
                  .map(
                    (product, index) => `
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span class="text-gray-500 text-xs">📦</span>
                </div>
                <div class="flex-1">
                  <p class="font-medium text-gray-900">${product.name}</p>
                  <p class="text-sm text-gray-500">${
                    product.totalQuantity
                  } unidades restantes</p>
                </div>
                <div class="text-right">
                  <p class="font-semibold text-gray-900">${formatCurrency(
                    product.revenue
                  )}</p>
                  <p class="text-sm text-gray-500">Ventas totales: ${formatCurrency(
                    product.totalSales
                  )}</p>
                  <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Disponible
                  </span>
                </div>
              </div>
            `
                  )
                  .join("")
              : `<div class="text-center py-8 text-gray-500">
              <span class="text-4xl">📦</span>
              <p class="mt-2">No hay productos vendidos</p>
            </div>`
          }
        </div>
      </div>
    </div>
  `;
}

/**
 * Configura los event listeners
 */
function setupEstadisticasEvents() {
  // Por ahora no hay eventos específicos, pero se pueden agregar filtros de fecha, etc.
  console.log("📊 Estadísticas cargadas correctamente");
}

// Exportar función principal globalmente
if (typeof window !== "undefined") {
  window.initEstadisticas = initEstadisticas;
}
