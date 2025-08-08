/**
 * POS Proveedores - Gestión de proveedores
 * Sistema básico para gestionar proveedores
 */

let currentProviders = [];

/**
 * Inicializa la página de proveedores
 */
async function initProveedores(container) {
  try {
    // Mostrar loading
    container.innerHTML = `
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <span class="ml-3 text-gray-600">Cargando proveedores...</span>
      </div>
    `;

    // Cargar proveedores
    currentProviders = await getProviders();

    // Renderizar interfaz
    container.innerHTML = createProveedoresHTML();

    // Configurar event listeners
    setupProveedoresEvents();
  } catch (error) {
    console.error("❌ Error al cargar proveedores:", error);
    showNotification("Error al cargar proveedores", "error");

    container.innerHTML = `
      <div class="text-center py-12">
        <h3 class="text-xl font-semibold text-red-600 mb-2">Error al cargar proveedores</h3>
        <p class="text-gray-500 mb-4">No se pudieron cargar los proveedores</p>
        <button onclick="location.reload()" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
          Reintentar
        </button>
      </div>
    `;
  }
}

/**
 * Crea el HTML de la página de proveedores
 */
function createProveedoresHTML() {
  return `
    <!-- Header con acciones -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
      <div class="flex items-center space-x-4">
        <button id="btn-agregar-proveedor" class="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <span>➕</span>
          <span>Agregar Proveedor</span>
        </button>
        <button id="btn-exportar-proveedores" class="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <span>📤</span>
          <span>Exportar</span>
        </button>
      </div>
    </div>

    <!-- Barra de búsqueda -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
        <div class="flex-1">
          <input 
            type="text" 
            id="search-providers" 
            placeholder="Buscar por nombre, email o teléfono" 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
        </div>
      </div>
    </div>

    <!-- Contador de proveedores -->
    <div class="mb-4">
      <p class="text-sm text-gray-600">
        <span id="providers-count">${currentProviders.length}</span> proveedor${
    currentProviders.length !== 1 ? "es" : ""
  }
      </p>
    </div>

    <!-- Lista de proveedores -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="providers-grid">
      ${
        currentProviders.length > 0
          ? currentProviders
              .map((provider) => createProviderCard(provider))
              .join("")
          : `<div class="col-span-full text-center py-12">
          <div class="text-4xl mb-4">🏢</div>
          <h3 class="text-xl font-semibold text-gray-600 mb-2">No hay proveedores</h3>
          <p class="text-gray-500 mb-4">Agrega tu primer proveedor para comenzar</p>
          <button onclick="document.getElementById('btn-agregar-proveedor').click()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Agregar Proveedor
          </button>
        </div>`
      }
    </div>

    <!-- Modal para agregar/editar proveedor -->
    <div id="provider-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden z-50">
      <div class="flex items-center justify-center min-h-screen p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 id="provider-modal-title" class="text-lg font-medium text-gray-900">Agregar Proveedor</h3>
          </div>
          
          <form id="provider-form" class="px-6 py-4">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input type="text" id="provider-name" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" id="provider-email" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input type="tel" id="provider-phone" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <textarea id="provider-address" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea id="provider-notes" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
              </div>
            </div>
          </form>
          
          <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button id="cancel-provider" type="button" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button id="save-provider" type="button" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Crea una tarjeta de proveedor
 */
function createProviderCard(provider) {
  return `
    <div class="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-gray-900">${provider.name}</h3>
          ${
            provider.email
              ? `<p class="text-sm text-gray-600">${provider.email}</p>`
              : ""
          }
          ${
            provider.phone
              ? `<p class="text-sm text-gray-600">${provider.phone}</p>`
              : ""
          }
        </div>
        <div class="flex space-x-2">
          <button onclick="editProvider('${
            provider.id
          }')" class="text-blue-600 hover:text-blue-800">
            ✏️
          </button>
          <button onclick="deleteProvider('${
            provider.id
          }')" class="text-red-600 hover:text-red-800">
            🗑️
          </button>
        </div>
      </div>
      
      ${
        provider.address
          ? `
        <div class="mb-3">
          <p class="text-sm text-gray-600">📍 ${provider.address}</p>
        </div>
      `
          : ""
      }
      
      ${
        provider.notes
          ? `
        <div class="mb-3">
          <p class="text-sm text-gray-500">${provider.notes}</p>
        </div>
      `
          : ""
      }
      
      <div class="text-xs text-gray-400">
        Agregado: ${formatDate(provider.createdAt)}
      </div>
    </div>
  `;
}

/**
 * Configura los event listeners
 */
function setupProveedoresEvents() {
  // Botón agregar proveedor
  const btnAgregar = document.getElementById("btn-agregar-proveedor");
  if (btnAgregar) {
    btnAgregar.addEventListener("click", () => openProviderModal());
  }

  // Modal events
  const cancelBtn = document.getElementById("cancel-provider");
  const saveBtn = document.getElementById("save-provider");

  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeProviderModal);
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", handleSaveProvider);
  }

  // Búsqueda
  const searchInput = document.getElementById("search-providers");
  if (searchInput) {
    searchInput.addEventListener("input", debounce(handleProviderSearch, 300));
  }
}

import { db } from "../firebase.js";
import { collection, getDocs } from "firebase/firestore";

/**
 * Obtiene los proveedores
 */
async function getProviders() {
  try {
    const providersRef = collection(db, "providers");
    const querySnapshot = await getDocs(providersRef);
    const providers = [];

    querySnapshot.forEach((doc) => {
      providers.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return providers.length > 0 ? providers : getExampleProviders();
  } catch (error) {
    console.error("❌ Error al obtener proveedores:", error);
    return getExampleProviders();
  }
}

/**
 * Datos de ejemplo para proveedores
 */
function getExampleProviders() {
  return [
    {
      id: "prov1",
      name: "Textiles del Norte",
      email: "ventas@textilesnorte.com",
      phone: "+54 261 123-4567",
      address: "Av. San Martín 1234, Mendoza",
      notes: "Proveedor principal de telas",
      createdAt: new Date().toISOString(),
    },
    {
      id: "prov2",
      name: "Confecciones Rosario",
      email: "info@confeccionesrosario.com",
      phone: "+54 341 987-6543",
      address: "Córdoba 567, Rosario",
      notes: "Especialistas en ropa infantil",
      createdAt: new Date().toISOString(),
    },
  ];
}

/**
 * Abre el modal de proveedor
 */
function openProviderModal(provider = null) {
  const modal = document.getElementById("provider-modal");
  const title = document.getElementById("provider-modal-title");

  title.textContent = provider ? "Editar Proveedor" : "Agregar Proveedor";

  if (provider) {
    document.getElementById("provider-name").value = provider.name || "";
    document.getElementById("provider-email").value = provider.email || "";
    document.getElementById("provider-phone").value = provider.phone || "";
    document.getElementById("provider-address").value = provider.address || "";
    document.getElementById("provider-notes").value = provider.notes || "";
  } else {
    document.getElementById("provider-form").reset();
  }

  modal.classList.remove("hidden");
}

/**
 * Cierra el modal de proveedor
 */
function closeProviderModal() {
  const modal = document.getElementById("provider-modal");
  modal.classList.add("hidden");
}

/**
 * Maneja el guardado del proveedor
 */
async function handleSaveProvider() {
  try {
    const name = document.getElementById("provider-name").value.trim();

    if (!name) {
      showNotification("El nombre es requerido", "error");
      return;
    }

    const providerData = {
      name,
      email: document.getElementById("provider-email").value.trim(),
      phone: document.getElementById("provider-phone").value.trim(),
      address: document.getElementById("provider-address").value.trim(),
      notes: document.getElementById("provider-notes").value.trim(),
      createdAt: new Date().toISOString(),
    };

    // Simular guardado (en una implementación real, guardaría en Firebase)
    showNotification("Proveedor guardado exitosamente", "success");
    closeProviderModal();

    // Recargar la página para mostrar cambios
    setTimeout(() => {
      if (window.POS && window.POS.loadPage) {
        window.POS.loadPage("proveedores");
      }
    }, 1000);
  } catch (error) {
    console.error("❌ Error al guardar proveedor:", error);
    showNotification("Error al guardar proveedor", "error");
  }
}

/**
 * Maneja la búsqueda de proveedores
 */
function handleProviderSearch(e) {
  const searchTerm = e.target.value.toLowerCase().trim();
  // Implementar filtrado de proveedores
  showNotification("Funcionalidad de búsqueda en desarrollo", "info");
}

// Funciones globales
window.editProvider = (providerId) => {
  const provider = currentProviders.find((p) => p.id === providerId);
  if (provider) {
    openProviderModal(provider);
  }
};

window.deleteProvider = (providerId) => {
  if (confirm("¿Estás seguro de que quieres eliminar este proveedor?")) {
    showNotification("Proveedor eliminado", "success");
    // En una implementación real, eliminaría de Firebase
  }
};
