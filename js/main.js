/**
 * Archivo Principal - Main.js
 * Coordina todos los módulos y maneja la inicialización de la aplicación
 */

import { 
  loadProducts, 
  loadProductsFromRoot, 
  filterProducts, 
  sortProducts, 
  getFeaturedProducts, 
  getOnSaleProducts,
  categorySubcategories 
} from './productsModule.js';

import { 
  updateCarouselTrack, 
  renderCatalogGrid, 
  updateResultsCount, 
  setupSubcategoryMenu, 
  setupMobileSubcategoryMenu, 
  showNotification, 
  setupCarousel, 
  setupMobileMenu 
} from './uiModule.js';

import { 
  initializeCart, 
  setupCartButton 
} from './cartModule.js';

// Estado global de la aplicación
let appState = {
  currentFilters: {
    category: 'all',
    search: '',
    onSale: false,
    subcategory: 'all',
    colors: [],
    sizes: [],
    minPrice: null,
    maxPrice: null
  },
  currentSort: 'featured',
  isHomePage: false,
  currentPageCategory: null
};

/**
 * Inicializa la aplicación
 */
async function initializeApp() {
  try {
    console.log('🚀 Iniciando aplicación Rosema...');
    
    // Determinar si estamos en la página principal o en una categoría
    const isHomePage = window.location.pathname.includes('index.html') || 
                      window.location.pathname === '/' || 
                      window.location.pathname.endsWith('/');
    
    appState.isHomePage = isHomePage;
    
    // Obtener categoría de la página actual si existe
    if (window.currentPageCategory) {
      appState.currentPageCategory = window.currentPageCategory;
      appState.currentFilters.category = window.currentPageCategory;
    }
    
    // Cargar productos
    let products;
    if (isHomePage) {
      products = await loadProductsFromRoot();
    } else {
      products = await loadProducts();
    }
    
    if (products.length === 0) {
      showNotification('No se pudieron cargar los productos', 'error');
      return;
    }
    
    // Inicializar carrito
    initializeCart();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Configurar UI específica según el tipo de página
    if (isHomePage) {
      setupHomePage();
    } else {
      setupCategoryPage();
    }
    
    // Configurar elementos comunes
    setupCarousel();
    setupMobileMenu();
    setupCartButton();
    
    console.log('✅ Aplicación inicializada correctamente');
    
  } catch (error) {
    console.error('❌ Error al inicializar la aplicación:', error);
    showNotification('Error al cargar la aplicación', 'error');
  }
}

/**
 * Configura la página principal
 */
function setupHomePage() {
  console.log('🏠 Configurando página principal...');
  
  // Renderizar carruseles principales
  const featuredProducts = getFeaturedProducts();
  const saleProducts = getOnSaleProducts();
  
  updateCarouselTrack('carousel-track', featuredProducts);
  updateCarouselTrack('carousel-track-ofertas', saleProducts);
  
  // Configurar carruseles por categoría
  setupCategoryCarousels();
  
  // Configurar botón "Ver Todo"
  const verTodoBtn = document.querySelector('.btn-ver-todo');
  if (verTodoBtn) {
    verTodoBtn.addEventListener('click', showAllProducts);
  }
}

/**
 * Configura carruseles por categoría en la página principal
 */
function setupCategoryCarousels() {
  try {
    console.log('🎠 Configurando carruseles por categoría...');
    
    const categories = ['mujer', 'hombre', 'ninos', 'otros'];
    
    categories.forEach(category => {
      // Obtener productos de la categoría
      const categoryProducts = filterProducts({
        category: category,
        search: '',
        onSale: false,
        subcategory: 'all',
        colors: [],
        sizes: [],
        minPrice: null,
        maxPrice: null
      });
      
      // Limitar a 8 productos por carrusel para mejor rendimiento
      const limitedProducts = categoryProducts.slice(0, 8);
      
      // Actualizar el carrusel correspondiente
      const trackId = `carousel-track-${category}`;
      updateCarouselTrack(trackId, limitedProducts);
      
      console.log(`✅ Carrusel ${category}: ${limitedProducts.length} productos`);
    });
    
  } catch (error) {
    console.error('❌ Error configurando carruseles por categoría:', error);
    showNotification('Error al cargar productos por categoría', 'error');
  }
}

/**
 * Configura una página de categoría
 */
function setupCategoryPage() {
  const category = appState.currentPageCategory;
  console.log(`📂 Configurando página de categoría: ${category}`);
  
  if (!category || !categorySubcategories[category]) {
    console.error(`❌ Categoría '${category}' no válida`);
    return;
  }
  
  // Configurar menú de subcategorías
  setupSubcategoryMenu(category, handleSubcategoryClick);
  
  // Configurar menú móvil de subcategorías
  if (isMobileDevice()) {
    setupMobileSubcategoryMenu(category, handleSubcategoryClick);
  }
  
  // Renderizar productos de la categoría
  renderCategoryProducts();
  
  // Configurar botón "Volver"
  const backBtn = document.getElementById('back-to-home');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '../index.html';
    });
  }
}

