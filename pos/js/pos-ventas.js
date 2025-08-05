/**
 * POS Ventas - Sistema de ventas y registro de transacciones
 * Basado en la maqueta visual proporcionada
 */

let currentSaleCart = [];
let allProducts = [];
let currentCustomer = null;
let currentDiscount = 0;

/**
 * Inicializa la página de ventas
 */
async function initVentas(container) {
  try {
    // Mostrar loading
    container.innerHTML = `
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <span class="ml-3 text-gray-600">Cargando sistema de ventas...</span>
      </div>
    `;

    // Cargar productos
    allProducts = await getProducts();
    
    // Renderizar interfaz
    container.innerHTML = createVentasHTML();
    
    // Configurar event listeners
    setupVentasEvents();
    
    // Cargar ventas recientes
    await loadRecentSales();
    
  } catch (error) {
    console.error('❌ Error al cargar ventas:', error);
    showNotification('Error al cargar el sistema de ventas', 'error');
    
    container.innerHTML = `
      <div class="text-center py-12">
        <h3 class="text-xl font-semibold text-red-600 mb-2">Error al cargar ventas</h3>
        <p class="text-gray-500 mb-4">No se pudo cargar el sistema de ventas</p>
        <button onclick="location.reload()" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
          Reintentar
        </button>
      </div>
    `;
  }
}

/**
 * Crea el HTML de la página de ventas
 */
