/**
 * POS Productos - Gestión completa de productos
 * Versión corregida y funcional
 */

let currentProducts = [];
let filteredProducts = [];
let isEditMode = false;
let editingProductId = null;

import { getProducts } from './firebase-products.js';

/**
 * Inicializa la página de productos
 */
async function initProductos(container) {
  try {
    console.log('🚀 Iniciando módulo de productos...');
    
    // Mostrar loading
    container.innerHTML = `
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <span class="ml-3 text-gray-600">Cargando productos...</span>
      </div>
    `;

    // Cargar productos
    currentProducts = await getProducts();
    filteredProducts = [...currentProducts];
    
    console.log(`📦 ${currentProducts.length} productos cargados`);
    
    // Renderizar interfaz
    container.innerHTML = createProductosHTML();
    
    // Configurar event listeners
    setupProductosEvents();
    
    // Renderizar lista de productos
    renderProductsList();
    
    console.log('✅ Módulo de productos iniciado correctamente');
    
  } catch (error) {
    console.error('❌ Error al cargar productos:', error);
    showNotification('Error al cargar productos', 'error');
    
    container.innerHTML = `
      <div class="text-center py-12">
        <h3 class="text-xl font-semibold text-red-600 mb-2">Error al cargar productos</h3>
        <p class="text-gray-500 mb-4">No se pudieron cargar los productos</p>
        <button onclick="location.reload()" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
          Reintentar
        </button>
      </div>
    `;
  }
}

/**
 * Crea el HTML de la página de productos
 */
