/**
 * Archivo JavaScript para la página de producto detallada
 */

import { getProductById, getRelatedProducts, loadProductsFromRoot } from './productsModule.js';
import { getColorCode, showNotification } from './uiModule.js';
import { addToCart } from './cartModule.js';

let currentProduct = null;
let selectedColor = '';
let selectedSize = '';
let quantity = 1;

/**
 * Inicializa la página de producto
 */
async function initializeProductPage() {
  try {
    console.log('🚀 Iniciando página de producto...');
    
    // Obtener ID del producto desde URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    if (!productId) {
      showNotification('Producto no encontrado', 'error');
      window.location.href = 'index.html';
      return;
    }
    
    // Cargar productos primero desde la ruta correcta (product.html está en la raíz)
    await loadProductsFromRoot();
    
    // Cargar producto
    currentProduct = getProductById(productId);
    if (!currentProduct) {
      showNotification('Producto no encontrado', 'error');
      window.location.href = 'index.html';
      return;
    }
    
    // Renderizar producto
    renderProduct();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Cargar productos relacionados
    loadRelatedProducts();
    
    console.log('✅ Página de producto inicializada correctamente');
    
  } catch (error) {
    console.error('❌ Error al inicializar página de producto:', error);
    showNotification('Error al cargar el producto', 'error');
  }
}

/**
 * Renderiza la información del producto
 */
function renderProduct() {
  if (!currentProduct) return;
  
  // Título de la página
  document.title = `${currentProduct.name} - Rosema Moda Familiar`;
  
  // Breadcrumb
  renderBreadcrumb();
  
  // Imagen principal
  const mainImage = document.getElementById('main-product-image');
  mainImage.src = currentProduct.images[0];
  mainImage.alt = currentProduct.name;
  
  // Galería de thumbnails
  renderThumbnailGallery();
  
  // Nombre del producto
  document.getElementById('product-name').textContent = currentProduct.name;
  
  // Precio
  renderPrice();
  
  // SKU
  document.getElementById('product-sku').textContent = `SKU: ${currentProduct.sku}`;
  
  // Tags/Categorías
  renderTags();
  
  // Opciones de color
  renderColorOptions();
  
  // Opciones de talla
  renderSizeOptions();
  
  // Descripción
  document.getElementById('product-description').textContent = currentProduct.description;
}

/**
 * Renderiza el breadcrumb
 */
function renderBreadcrumb() {
  const categoryElement = document.getElementById('breadcrumb-category');
  const tagsElement = document.getElementById('breadcrumb-tags');
  
  // Categoría principal
  categoryElement.textContent = currentProduct.category.toUpperCase();
  categoryElement.onclick = () => {
    window.location.href = `categories/${currentProduct.category}.html`;
  };
  
  // Tags como breadcrumb
  if (currentProduct.tags && currentProduct.tags.length > 0) {
    tagsElement.textContent = currentProduct.tags.slice(1, 3).join(' / ').toUpperCase();
  }
}

/**
 * Renderiza la galería de thumbnails
 */
function renderThumbnailGallery() {
  const gallery = document.getElementById('thumbnail-gallery');
  
  gallery.innerHTML = currentProduct.images.map((img, index) => `
    <img src="${img}" alt="${currentProduct.name}" 
         class="w-20 h-20 object-cover rounded cursor-pointer border-2 ${index === 0 ? 'border-[#d63629]' : 'border-gray-300'} hover:border-[#d63629] transition-colors"
         onclick="changeMainImage('${img}', this)">
  `).join('');
}

/**
 * Renderiza el precio
 */
