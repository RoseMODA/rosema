/**
 * Módulo de UI
 * Maneja el renderizado de la interfaz de usuario, carruseles, tarjetas de producto y modales
 */

import { categorySubcategories, getProductById } from './productsModule.js';

/**
 * Returns the correct image path based on the current page URL.
 * If the current page is in a subfolder (i.e., /categories/), it prefixes "../".
 * @param {string} path - Original image path from the product data.
 * @returns {string} - Adjusted image path.
 */
function getImagePath(path) {
  // If current path includes '/categories/', update the image path
  if (window.location.pathname.includes('/categories/') && !path.startsWith('../')) {
    return '../' + path;
  }
  return path;
}

/**
 * Detecta si es un dispositivo móvil
 * @returns {boolean}
 */
function isMobileDevice() {
  return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Crea una tarjeta de producto para el carrusel
 * @param {Object} product - Objeto del producto
 * @returns {string} HTML de la tarjeta del producto
 */
function createProductCard(product) {
  const discountBadge = product.discount ? 
    `<div class="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-xs font-bold rounded">-${product.discount}%</div>` : '';
  
  const priceHTML = product.originalPrice ? 
    `<p class="product-price line-through text-gray-500">$ ${product.originalPrice.toLocaleString()}</p>
     <p class="product-price text-red-600 font-bold">$ ${product.price.toLocaleString()}</p>` :
    `<p class="product-price">$ ${product.price.toLocaleString()}</p>`;
  
  return `
    <article class="carousel-item relative cursor-pointer hover:transform hover:scale-105 transition-transform" 
             role="group" aria-label="${product.name}, precio ${product.price} pesos argentinos"
             data-product-id="${product.id}">
      ${discountBadge}
      <img src="${getImagePath(product.images[0])}" loading="lazy" alt="${product.name}"
           onerror="this.style.display='none';" class="product-image"/>
      <h3 class="product-title">${product.name}</h3>
      ${priceHTML}
      <p class="product-sku">${product.sku}</p>
      <div class="mt-2">
        <span class="text-xs text-gray-500">Stock: ${product.stock}</span>
      </div>
    </article>
  `;
}

/**
 * Crea una tarjeta de producto para el catálogo
 * @param {Object} product - Objeto del producto
 * @returns {string} HTML de la tarjeta del producto
 */
function createCatalogProductCard(product) {
  const discountBadge = product.discount ? 
    `<div class="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-xs font-bold rounded">-${product.discount}%</div>` : '';
  
  const priceHTML = product.originalPrice ? 
    `<p class="text-sm line-through text-gray-500">$ ${product.originalPrice.toLocaleString()}</p>
     <p class="text-lg font-bold text-red-600">$ ${product.price.toLocaleString()}</p>` :
    `<p class="text-lg font-bold">$ ${product.price.toLocaleString()}</p>`;
  
  return `
    <div class="catalog-product-card bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow relative"
         data-product-id="${product.id}">
      ${discountBadge}
      <div class="aspect-square overflow-hidden">
        <img src="${getImagePath(product.images[0])}" loading="lazy" alt="${product.name}"
             class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
             onerror="this.style.display='none';"/>
      </div>
      <div class="p-4">
        <h3 class="font-semibold text-gray-900 mb-2">${product.name}</h3>
        <div class="mb-2">
          ${priceHTML}
        </div>
        <p class="text-xs text-gray-500 mb-2">SKU: ${product.sku}</p>
        <p class="text-xs text-gray-600 mb-2">${product.description}</p>
        <div class="flex justify-between items-center">
          <span class="text-xs text-gray-500">Stock: ${product.stock}</span>
          <span class="text-xs bg-gray-100 px-2 py-1 rounded">${product.category.toUpperCase()}</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Actualiza el track del carrusel con productos
 * @param {string} trackId - ID del elemento track
 * @param {Array} products - Array de productos
 */
function updateCarouselTrack(trackId, products) {
  const track = document.getElementById(trackId);
  if (!track) {
    console.warn(`⚠️ Track con ID '${trackId}' no encontrado`);
    return;
  }
  
  if (products.length === 0) {
    track.innerHTML = '<div class="text-center text-gray-500 py-8">No hay productos disponibles</div>';
    return;
  }
  
  track.innerHTML = products.map(product => createProductCard(product)).join('');
  
  // Agregar event listeners a las tarjetas de producto
  track.querySelectorAll('.carousel-item').forEach(item => {
    item.addEventListener('click', () => {
      const productId = parseInt(item.dataset.productId);
      openProductModal(productId);
    });
  });
}

/**
 * Renderiza productos en el grid del catálogo
 * @param {Array} products - Array de productos
 * @param {string} gridId - ID del contenedor grid
 */
function renderCatalogGrid(products, gridId = 'catalog-grid') {
  const catalogGrid = document.getElementById(gridId);
  const noResults = document.getElementById('no-results');
  
  if (!catalogGrid) {
    console.warn(`⚠️ Grid con ID '${gridId}' no encontrado`);
    return;
  }
  
  if (products.length === 0) {
    catalogGrid.innerHTML = '';
    if (noResults) noResults.classList.remove('hidden');
  } else {
    if (noResults) noResults.classList.add('hidden');
    catalogGrid.innerHTML = products.map(product => createCatalogProductCard(product)).join('');
    
    // Agregar event listeners a las tarjetas de producto
    catalogGrid.querySelectorAll('.catalog-product-card').forEach(item => {
      item.addEventListener('click', () => {
        const productId = parseInt(item.dataset.productId);
        openProductModal(productId);
      });
    });
  }
}

/**
 * Actualiza el contador de resultados
 * @param {number} count - Número de productos encontrados
 * @param {string} elementId - ID del elemento contador
 */
function updateResultsCount(count, elementId = 'results-count') {
  const resultsCount = document.getElementById(elementId);
  if (resultsCount) {
    resultsCount.textContent = `${count} producto${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}`;
  }
}

/**
 * Configura el menú de subcategorías
 * @param {string} category - Categoría actual
 * @param {Function} clickHandler - Función para manejar clicks
 */
function setupSubcategoryMenu(category, clickHandler) {
  const subcategoryMenu = document.getElementById('subcategory-menu');
  if (!subcategoryMenu || !categorySubcategories[category]) {
    console.warn(`⚠️ No se pudo configurar el menú de subcategorías para: ${category}`);
    return;
  }
  
  const menuHTML = categorySubcategories[category].items.map(item => {
    const activeClass = item.active ? 'active' : '';
    const seasonClass = item.class || '';
    return `
      <a href="#" class="subcategory-item ${activeClass} ${seasonClass}" 
         data-category="${category}" 
         data-subcategory="${item.type}"
         data-season="${item.season || ''}">
        ${item.name}
      </a>
    `;
  }).join('');
  
  subcategoryMenu.innerHTML = menuHTML;
  
  // Agregar event listeners
  subcategoryMenu.querySelectorAll('.subcategory-item').forEach(item => {
    item.addEventListener('click', clickHandler);
  });
}

/**
 * Configura el menú móvil de subcategorías
 * @param {string} category - Categoría actual
 * @param {Function} clickHandler - Función para manejar clicks
 */
function setupMobileSubcategoryMenu(category, clickHandler) {
  const toggleBtn = document.getElementById('toggle-subcategories');
  const menu = document.getElementById('mobile-subcategory-menu');
  const categoryLabel = document.getElementById('mobile-category-name');
  
  if (!toggleBtn || !menu || !categorySubcategories[category]) {
    console.warn(`⚠️ No se pudo configurar el menú móvil de subcategorías para: ${category}`);
    return;
  }
  
  // Actualizar el nombre de la categoría
  if (categoryLabel) {
    categoryLabel.textContent = category.toUpperCase();
  }
  
  // Generar HTML del menú
  const menuHTML = categorySubcategories[category].items.map(item => `
    <a href="#" class="block text-gray-700 font-medium py-2 px-3 rounded hover:bg-gray-100 subcategory-item
       ${item.active ? 'active' : ''} ${item.class || ''}"
       data-category="${category}"
       data-subcategory="${item.type}"
       data-season="${item.season || ''}">
      ${item.name}
    </a>
  `).join('');
  
  menu.innerHTML = menuHTML;
  
  // Agregar event listeners
  menu.querySelectorAll('a').forEach(item => {
    item.addEventListener('click', (e) => {
      clickHandler(e);
      menu.classList.add('hidden'); // Ocultar menú después de selección
    });
  });
  
  // Toggle del menú
  toggleBtn.addEventListener('click', () => {
    menu.classList.toggle('hidden');
  });
}

/**
 * Obtiene el código de color para mostrar en la UI
 * @param {string} colorName - Nombre del color
 * @returns {string} Código hexadecimal del color
 */
function getColorCode(colorName) {
  const colorMap = {
    'Verde militar': '#4a5d23',
    'Negro': '#000000',
    'Gris': '#808080',
    'Blanco': '#ffffff',
    'Violeta': '#8a2be2',
    'Rosa': '#ffc0cb',
    'Morado': '#800080',
    'Bordo': '#800020',
    'Marrón': '#8b4513',
    'Beige': '#f5f5dc',
    'Rojo': '#ff0000',
    'Azul marino': '#000080',
    'Celeste': '#87ceeb',
    'Amarillo': '#ffff00',
    'Azul': '#0000ff'
  };
  
  return colorMap[colorName] || '#cccccc';
}

/**
 * Crea el HTML del modal de producto con botón para ver detalles completos
 * @param {Object} product - Objeto del producto
 * @returns {string} HTML del modal
 */
function createProductModalHTML(product) {
  const discountBadge = product.discount ? 
    `<span class="bg-red-600 text-white px-2 py-1 text-sm font-bold rounded ml-2">-${product.discount}%</span>` : '';
  
  const priceHTML = product.originalPrice ? 
    `<p class="text-lg line-through text-gray-500">$ ${product.originalPrice.toLocaleString()}</p>
     <p class="text-2xl font-bold text-red-600">$ ${product.price.toLocaleString()}</p>` :
    `<p class="text-2xl font-bold">$ ${product.price.toLocaleString()}</p>`;
  
  const colorOptions = product.colors.map(color => 
    `<button class="color-option w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-600" 
             data-color="${color}" title="${color}" style="background-color: ${getColorCode(color)}"></button>`
  ).join('');
  
  const sizeOptions = product.sizes.map(size => 
    `<button class="size-option px-3 py-2 border border-gray-300 hover:border-gray-600 hover:bg-gray-100" 
             data-size="${size}">${size}</button>`
  ).join('');
  
  return `
    <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center p-4 border-b">
        <h2 class="text-xl font-bold">${product.name}${discountBadge}</h2>
        <button class="close-modal text-2xl text-gray-500 hover:text-gray-700">×</button>
      </div>
      
      <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Product Images -->
        <div>
          <div class="main-image mb-4">
            <img src="${getImagePath(product.images[0])}" alt="${product.name}" 
                 class="w-full h-96 object-cover rounded-lg" id="main-product-image">
          </div>
          ${product.images.length > 1 ? `
            <div class="flex space-x-2">
              ${product.images.map((img, index) => 
                `<img src="${getImagePath(img)}" alt="${product.name}" 
                      class="w-16 h-16 object-cover rounded cursor-pointer border-2 ${index === 0 ? 'border-gray-600' : 'border-gray-300'}" 
                      onclick="changeMainImage('${getImagePath(img)}', this)">`
              ).join('')}
            </div>
          ` : ''}
        </div>
        
        <!-- Product Details -->
        <div>
          <div class="mb-4">
            ${priceHTML}
            <p class="text-sm text-gray-500 mt-1">SKU: ${product.sku}</p>
            <p class="text-sm text-gray-600 mt-2">${product.description}</p>
          </div>
          
          <!-- Color Selection -->
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Color:</label>
            <div class="flex space-x-2 flex-wrap">
              ${colorOptions}
            </div>
            <p class="text-sm text-gray-600 mt-1" id="selected-color">Selecciona un color</p>
          </div>
          
          <!-- Size Selection -->
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Talla:</label>
            <div class="flex space-x-2 flex-wrap">
              ${sizeOptions}
            </div>
            <p class="text-sm text-gray-600 mt-1" id="selected-size">Selecciona una talla</p>
          </div>
          
          <!-- Quantity -->
          <div class="mb-6">
            <label class="block text-sm font-medium mb-2">Cantidad:</label>
            <div class="flex items-center space-x-3">
              <button class="quantity-btn px-3 py-1 border border-gray-300 hover:bg-gray-100" data-action="decrease">-</button>
              <span class="quantity-display px-4 py-1 border border-gray-300 min-w-[3rem] text-center">1</span>
              <button class="quantity-btn px-3 py-1 border border-gray-300 hover:bg-gray-100" data-action="increase">+</button>
            <p class="text-sm text-gray-600 mt-1">Stock disponible: ${product.stock}</p>
          </div>
          
          <!-- Action Buttons -->
          <div class="space-y-3">
            <button class="add-to-cart w-full bg-[#d63629] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#b22a26] transition-colors">
              AÑADIR AL CARRITO
            </button>
            <button class="view-details w-full bg-gray-800 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                    onclick="window.location.href='${window.location.pathname.includes('/categories/') ? '../' : ''}product.html?id=${product.id}'">
              VER DETALLES COMPLETOS
            </button>
            <button class="whatsapp-inquiry w-full bg-[#25D366] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#1ebe57] transition-colors">
              CONSULTAR STOCK POR WHATSAPP
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Abre el modal de producto o navega a la página completa según el dispositivo
 * @param {number} productId - ID del producto
 */
function openProductModal(productId) {
  const product = getProductById(productId);
  if (!product) {
    console.error(`❌ Producto con ID ${productId} no encontrado`);
    showNotification('Producto no encontrado', 'error');
    return;
  }
  
  // Detectar si es móvil
  if (isMobileDevice()) {
    // En móvil, navegar a la página completa del producto
    // Ajustar la ruta según si estamos en una subcarpeta o no
    const productUrl = window.location.pathname.includes('/categories/') 
      ? `../product.html?id=${productId}` 
      : `product.html?id=${productId}`;
    window.location.href = productUrl;
    return;
  }
  
  // En desktop, mostrar modal de vista rápida
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  modal.innerHTML = createProductModalHTML(product);
  
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  
  // Configurar event listeners del modal
  setupProductModalListeners(modal, product);
}

/**
 * Configura los event listeners del modal de producto
 * @param {HTMLElement} modal - Elemento del modal
 * @param {Object} product - Objeto del producto
 */
function setupProductModalListeners(modal, product) {
  let selectedColor = '';
  let selectedSize = '';
  let quantity = 1;
  
  // Cerrar modal
  const closeBtn = modal.querySelector('.close-modal');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => closeModal(modal));
  }
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(modal);
  });
  
  // Selección de color
  modal.querySelectorAll('.color-option').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('.color-option').forEach(b => b.classList.remove('ring-2', 'ring-gray-600'));
      btn.classList.add('ring-2', 'ring-gray-600');
      selectedColor = btn.dataset.color;
      const selectedColorEl = modal.querySelector('#selected-color');
      if (selectedColorEl) {
        selectedColorEl.textContent = `Color seleccionado: ${selectedColor}`;
      }
    });
  });
  
  // Selección de talla
  modal.querySelectorAll('.size-option').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('.size-option').forEach(b => b.classList.remove('bg-gray-200', 'border-gray-600'));
      btn.classList.add('bg-gray-200', 'border-gray-600');
      selectedSize = btn.dataset.size;
      const selectedSizeEl = modal.querySelector('#selected-size');
      if (selectedSizeEl) {
        selectedSizeEl.textContent = `Talla seleccionada: ${selectedSize}`;
      }
    });
  });
  
  // Controles de cantidad
  modal.querySelectorAll('.quantity-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const display = modal.querySelector('.quantity-display');
      
      if (action === 'increase' && quantity < product.stock) {
        quantity++;
      } else if (action === 'decrease' && quantity > 1) {
        quantity--;
      }
      
      if (display) {
        display.textContent = quantity;
      }
    });
  });
  
  // Agregar al carrito
  const addToCartBtn = modal.querySelector('.add-to-cart');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      if (!selectedColor || !selectedSize) {
        showNotification('Por favor selecciona color y talla', 'warning');
        return;
      }
      
      // Importar dinámicamente el módulo del carrito
      import('./cartModule.js').then(({ addToCart }) => {
        addToCart(product, selectedColor, selectedSize, quantity);
        closeModal(modal);
      }).catch(error => {
        console.error('Error al cargar el módulo del carrito:', error);
        showNotification('Error al agregar al carrito', 'error');
      });
    });
  }
  
  // Consulta por WhatsApp
  const whatsappBtn = modal.querySelector('.whatsapp-inquiry');
  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', () => {
      const message = `Hola! Me interesa consultar sobre el producto:
    
📦 *${product.name}*
💰 Precio: $${product.price.toLocaleString()}
🏷️ SKU: ${product.sku}
${selectedColor ? `🎨 Color: ${selectedColor}` : ''}
${selectedSize ? `📏 Talla: ${selectedSize}` : ''}

¿Tienen stock disponible?`;
      
      const whatsappUrl = `https://wa.me/5492604381502?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    });
  }
}

/**
 * Cierra el modal
 * @param {HTMLElement} modal - Elemento del modal
 */
function closeModal(modal) {
  if (modal && modal.parentNode) {
    document.body.removeChild(modal);
    document.body.style.overflow = 'auto';
  }
}

/**
 * Cambia la imagen principal del modal
 * @param {string} src - URL de la imagen
 * @param {HTMLElement} thumbnail - Elemento thumbnail clickeado
 */
function changeMainImage(src, thumbnail) {
  const mainImage = document.getElementById('main-product-image');
  if (mainImage) {
    mainImage.src = src;
  }
  
  // Actualizar bordes de thumbnails
  if (thumbnail && thumbnail.parentElement) {
    const thumbnails = thumbnail.parentElement.querySelectorAll('img');
    thumbnails.forEach(thumb => {
      thumb.classList.remove('border-gray-600');
      thumb.classList.add('border-gray-300');
    });
    thumbnail.classList.remove('border-gray-300');
    thumbnail.classList.add('border-gray-600');
  }
}

/**
 * Muestra una notificación al usuario
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación (success, error, warning, info)
 */
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  
  const typeClasses = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-600',
    info: 'bg-blue-600'
  };
  
  notification.className = `fixed top-4 right-4 ${typeClasses[type] || typeClasses.success} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-transform duration-300 translate-x-full`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Animación de entrada
  setTimeout(() => {
    notification.classList.remove('translate-x-full');
  }, 100);
  
  // Remover después de 3 segundos
  setTimeout(() => {
    notification.classList.add('translate-x-full');
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

/**
 * Configura el carrusel
 */
function setupCarousel() {
  const carousels = document.querySelectorAll('.carousel');
  
  carousels.forEach((carousel) => {
    const track = carousel.querySelector('.carousel-track');
    const prevBtn = carousel.querySelector('.prev');
    const nextBtn = carousel.querySelector('.next');
    
    if (!track || !prevBtn || !nextBtn) return;
    
    const items = track.children;
    const totalItems = items.length;
    let currentIndex = 0;

    // Número de elementos visibles según el ancho de pantalla
    function getVisibleCount() {
      const w = window.innerWidth;
      if (w < 400) return 1;
      if (w < 640) return 2;
      if (w < 1024) return 3;
      return 4;
    }

    // Actualizar posición del carrusel
    function updateCarousel() {
      const visibleCount = getVisibleCount();
      const maxIndex = Math.max(0, totalItems - visibleCount);
      if (currentIndex < 0) currentIndex = 0;
      if (currentIndex > maxIndex) currentIndex = maxIndex;

      const translateX = -(currentIndex * (100 / visibleCount));
      track.style.transform = `translateX(${translateX}%)`;
    }

    prevBtn.addEventListener('click', () => {
      currentIndex--;
      updateCarousel();
    });

    nextBtn.addEventListener('click', () => {
      currentIndex++;
      updateCarousel();
    });

    // Actualizar en resize
    window.addEventListener('resize', updateCarousel);

    // Inicializar carrusel
    updateCarousel();
  });
}

/**
 * Configura el menú móvil
 */
function setupMobileMenu() {
  const toggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  if (toggle && mobileMenu) {
    toggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }
}

// Hacer disponible globalmente para el HTML inline
window.changeMainImage = changeMainImage;

// Exportar funciones
export {
  createProductCard,
  createCatalogProductCard,
  updateCarouselTrack,
  renderCatalogGrid,
  updateResultsCount,
  setupSubcategoryMenu,
  setupMobileSubcategoryMenu,
  openProductModal,
  showNotification,
  setupCarousel,
  setupMobileMenu,
  getColorCode,
  getImagePath,
  isMobileDevice
};