/**
 * Configura todos los event listeners
 */
function setupEventListeners() {
  // Configurar botón "Ver Todo" en todas las páginas
  setupVerTodoButton();
  
  // Búsqueda
  const searchInput = document.querySelector('input[type="search"]');
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }
  
  // Búsqueda móvil
  const mobileSearchBtn = document.querySelector('.sm\\:hidden button[aria-label="Buscar"]');
  if (mobileSearchBtn) {
    mobileSearchBtn.addEventListener('click', toggleMobileSearch);
  }
  
  // Ordenamiento
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', handleSortChange);
  }
  
  // Navegación de categorías
  const categoryLinks = document.querySelectorAll('.category-nav a, #mobile-menu a');
  categoryLinks.forEach(link => {
    link.addEventListener('click', handleCategoryNavigation);
  });
  
  // Botón "Ver más"
  const loadMoreBtn = document.getElementById('load-more');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', handleLoadMore);
  }
  
  // Logo - volver al inicio
  const homeLogo = document.getElementById('home-logo-link');
  if (homeLogo) {
    homeLogo.addEventListener('click', (e) => {
      e.preventDefault();
      if (appState.isHomePage) {
        window.location.reload();
      } else {
        window.location.href = '../index.html';
      }
    });
  }
}

/**
 * Configura el botón "Ver Todo" en todas las páginas
 */
function setupVerTodoButton() {
  const verTodoBtn = document.querySelector('.btn-ver-todo');
  if (verTodoBtn) {
    verTodoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // En todas las páginas, mostrar catálogo completo
      showAllProducts();
    });
  }
}

/**
 * Maneja la búsqueda de productos
 */
function handleSearch(e) {
  appState.currentFilters.search = e.target.value.toLowerCase();
  
  if (appState.isHomePage) {
    // En la página principal, filtrar carruseles
    const allProducts = filterProducts(appState.currentFilters);
    const featuredFiltered = allProducts.filter(p => p.featured);
    const saleFiltered = allProducts.filter(p => p.onSale);
    
    updateCarouselTrack('carousel-track', featuredFiltered);
    updateCarouselTrack('carousel-track-ofertas', saleFiltered);
    
    // También actualizar carruseles por categoría
    setupCategoryCarousels();
  } else {
    // En páginas de categoría, actualizar grid
    renderCategoryProducts();
  }
}

/**
 * Maneja el cambio de ordenamiento
 */
function handleSortChange(e) {
  appState.currentSort = e.target.value;
  
  if (!appState.isHomePage) {
    renderCategoryProducts();
  }
}

/**
 * Maneja la navegación entre categorías
 */
function handleCategoryNavigation(e) {
  e.preventDefault();
  
  const link = e.target;
  const href = link.getAttribute('href');
  const text = link.textContent.toLowerCase().trim();
  
  // Si es "Inicio", ir a la página principal
  if (text === 'inicio' || href === '../index.html' || href === 'index.html') {
    if (appState.isHomePage) {
      window.location.reload();
    } else {
      window.location.href = '../index.html';
    }
    return;
  }
  
  // Si tiene href específico, navegar a esa página
  if (href && href !== '#') {
    window.location.href = href;
    return;
  }
  
  // Cerrar menú móvil si está abierto
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
    mobileMenu.classList.add('hidden');
  }
}

/**
 * Maneja el click en subcategorías - VERSIÓN MEJORADA PARA MÓVIL
 */
