/**
 * Correcciones adicionales para la funcionalidad de ventas
 * Este archivo se asegura de que todas las funciones estén disponibles globalmente
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

// Función para verificar que los elementos del DOM existan
function verifyDOMElements() {
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
    console.warn('⚠️ Elementos DOM faltantes:', missingElements);
  } else {
    console.log('✅ Todos los elementos DOM requeridos están presentes');
  }
  
  return missingElements.length === 0;
}

// Función para reinicializar eventos si es necesario
function reinitializeEvents() {
  // Reinicializar eventos de producto rápido si la función existe
  if (typeof setupQuickProductEvents === 'function') {
    setupQuickProductEvents();
    console.log('🔧 Eventos de producto rápido reinicializados');
  }
  
  // Verificar que addProductToSale esté disponible globalmente
  if (typeof window.addProductToSale !== 'function') {
    console.warn('⚠️ addProductToSale no está disponible globalmente');
  }
}

// Función principal de corrección
function applyVentasFixes() {
  console.log('🔧 Aplicando correcciones de ventas...');
  
  try {
    // Asegurar variables globales
    ensureGlobalVariables();
    
    // Verificar elementos DOM
    const domReady = verifyDOMElements();
    
    if (domReady) {
      // Reinicializar eventos
      reinitializeEvents();
      
      console.log('✅ Correcciones de ventas aplicadas exitosamente');
    } else {
      console.warn('⚠️ Algunos elementos DOM no están listos, reintentando...');
      setTimeout(applyVentasFixes, 1000);
    }
    
  } catch (error) {
    console.error('❌ Error al aplicar correcciones de ventas:', error);
  }
}

// Aplicar correcciones cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyVentasFixes);
} else {
  applyVentasFixes();
}

// También aplicar después de un delay para asegurar que todo esté cargado
setTimeout(applyVentasFixes, 2000);

// Hacer funciones disponibles globalmente para debugging
window.ensureGlobalVariables = ensureGlobalVariables;
window.verifyDOMElements = verifyDOMElements;
window.applyVentasFixes = applyVentasFixes;