function createVentasHTML() {
  return `
<!-- Panel de nueva venta -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

  <!-- Panel de productos y búsqueda -->
  <div class="lg:col-span-2 space-y-6">
    <div class="bg-white rounded-lg shadow p-6">

      <!-- Búsqueda de productos -->
      <div class="mb-6">
        <label for="product-search" class="block text-sm font-medium text-gray-700 mb-2">
          Buscar producto (nombre, SKU o código de barras)
        </label>
        <div class="flex space-x-2">
          <input 
            type="text" 
            id="product-search" 
            placeholder="Escanear código de barras o buscar producto..."
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
          <button 
            id="btn-scan-barcode" 
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            📷 Escanear
          </button>
          <button 
            id="btn-quick-product" 
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            ➕ Producto Rápido
          </button>
        </div>
      </div>

      <!-- Resultados de búsqueda -->
      <div id="search-results" class="mb-6 hidden">
        <h4 class="text-sm font-medium text-gray-700 mb-2">Resultados de búsqueda:</h4>
        <div id="search-results-list" class="space-y-2 max-h-40 overflow-y-auto">
          <!-- Resultados se mostrarán aquí -->
        </div>
      </div>

      <!-- Productos en el carrito de venta -->
      <div>
        <h4 class="text-sm font-medium text-gray-700 mb-2">Productos en la venta:</h4>
        <div id="sale-cart-items" class="space-y-2 min-h-[200px] border border-gray-200 rounded-lg p-4">
          <div class="text-center text-gray-500 py-8">
            <span class="text-4xl">🛒</span>
            <p class="mt-2">No hay productos en la venta</p>
            <p class="text-sm">Busca y agrega productos para comenzar</p>
          </div>
        </div>
      </div>

    </div>

    <!-- Aplicar descuento manual -->
    <div class="bg-white rounded-lg shadow p-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Aplicar descuento general
      </label>
      <div class="flex space-x-2">
        <input 
          type="number" 
          id="descuento" 
          placeholder="0.00"
          min="0"
          step="0.01"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
        <select id="discount-type" class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
          <option value="amount">$</option>
          <option value="percentage">%</option>
        </select>
        <button id="btn-descuento" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
          Aplicar
        </button>
      </div>
    </div>
  </div>

  <!-- Panel de resumen y checkout -->
  <div class="lg:col-span-1">
    <div class="bg-white rounded-lg shadow p-6 sticky top-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Resumen de Venta</h3>
      
      <!-- Información del cliente -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
        <input 
          type="text" 
          id="customer-name" 
          placeholder="Nombre del cliente (opcional)"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
      </div>

      <!-- Resumen de totales -->
      <div class="border-t border-gray-200 pt-4 mb-6">
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Subtotal:</span>
            <span id="sale-subtotal">$0,00</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Descuentos:</span>
            <span id="sale-discount" class="text-green-600">-$0,00</span>
          </div>
          <div class="flex justify-between text-lg font-semibold border-t pt-2">
            <span>Total:</span>
            <span id="sale-total">$0,00</span>
          </div>
          <div class="text-sm text-gray-500">
            <span id="sale-items-count">0</span> producto(s)
          </div>
        </div>
      </div>

      <!-- Método de pago -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Método de pago</label>
        <select id="payment-method" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
          <option value="efectivo">Efectivo</option>
          <option value="transferencia">Transferencia</option>
          <option value="mercadopago">Mercado Pago</option>
          <option value="tarjeta">Tarjeta Débito</option>
          <option value="tarjeta">Tarjeta Crédito</option>
        </select>
      </div>

      <!-- Botones de acción -->
      <div class="space-y-3">
        <button id="btn-finish-sale" class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed" disabled>
          FINALIZAR VENTA
        </button>
        <button id="btn-clear-sale" class="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
          Limpiar Venta
        </button>
      </div>
    </div>
  </div>

</div>

<!-- Modal para producto rápido -->
<div id="quick-product-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden z-50">
  <div class="flex items-center justify-center min-h-screen p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Agregar Producto Rápido</h3>
      </div>
      <form id="quick-product-form" class="px-6 py-4">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del producto *</label>
            <input type="text" id="quick-product-name" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Talla/Tamaño</label>
            <input type="text" id="quick-product-size" placeholder="S, M, L, XL, etc." class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
            <input type="number" id="quick-product-price" required min="0" step="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
            <input type="number" id="quick-product-quantity" value="1" min="1" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
          </div>
        </div>
      </form>
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
        <button id="cancel-quick-product" type="button" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
          Cancelar
        </button>
        <button id="save-quick-product" type="button" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
          Agregar a la Venta
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Modal de recibo -->
<div id="receipt-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 hidden z-50">
  <div class="flex items-center justify-center min-h-screen p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Venta Completada</h3>
      </div>
      <div id="receipt-content" class="px-6 py-4">
        <!-- Contenido del recibo se generará aquí -->
      </div>
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
        <button id="btn-print-receipt" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          🖨️ Imprimir Recibo
        </button>
        <button id="btn-close-receipt" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
          Cerrar
        </button>
      </div>
    </div>
  </div>
</div>


    <!-- Exportar historial -->
    
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
      <div class="flex items-center space-x-4">
        <button id="btn-exportar-lista" class="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <span>📤</span>
          <span>Exportar lista</span>
        </button>

      </div>
    </div>

    <!-- Barra de búsqueda -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
        <div class="flex-1">
          <input 
            type="text" 
            id="search-sales" 
            placeholder="Buscar por número o monto exacto de la venta, nombre del cliente" 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
        </div>
        <div class="flex items-center space-x-2">
          <button id="btn-filtrar-ventas" class="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <span>🔍</span>
            <span>Filtrar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Contador de ventas -->
    <div class="mb-4">
      <p class="text-sm text-gray-600">
        <span id="sales-count">0</span> venta abierta (menos archivada y cancelada)
      </p>
    </div>

    <!-- Tabla de ventas -->
    <div class="bg-white rounded-lg shadow overflow-hidden mb-8">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input type="checkbox" id="select-all-sales" class="rounded border-gray-300">
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Venta
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Productos
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pago
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody id="sales-table-body" class="bg-white divide-y divide-gray-200">
            <!-- Las ventas se cargarán aquí -->
          </tbody>
        </table>
      </div>
    </div>


  `;
}

/**
 * Configura los event listeners
 */