function renderPrice() {
  const priceContainer = document.getElementById('product-price');
  
  if (currentProduct.originalPrice) {
    priceContainer.innerHTML = `
      <div class="flex items-center space-x-3">
        <span class="text-3xl font-bold text-[#d63629]">$ ${currentProduct.price.toLocaleString()}</span>
        <span class="text-xl text-gray-500 line-through">$ ${currentProduct.originalPrice.toLocaleString()}</span>
        <span class="bg-red-600 text-white px-2 py-1 text-sm font-bold rounded">-${currentProduct.discount}%</span>
      </div>
    `;
  } else {
    priceContainer.innerHTML = `
      <span class="text-3xl font-bold text-gray-900">$ ${currentProduct.price.toLocaleString()}</span>
    `;
  }
}

/**
 * Renderiza los tags/categorías
 */
function renderTags() {
  const tagsContainer = document.getElementById('product-tags');
  
  if (currentProduct.tags && currentProduct.tags.length > 0) {
    tagsContainer.innerHTML = currentProduct.tags.map(tag => `
      <span class="inline-block bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full font-medium uppercase cursor-pointer hover:bg-gray-200 transition-colors"
            onclick="navigateToCategory('${tag}')">
        ${tag}
      </span>
    `).join('');
  } else {
    tagsContainer.innerHTML = `
      <span class="inline-block bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full font-medium uppercase">
        ${currentProduct.category}
      </span>
    `;
  }
}

/**
 * Renderiza las opciones de color
 */
function renderColorOptions() {
  const colorContainer = document.getElementById('color-options');
  
  colorContainer.innerHTML = currentProduct.colors.map(color => `
    <button class="color-option w-12 h-12 rounded-full border-3 border-gray-300 hover:border-gray-600 transition-colors" 
            data-color="${color}" 
            title="${color}" 
            style="background-color: ${getColorCode(color)}"
            onclick="selectColor('${color}', this)">
    </button>
  `).join('');
  
  // Seleccionar primer color por defecto
  if (currentProduct.colors.length > 0) {
    selectColor(currentProduct.colors[0], colorContainer.firstElementChild);
  }
}

/**
 * Renderiza las opciones de talla
 */
function renderSizeOptions() {
  const sizeContainer = document.getElementById('size-options');
  
  sizeContainer.innerHTML = currentProduct.sizes.map(size => `
    <button class="size-option px-4 py-2 border-2 border-gray-300 rounded hover:border-gray-600 hover:bg-gray-50 transition-colors font-medium"
            data-size="${size}"
            onclick="selectSize('${size}', this)">
      ${size}
    </button>
  `).join('');
}

/**
 * Cambia la imagen principal
 */
function changeMainImage(src, thumbnail) {
  const mainImage = document.getElementById('main-product-image');
  mainImage.src = src;
  
  // Actualizar bordes de thumbnails
  const thumbnails = document.querySelectorAll('#thumbnail-gallery img');
  thumbnails.forEach(thumb => {
    thumb.classList.remove('border-[#d63629]');
    thumb.classList.add('border-gray-300');
  });
  
  thumbnail.classList.remove('border-gray-300');
  thumbnail.classList.add('border-[#d63629]');
}

/**
 * Selecciona un color
 */
function selectColor(color, element) {
  selectedColor = color;
  
  // Actualizar UI
  const colorOptions = document.querySelectorAll('.color-option');
  colorOptions.forEach(option => {
    option.classList.remove('border-[#d63629]', 'border-4');
    option.classList.add('border-gray-300', 'border-3');
  });
  
  element.classList.remove('border-gray-300', 'border-3');
  element.classList.add('border-[#d63629]', 'border-4');
  
  // Actualizar texto
  document.getElementById('selected-color-name').textContent = color;
}

/**
 * Selecciona una talla
 */
function selectSize(size, element) {
  selectedSize = size;
  
  // Actualizar UI
  const sizeOptions = document.querySelectorAll('.size-option');
  sizeOptions.forEach(option => {
    option.classList.remove('border-[#d63629]', 'bg-red-50', 'text-[#d63629]');
    option.classList.add('border-gray-300');
  });
  
  element.classList.remove('border-gray-300');
  element.classList.add('border-[#d63629]', 'bg-red-50', 'text-[#d63629]');
}

