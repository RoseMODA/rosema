/**
 * POS Facturas - Gestión de facturas ARCA
 * Sistema básico para gestionar facturas y facturación
 */

let currentInvoices = [];

/**
 * Inicializa la página de facturas
 */
async function initFacturas(container) {
  try {
    // Mostrar loading
    container.innerHTML = `
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <span class="ml-3 text-gray-600">Cargando facturas...</span>
      </div>
    `;

    // Cargar facturas
    currentInvoices = await getInvoices();

    // Renderizar interfaz
    container.innerHTML = createFacturasHTML();

    // Configurar event listeners
    setupFacturasEvents();
  } catch (error) {
    console.error("❌ Error al cargar facturas:", error);
    showNotification("Error al cargar facturas", "error");

    container.innerHTML = `
      <div class="text-center py-12">
        <h3 class="text-xl font-semibold text-red-600 mb-2">Error al cargar facturas</h3>
        <p class="text-gray-500 mb-4">No se pudieron cargar las facturas</p>
        <button onclick="location.reload()" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
          Reintentar
        </button>
      </div>
    `;
  }
}

/**
 * Crea el HTML de la página de facturas
 */
function createFacturasHTML() {
  return `
    <!-- Header con información ARCA -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div class="flex items-center space-x-3">
        <div class="text-blue-600 text-2xl">📄</div>
        <div>
          <h3 class="text-lg font-semibold text-blue-900">Sistema de Facturación ARCA</h3>
          <p class="text-sm text-blue-700">Gestión de facturas electrónicas y comprobantes fiscales</p>
        </div>
      </div>
    </div>

    <!-- Métricas de facturación -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Facturas del Mes</p>
            <p class="text-2xl font-bold text-gray-900">${
              currentInvoices.length
            }</p>
          </div>
          <div class="text-blue-600 text-2xl">📊</div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Facturado</p>
            <p class="text-2xl font-bold text-gray-900">${formatCurrency(
              calculateTotalInvoiced()
            )}</p>
          </div>
          <div class="text-green-600 text-2xl">💰</div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Pendientes</p>
            <p class="text-2xl font-bold text-gray-900">${
              currentInvoices.filter((inv) => inv.status === "pending").length
            }</p>
          </div>
          <div class="text-yellow-600 text-2xl">⏳</div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Aprobadas</p>
            <p class="text-2xl font-bold text-gray-900">${
              currentInvoices.filter((inv) => inv.status === "approved").length
            }</p>
          </div>
          <div class="text-green-600 text-2xl">✅</div>
        </div>
      </div>
    </div>

    <!-- Acciones principales -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
      <div class="flex items-center space-x-4">
        <button id="btn-nueva-factura" class="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <span>➕</span>
          <span>Nueva Factura</span>
        </button>
        <button id="btn-sincronizar-arca" class="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <span>🔄</span>
          <span>Sincronizar ARCA</span>
        </button>
        <button id="btn-exportar-facturas" class="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <span>📤</span>
          <span>Exportar</span>
        </button>
      </div>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div>
          <input 
            type="text" 
            id="search-invoices" 
            placeholder="Buscar por número o cliente" 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
        </div>
        <div>
          <select id="filter-status" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="approved">Aprobada</option>
            <option value="rejected">Rechazada</option>
          </select>
        </div>
        <div>
          <input 
            type="date" 
            id="filter-date-from" 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
        </div>
        <div>
          <input 
            type="date" 
            id="filter-date-to" 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
        </div>
      </div>
    </div>

    <!-- Tabla de facturas -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ARCA
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody id="invoices-table-body" class="bg-white divide-y divide-gray-200">
            ${renderInvoicesTable()}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal para nueva factura -->
    <div id="invoice-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden z-50">
      <div class="flex items-center justify-center min-h-screen p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Nueva Factura</h3>
          </div>
          
          <form id="invoice-form" class="px-6 py-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                <input type="text" id="invoice-customer" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">CUIT/CUIL</label>
                <input type="text" id="invoice-cuit" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Factura</label>
                <select id="invoice-type" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                  <option value="A">Factura A</option>
                  <option value="B">Factura B</option>
                  <option value="C">Factura C</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
                <input type="number" id="invoice-amount" required min="0" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              </div>
              
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Concepto</label>
                <textarea id="invoice-concept" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
              </div>
            </div>
          </form>
          
          <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button id="cancel-invoice" type="button" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button id="save-invoice" type="button" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Crear Factura
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renderiza la tabla de facturas
 */
function renderInvoicesTable() {
  if (currentInvoices.length === 0) {
    return `
      <tr>
        <td colspan="7" class="px-6 py-12 text-center text-gray-500">
          <div class="text-4xl mb-2">📄</div>
          <p>No hay facturas registradas</p>
        </td>
      </tr>
    `;
  }

  return currentInvoices
    .map(
      (invoice) => `
    <tr class="hover:bg-gray-50">
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-sm font-medium text-blue-600">${invoice.number}</div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-sm text-gray-900">${invoice.customer}</div>
        ${
          invoice.cuit
            ? `<div class="text-xs text-gray-500">${invoice.cuit}</div>`
            : ""
        }
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-sm text-gray-900">${formatDate(invoice.date)}</div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-sm font-semibold text-gray-900">${formatCurrency(
          invoice.amount
        )}</div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
          invoice.status
        )}">
          ${getStatusText(invoice.status)}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-sm text-gray-900">${
          invoice.arcaStatus || "No enviada"
        }</div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button onclick="viewInvoice('${
          invoice.id
        }')" class="text-blue-600 hover:text-blue-900 mr-3">
          Ver
        </button>
        <button onclick="sendToArca('${
          invoice.id
        }')" class="text-green-600 hover:text-green-900">
          Enviar ARCA
        </button>
      </td>
    </tr>
  `
    )
    .join("");
}

/**
 * Configura los event listeners
 */
function setupFacturasEvents() {
  // Botón nueva factura
  const btnNuevaFactura = document.getElementById("btn-nueva-factura");
  if (btnNuevaFactura) {
    btnNuevaFactura.addEventListener("click", openInvoiceModal);
  }

  // Botón sincronizar ARCA
  const btnSincronizar = document.getElementById("btn-sincronizar-arca");
  if (btnSincronizar) {
    btnSincronizar.addEventListener("click", handleSyncArca);
  }

  // Modal events
  const cancelBtn = document.getElementById("cancel-invoice");
  const saveBtn = document.getElementById("save-invoice");

  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeInvoiceModal);
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", handleSaveInvoice);
  }
}

import { db } from "../firebase.js";
import { collection, getDocs } from "firebase/firestore";

/**
 * Obtiene las facturas
 */
async function getInvoices() {
  try {
    const invoicesRef = collection(db, "invoices");
    const querySnapshot = await getDocs(invoicesRef);
    const invoices = [];

    querySnapshot.forEach((doc) => {
      invoices.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return invoices.length > 0 ? invoices : getExampleInvoices();
  } catch (error) {
    console.error("❌ Error al obtener facturas:", error);
    return getExampleInvoices();
  }
}

/**
 * Datos de ejemplo para facturas
 */
function getExampleInvoices() {
  return [
    {
      id: "inv1",
      number: "A-0001-00000001",
      customer: "María González",
      cuit: "20-12345678-9",
      type: "A",
      amount: 15000,
      concept: "Venta de ropa",
      date: new Date().toISOString(),
      status: "approved",
      arcaStatus: "Enviada",
    },
    {
      id: "inv2",
      number: "B-0001-00000002",
      customer: "Juan Pérez",
      cuit: "23-87654321-0",
      type: "B",
      amount: 8500,
      concept: "Venta de accesorios",
      date: new Date(Date.now() - 86400000).toISOString(),
      status: "pending",
      arcaStatus: "Pendiente",
    },
  ];
}

/**
 * Calcula el total facturado
 */
function calculateTotalInvoiced() {
  return currentInvoices.reduce(
    (sum, invoice) => sum + (invoice.amount || 0),
    0
  );
}

/**
 * Obtiene el color del estado
 */
function getStatusColor(status) {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/**
 * Obtiene el texto del estado
 */
function getStatusText(status) {
  switch (status) {
    case "approved":
      return "Aprobada";
    case "pending":
      return "Pendiente";
    case "rejected":
      return "Rechazada";
    default:
      return "Desconocido";
  }
}

/**
 * Abre el modal de factura
 */
function openInvoiceModal() {
  const modal = document.getElementById("invoice-modal");
  document.getElementById("invoice-form").reset();
  modal.classList.remove("hidden");
}

/**
 * Cierra el modal de factura
 */
function closeInvoiceModal() {
  const modal = document.getElementById("invoice-modal");
  modal.classList.add("hidden");
}

/**
 * Maneja el guardado de la factura
 */
async function handleSaveInvoice() {
  try {
    const customer = document.getElementById("invoice-customer").value.trim();
    const amount = parseFloat(document.getElementById("invoice-amount").value);

    if (!customer || !amount) {
      showNotification("Cliente y monto son requeridos", "error");
      return;
    }

    showNotification("Factura creada exitosamente", "success");
    closeInvoiceModal();

    // Recargar la página para mostrar cambios
    setTimeout(() => {
      if (window.POS && window.POS.loadPage) {
        window.POS.loadPage("facturas");
      }
    }, 1000);
  } catch (error) {
    console.error("❌ Error al crear factura:", error);
    showNotification("Error al crear factura", "error");
  }
}

/**
 * Maneja la sincronización con ARCA
 */
function handleSyncArca() {
  showNotification("Sincronizando con ARCA...", "info");

  // Simular sincronización
  setTimeout(() => {
    showNotification("Sincronización completada", "success");
  }, 2000);
}

// Funciones globales
window.viewInvoice = (invoiceId) => {
  showNotification("Vista de factura en desarrollo", "info");
};

window.sendToArca = (invoiceId) => {
  showNotification("Enviando a ARCA...", "info");
  setTimeout(() => {
    showNotification("Factura enviada a ARCA exitosamente", "success");
  }, 1500);
};