function handleSubcategoryClick(e) {
  e.preventDefault();
  
  const category = e.target.dataset.category;
  const subcategory = e.target.dataset.subcategory;
  
  // Actualizar filtros
  appState.currentFilters.category = category;
  appState.currentFilters.subcategory = subcategory;
  
  // Actualizar estado activo en el menú de escritorio
  const desktopSubMenu = document.getElementById('subcategory-menu');
  if (desktopSubMenu) {
    desktopSubMenu.querySelectorAll('.subcategory-item').forEach(item => {
      item.classList.remove('active');
    });
  }
  
  // Actualizar estado activo en el menú móvil
  const mobileSubMenu = document.getElementById('mobile-subcategory-menu');
  if (mobileSubMenu) {
    // Limpiar estado activo de todos los elementos del menú móvil
    mobileSubMenu.querySelectorAll('.subcategory-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // Agregar active solo al elemento clickeado
    e.target.classList.add('active');
    
    // Actualizar el texto del botón toggle para mostrar la subcategoría seleccionada
    const toggleBtnLabel = document.getElementById('mobile-category-name');
    if (toggleBtnLabel) {
      toggleBtnLabel.textContent = e.target.textContent.trim();
    }
    
    // Ocultar el menú después de la selección
    mobileSubMenu.classList.add('hidden');
  } else {
    // Si no hay menú móvil, agregar active al elemento clickeado (escritorio)
    e.target.classList.add('active');
  }
  
  // Renderizar productos
  renderCategoryProducts();
}

/**
 * Renderiza productos de la categoría actual
 */
function renderCategoryProducts() {
  const filteredProducts = filterProducts(appState.currentFilters);
  const sortedProducts = sortProducts(filteredProducts, appState.currentSort);
  
  renderCatalogGrid(sortedProducts);
  updateResultsCount(sortedProducts.length);
}

/**
 * Muestra todos los productos (funciona en todas las páginas)
 */
function showAllProducts() {
  // Resetear filtros
  appState.currentFilters = {
    category: 'all',
    search: '',
    onSale: false,
    subcategory: 'all',
    colors: [],
    sizes: [],
    minPrice: null,
    maxPrice: null
  };
  
  // Limpiar búsqueda
  const searchInput = document.querySelector('input[type="search"]');
  if (searchInput) searchInput.value = '';
  
  // Mostrar vista de catálogo completo
  if (appState.isHomePage) {
    // En la página principal
    const carouselSections = document.getElementById('carousel-sections');
    const fullCatalog = document.getElementById('full-catalog');
    
    if (carouselSections) carouselSections.classList.add('hidden');
    if (fullCatalog) fullCatalog.classList.remove('hidden');
  } else {
    // En páginas de categoría
    const categoryPage = document.getElementById('category-page');
    const fullCatalog = document.getElementById('full-catalog');
    
    if (categoryPage) categoryPage.classList.add('hidden');
    if (fullCatalog) fullCatalog.classList.remove('hidden');
  }
  
  // Renderizar todos los productos
  const allProducts = filterProducts(appState.currentFilters);
  const sortedProducts = sortProducts(allProducts, appState.currentSort);
  
  renderCatalogGrid(sortedProducts, 'catalog-grid-old');
  updateResultsCount(sortedProducts.length, 'results-count-old');
  
  // Configurar el selector de ordenamiento para el catálogo completo
  const sortSelectOld = document.getElementById('sort-select-old');
  if (sortSelectOld) {
    sortSelectOld.value = appState.currentSort;
    sortSelectOld.addEventListener('change', (e) => {
      appState.currentSort = e.target.value;
      const allProducts = filterProducts(appState.currentFilters);
      const sortedProducts = sortProducts(allProducts, appState.currentSort);
      renderCatalogGrid(sortedProducts, 'catalog-grid-old');
    });
  }
}

/**
 * Maneja el botón "Ver más"
 */
function handleLoadMore() {
  const loadMoreBtn = document.getElementById('load-more');
  if (loadMoreBtn) {
    loadMoreBtn.textContent = 'CARGANDO...';
    loadMoreBtn.disabled = true;
    
    // Simular carga (en una app real, cargarías más productos)
    setTimeout(() => {
      loadMoreBtn.textContent = 'VER MÁS ▼';
      loadMoreBtn.disabled = false;
      showNotification('No hay más productos para mostrar', 'info');
    }, 1000);
  }
}

/**
 * Toggle de búsqueda móvil
 */
function toggleMobileSearch() {
  const searchContainer = document.createElement('div');
  searchContainer.className = 'fixed top-0 left-0 w-full bg-[#d63629] p-4 z-50';
  searchContainer.innerHTML = `
    <div class="flex items-center space-x-2">
      <input type="search" placeholder="Buscar productos..." 
             class="flex-1 rounded-full py-2 px-4 text-gray-900 focus:outline-none" 
             id="mobile-search-input">
      <button onclick="closeMobileSearch()" class="text-white text-xl">✕</button>
    </div>
  `;
  
  document.body.appendChild(searchContainer);
  document.getElementById('mobile-search-input').focus();
  
  // Configurar búsqueda
  document.getElementById('mobile-search-input').addEventListener('input', handleSearch);
}

/**
 * Cierra la búsqueda móvil
 */
function closeMobileSearch() {
  const searchContainer = document.querySelector('.fixed.top-0');
  if (searchContainer) {
    searchContainer.remove();
  }
}

/**
 * Detecta si es un dispositivo móvil
 */
function isMobileDevice() {
  return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Maneja errores globales
 */
function handleGlobalError(error) {
  console.error('❌ Error global:', error);
  showNotification('Ha ocurrido un error inesperado', 'error');
}

// Hacer funciones disponibles globalmente para HTML inline
window.closeMobileSearch = closeMobileSearch;

// Manejar errores no capturados
window.addEventListener('error', (e) => {
  handleGlobalError(e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  handleGlobalError(e.reason);
});

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Exportar funciones principales para uso externo si es necesario
export {
  initializeApp,
  appState,
  handleSearch,
  handleSortChange,
  renderCategoryProducts
};
