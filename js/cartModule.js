/**
 * Módulo del Carrito
 * Maneja toda la funcionalidad del carrito de compras, localStorage y checkout
 */

import { showNotification } from './uiModule.js';

// Variable global para el carrito
let cart = [];

// Clave para localStorage
const CART_STORAGE_KEY = 'rosema-cart';

/**
 * Inicializa el carrito cargando datos desde localStorage
 */
function initializeCart() {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    cart = savedCart ? JSON.parse(savedCart) : [];
    console.log(`🛒 Carrito inicializado con ${cart.length} productos`);
    updateCartUI();
  } catch (error) {
    console.error('❌ Error al cargar el carrito desde localStorage:', error);
    cart = [];
    showNotification('Error al cargar el carrito', 'error');
  }
}

/**
 * Guarda el carrito en localStorage
 */
function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    console.log('💾 Carrito guardado en localStorage');
  } catch (error) {
    console.error('❌ Error al guardar el carrito:', error);
    showNotification('Error al guardar el carrito', 'error');
  }
}

/**
 * Agrega un producto al carrito
 * @param {Object} product - Objeto del producto
 * @param {string} color - Color seleccionado
 * @param {string} size - Talla seleccionada
 * @param {number} quantity - Cantidad a agregar
 */
function addToCart(product, color, size, quantity = 1) {
  // Validar parámetros
  if (!product || !color || !size || quantity <= 0) {
    showNotification('Datos del producto incompletos', 'error');
    return false;
  }

  // Verificar stock disponible
  if (quantity > product.stock) {
    showNotification(`Solo hay ${product.stock} unidades disponibles`, 'warning');
    return false;
  }

  // Buscar si ya existe un producto igual en el carrito
  const existingItemIndex = cart.findIndex(item => 
    item.productId === product.id && 
    item.color === color && 
    item.size === size
  );

  if (existingItemIndex !== -1) {
    // Si existe, actualizar cantidad
    const existingItem = cart[existingItemIndex];
    const newQuantity = existingItem.quantity + quantity;
    
    if (newQuantity > product.stock) {
      showNotification(`Solo puedes agregar ${product.stock - existingItem.quantity} unidades más`, 'warning');
      return false;
    }
    
    existingItem.quantity = newQuantity;
    showNotification(`Cantidad actualizada: ${existingItem.name}`, 'success');
  } else {
    // Si no existe, crear nuevo item
    const cartItem = {
      id: Date.now() + Math.random(), // ID único para el item del carrito
      productId: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images[0],
      color: color,
      size: size,
      quantity: quantity,
      sku: product.sku,
      addedAt: new Date().toISOString()
    };
    
    cart.push(cartItem);
    showNotification(`Producto agregado: ${product.name}`, 'success');
  }

  saveCart();
  updateCartUI();
  return true;
}

/**
 * Remueve un producto del carrito
 * @param {number} itemId - ID del item en el carrito
 */
function removeFromCart(itemId) {
  const itemIndex = cart.findIndex(item => item.id === itemId);
  
  if (itemIndex === -1) {
    showNotification('Producto no encontrado en el carrito', 'error');
    return false;
  }

  const removedItem = cart.splice(itemIndex, 1)[0];
  saveCart();
  updateCartUI();
  showNotification(`Producto removido: ${removedItem.name}`, 'success');
  return true;
}

/**
 * Actualiza la cantidad de un producto en el carrito
 * @param {number} itemId - ID del item en el carrito
 * @param {number} newQuantity - Nueva cantidad
 */
function updateCartItemQuantity(itemId, newQuantity) {
  if (newQuantity <= 0) {
    return removeFromCart(itemId);
  }

  const item = cart.find(item => item.id === itemId);
  if (!item) {
    showNotification('Producto no encontrado en el carrito', 'error');
    return false;
  }

  // Aquí podrías validar contra el stock actual del producto
  // Por simplicidad, asumimos que la validación se hace en la UI
  
  item.quantity = newQuantity;
  saveCart();
  updateCartUI();
  return true;
}

