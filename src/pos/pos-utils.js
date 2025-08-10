export { debounce, showNotification, sanitizeText };

/**
 * POS Utils - Utilidades comunes para el sistema POS
 * Funciones de notificaciones, fechas, formateo, etc.
 */

/**
 * Muestra una notificación en pantalla
 */
function showNotification(message, type = "info", duration = 5000) {
  const container = document.getElementById("notification-container");
  if (!container) return;

  const notification = document.createElement("div");
  notification.className = `
    max-w-md w-full bg-white shadow-xl rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5
    transform transition-all duration-300 ease-out opacity-0 scale-95 mb-3
  `;

  const colors = {
    success: "text-green-600",
    error: "text-red-600",
    warning: "text-yellow-600",
    info: "text-blue-600",
  };

  const bgColors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-yellow-50 border-yellow-200",
    info: "bg-blue-50 border-blue-200",
  };

  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };

  notification.innerHTML = `
    <div class="flex-1 p-4">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <span class="text-2xl">${icons[type] || icons.info}</span>
        </div>
        <div class="ml-3 flex-1">
          <p class="text-base font-medium text-gray-900 leading-relaxed">
            ${message}
          </p>
        </div>
      </div>
    </div>
    <div class="flex border-l border-gray-200">
      <button class="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-lg font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 focus:outline-none transition-colors">
        ×
      </button>
    </div>
  `;

  // Aplicar colores según el tipo
  notification.classList.add(...bgColors[type].split(" "));

  // Agregar al container
  container.appendChild(notification);

  // Animar entrada
  setTimeout(() => {
    notification.classList.remove("opacity-0", "scale-95");
    notification.classList.add("opacity-100", "scale-100");
  }, 100);

  // Configurar botón de cerrar
  const closeBtn = notification.querySelector("button");
  closeBtn.addEventListener("click", () => {
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
  notification.classList.remove("opacity-100", "scale-100");
  notification.classList.add("opacity-0", "scale-95");
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
  const pageDate = document.getElementById("page-date");
  if (!pageDate) return;

  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const dateString = now.toLocaleDateString("es-ES", options);
  pageDate.textContent = `Hoy ${dateString}`;
}

/**
 * Formatea un número como moneda argentina
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formatea un número sin símbolo de moneda
 */
function formatNumber(number) {
  return new Intl.NumberFormat("es-AR").format(number);
}

/**
 * Formatea una fecha
 */
function formatDate(date, options = {}) {
  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return new Date(date).toLocaleDateString("es-ES", {
    ...defaultOptions,
    ...options,
  });
}

/**
 * Formatea fecha y hora
 */
function formatDateTime(date) {
  return new Date(date).toLocaleString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
  const div = document.createElement("div");
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
    showNotification("Copiado al portapapeles", "success");
    return true;
  } catch (err) {
    console.error("Error al copiar:", err);
    showNotification("Error al copiar al portapapeles", "error");
    return false;
  }
}

/**
 * Descarga un archivo
 */
function downloadFile(data, filename, type = "text/plain") {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
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
    reader.onerror = (error) => reject(error);
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
function validateFileType(
  file,
  allowedTypes = ["image/jpeg", "image/png", "image/webp"]
) {
  return allowedTypes.includes(file.type);
}

/**
 * Redimensiona una imagen
 */
function resizeImage(file, maxWidth = 800, maxHeight = 600, quality = 0.8) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
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
    "#d63629",
    "#dc2626",
    "#ef4444",
    "#f87171",
    "#fca5a5",
    "#374151",
    "#4b5563",
    "#6b7280",
    "#9ca3af",
    "#d1d5db",
  ];

  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }

  return result;
}

/**
 * Muestra un modal de confirmación personalizado
 * @param {string} message - Mensaje a mostrar
 * @param {function} onConfirm - Función a ejecutar si se confirma
 * @param {function} [onCancel] - Función a ejecutar si se cancela
 * @param {string} [title="Confirmación"] - Título del modal
 * @param {string} [confirmText="Confirmar"] - Texto del botón de confirmación
 * @param {string} [cancelText="Cancelar"] - Texto del botón de cancelación
 */