function setupVentasEvents() {
  // Búsqueda de productos con debounce
  const productSearch = document.getElementById('product-search');
  if (productSearch) {
    productSearch.addEventListener('input', debounce(handleProductSearch, 300));
    productSearch.addEventListener('keydown', handleBarcodeInput);
  }

  // Botón nueva venta
  const btnNuevaVenta = document.getElementById('btn-nueva-venta');
  if (btnNuevaVenta) {
    btnNuevaVenta.addEventListener('click', () => {
      document.getElementById('product-search').focus();
    });
  }

  // Botón finalizar venta
  const btnFinishSale = document.getElementById('btn-finish-sale');
  if (btnFinishSale) {
    btnFinishSale.addEventListener('click', handleFinishSale);
  }

  // Botón limpiar venta
  const btnClearSale = document.getElementById('btn-clear-sale');
  if (btnClearSale) {
    btnClearSale.addEventListener('click', handleClearSale);
  }

  // Botón aplicar descuento
  const btnDescuento = document.getElementById('btn-descuento');
  if (btnDescuento) {
    btnDescuento.addEventListener('click', handleApplyDiscount);
  }

  // Modal de recibo
  const btnCloseReceipt = document.getElementById('btn-close-receipt');
  const btnPrintReceipt = document.getElementById('btn-print-receipt');
  
  if (btnCloseReceipt) {
    btnCloseReceipt.addEventListener('click', closeReceiptModal);
  }
  
  if (btnPrintReceipt) {
    btnPrintReceipt.addEventListener('click', printReceipt);
  }

  // Botón exportar lista
  const btnExportarLista = document.getElementById('btn-exportar-lista');
  if (btnExportarLista) {
    btnExportarLista.addEventListener('click', handleExportSales);
  }

  // Cerrar modal al hacer click fuera
  document.getElementById('receipt-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'receipt-modal') {
      closeReceiptModal();
    }
  });
}

/**
 * Maneja la búsqueda de productos
 */
function handleProductSearch(e) {
  const searchTerm = e.target.value.toLowerCase().trim();
  const resultsContainer = document.getElementById('search-results');
  const resultsList = document.getElementById('search-results-list');
  
  if (searchTerm === '') {
    resultsContainer.classList.add('hidden');
    return;
  }

  // Buscar productos
  const matchingProducts = allProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm) ||
    (product.sku && product.sku.toLowerCase().includes(searchTerm)) ||
    (product.tags && Array.isArray(product.tags) && product.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
  ).slice(0, 5); // Limitar a 5 resultados

  if (matchingProducts.length > 0) {
    resultsContainer.classList.remove('hidden');
    resultsList.innerHTML = matchingProducts.map(product => `
      <div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer product-search-result" data-product-id="${product.id}" onclick="addProductToSale('${product.id}')">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
            ${product.images && product.images.length > 0 ? 
              `<img src="${product.images[0]}" alt="${sanitizeText(product.name)}" class="w-10 h-10 object-cover rounded" onerror="this.parentElement.innerHTML='<span class=\\'text-xs text-gray-500\\'>📦</span>'">` :
              `<span class="text-xs text-gray-500">📦</span>`
            }
          </div>
          <div>
            <p class="font-medium text-sm">${sanitizeText(product.name)}</p>
            <p class="text-xs text-gray-500">${product.sku || 'Sin SKU'} • Stock: ${product.stock || 0}</p>
            ${(product.stock || 0) <= 5 ? '<p class="text-xs text-red-500">Stock bajo</p>' : ''}
          </div>
        </div>
        <div class="text-right">
          <p class="font-semibold">${formatCurrency(product.price || 0)}</p>
          ${product.originalPrice ? `<p class="text-xs text-gray-500 line-through">${formatCurrency(product.originalPrice)}</p>` : ''}
        </div>
      </div>
    `).join('');
  } else {
    resultsContainer.classList.add('hidden');
    resultsList.innerHTML = `
      <div class="p-3 text-center text-gray-500">
        <p class="text-sm">No se encontraron productos</p>
        <p class="text-xs">Intenta con otro término de búsqueda</p>
      </div>
    `;
    resultsContainer.classList.remove('hidden');
  }
}

/**
 * Maneja la entrada de código de barras
 */
function handleBarcodeInput(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    const searchTerm = e.target.value.trim();
    
    if (searchTerm) {
      // Buscar producto por SKU exacto
      const product = allProducts.find(p => p.sku === searchTerm);
      if (product) {
        addProductToSale(product.id);
        e.target.value = '';
        document.getElementById('search-results').classList.add('hidden');
      } else {
        showNotification('Producto no encontrado', 'warning');
      }
    }
  }
}

/**
 * Agrega un producto al carrito de venta
 */