/**
 * Vacía completamente el carrito
 */
function clearCart() {
  cart = [];
  saveCart();
  updateCartUI();
  showNotification('Carrito vaciado', 'success');
}

/**
 * Obtiene el número total de productos en el carrito
 * @returns {number} Cantidad total de productos
 */
function getCartItemCount() {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Obtiene el precio total del carrito
 * @returns {number} Precio total
 */
function getCartTotal() {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

/**
 * Obtiene todos los items del carrito
 * @returns {Array} Array de items del carrito
 */
function getCartItems() {
  return [...cart]; // Retorna una copia para evitar mutaciones accidentales
}

/**
 * Actualiza la UI del carrito (badge del botón)
 */
function updateCartUI() {
  const cartButton = document.querySelector('button[aria-label="Carrito"]');
  if (!cartButton) return;

  const itemCount = getCartItemCount();
  let badge = cartButton.querySelector('.cart-badge');
  
  if (itemCount > 0) {
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'cart-badge absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold';
      cartButton.style.position = 'relative';
      cartButton.appendChild(badge);
    }
    badge.textContent = itemCount > 99 ? '99+' : itemCount.toString();
  } else {
    if (badge) {
      badge.remove();
    }
  }
}

/**
 * Crea el HTML del carrito lateral
 * @returns {string} HTML del carrito
 */
function createCartHTML() {
  const total = getCartTotal();
  const itemCount = getCartItemCount();
  
  const cartItems = cart.map(item => {
    const itemTotal = item.price * item.quantity;
    const originalPriceHTML = item.originalPrice ? 
      `<p class="text-xs line-through text-gray-400">$${item.originalPrice.toLocaleString()}</p>` : '';
    
    return `
      <div class="flex items-center space-x-3 p-3 border-b border-gray-100">
        <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded">
        <div class="flex-1 min-w-0">
          <h4 class="font-semibold text-sm truncate">${item.name}</h4>
          <p class="text-xs text-gray-600">${item.color} - ${item.size}</p>
          <div class="flex items-center space-x-2">
            ${originalPriceHTML}
            <p class="text-sm font-semibold text-gray-900">$${item.price.toLocaleString()}</p>
          </div>
          <p class="text-xs text-gray-500">Total: $${itemTotal.toLocaleString()}</p>
        </div>
        <div class="flex flex-col items-center space-y-2">
          <div class="flex items-center space-x-1">
            <button class="cart-quantity-btn w-6 h-6 flex items-center justify-center border border-gray-300 text-xs hover:bg-gray-100" 
                    data-action="decrease" data-id="${item.id}">-</button>
            <span class="px-2 text-sm font-medium min-w-[2rem] text-center">${item.quantity}</span>
            <button class="cart-quantity-btn w-6 h-6 flex items-center justify-center border border-gray-300 text-xs hover:bg-gray-100" 
                    data-action="increase" data-id="${item.id}">+</button>
          </div>
          <button class="remove-item text-red-600 hover:text-red-800 text-xs" data-id="${item.id}">
            🗑️ Eliminar
          </button>
        </div>
      </div>
    `;
  }).join('');
  
  return `
    <div class="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col">
      <div class="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
        <h2 class="text-xl font-bold text-gray-900">Carrito de Compras</h2>
        <button class="close-cart text-2xl text-gray-500 hover:text-gray-700 transition-colors">×</button>
      </div>
      
      <div class="flex-1 overflow-y-auto">
        ${cart.length === 0 ? 
          `<div class="flex flex-col items-center justify-center h-full p-8 text-center">
            <div class="text-6xl mb-4">🛒</div>
            <h3 class="text-lg font-semibold text-gray-600 mb-2">Tu carrito está vacío</h3>
            <p class="text-gray-500">Agrega algunos productos para comenzar</p>
          </div>` : 
          cartItems
        }
      </div>
      
      ${cart.length > 0 ? `
        <div class="border-t border-gray-200 bg-gray-50 p-4">
          <div class="flex justify-between items-center mb-4">
            <div>
              <p class="text-sm text-gray-600">${itemCount} producto${itemCount !== 1 ? 's' : ''}</p>
              <p class="text-xl font-bold text-gray-900">Total: $${total.toLocaleString()}</p>
            </div>
          </div>
          
          <div class="space-y-2">
            <button class="checkout-whatsapp w-full bg-[#25D366] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#1ebe57] transition-colors flex items-center justify-center space-x-2">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.52 3.48A11.86 11.86 0 0012 0C5.37 0 0 5.37 0 12c0 2.11.57 4.07 1.56 5.78L0 24l6.47-1.54A11.87 11.87 0 0012 24c6.63 0 12-5.37 12-12a11.86 11.86 0 00-3.48-8.52zM12 21.9a9.91 9.91 0 01-5.12-1.4l-.37-.22-3.84 .91.81-3.75-.24-.37a9.91 9.91 0 1111.67 3.63zm5.36-7.72c-.3-.15-1.76-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.77.97-.94 1.17-.17.2-.34.22-.64.07-.3-.15-1.26-.47-2.4-1.5-.89-.8-1.49-1.79-1.66-2.09-.17-.3-.02-.46.13-.61.14-.14.3-.37.45-.56.15-.2.2-.33.3-.55.1-.22.05-.42-.02-.58-.07-.15-.68-1.63-.93-2.24-.24-.59-.49-.51-.68-.52-.18 0-.39 0-.6 0-.2 0-.58.08-.88.42-.3.34-1.14 1.12-1.14 2.72s1.17 3.16 1.33 3.38c.16.22 2.29 3.5 5.55 4.91.78.34 1.39.54 1.87.69.79.25 1.51.21 2.08.13.63-.1 1.94-.79 2.21-1.56.27-.76.27-1.41.19-1.56-.07-.15-.27-.24-.57-.39z"/>
              </svg>
              <span>REALIZAR PEDIDO</span>
            </button>
            
            <button class="clear-cart w-full bg-gray-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors">
              VACIAR CARRITO
            </button>
          </div>
          
          <p class="text-xs text-gray-500 mt-3 text-center">
            El pedido se enviará por WhatsApp para coordinar retiro en tienda
          </p>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Muestra el carrito lateral
 */
function showCart() {
  // Cerrar carrito existente si está abierto
  const existingCart = document.getElementById('cart-sidebar');
  if (existingCart) {
    hideCart();
    return;
  }
  
  const cartSidebar = document.createElement('div');
  cartSidebar.id = 'cart-sidebar';
  cartSidebar.className = 'fixed inset-0 bg-black bg-opacity-50 z-50';
  cartSidebar.innerHTML = createCartHTML();
  
  document.body.appendChild(cartSidebar);
  document.body.style.overflow = 'hidden';
  
  setupCartListeners(cartSidebar);
}

/**
 * Oculta el carrito lateral
 */
function hideCart() {
  const cartSidebar = document.getElementById('cart-sidebar');
  if (cartSidebar) {
    document.body.removeChild(cartSidebar);
    document.body.style.overflow = 'auto';
  }
}

/**
 * Configura los event listeners del carrito
 * @param {HTMLElement} cartSidebar - Elemento del carrito lateral
 */
function setupCartListeners(cartSidebar) {
  // Cerrar carrito
  const closeBtn = cartSidebar.querySelector('.close-cart');
  if (closeBtn) {
    closeBtn.addEventListener('click', hideCart);
  }
  
  // Click fuera del carrito para cerrar
  cartSidebar.addEventListener('click', (e) => {
    if (e.target === cartSidebar) {
      hideCart();
    }
  });
  
  // Controles de cantidad
  cartSidebar.querySelectorAll('.cart-quantity-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const itemId = parseFloat(btn.dataset.id);
      const item = cart.find(i => i.id === itemId);
      
      if (!item) return;
      
      let newQuantity = item.quantity;
      if (action === 'increase') {
        newQuantity++;
      } else if (action === 'decrease') {
        newQuantity--;
      }
      
      updateCartItemQuantity(itemId, newQuantity);
      updateCartDisplay(cartSidebar);
    });
  });
  
  // Eliminar productos
  cartSidebar.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = parseFloat(btn.dataset.id);
      removeFromCart(itemId);
      updateCartDisplay(cartSidebar);
    });
  });
  
  // Checkout por WhatsApp
  const checkoutBtn = cartSidebar.querySelector('.checkout-whatsapp');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      const orderMessage = createWhatsAppOrderMessage();
      const whatsappUrl = `https://wa.me/5492604381502?text=${encodeURIComponent(orderMessage)}`;
      window.open(whatsappUrl, '_blank');
    });
  }
  
  // Vaciar carrito
  const clearBtn = cartSidebar.querySelector('.clear-cart');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        clearCart();
        updateCartDisplay(cartSidebar);
      }
    });
  }
}

