/**
 * POS Utils - Utilidades comunes para el sistema POS
 * Funciones de notificaciones, fechas, formateo, etc.
 */

/**
 * Muestra una notificación en pantalla
 */
function showNotification(message, type = 'info', duration = 5000) {
  const container = document.getElementById('notification-container');
  if (!container) return;

  const notification = document.createElement('div');
  notification.className = `
    max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5
    transform transition-all duration-300 ease-in-out translate-x-full opacity-0
  `;

  const colors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  };

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  notification.innerHTML = `
    <div class="flex-1 w-0 p-4">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <span class="text-xl">${icons[type] || icons.info}</span>
        </div>
        <div class="ml-3 flex-1">
          <p class="text-sm font-medium text-gray-900">
            ${message}
          </p>
        </div>
      </div>
    </div>
    <div class="flex border-l border-gray-200">
      <button class="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none">
        ×
      </button>
    </div>
  `;

  // Agregar al container
  container.appendChild(notification);

  // Animar entrada
  setTimeout(() => {
    notification.classList.remove('translate-x-full', 'opacity-0');
  }, 100);

  // Configurar botón de cerrar
  const closeBtn = notification.querySelector('button');
  closeBtn.addEventListener('click', () => {
    removeNotification(notification);
  });

  // Auto-remover después del tiempo especificado
  if (duration > 0) {
    setTimeout(() => {
      removeNotification(notification);
    }, duration);
  }
}

/**
 * Remueve una notificación
 */
function removeNotification(notification) {
  notification.classList.add('translate-x-full', 'opacity-0');
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 300);
}

/**
 * Actualiza la fecha en el header
 */
function updatePageDate() {
  const pageDate = document.getElementById('page-date');
  if (!pageDate) return;

  const now = new Date();
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  const dateString = now.toLocaleDateString('es-ES', options);
  pageDate.textContent = `Hoy ${dateString}`;
}

/**
 * Formatea un número como moneda argentina
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2
  }).format(amount);
}

/**
 * Formatea un número sin símbolo de moneda
 */
function formatNumber(number) {
  return new Intl.NumberFormat('es-AR').format(number);
}

/**
 * Formatea una fecha
 */
function formatDate(date, options = {}) {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  return new Date(date).toLocaleDateString('es-ES', { ...defaultOptions, ...options });
}

/**
 * Formatea fecha y hora
 */
function formatDateTime(date) {
  return new Date(date).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Genera un ID único
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Valida un email
 */
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Valida un número de teléfono argentino
 */
function validatePhone(phone) {
  const re = /^(\+54|54|0)?[\s\-]?(\d{2,4})[\s\-]?(\d{6,8})$/;
  return re.test(phone);
}

/**
 * Sanitiza texto para evitar XSS
 */
function sanitizeText(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Debounce function para optimizar búsquedas
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Copia texto al portapapeles
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showNotification('Copiado al portapapeles', 'success');
    return true;
  } catch (err) {
    console.error('Error al copiar:', err);
    showNotification('Error al copiar al portapapeles', 'error');
    return false;
  }
}

/**
 * Descarga un archivo
 */
function downloadFile(data, filename, type = 'text/plain') {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * Convierte archivo a base64
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

/**
 * Valida el tamaño de archivo
 */
function validateFileSize(file, maxSizeMB = 5) {
  const maxSize = maxSizeMB * 1024 * 1024; // Convertir a bytes
  return file.size <= maxSize;
}

/**
 * Valida el tipo de archivo
 */
function validateFileType(file, allowedTypes = ['image/jpeg', 'image/png', 'image/webp']) {
  return allowedTypes.includes(file.type);
}

/**
 * Redimensiona una imagen
 */
function resizeImage(file, maxWidth = 800, maxHeight = 600, quality = 0.8) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calcular nuevas dimensiones
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convertir a blob
      canvas.toBlob(resolve, file.type, quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Calcula el porcentaje de cambio
 */
function calculatePercentageChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Genera colores para gráficos
 */
function generateChartColors(count) {
  const colors = [
    '#d63629', '#dc2626', '#ef4444', '#f87171', '#fca5a5',
    '#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db'
  ];
  
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }
  
  return result;
}
