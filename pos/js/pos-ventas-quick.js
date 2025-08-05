/**
 * Funciones para producto rápido en ventas
 */

/**
 * Configura los event listeners para producto rápido
 */
function setupQuickProductEvents() {
  // Botón producto rápido
  const btnQuickProduct = document.getElementById('btn-quick-product');
  if (btnQuickProduct) {
    btnQuickProduct.addEventListener('click', openQuickProductModal);
  }

  // Modal de producto rápido
  const cancelQuickProduct = document.getElementById('cancel-quick-product');
  const saveQuickProduct = document.getElementById('save-quick-product');
  
  if (cancelQuickProduct) {
    cancelQuickProduct.addEventListener('click', closeQuickProductModal);
  }
  
  if (saveQuickProduct) {
    saveQuickProduct.addEventListener('click', handleSaveQuickProduct);
  }

  // Cerrar modal al hacer click fuera
  document.getElementById('quick-product-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'quick-product-modal') {
      closeQuickProductModal();
    }
  });
}

/**
 * Abre el modal de producto rápido
 */
function openQuickProductModal() {
  const modal = document.getElementById('quick-product-modal');
  document.getElementById('quick-product-form').reset();
  document.getElementById('quick-product-quantity').value = '1';
  modal.classList.remove('hidden');
  document.getElementById('quick-product-name').focus();
}

/**
 * Cierra el modal de producto rápido
 */
function closeQuickProductModal() {
  const modal = document.getElementById('quick-product-modal');
  modal.classList.add('hidden');
}

/**
 * Maneja el guardado del producto rápido
 */
function handleSaveQuickProduct() {
  try {
    const name = document.getElementById('quick-product-name').value.trim();
    const size = document.getElementById('quick-product-size').value.trim();
    const price = parseFloat(document.getElementById('quick-product-price').value);
    const quantity = parseInt(document.getElementById('quick-product-quantity').value) || 1;

    if (!name || !price || price <= 0) {
      showNotification('Nombre y precio son requeridos', 'error');
      return;
    }

    // Crear producto temporal para la venta
    const quickProduct = {
      id: generateId(),
      productId: 'quick-' + generateId(),
      name: size ? `${name} (${size})` : name,
      price: price,
      sku: 'QUICK-' + Date.now(),
      quantity: quantity,
      maxStock: 999, // Stock ilimitado para productos rápidos
      isQuickProduct: true
    };

    // Agregar al carrito
    currentSaleCart.push(quickProduct);
    
    renderSaleCart();
    updateSaleTotals();
    closeQuickProductModal();
    
    showNotification(`${quickProduct.name} agregado a la venta`, 'success');

  } catch (error) {
    console.error('❌ Error al agregar producto rápido:', error);
    showNotification('Error al agregar producto rápido', 'error');
  }
}

// Llamar a la configuración cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(setupQuickProductEvents, 1000);
});
