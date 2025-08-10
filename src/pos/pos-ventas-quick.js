/**
 * Funciones para producto rápido en ventas
 */

/**
 * Configura los event listeners para producto rápido
 */
function setupQuickProductEvents() {
  console.log("🔧 Configurando eventos de producto rápido...");

  // Botón producto rápido
  const btnQuickProduct = document.getElementById("btn-quick-product");
  if (btnQuickProduct) {
    btnQuickProduct.addEventListener("click", openQuickProductModal);
    console.log("✅ Event listener agregado al botón producto rápido");
  } else {
    console.warn("⚠️ Botón btn-quick-product no encontrado");
  }

  // Modal de producto rápido
  const cancelQuickProduct = document.getElementById("cancel-quick-product");
  const saveQuickProduct = document.getElementById("save-quick-product");

  if (cancelQuickProduct) {
    cancelQuickProduct.addEventListener("click", closeQuickProductModal);
  }

  if (saveQuickProduct) {
    saveQuickProduct.addEventListener("click", handleSaveQuickProduct);
  }

  // Cerrar modal al hacer click fuera
  const quickProductModal = document.getElementById("quick-product-modal");
  if (quickProductModal) {
    quickProductModal.addEventListener("click", (e) => {
      if (e.target.id === "quick-product-modal") {
        closeQuickProductModal();
      }
    });
  }

  // Manejar Enter en el formulario - prevenir doble envío
  const quickProductForm = document.getElementById("quick-product-form");
  if (quickProductForm) {
    let isSubmitting = false;

    quickProductForm.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();

        // Prevenir múltiples envíos
        if (isSubmitting) {
          console.log("⚠️ Envío ya en progreso, ignorando Enter");
          return;
        }

        isSubmitting = true;
        handleSaveQuickProduct().finally(() => {
          isSubmitting = false;
        });
      }
    });
  }
}

/**
 * Abre el modal de producto rápido
 */
function openQuickProductModal() {
  try {
    console.log("📦 Abriendo modal de producto rápido...");

    const modal = document.getElementById("quick-product-modal");
    const form = document.getElementById("quick-product-form");
    const quantityInput = document.getElementById("quick-product-quantity");
    const nameInput = document.getElementById("quick-product-name");

    if (!modal) {
      console.error("❌ Modal quick-product-modal no encontrado");
      showNotification("Error: Modal no encontrado", "error");
      return;
    }

    // Resetear formulario
    if (form) {
      form.reset();
    }

    // Establecer cantidad por defecto
    if (quantityInput) {
      quantityInput.value = "1";
    }

    // Mostrar modal
    modal.classList.remove("hidden");

    // Enfocar campo nombre
    if (nameInput) {
      setTimeout(() => nameInput.focus(), 100);
    }

    console.log("✅ Modal de producto rápido abierto");
  } catch (error) {
    console.error("❌ Error al abrir modal de producto rápido:", error);
    showNotification("Error al abrir modal de producto rápido", "error");
  }
}

/**
 * Cierra el modal de producto rápido
 */
function closeQuickProductModal() {
  try {
    const modal = document.getElementById("quick-product-modal");
    if (modal) {
      modal.classList.add("hidden");
      console.log("✅ Modal de producto rápido cerrado");
    }
  } catch (error) {
    console.error("❌ Error al cerrar modal:", error);
  }
}

/**
 * Maneja el guardado del producto rápido
 */
async function handleSaveQuickProduct() {
  try {
    console.log("💾 Guardando producto rápido...");

    // Deshabilitar botón para prevenir doble click
    const saveBtn = document.getElementById("save-quick-product");
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = "Agregando...";
    }

    const name = document.getElementById("quick-product-name").value.trim();
    const size = document.getElementById("quick-product-size").value.trim();
    const priceValue = document.getElementById("quick-product-price").value;
    const quantityValue = document.getElementById(
      "quick-product-quantity"
    ).value;

    // Validaciones
    if (!name) {
      showNotification("El nombre del producto es requerido", "error");
      document.getElementById("quick-product-name").focus();
      return;
    }

    if (!priceValue || priceValue === "") {
      showNotification("El precio es requerido", "error");
      document.getElementById("quick-product-price").focus();
      return;
    }

    const price = parseFloat(priceValue);
    if (isNaN(price) || price <= 0) {
      showNotification(
        "El precio debe ser un número válido mayor a 0",
        "error"
      );
      document.getElementById("quick-product-price").focus();
      return;
    }

    const quantity = parseInt(quantityValue) || 1;
    if (quantity <= 0) {
      showNotification("La cantidad debe ser mayor a 0", "error");
      document.getElementById("quick-product-quantity").focus();
      return;
    }

    // Verificar que currentSaleCart esté disponible
    if (typeof currentSaleCart === "undefined") {
      console.error("❌ currentSaleCart no está definido");
      showNotification("Error: Sistema de ventas no disponible", "error");
      return;
    }

    // Crear producto temporal para la venta
    const quickProduct = {
      id: generateId(),
      productId: "quick-" + generateId(),
      name: size ? `${name} (${size})` : name,
      price: price,
      originalPrice: null,
      sku: "QUICK-" + Date.now(),
      image: null,
      quantity: quantity,
      maxStock: 999, // Stock ilimitado para productos rápidos
      isQuickProduct: true,
      category: "Producto Rápido",
    };

    console.log("📦 Producto rápido creado:", quickProduct);

    // Agregar al carrito
    currentSaleCart.push(quickProduct);

    // Actualizar UI
    if (typeof renderSaleCart === "function") {
      renderSaleCart();
    }

    if (typeof updateSaleTotals === "function") {
      updateSaleTotals();
    }

    closeQuickProductModal();

    showNotification(`${quickProduct.name} agregado a la venta`, "success");
    console.log("✅ Producto rápido agregado exitosamente");
  } catch (error) {
    console.error("❌ Error al agregar producto rápido:", error);
    showNotification("Error al agregar producto rápido", "error");
  } finally {
    // Rehabilitar botón
    const saveBtn = document.getElementById("save-quick-product");
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = "Agregar a la Venta";
    }
  }
}

// Hacer las funciones disponibles globalmente
if (typeof window !== "undefined") {
  window.openQuickProductModal = openQuickProductModal;
  window.closeQuickProductModal = closeQuickProductModal;
  window.handleSaveQuickProduct = handleSaveQuickProduct;
  window.setupQuickProductEvents = setupQuickProductEvents;
}

// Inicializar eventos solo si el DOM está listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupQuickProductEvents);
} else {
  setupQuickProductEvents();
}

// También intentar configurar después de un delay para asegurar que el DOM esté listo
setTimeout(() => {
  if (
    document.getElementById("btn-quick-product") &&
    !document.getElementById("btn-quick-product").onclick
  ) {
    setupQuickProductEvents();
  }
}, 2000);