function addProductToSale(productId) {
  try {
    console.log('🛒 Agregando producto a la venta:', productId);
    
    const product = allProducts.find(p => p.id === productId);
    if (!product) {
      showNotification('Producto no encontrado', 'error');
      console.error('❌ Producto no encontrado:', productId);
      return;
    }

    if ((product.stock || 0) <= 0) {
      showNotification(`${product.name} sin stock disponible`, 'warning');
      return;
    }

    // Verificar si ya está en el carrito
    const existingItem = currentSaleCart.find(item => item.productId === productId);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        showNotification(`No hay más stock disponible para ${product.name}`, 'warning');
        return;
      }
      existingItem.quantity++;
      console.log(`✅ Cantidad actualizada para ${product.name}: ${existingItem.quantity}`);
    } else {
      const newItem = {
        id: generateId(),
        productId: productId,
        name: product.name,
        price: product.price || 0,
        originalPrice: product.originalPrice,
        sku: product.sku,
        image: product.images && product.images.length > 0 ? product.images[0] : null,
        quantity: 1,
        maxStock: product.stock || 0,
        category: product.category
      };
      
      currentSaleCart.push(newItem);
      console.log('✅ Nuevo producto agregado al carrito:', newItem);
    }

    renderSaleCart();
    updateSaleTotals();
    
    // Limpiar búsqueda
    const searchInput = document.getElementById('product-search');
    const searchResults = document.getElementById('search-results');
    
    if (searchInput) searchInput.value = '';
    if (searchResults) searchResults.classList.add('hidden');
    
    showNotification(`${product.name} agregado a la venta`, 'success');
    
  } catch (error) {
    console.error('❌ Error al agregar producto a la venta:', error);
    showNotification('Error al agregar producto a la venta', 'error');
  }
}

/**
 * Renderiza el carrito de venta
 */
function renderSaleCart() {
  const container = document.getElementById('sale-cart-items');
  
  if (!container) {
    console.error('❌ Contenedor sale-cart-items no encontrado');
    return;
  }
  
  if (currentSaleCart.length === 0) {
    container.innerHTML = `
      <div class="text-center text-gray-500 py-8">
        <span class="text-4xl">🛒</span>
        <p class="mt-2">No hay productos en la venta</p>
        <p class="text-sm">Busca y agrega productos para comenzar</p>
      </div>
    `;
    return;
  }

  container.innerHTML = currentSaleCart.map(item => `
    <div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg mb-2">
      <div class="flex items-center space-x-3 flex-1">
        <div class="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
          ${item.image ? 
            `<img src="${item.image}" alt="${sanitizeText(item.name)}" class="w-12 h-12 object-cover rounded" onerror="this.parentElement.innerHTML='<span class=\\'text-xs text-gray-500\\'>📦</span>'">` :
            `<span class="text-xs text-gray-500">📦</span>`
          }
        </div>
        <div class="flex-1">
          <p class="font-medium text-sm">${sanitizeText(item.name)}</p>
          <p class="text-xs text-gray-500">${item.sku || 'Sin SKU'}</p>
          <p class="text-sm font-semibold">${formatCurrency(item.price)}</p>
          ${item.originalPrice ? `<p class="text-xs text-gray-400 line-through">${formatCurrency(item.originalPrice)}</p>` : ''}
        </div>
      </div>
      
      <div class="flex items-center space-x-2">
        <button onclick="updateSaleItemQuantity('${item.id}', ${item.quantity - 1})" 
                class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 ${item.quantity <= 1 ? 'opacity-50 cursor-not-allowed' : ''}" 
                ${item.quantity <= 1 ? 'disabled' : ''}
                title="Disminuir cantidad">
          -
        </button>
        <span class="w-8 text-center font-medium">${item.quantity}</span>
        <button onclick="updateSaleItemQuantity('${item.id}', ${item.quantity + 1})" 
                class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 ${item.quantity >= item.maxStock ? 'opacity-50 cursor-not-allowed' : ''}" 
                ${item.quantity >= item.maxStock ? 'disabled' : ''}
                title="Aumentar cantidad">
          +
        </button>
        <button onclick="removeSaleItem('${item.id}')" 
                class="ml-2 text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                title="Eliminar producto">
          🗑️
        </button>
      </div>
    </div>
  `).join('');
  
  console.log(`🛒 Carrito renderizado con ${currentSaleCart.length} productos`);
}

/**
 * Actualiza la cantidad de un item en la venta
 */