/**
 * Actualiza la visualización del carrito
 * @param {HTMLElement} cartSidebar - Elemento del carrito lateral
 */
function updateCartDisplay(cartSidebar) {
  const newCartHTML = createCartHTML();
  cartSidebar.innerHTML = newCartHTML;
  setupCartListeners(cartSidebar);
}

/**
 * Crea el mensaje de pedido para WhatsApp
 * @returns {string} Mensaje formateado para WhatsApp
 */
function createWhatsAppOrderMessage() {
  const total = getCartTotal();
  const itemCount = getCartItemCount();
  
  let message = `🛍️ *NUEVO PEDIDO - ROSEMA*\n\n`;
  message += `📋 *DETALLE DEL PEDIDO:*\n`;
  
  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    message += `\n${index + 1}. *${item.name}*\n`;
    message += `   • Color: ${item.color}\n`;
    message += `   • Talla: ${item.size}\n`;
    message += `   • Cantidad: ${item.quantity}\n`;
    message += `   • Precio unitario: $${item.price.toLocaleString()}\n`;
    message += `   • Subtotal: $${itemTotal.toLocaleString()}\n`;
    message += `   • SKU: ${item.sku}\n`;
  });
  
  message += `\n💰 *RESUMEN:*\n`;
  message += `   • Total de productos: ${itemCount}\n`;
  message += `   • *TOTAL A PAGAR: $${total.toLocaleString()}*\n\n`;
  
  message += `📍 *INFORMACIÓN DE RETIRO:*\n`;
  message += `📍 Dirección: Salto de las Rosas, Mendoza AR\n`;
  message += `⏰ Horarios de atención:\n`;
  message += `   • Lunes a Sábado\n`;
  message += `   • Mañana: 9:00am a 1:00pm\n`;
  message += `   • Tarde: 5:00pm a 9:00pm\n\n`;
  
  message += `Por favor confirmen disponibilidad de stock y coordinen horario de retiro.\n`;
  message += `¡Muchas gracias! 😊`;
  
  return message;
}

/**
 * Configura el botón del carrito en la página
 */
function setupCartButton() {
  const cartButton = document.querySelector('button[aria-label="Carrito"]');
  if (cartButton) {
    cartButton.addEventListener('click', showCart);
  }
}

/**
 * Obtiene estadísticas del carrito
 * @returns {Object} Estadísticas del carrito
 */
function getCartStats() {
  return {
    itemCount: getCartItemCount(),
    uniqueProducts: cart.length,
    total: getCartTotal(),
    averageItemPrice: cart.length > 0 ? getCartTotal() / getCartItemCount() : 0,
    categories: [...new Set(cart.map(item => item.category))].length
  };
}

// Exportar funciones
export {
  initializeCart,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
  getCartItemCount,
  getCartTotal,
  getCartItems,
  showCart,
  hideCart,
  setupCartButton,
  getCartStats
};
