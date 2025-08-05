/**
 * Corrección para la funcionalidad de ventas
 */

// Sobrescribir la función addProductToSale con debugging
window.addProductToSale = function(productId) {
  console.log('🔍 Buscando producto con ID:', productId);
  console.log('📦 Productos disponibles:', allProducts.length);
  
  const product = allProducts.find(p => p.id === productId);
  if (!product) {
    console.error('❌ Producto no encontrado con ID:', productId);
    console.log('📋 IDs disponibles:', allProducts.map(p => p.id));
    showNotification('Producto no encontrado', 'error');
    return;
  }

  console.log('✅ Producto encontrado:', product.name);

  if ((product.stock || 0) <= 0) {
    showNotification('Producto sin stock disponible', 'warning');
    return;
  }

  // Verificar si ya está en el carrito
  const existingItem = currentSaleCart.find(item => item.productId === productId);
  
  if (existingItem) {
    if (existingItem.quantity >= product.stock) {
      showNotification('No hay más stock disponible', 'warning');
      return;
    }
    existingItem.quantity++;
  } else {
    currentSaleCart.push({
      id: generateId(),
      productId: productId,
      name: product.name,
      price: product.price || 0,
      originalPrice: product.originalPrice,
      sku: product.sku,
      image: product.images?.[0],
      quantity: 1,
      maxStock: product.stock || 0
    });
  }

  renderSaleCart();
  updateSaleTotals();
  
  // Limpiar búsqueda
  document.getElementById('product-search').value = '';
  document.getElementById('search-results').classList.add('hidden');
  
  showNotification(`${product.name} agregado a la venta`, 'success');
};

// Asegurar que las funciones estén disponibles globalmente
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔧 Aplicando correcciones de ventas...');
  
  // Verificar que las variables globales estén disponibles
  if (typeof currentSaleCart === 'undefined') {
    window.currentSaleCart = [];
  }
  if (typeof allProducts === 'undefined') {
    window.allProducts = [];
  }
});