function updateSaleItemQuantity(itemId, newQuantity) {
  if (newQuantity <= 0) {
    removeSaleItem(itemId);
    return;
  }

  const item = currentSaleCart.find(i => i.id === itemId);
  if (!item) return;

  if (newQuantity > item.maxStock) {
    showNotification('No hay suficiente stock disponible', 'warning');
    return;
  }

  item.quantity = newQuantity;
  renderSaleCart();
  updateSaleTotals();
}

/**
 * Remueve un item de la venta
 */
function removeSaleItem(itemId) {
  currentSaleCart = currentSaleCart.filter(item => item.id !== itemId);
  renderSaleCart();
  updateSaleTotals();
}

/**
 * Actualiza los totales de la venta
 */
function updateSaleTotals() {
  const subtotal = currentSaleCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal - currentDiscount;
  const itemsCount = currentSaleCart.reduce((sum, item) => sum + item.quantity, 0);

  document.getElementById('sale-subtotal').textContent = formatCurrency(subtotal);
  document.getElementById('sale-discount').textContent = formatCurrency(currentDiscount);
  document.getElementById('sale-total').textContent = formatCurrency(Math.max(0, total));
  document.getElementById('sale-items-count').textContent = itemsCount;

  // Habilitar/deshabilitar botón de finalizar venta
  const finishBtn = document.getElementById('btn-finish-sale');
  finishBtn.disabled = currentSaleCart.length === 0;
}

/**
 * Maneja la finalización de la venta
 */
async function handleFinishSale() {
  try {
    if (currentSaleCart.length === 0) {
      showNotification('No hay productos en la venta', 'warning');
      return;
    }

    const finishBtn = document.getElementById('btn-finish-sale');
    finishBtn.disabled = true;
    finishBtn.textContent = 'Procesando...';

    // Preparar datos de la venta
    const saleData = {
      saleNumber: generateSaleNumber(),
      customerName: document.getElementById('customer-name').value.trim() || 'Cliente General',
      items: currentSaleCart.map(item => ({
        productId: item.productId,
        name: item.name,
        sku: item.sku,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      })),
      subtotal: currentSaleCart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      discount: currentDiscount,
      total: Math.max(0, currentSaleCart.reduce((sum, item) => sum + (item.price * item.quantity), 0) - currentDiscount),
      paymentMethod: document.getElementById('payment-method').value,
      createdAt: new Date().toISOString(),
      status: 'completed'
    };

    // Guardar venta en Firebase
    const db = window.firebaseDB();
    if (db) {
      const docRef = await db.collection('sales').add(saleData);
      console.log('✅ Venta guardada con ID:', docRef.id);

      // Actualizar stock de productos
      for (const item of currentSaleCart) {
        const product = allProducts.find(p => p.id === item.productId);
        if (product) {
          const newStock = (product.stock || 0) - item.quantity;
          await updateProductStock(item.productId, Math.max(0, newStock));
        }
      }
    }

    // Mostrar recibo
    showReceiptModal(saleData);

    // Limpiar venta
    handleClearSale();
    
    showNotification('Venta completada exitosamente', 'success');

  } catch (error) {
    console.error('❌ Error al finalizar venta:', error);
    showNotification('Error al procesar la venta', 'error');
  } finally {
    const finishBtn = document.getElementById('btn-finish-sale');
    finishBtn.disabled = false;
    finishBtn.textContent = 'FINALIZAR VENTA';
  }
}

/**
 * Limpia la venta actual
 */
function handleClearSale() {
  currentSaleCart = [];
  currentCustomer = null;
  currentDiscount = 0;
  document.getElementById('customer-name').value = '';
  document.getElementById('payment-method').value = 'efectivo';
  document.getElementById('descuento').value = '';
  document.getElementById('discount-type').value = 'amount';
  renderSaleCart();
  updateSaleTotals();
}

/**
 * Maneja la aplicación de descuentos
 */
function handleApplyDiscount() {
  try {
    const discountInput = document.getElementById('descuento');
    const discountType = document.getElementById('discount-type');
    const discountValue = parseFloat(discountInput.value) || 0;
    
    if (discountValue < 0) {
      showNotification('El descuento no puede ser negativo', 'error');
      return;
    }

    const subtotal = currentSaleCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (discountType.value === 'percentage') {
      if (discountValue > 100) {
        showNotification('El descuento no puede ser mayor al 100%', 'error');
        return;
      }
      currentDiscount = (subtotal * discountValue) / 100;
    } else {
      if (discountValue > subtotal) {
        showNotification('El descuento no puede ser mayor al subtotal', 'error');
        return;
      }
      currentDiscount = discountValue;
    }

    updateSaleTotals();
    showNotification(`Descuento de ${formatCurrency(currentDiscount)} aplicado`, 'success');
    
  } catch (error) {
    console.error('❌ Error al aplicar descuento:', error);
    showNotification('Error al aplicar descuento', 'error');
  }
}