function createProductosHTML() {
  return `
    <!-- Header con acciones -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
      <div class="flex items-center space-x-4">
        <button id="btn-organizar" class="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <span>📋</span>
          <span>Organizar</span>
        </button>
        <button id="btn-exportar" class="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <span>📤</span>
          <span>Exportar e importar</span>
        </button>
        <button id="btn-agregar-producto" class="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <span>➕</span>
          <span>Agregar producto</span>
        </button>
      </div>
    </div>

    <!-- Barra de búsqueda y filtros -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
        <div class="flex-1">
          <input 
            type="text" 
            id="search-input" 
            placeholder="Busca por nombre, SKU o tags" 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
        </div>
        <div class="flex items-center space-x-2">
          <button id="btn-filtrar" class="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <span>🔍</span>
            <span>Filtrar</span>
          </button>
          <button id="btn-mas-nuevo" class="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <span>⬆️</span>
            <span>Más nuevo</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Contador de productos -->
    <div class="mb-4">
      <p class="text-sm text-gray-600">
        <span id="products-count">${currentProducts.length}</span> producto${currentProducts.length !== 1 ? 's' : ''}
      </p>
    </div>

    <!-- Tabla de productos -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input type="checkbox" id="select-all" class="rounded border-gray-300">
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Costo
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody id="products-table-body" class="bg-white divide-y divide-gray-200">
            <!-- Los productos se cargarán aquí -->
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal para agregar/editar producto -->
    <div id="product-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden z-50">
      <div class="flex items-center justify-center min-h-screen p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 id="modal-title" class="text-lg font-medium text-gray-900">Agregar Producto</h3>
          </div>
          
          <form id="product-form" class="px-6 py-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Nombre -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del producto *</label>
                <input type="text" id="product-name" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              </div>
              
              <!-- Categoría -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                <select id="product-category" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Seleccionar categoría</option>
                  <option value="mujer">Mujer</option>
                  <option value="hombre">Hombre</option>
                  <option value="ninos">Niños</option>
                  <option value="calzado">Calzado</option>
                  <option value="ropa-interior">Ropa Interior</option>
                  <option value="accesorios">Accesorios</option>
                </select>
              </div>
              
              <!-- SKU -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">SKU / Código de barras</label>
                <input type="text" id="product-sku" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              </div>
              
              <!-- Precio -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
                <input type="number" id="product-price" required min="0" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              </div>
              
              <!-- Precio original -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Precio original</label>
                <input type="number" id="product-original-price" min="0" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              </div>
              
              <!-- Stock -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                <input type="number" id="product-stock" required min="0" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              </div>
              
              <!-- Colores -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Colores (separados por coma)</label>
                <input type="text" id="product-colors" placeholder="Rojo, Azul, Verde" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              </div>
              
              <!-- Tallas -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tallas (separadas por coma)</label>
                <input type="text" id="product-sizes" placeholder="S, M, L, XL" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              </div>
              
              <!-- Tags -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tags (separados por coma)</label>
                <input type="text" id="product-tags" placeholder="verano, formal, casual" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              </div>
              
              <!-- Descripción -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea id="product-description" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"></textarea>
              </div>
              
              <!-- Imágenes -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Imágenes</label>
                <div id="image-drop-zone" class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                  <input type="file" id="product-images" multiple accept="image/*" class="hidden">
                  <div class="space-y-2">
                    <div class="text-gray-400">
                      <svg class="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <button type="button" id="select-images-btn" class="text-blue-600 hover:text-blue-500 font-medium">
                        Seleccionar imágenes
                      </button>
                      <span class="text-gray-500"> o arrastra y suelta aquí</span>
                    </div>
                    <p class="text-xs text-gray-500">Máximo 5MB por imagen. Formatos: JPG, PNG, WebP</p>
                  </div>
                </div>
                <!-- Preview container -->
                <div id="image-preview-container" class="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3"></div>
              </div>
              
              <!-- Opciones adicionales -->
              <div class="md:col-span-2 flex items-center space-x-6">
                <label class="flex items-center">
                  <input type="checkbox" id="product-featured" class="rounded border-gray-300">
                  <span class="ml-2 text-sm text-gray-700">Producto destacado</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" id="product-on-sale" class="rounded border-gray-300">
                  <span class="ml-2 text-sm text-gray-700">En oferta</span>
                </label>
              </div>
            </div>
          </form>
          
          <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button id="cancel-product" type="button" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button id="save-product" type="button" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Guardar Producto
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de migración -->
    <div id="migration-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden z-50">
      <div class="flex items-center justify-center min-h-screen p-4">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Migrar Productos</h3>
          </div>
          
          <div class="px-6 py-4">
            <p class="text-gray-600 mb-4">
              ¿Deseas migrar los productos desde products.json a Firebase? 
              Esto solo debe hacerse una vez.
            </p>
            <div class="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p class="text-sm text-yellow-800">
                ⚠️ Esta acción creará productos duplicados si ya existen en Firebase.
              </p>
            </div>
          </div>
          
          <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button id="cancel-migration" type="button" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button id="confirm-migration" type="button" class="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">
              Migrar Productos
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Configura los event listeners
 */
function setupProductosEvents() {
  console.log('🔧 Configurando event listeners de productos...');
  
  // Búsqueda con debounce
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(handleSearch, 300));
  }

  // Botón agregar producto
  const btnAgregar = document.getElementById('btn-agregar-producto');
  if (btnAgregar) {
    btnAgregar.addEventListener('click', openProductModal);
  }

  // Botón exportar/importar
  const btnExportar = document.getElementById('btn-exportar');
  if (btnExportar) {
    btnExportar.addEventListener('click', openMigrationModal);
  }

  // Modal de producto
  const cancelBtn = document.getElementById('cancel-product');
  const saveBtn = document.getElementById('save-product');
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeProductModal);
  }
  
  if (saveBtn) {
    saveBtn.addEventListener('click', handleSaveProduct);
  }

  // Configurar carga de imágenes
  setupImageUpload();

  // Modal de migración
  const cancelMigration = document.getElementById('cancel-migration');
  const confirmMigration = document.getElementById('confirm-migration');
  
  if (cancelMigration) {
    cancelMigration.addEventListener('click', closeMigrationModal);
  }
  
  if (confirmMigration) {
    confirmMigration.addEventListener('click', handleMigration);
  }

  // Cerrar modales al hacer click fuera
  document.getElementById('product-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'product-modal') {
      closeProductModal();
    }
  });

  document.getElementById('migration-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'migration-modal') {
      closeMigrationModal();
    }
  });
  
  console.log('✅ Event listeners configurados');
}

/**
 * Configura la carga de imágenes con drag & drop
 */
function setupImageUpload() {
  const imageInput = document.getElementById('product-images');
  const selectBtn = document.getElementById('select-images-btn');
  const dropZone = document.getElementById('image-drop-zone');

  if (!imageInput || !selectBtn || !dropZone) return;

  // Event listener para el botón de seleccionar
  selectBtn.addEventListener('click', (e) => {
    e.preventDefault();
    imageInput.click();
  });

  // Event listener para cambio en el input de archivos
  imageInput.addEventListener('change', handleImageSelection);

  // Configurar drag & drop
  if (typeof enableDragAndDrop === 'function') {
    enableDragAndDrop(dropZone, handleImageDrop, ['image/jpeg', 'image/png', 'image/webp']);
  }
}

/**
 * Maneja la selección de imágenes desde el input
 */
function handleImageSelection(e) {
  const files = Array.from(e.target.files);
  processSelectedImages(files);
}

/**
 * Maneja las imágenes soltadas en el drag & drop
 */
function handleImageDrop(files) {
  // Actualizar el input con los archivos
  const imageInput = document.getElementById('product-images');
  if (imageInput) {
    const dt = new DataTransfer();
    files.forEach(file => dt.items.add(file));
    imageInput.files = dt.files;
  }
  
  processSelectedImages(files);
}

/**
 * Procesa las imágenes seleccionadas y muestra vista previa
 */
function processSelectedImages(files) {
  const previewContainer = document.getElementById('image-preview-container');
  if (!previewContainer) return;

  // Limpiar vista previa anterior
  previewContainer.innerHTML = '';

  if (files.length === 0) return;

  // Validar archivos
  const validFiles = [];
  for (const file of files) {
    if (!validateFileType(file, ['image/jpeg', 'image/png', 'image/webp'])) {
      showNotification(`Formato no válido para ${file.name}. Use JPG, PNG o WebP`, 'error');
      continue;
    }
    
    if (!validateFileSize(file, 5)) {
      showNotification(`${file.name} es muy grande. Máximo 5MB por imagen`, 'error');
      continue;
    }
    
    validFiles.push(file);
  }

  if (validFiles.length === 0) return;

  // Mostrar vista previa de archivos válidos
  validFiles.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const previewItem = document.createElement('div');
      previewItem.className = 'relative group';
      previewItem.innerHTML = `
        <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
          <img src="${e.target.result}" alt="Vista previa ${index + 1}" class="w-full h-full object-cover">
        </div>
        <button type="button" onclick="removeImagePreview(${index})" 
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
          ×
        </button>
        <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg truncate">
          ${file.name}
        </div>
      `;
      previewContainer.appendChild(previewItem);
    };
    reader.readAsDataURL(file);
  });

  showNotification(`${validFiles.length} imagen${validFiles.length > 1 ? 'es' : ''} seleccionada${validFiles.length > 1 ? 's' : ''}`, 'success');
}

/**
 * Remueve una imagen de la vista previa
 */
window.removeImagePreview = function(index) {
  const imageInput = document.getElementById('product-images');
  const previewContainer = document.getElementById('image-preview-container');
  
  if (!imageInput || !previewContainer) return;

  // Crear nuevo DataTransfer sin el archivo removido
  const dt = new DataTransfer();
  const files = Array.from(imageInput.files);
  
  files.forEach((file, i) => {
    if (i !== index) {
      dt.items.add(file);
    }
  });
  
  imageInput.files = dt.files;
  
  // Reprocesar imágenes
  processSelectedImages(Array.from(dt.files));
};

/**
 * Renderiza la lista de productos en la tabla
 */
function renderProductsList() {
  const tbody = document.getElementById('products-table-body');
  const countElement = document.getElementById('products-count');
  
  if (!tbody) return;

  countElement.textContent = filteredProducts.length;

  if (filteredProducts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="px-6 py-12 text-center text-gray-500">
          <div class="text-4xl mb-2">📦</div>
          <p>No se encontraron productos</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filteredProducts.map(product => `
    <tr class="hover:bg-gray-50">
      <td class="px-6 py-4 whitespace-nowrap">
        <input type="checkbox" class="product-checkbox rounded border-gray-300" data-id="${product.id}">
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="flex items-center">
          <div class="flex-shrink-0 h-12 w-12">
            ${product.images && product.images.length > 0 ? 
              `<img class="h-12 w-12 rounded-lg object-cover" src="${product.images[0]}" alt="${sanitizeText(product.name)}" onerror="this.parentElement.innerHTML='<div class=\\'h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center\\'><span class=\\'text-gray-400 text-xs\\'>Sin imagen</span></div>'">` :
              `<div class="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                <span class="text-gray-400 text-xs">Sin imagen</span>
              </div>`
            }
          </div>
          <div class="ml-4">
            <div class="text-sm font-medium text-gray-900">${sanitizeText(product.name)}</div>
            <div class="text-sm text-gray-500">${product.sku || 'Sin SKU'}</div>
            ${product.category ? `<div class="text-xs text-gray-400">${sanitizeText(product.category)}</div>` : ''}
          </div>
        </div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="text-sm ${(product.stock || 0) <= 5 ? 'text-red-600 font-semibold' : 'text-gray-900'}">
          ${product.stock || 0}
        </span>
        ${(product.stock || 0) <= 5 ? '<div class="text-xs text-red-500">Stock bajo</div>' : ''}
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-sm text-gray-900">${formatCurrency(product.price || 0)}</div>
        ${product.originalPrice ? 
          `<div class="text-xs text-gray-500 line-through">${formatCurrency(product.originalPrice)}</div>` : 
          ''
        }
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="text-sm text-gray-500">-</span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button onclick="editProduct('${product.id}')" class="text-blue-600 hover:text-blue-900 mr-3" title="Editar producto">
          Editar
        </button>
        <button onclick="deleteProductConfirm('${product.id}')" class="text-red-600 hover:text-red-900" title="Eliminar producto">
          Eliminar
        </button>
      </td>
    </tr>
  `).join('');
}

/**
 * Maneja la búsqueda de productos
 */
function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase().trim();
  
  if (searchTerm === '') {
    filteredProducts = [...currentProducts];
  } else {
    filteredProducts = currentProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm)) ||
      (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
    );
  }
  
  renderProductsList();
}

/**
 * Abre el modal de producto
 */
function openProductModal(productData = null) {
  const modal = document.getElementById('product-modal');
  const title = document.getElementById('modal-title');
  
  isEditMode = !!productData;
  editingProductId = productData?.id || null;
  
  title.textContent = isEditMode ? 'Editar Producto' : 'Agregar Producto';
  
  // Limpiar o llenar formulario
  if (productData) {
    fillProductForm(productData);
  } else {
    clearProductForm();
  }
  
  modal.classList.remove('hidden');
  
  // Configurar eventos de imágenes después de que el modal esté visible
  setTimeout(() => {
    setupImageUpload();
  }, 100);
}

/**
 * Cierra el modal de producto
 */
function closeProductModal() {
  const modal = document.getElementById('product-modal');
  modal.classList.add('hidden');
  clearProductForm();
  isEditMode = false;
  editingProductId = null;
  
  // Limpiar vista previa de imágenes
  const previewContainer = document.getElementById('image-preview-container');
  if (previewContainer) {
    previewContainer.innerHTML = '';
  }
}

/**
 * Llena el formulario con datos del producto
 */
function fillProductForm(product) {
  document.getElementById('product-name').value = product.name || '';
  document.getElementById('product-category').value = product.category || '';
  document.getElementById('product-sku').value = product.sku || '';
  document.getElementById('product-price').value = product.price || '';
  document.getElementById('product-original-price').value = product.originalPrice || '';
  document.getElementById('product-stock').value = product.stock || '';
  document.getElementById('product-colors').value = (product.colors || []).join(', ');
   document.getElementById('product-sizes').value = (product.sizes || []).join(', ');
  document.getElementById('product-tags').value = (product.tags || []).join(', ');
  document.getElementById('product-description').value = product.description || '';
  document.getElementById('product-featured').checked = product.featured || false;
  document.getElementById('product-on-sale').checked = product.onSale || false;
}

/**
 * Limpia el formulario
 */
function clearProductForm() {
  document.getElementById('product-form').reset();
}

/**
 * Maneja el guardado del producto
 */
async function handleSaveProduct() {
  try {
    const saveBtn = document.getElementById('save-product');
    const originalText = saveBtn.textContent;
    saveBtn.disabled = true;
    saveBtn.textContent = isEditMode ? 'Actualizando...' : 'Guardando...';

    // Recopilar datos del formulario
    const productData = {
      name: document.getElementById('product-name').value.trim(),
      category: document.getElementById('product-category').value,
      sku: document.getElementById('product-sku').value.trim(),
      price: document.getElementById('product-price').value,
      originalPrice: document.getElementById('product-original-price').value,
      stock: document.getElementById('product-stock').value,
      colors: document.getElementById('product-colors').value.split(',').map(c => c.trim()).filter(c => c),
      sizes: document.getElementById('product-sizes').value.split(',').map(s => s.trim()).filter(s => s),
      tags: document.getElementById('product-tags').value.split(',').map(t => t.trim()).filter(t => t),
      description: document.getElementById('product-description').value.trim(),
      featured: document.getElementById('product-featured').checked,
      onSale: document.getElementById('product-on-sale').checked
    };

    console.log('📝 Datos del producto a guardar:', productData);

    // Validar datos requeridos
    if (!productData.name || !productData.category || productData.price === '' || productData.price === undefined) {
      showNotification('Por favor completa todos los campos requeridos: nombre, categoría y precio', 'error');
      return;
    }

    // Validar precio
    const price = parseFloat(productData.price);
    if (isNaN(price) || price < 0) {
      showNotification('El precio debe ser un número válido mayor o igual a 0', 'error');
      return;
    }

    // Validar stock
    const stock = parseInt(productData.stock) || 0;
    if (isNaN(stock) || stock < 0) {
      showNotification('El stock debe ser un número válido mayor o igual a 0', 'error');
      return;
    }

    // Obtener archivos de imagen
    const imageFiles = Array.from(document.getElementById('product-images').files);
    
    // Validar archivos
    for (const file of imageFiles) {
      if (!validateFileType(file)) {
        showNotification(`Formato de imagen no válido para ${file.name}. Use JPG, PNG o WebP`, 'error');
        return;
      }
      if (!validateFileSize(file)) {
        showNotification(`El archivo ${file.name} es muy grande. Máximo 5MB por imagen`, 'error');
        return;
      }
    }

    let result;
    if (isEditMode && editingProductId) {
      console.log('🔄 Actualizando producto:', editingProductId);
      result = await updateProduct(editingProductId, productData, imageFiles);
    } else {
      console.log('➕ Creando nuevo producto');
      result = await createProduct(productData, imageFiles);
    }

    if (result && result.success) {
      const action = isEditMode ? 'actualizado' : 'creado';
      showNotification(`Producto ${action} exitosamente`, 'success');
      
      closeProductModal();
      
      // Recargar productos
      console.log('🔄 Recargando lista de productos...');
      currentProducts = await getProducts();
      filteredProducts = [...currentProducts];
      renderProductsList();
      
      // Actualizar contador
      const countElement = document.getElementById('products-count');
      if (countElement) {
        countElement.textContent = currentProducts.length;
      }
    } else {
      console.error('❌ Error en resultado:', result);
      showNotification(result?.error || 'Error desconocido al guardar producto', 'error');
    }

  } catch (error) {
    console.error('❌ Error al guardar producto:', error);
    showNotification('Error al guardar el producto', 'error');
  } finally {
    const saveBtn = document.getElementById('save-product');
    saveBtn.disabled = false;
    saveBtn.textContent = isEditMode ? 'Actualizar Producto' : 'Guardar Producto';
  }
}

/**
 * Abre el modal de migración
 */
function openMigrationModal() {
  const modal = document.getElementById('migration-modal');
  modal.classList.remove('hidden');
}

/**
 * Cierra el modal de migración
 */
function closeMigrationModal() {
  const modal = document.getElementById('migration-modal');
  modal.classList.add('hidden');
}

/**
 * Maneja la migración de productos
 */
async function handleMigration() {
  try {
    const confirmBtn = document.getElementById('confirm-migration');
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Migrando...';

    const result = await migrateProductsFromJSON();
    
    if (result.success) {
      closeMigrationModal();
      // Recargar productos
      currentProducts = await getProducts();
      filteredProducts = [...currentProducts];
      renderProductsList();
    }

  } catch (error) {
    console.error('❌ Error en migración:', error);
    showNotification('Error en la migración', 'error');
  } finally {
    const confirmBtn = document.getElementById('confirm-migration');
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Migrar Productos';
  }
}

// Funciones globales para los botones de la tabla
window.editProduct = async (productId) => {
  try {
    console.log('✏️ Editando producto:', productId);
    
    const product = currentProducts.find(p => p.id === productId);
    if (!product) {
      showNotification('Producto no encontrado', 'error');
      return;
    }
    
    console.log('📝 Datos del producto a editar:', product);
    openProductModal(product);
    
  } catch (error) {
    console.error('❌ Error al editar producto:', error);
    showNotification('Error al cargar datos del producto', 'error');
  }
};

window.deleteProductConfirm = async (productId) => {
  try {
    console.log('🗑️ Solicitando eliminar producto:', productId);
    
    const product = currentProducts.find(p => p.id === productId);
    if (!product) {
      showNotification('Producto no encontrado', 'error');
      return;
    }

    const confirmMessage = `¿Estás seguro de que quieres eliminar "${product.name}"?\n\nEsta acción no se puede deshacer.`;
    
    if (confirm(confirmMessage)) {
      console.log('🗑️ Eliminando producto:', productId);
      
      const result = await deleteProduct(productId);
      
      if (result && result.success) {
        showNotification('Producto eliminado exitosamente', 'success');
        
        // Recargar productos
        console.log('🔄 Recargando lista de productos...');
        currentProducts = await getProducts();
        filteredProducts = [...currentProducts];
        renderProductsList();
        
        // Actualizar contador
        const countElement = document.getElementById('products-count');
        if (countElement) {
          countElement.textContent = currentProducts.length;
        }
      } else {
        console.error('❌ Error en resultado de eliminación:', result);
        showNotification(result?.error || 'Error al eliminar producto', 'error');
      }
    }
    
  } catch (error) {
    console.error('❌ Error al eliminar producto:', error);
    showNotification('Error al eliminar el producto', 'error');
  }
};