function showConfirmationModal(
  message,
  onConfirm,
  onCancel,
  title = "Confirmación",
  confirmText = "Confirmar",
  cancelText = "Cancelar"
) {
  const modal = document.getElementById("confirmation-modal");
  const modalContent = document.getElementById("confirmation-modal-content");
  const modalTitle = document.getElementById("confirmation-modal-title");
  const modalMessage = document.getElementById("confirmation-modal-message");
  const cancelBtn = document.getElementById("confirmation-cancel");
  const confirmBtn = document.getElementById("confirmation-confirm");

  if (!modal || !modalContent || !modalMessage || !cancelBtn || !confirmBtn) {
    console.error("❌ Modal de confirmación no encontrado en el DOM");
    return;
  }

  // Configurar contenido del modal
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  cancelBtn.textContent = cancelText;
  confirmBtn.textContent = confirmText;

  // Función para cerrar el modal
  const closeModal = () => {
    modalContent.classList.remove("scale-100", "opacity-100");
    modalContent.classList.add("scale-95", "opacity-0");
    setTimeout(() => {
      modal.classList.add("hidden");
    }, 200);
  };

  // Función para manejar cancelación
  const handleCancel = () => {
    closeModal();
    if (onCancel) onCancel();
  };

  // Función para manejar confirmación
  const handleConfirm = () => {
    closeModal();
    onConfirm();
  };

  // Remover event listeners previos clonando los botones
  const newCancelBtn = cancelBtn.cloneNode(true);
  const newConfirmBtn = confirmBtn.cloneNode(true);
  cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

  // Agregar nuevos event listeners
  newCancelBtn.addEventListener("click", handleCancel);
  newConfirmBtn.addEventListener("click", handleConfirm);

  // Event listener para cerrar con Escape
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      handleCancel();
      document.removeEventListener("keydown", handleKeyDown);
    }
  };

  // Event listener para cerrar al hacer clic fuera del modal
  const handleClickOutside = (e) => {
    if (e.target === modal) {
      handleCancel();
      modal.removeEventListener("click", handleClickOutside);
    }
  };

  // Agregar event listeners
  document.addEventListener("keydown", handleKeyDown);
  modal.addEventListener("click", handleClickOutside);

  // Mostrar modal con animación
  modal.classList.remove("hidden");
  setTimeout(() => {
    modalContent.classList.remove("scale-95", "opacity-0");
    modalContent.classList.add("scale-100", "opacity-100");
  }, 10);

  // Enfocar el botón de cancelar por defecto
  setTimeout(() => {
    newCancelBtn.focus();
  }, 250);
}

/**
 * Crea un elemento de arrastrar y soltar para archivos
 * @param {HTMLElement} element - Elemento al que agregar funcionalidad drag & drop
 * @param {function} onFilesDropped - Callback cuando se sueltan archivos
 * @param {string[]} [acceptedTypes] - Tipos de archivo aceptados
 */
function enableDragAndDrop(
  element,
  onFilesDropped,
  acceptedTypes = ["image/*"]
) {
  if (!element) return;

  // Prevenir comportamiento por defecto
  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    element.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });

  // Resaltar área de drop
  ["dragenter", "dragover"].forEach((eventName) => {
    element.addEventListener(eventName, highlight, false);
  });

  ["dragleave", "drop"].forEach((eventName) => {
    element.addEventListener(eventName, unhighlight, false);
  });

  // Manejar archivos soltados
  element.addEventListener("drop", handleDrop, false);

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function highlight() {
    element.classList.add("border-blue-500", "bg-blue-50");
  }

  function unhighlight() {
    element.classList.remove("border-blue-500", "bg-blue-50");
  }

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = Array.from(dt.files);

    // Filtrar archivos por tipo si se especifica
    const validFiles = files.filter((file) => {
      return acceptedTypes.some((type) => {
        if (type.endsWith("/*")) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });
    });

    if (validFiles.length > 0) {
      onFilesDropped(validFiles);
    } else {
      showNotification("Tipo de archivo no válido", "error");
    }
  }
}
