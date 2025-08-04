/**
 * Configuración de Firebase para Rosema POS
 * Inicializa Firebase, Firestore y Storage usando Firebase compat
 */

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAMbdKhLxdzaigZW95MC9G0hPGR4r-b5d0",
  authDomain: "rosema-pos.firebaseapp.com",
  projectId: "rosema-pos",
  storageBucket: "rosema-pos.firebasestorage.app",
  messagingSenderId: "1097595627472",
  appId: "1:1097595627472:web:18e4f622b01b4ec8643bd5",
  measurementId: "G-D7RDWF848P"
};

// Inicializar Firebase usando compat API
let app, db, storage, analytics;

// Función para inicializar Firebase
function initializeFirebase() {
  try {
    // Verificar que Firebase esté disponible
    if (typeof firebase === 'undefined') {
      throw new Error('Firebase no está disponible');
    }

    // Inicializar Firebase
    app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    storage = firebase.storage();
    
    // Analytics opcional
    if (firebase.analytics) {
      analytics = firebase.analytics();
    }

    console.log('🔥 Firebase inicializado correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al inicializar Firebase:', error);
    return false;
  }
}

// Inicializar Firebase cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFirebase);
} else {
  initializeFirebase();
}

// Exportar para uso global (compatible con módulos y scripts)
if (typeof window !== 'undefined') {
  window.firebaseApp = () => app;
  window.firebaseDB = () => db;
  window.firebaseStorage = () => storage;
  window.firebaseAnalytics = () => analytics;
}

// Para compatibilidad con imports (aunque no se usarán en este caso)
const exportedApp = () => app;
const exportedDB = () => db;
const exportedStorage = () => storage;
const exportedAnalytics = () => analytics;

// Verificar si estamos en un entorno que soporta exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    app: exportedApp, 
    db: exportedDB, 
    storage: exportedStorage, 
    analytics: exportedAnalytics 
  };
}
