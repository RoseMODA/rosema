/**
 * Correcciones adicionales para la funcionalidad de ventas
 * Este archivo se asegura de que todas las funciones estén disponibles globalmente
 * Solo se ejecuta cuando la sección "Ventas" está activa
 */

// Función para asegurar que las variables globales estén disponibles
function ensureGlobalVariables() {
  if (typeof window.currentSaleCart === 'undefined') {
    window.currentSaleCart = [];
    console.log('🔧 currentSaleCart inicializado');
  }
  
  if (typeof window.allProducts === 'undefined') {
    window.allProducts = [];
    console.log('🔧 allProducts inicializado');
  }
  
  if (typeof window.currentDiscount === 'undefined') {
    window.currentDiscount = 0;
    console.log('🔧 currentDiscount inicializado');
  }
}

// Función para verificar que los elementos del DOM existan (solo para ventas)
function verifyVentasDOMElements() {
  const requiredElements = [
    'product-search',
    'search-results',
    'search-results-list',
    'sale-cart-items',
    'btn-quick-product',
    'quick-product-modal'
  ];
  
  const missingElements = [];
  
  requiredElements.forEach(elementId => {
    if (!document.getElementById(elementId)) {
      missingElements.push(elementId);
    }
  });
  
  if (missingElements.length > 0) {
    console.warn('⚠️ Elementos DOM de ventas faltantes:', missingElements);
    return false;
  } else {
    console.log('✅ Todos los elementos DOM de ventas están presentes');
    return true;
  }
}

// Función para reinicializar eventos si es necesario
function reinitializeVentasEvents() {
  // Reinicializar eventos de producto rápido si la función existe
  if (typeof setupQuickProductEvents === 'function') {
    setupQuickProductEvents();
    console.log('🔧 Eventos de producto rápido reinicializados');
  }
  
  // Verificar que addProductToSale esté disponible globalmente
  if (typeof window.addProductToSale !== 'function' && typeof addProductToSale === 'function') {
    window.addProductToSale = addProductToSale;
    console.log('🔧 addProductToSale exportado globalmente');
  }
}

// Función principal de corrección para ventas
function applyVentasFixes() {
  // Solo ejecutar si estamos en la página de ventas
  if (!isVentasPageActive()) {
    console.log('📝 Página de ventas no activa, omitiendo correcciones');
    return;
  }
  
  console.log('🔧 Aplicando correcciones de ventas...');
  
  try {
    // Asegurar variables globales
    ensureGlobalVariables();
    
    // Verificar elementos DOM específicos de ventas
    const domReady = verifyVentasDOMElements();
    
    if (domReady) {
      // Reinicializar eventos
      reinitializeVentasEvents();
      console.log('✅ Correcciones de ventas aplicadas exitosamente');
    } else {
      console.log('⚠️ Elementos DOM de ventas no están listos aún');
    }
    
  } catch (error) {
    console.error('❌ Error al aplicar correcciones de ventas:', error);
  }
}

// Función para verificar si la página de ventas está activa
function isVentasPageActive() {
  // Verificar si el título de la página es "VENTAS"
  const pageTitle = document.getElementById('page-title');
  if (pageTitle && pageTitle.textContent === 'VENTAS') {
    return true;
  }
  
  // Verificar si el botón de navegación de ventas está activo
  const ventasNav = document.getElementById('nav-ventas');
  if (ventasNav && ventasNav.classList.contains('sidebar-active')) {
    return true;
  }
  
  // Verificar si existe algún elemento específico de ventas
  return document.getElementById('product-search') !== null;
}

// Función para observar cambios en la navegación
function setupVentasObserver() {
  // Observer para detectar cuando se carga la página de ventas
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' || mutation.type === 'characterData') {
        // Verificar si se cargó la página de ventas
        if (isVentasPageActive()) {
          // Esperar un poco para que el DOM se estabilice
          setTimeout(applyVentasFixes, 500);
        }
      }
    });
  });
  
  // Observar cambios en el contenido principal
  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    observer.observe(mainContent, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }
  
  // Observar cambios en el título de la página
  const pageTitle = document.getElementById('page-title');
  if (pageTitle) {
    observer.observe(pageTitle, {
      childList: true,
      characterData: true
    });
  }
}

// Función para configurar listener en el botón de ventas
function setupVentasNavListener() {
  const ventasNav = document.getElementById('nav-ventas');
  if (ventasNav) {
    ventasNav.addEventListener('click', () => {
      console.log('🛒 Navegando a ventas, preparando correcciones...');
      // Aplicar correcciones después de un delay para permitir que se cargue el contenido
      setTimeout(applyVentasFixes, 1000);
    });
  }
}

// Inicialización cuando el DOM esté listo
function initVentasFixes() {
  console.log('🚀 Inicializando sistema de correcciones de ventas...');
  
  // Asegurar variables globales siempre
  ensureGlobalVariables();
  
  // Configurar observer para detectar cambios
  setupVentasObserver();
  
  // Configurar listener en navegación
  setupVentasNavListener();
  
  // Si ya estamos en ventas, aplicar correcciones
  if (isVentasPageActive()) {
    setTimeout(applyVentasFixes, 500);
  }
  
  console.log('✅ Sistema de correcciones de ventas inicializado');
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVentasFixes);
} else {
  initVentasFixes();
}

// Hacer funciones disponibles globalmente para debugging
window.ensureGlobalVariables = ensureGlobalVariables;
window.verifyVentasDOMElements = verifyVentasDOMElements;
window.applyVentasFixes = applyVentasFixes;
window.isVentasPageActive = isVentasPageActive;