/**
 * Genera un número de venta único
 */
function generateSaleNumber() {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const time = now.getTime().toString().slice(-4);
  
  return `#${year}${month}${day}${time}`;
}

/**
 * Muestra el modal del recibo
 */
function showReceiptModal(saleData) {
  const modal = document.getElementById('receipt-modal');
  const content = document.getElementById('receipt-content');
  
  content.innerHTML = createReceiptHTML(saleData);
  modal.classList.remove('hidden');
}

/**
 * Cierra el modal del recibo
 */
function closeReceiptModal() {
  const modal = document.getElementById('receipt-modal');
  modal.classList.add('hidden');
}

/**
 * Crea el HTML del recibo
 */
function createReceiptHTML(saleData) {
  return `
    <div class="text-center mb-4">
      <h2 class="text-xl font-bold">ROSEMA MODA FAMILIAR</h2>
      <p class="text-sm text-gray-600">Salto de las Rosas, Mendoza AR</p>
      <p class="text-sm text-gray-600">Tel: +54 9 260 4381502</p>
    </div>
    
    <div class="border-t border-b border-gray-300 py-2 mb-4">
      <div class="flex justify-between text-sm">
        <span>Venta: ${saleData.saleNumber}</span>
        <span>${formatDateTime(saleData.createdAt)}</span>
      </div>
      <div class="text-sm">
        <span>Cliente: ${saleData.customerName}</span>
      </div>
    </div>
    
    <div class="space-y-2 mb-4">
      ${saleData.items.map(item => `
        <div class="flex justify-between text-sm">
          <div class="flex-1">
            <p class="font-medium">${item.name}</p>
            <p class="text-gray-500">${item.quantity} x ${formatCurrency(item.price)}</p>
          </div>
          <div class="text-right">
            <p class="font-medium">${formatCurrency(item.subtotal)}</p>
          </div>
        </div>
      `).join('')}
    </div>
    
    <div class="border-t border-gray-300 pt-2">
      <div class="flex justify-between font-semibold">
        <span>TOTAL:</span>
        <span>${formatCurrency(saleData.total)}</span>
      </div>
      <div class="text-sm text-gray-600 mt-1">
        Pago: ${saleData.paymentMethod.charAt(0).toUpperCase() + saleData.paymentMethod.slice(1)}
      </div>
    </div>
    
    <div class="text-center mt-4 text-xs text-gray-500">
      <p>¡Gracias por su compra!</p>
      <p>Síguenos en nuestras redes sociales</p>
    </div>
  `;
}

/**
 * Imprime el recibo
 */