/**
 * Navega a una categoría específica
 */
function navigateToCategory(tag) {
  // Mapear tags a categorías
  const categoryMap = {
    'mujer': 'categories/mujer.html',
    'hombre': 'categories/hombre.html',
    'ninos': 'categories/ninos.html',
    'calzado': 'categories/otros.html'
  };
  
  if (categoryMap[tag]) {
    window.location.href = categoryMap[tag];
  } else if (currentProduct.category) {
    window.location.href = `categories/${currentProduct.category}.html`;
  }
}

/**
 * Carga productos relacionados
 */
function loadRelatedProducts() {
  const relatedProducts = getRelatedProducts(currentProduct.id, 4);
  const container = document.getElementById('related-products-container');
  
  container.innerHTML = relatedProducts.map(product => `
    <div class="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
         onclick="window.location.href='product.html?id=${product.id}'">
      <div class="aspect-square overflow-hidden">
        <img src="${product.images[0]}" alt="${product.name}"
             class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
      </div>
      <div class="p-4">
        <h3 class="font-semibold text-gray-900 mb-2 text-sm">${product.name}</h3>
        <div class="text-lg font-bold text-gray-900">$ ${product.price.toLocaleString()}</div>
        <div class="text-xs text-gray-500 mt-1">${product.sku}</div>
      </div>
    </div>
  `).join('');
}

/**
 * Configura los event listeners
 */
function setupEventListeners() {
  // Controles de cantidad
  document.getElementById('qty-decrease').addEventListener('click', () => {
    if (quantity > 1) {
      quantity--;
      document.getElementById('quantity-display').textContent = quantity;
    }
  });
  
  document.getElementById('qty-increase').addEventListener('click', () => {
    if (quantity < currentProduct.stock) {
      quantity++;
      document.getElementById('quantity-display').textContent = quantity;
    }
  });
  
  // Botón agregar al carrito
  document.getElementById('add-to-cart-btn').addEventListener('click', () => {
    if (!selectedColor || !selectedSize) {
      showNotification('Por favor selecciona color y talla', 'warning');
      return;
    }
    
    addToCart(currentProduct, selectedColor, selectedSize, quantity);
    showNotification('Producto agregado al carrito', 'success');
  });
  
  // Botón WhatsApp
  document.getElementById('whatsapp-btn').addEventListener('click', () => {
    const message = `Hola! Me interesa consultar sobre el producto:

📦 *${currentProduct.name}*
💰 Precio: $${currentProduct.price.toLocaleString()}
🏷️ SKU: ${currentProduct.sku}
${selectedColor ? `🎨 Color: ${selectedColor}` : ''}
${selectedSize ? `📏 Talla: ${selectedSize}` : ''}

¿Tienen stock disponible?`;
    
    const whatsappUrl = `https://wa.me/5492604381502?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  });
  
  // Tabs
  setupTabs();
  
  // Menú móvil
  setupMobileMenu();
  
  // Inicializar lightbox
  initializeLightbox();
}

/**
 * Inicializa la funcionalidad del lightbox para las imágenes
 */
function initializeLightbox() {
  try {
    console.log('🖼️ Inicializando lightbox...');
    
    // Seleccionar todas las imágenes que pueden abrir lightbox
    const productImages = document.querySelectorAll('#main-product-image, #thumbnail-gallery img');
    
    if (!productImages.length) {
      console.warn('No se encontraron imágenes para el lightbox');
      return;
    }
    
    productImages.forEach((img) => {
      // Agregar clase para mejorar visualización
      img.classList.add('product-image-full');
      
      // Agregar event listener para abrir lightbox
      img.addEventListener('click', function(e) {
        // Prevenir el comportamiento por defecto si es thumbnail
        if (this.id !== 'main-product-image') {
          e.stopPropagation();
        }
        
        openLightbox(this.src, currentProduct.name);
      });
    });
    
    console.log(`✅ Lightbox configurado para ${productImages.length} imágenes`);
    
  } catch (error) {
    console.error('❌ Error inicializando lightbox:', error);
  }
}

/**
 * Abre el lightbox con la imagen especificada
 */
function openLightbox(imageSrc, altText) {
  try {
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Vista ampliada de imagen');
    
    // Crear container
    const container = document.createElement('div');
    container.className = 'lightbox-container';
    
    // Crear imagen
    const lightboxImg = document.createElement('img');
    lightboxImg.src = imageSrc;
    lightboxImg.alt = altText || 'Imagen del producto';
    lightboxImg.style.maxWidth = '100%';
    lightboxImg.style.maxHeight = '100%';
    
    // Crear botón de cerrar
    const closeBtn = document.createElement('button');
    closeBtn.className = 'lightbox-close';
    closeBtn.innerHTML = '×';
    closeBtn.setAttribute('aria-label', 'Cerrar vista ampliada');
    closeBtn.setAttribute('title', 'Cerrar (Esc)');
    
    // Ensamblar elementos
    container.appendChild(lightboxImg);
    container.appendChild(closeBtn);
    overlay.appendChild(container);
    
    // Agregar al DOM
    document.body.appendChild(overlay);
    
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
    
    // Mostrar con animación
    setTimeout(() => {
      overlay.classList.add('show');
    }, 10);
    
    // Event listeners para cerrar
    setupLightboxCloseEvents(overlay);
    
    // Focus en el botón de cerrar para accesibilidad
    closeBtn.focus();
    
  } catch (error) {
    console.error('❌ Error abriendo lightbox:', error);
    showNotification('Error al mostrar la imagen', 'error');
  }
}

/**
 * Configura los eventos para cerrar el lightbox
 */
function setupLightboxCloseEvents(overlay) {
  const closeBtn = overlay.querySelector('.lightbox-close');
  const container = overlay.querySelector('.lightbox-container');
  
  // Cerrar con botón X
  closeBtn.addEventListener('click', () => {
    closeLightbox(overlay);
  });
  
  // Cerrar al hacer clic fuera de la imagen
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeLightbox(overlay);
    }
  });
  
  // Cerrar con tecla Escape
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeLightbox(overlay);
      document.removeEventListener('keydown', handleKeyDown);
    }
  };
  
  document.addEventListener('keydown', handleKeyDown);
  
  // Guardar referencia para limpieza
  overlay._keydownHandler = handleKeyDown;
}

/**
 * Cierra el lightbox
 */
function closeLightbox(overlay) {
  try {
    // Remover clase show para animación de salida
    overlay.classList.remove('show');
    
    // Remover event listener de teclado
    if (overlay._keydownHandler) {
      document.removeEventListener('keydown', overlay._keydownHandler);
    }
    
    // Restaurar scroll del body
    document.body.style.overflow = '';
    
    // Remover del DOM después de la animación
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 300);
    
  } catch (error) {
    console.error('❌ Error cerrando lightbox:', error);
    // Forzar limpieza en caso de error
    document.body.style.overflow = '';
    if (overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  }
}

/**
 * Configura las pestañas
 */
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.dataset.tab;
      
      // Actualizar botones
      tabButtons.forEach(btn => {
        btn.classList.remove('border-[#d63629]', 'text-[#d63629]');
        btn.classList.add('border-transparent', 'text-gray-500');
      });
      
      button.classList.remove('border-transparent', 'text-gray-500');
      button.classList.add('border-[#d63629]', 'text-[#d63629]');
      
      // Actualizar contenido
      tabContents.forEach(content => {
        content.classList.add('hidden');
      });
      
      document.getElementById(`${tabId}-tab`).classList.remove('hidden');
    });
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

// Hacer funciones disponibles globalmente
window.changeMainImage = changeMainImage;
window.selectColor = selectColor;
window.selectSize = selectSize;
window.navigateToCategory = navigateToCategory;

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeProductPage);
} else {
  initializeProductPage();
}