function printReceipt() {
  const receiptContent = document.getElementById('receipt-content').innerHTML;
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Recibo de Venta - Rosema</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          font-size: 12px; 
          line-height: 1.4; 
          margin: 20px;
          max-width: 300px;
        }
        .text-center { text-align: center; }
        .text-sm { font-size: 11px; }
        .text-xs { font-size: 10px; }
        .font-bold { font-weight: bold; }
        .font-medium { font-weight: 500; }
        .font-semibold { font-weight: 600; }
        .text-gray-600 { color: #666; }
        .text-gray-500 { color: #888; }
        .border-t { border-top: 1px solid #ccc; }
        .border-b { border-bottom: 1px solid #ccc; }
        .py-2 { padding: 8px 0; }
        .mb-4 { margin-bottom: 16px; }
        .mt-4 { margin-top: 16px; }
        .pt-2 { padding-top: 8px; }
        .space-y-2 > * + * { margin-top: 8px; }
        .flex { display: flex; }
        .justify-between { justify-content: space-between; }
        .flex-1 { flex: 1; }
        .text-right { text-align: right; }
      </style>
    </head>
    <body>
      ${receiptContent}
    </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}

/**
 * Carga las ventas recientes
 */
async function loadRecentSales() {
  try {
    const db = window.firebaseDB();
    if (!db) {
      console.warn('Firebase no disponible para cargar ventas');
      return;
    }

    const salesSnapshot = await db.collection('sales')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    
    const sales = [];
    salesSnapshot.forEach((doc) => {
      sales.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    renderSalesTable(sales);
    
  } catch (error) {
    console.error('❌ Error al cargar ventas:', error);
    showNotification('Error al cargar las ventas', 'error');
  }
}

/**
 * Renderiza la tabla de ventas
 */
function renderSalesTable(sales) {
  const tbody = document.getElementById('sales-table-body');
  const countElement = document.getElementById('sales-count');
  
  if (!tbody) return;

  countElement.textContent = sales.length;

  if (sales.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="px-6 py-12 text-center text-gray-500">
          <div class="text-4xl mb-2">💰</div>
          <p>No hay ventas registradas</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = sales.map(sale => `
    <tr class="hover:bg-gray-50">
      <td class="px-6 py-4 whitespace-nowrap">
        <input type="checkbox" class="sale-checkbox rounded border-gray-300" data-id="${sale.id}">
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-sm font-medium text-blue-600">${sale.saleNumber}</div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-sm text-gray-900">${formatDateTime(sale.createdAt)}</div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-sm text-gray-900">${sale.customerName}</div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-sm font-semibold text-gray-900">${formatCurrency(sale.total)}</div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-sm text-gray-900">${sale.items.length} unid.</div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          sale.paymentMethod === 'efectivo' ? 'bg-green-100 text-green-800' :
          sale.paymentMethod === 'tarjeta' ? 'bg-blue-100 text-blue-800' :
          sale.paymentMethod === 'transferencia' ? 'bg-purple-100 text-purple-800' :
          'bg-yellow-100 text-yellow-800'
        }">
          ${sale.paymentMethod.toUpperCase()}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button onclick="viewSaleDetails('${sale.id}')" class="text-blue-600 hover:text-blue-900 mr-3">
          Ver
        </button>
        <button onclick="printSaleReceipt('${sale.id}')" class="text-green-600 hover:text-green-900">
          Imprimir
        </button>
      </td>
    </tr>
  `).join('');
}

// Funciones globales para los botones de la tabla
window.addProductToSale = addProductToSale;
window.updateSaleItemQuantity = updateSaleItemQuantity;
window.removeSaleItem = removeSaleItem;

window.viewSaleDetails = (saleId) => {
  // TODO: Implementar vista de detalles de venta
  showNotification('Funcionalidad en desarrollo', 'info');
};

window.printSaleReceipt = (saleId) => {
  // TODO: Implementar reimpresión de recibo
  showNotification('Funcionalidad en desarrollo', 'info');
};

/**
 * Maneja la exportación de ventas
 */
async function handleExportSales() {
  try {
    showNotification('Exportando ventas...', 'info');
    
    const db = window.firebaseDB();
    if (!db) {
      showNotification('Firebase no disponible para exportar', 'error');
      return;
    }

    const salesSnapshot = await db.collection('sales')
      .orderBy('createdAt', 'desc')
      .get();
    
    const sales = [];
    salesSnapshot.forEach((doc) => {
      const saleData = doc.data();
      sales.push({
        'Número de Venta': saleData.saleNumber,
        'Fecha': formatDateTime(saleData.createdAt),
        'Cliente': saleData.customerName,
        'Total': saleData.total,
        'Descuento': saleData.discount || 0,
        'Subtotal': saleData.subtotal,
        'Método de Pago': saleData.paymentMethod,
        'Productos': saleData.items.length,
        'Estado': saleData.status
      });
    });

    if (sales.length === 0) {
      showNotification('No hay ventas para exportar', 'warning');
      return;
    }

    // Convertir a CSV
    const headers = Object.keys(sales[0]);
    const csvContent = [
      headers.join(','),
      ...sales.map(sale => 
        headers.map(header => {
          const value = sale[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');

    // Descargar archivo
    const fileName = `ventas_${new Date().toISOString().split('T')[0]}.csv`;
    downloadFile(csvContent, fileName, 'text/csv');
    
    showNotification(`${sales.length} ventas exportadas exitosamente`, 'success');

  } catch (error) {
    console.error('❌ Error al exportar ventas:', error);
    showNotification('Error al exportar ventas', 'error');
  }
}
