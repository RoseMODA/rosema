/**
 * Módulo de Productos
 * Maneja la carga, filtrado y gestión de datos de productos
 * Usa Firestore como fuente única de datos
 */

import { db } from "./firebase.js";
import { collection, getDocs } from "firebase/firestore";

// Variable global para almacenar los productos
let products = [];

// Configuración de subcategorías por categoría
const categorySubcategories = {
  mujer: {
    title: "ROPA DE MUJER",
    items: [
      { name: "Ver todo de MUJER", type: "all", active: true },
      { name: "Vestidos", type: "vestidos" },
      { name: "Prendas de Torso", type: "torso" },
      { name: "Prendas de Piernas", type: "piernas" },
      {
        name: "VERANO",
        type: "season",
        season: "verano",
        class: "season-verano",
      },
      {
        name: "MEDIA ESTACION",
        type: "season",
        season: "media",
        class: "season-media",
      },
      {
        name: "INVIERNO",
        type: "season",
        season: "invierno",
        class: "season-invierno",
      },
      { name: "Formal", type: "formal" },
      { name: "Fiestas", type: "fiestas" },
      { name: "TALLAS", type: "tallas" },
    ],
  },
  hombre: {
    title: "ROPA DE HOMBRE",
    items: [
      { name: "Ver todo de HOMBRE", type: "all", active: true },
      { name: "Camisas", type: "camisas" },
      { name: "Pantalones", type: "pantalones" },
      { name: "Camperas", type: "camperas" },
      {
        name: "VERANO",
        type: "season",
        season: "verano",
        class: "season-verano",
      },
      {
        name: "MEDIA ESTACION",
        type: "season",
        season: "media",
        class: "season-media",
      },
      {
        name: "INVIERNO",
        type: "season",
        season: "invierno",
        class: "season-invierno",
      },
      { name: "Deportivo", type: "deportivo" },
      { name: "Formal", type: "formal" },
      { name: "TALLAS", type: "tallas" },
    ],
  },
  ninos: {
    title: "ROPA DE NIÑOS/BEBÉS",
    items: [
      { name: "Ver todo de NIÑOS/BEBÉS", type: "all", active: true },
      { name: "Bebés (0-2 años)", type: "bebes" },
      { name: "Niños (3-8 años)", type: "ninos" },
      { name: "Niñas (3-8 años)", type: "ninas" },
      {
        name: "VERANO",
        type: "season",
        season: "verano",
        class: "season-verano",
      },
      {
        name: "MEDIA ESTACION",
        type: "season",
        season: "media",
        class: "season-media",
      },
      {
        name: "INVIERNO",
        type: "season",
        season: "invierno",
        class: "season-invierno",
      },
      { name: "Pijamas", type: "pijamas" },
      { name: "TALLAS", type: "tallas" },
    ],
  },
  otros: {
    title: "OTROS",
    items: [
      { name: "Ver todo", type: "all", active: true },
      { name: "Calzado", type: "calzado" },
      { name: "Ropa Interior", type: "ropa-interior" },
      { name: "Accesorios", type: "accesorios" },
    ],
  },
};

/**
 * Carga productos desde Firebase Firestore
 * @returns {Promise<Array>} Array de productos desde Firebase
 */
async function loadProducts() {
  try {
    console.log("🔥 Cargando productos desde Firebase...");
    const productsCollection = collection(db, "productos");
    const querySnapshot = await getDocs(productsCollection);
    const firebaseProducts = [];

    querySnapshot.forEach((doc) => {
      firebaseProducts.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    products = firebaseProducts;
    console.log(
      `✅ Productos cargados desde Firebase: ${firebaseProducts.length} productos`
    );
    return firebaseProducts;
  } catch (error) {
    console.error("❌ Error al cargar productos desde Firebase:", error);
    throw error;
  }
}

/**
 * Carga los productos desde el archivo JSON (fallback)
 * @returns {Promise<Array>} Array de productos
 */
async function loadProductsFromJSON() {
  try {
    console.log("📄 Cargando productos desde JSON (fallback)...");
    const response = await fetch("../products.json");
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const data = await response.json();
    console.log(`✅ Productos cargados desde JSON: ${data.length} productos`);
    return data;
  } catch (error) {
    console.error("❌ Error al cargar productos desde JSON:", error);
    throw error;
  }
}

/**
 * Carga productos para la página principal (alias de loadProducts)
 * @returns {Promise<Array>} Array de productos
 */
async function loadProductsFromRoot() {
  try {
    // Intentar cargar desde Firebase primero
    try {
      return loadProducts();
    } catch (firebaseError) {
      console.warn("⚠️ Firebase no disponible, usando fallback a JSON");
    }

    // Fallback a JSON si Firebase falla
    console.log("📄 Cargando productos desde JSON (fallback - root)...");
    const response = await fetch("./products.json");
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const data = await response.json();
    products = data;
    console.log(
      `✅ Productos cargados desde JSON: ${products.length} productos`
    );
    return products;
  } catch (error) {
    console.error("❌ Error al cargar productos:", error);
    if (typeof showNotification === "function") {
      showNotification(
        "Error al cargar los productos. Por favor, recarga la página.",
        "error"
      );
    }
    products = [];
    return products;
  }
}

/**
 * Filtra productos según los criterios especificados - VERSIÓN MEJORADA CON TAGS
 * @param {Object} filters - Objeto con los filtros a aplicar
 * @param {string} filters.category - Categoría de productos
 * @param {string} filters.search - Término de búsqueda
 * @param {boolean} filters.onSale - Solo productos en oferta
 * @param {string} filters.subcategory - Subcategoría específica
 * @returns {Array} Array de productos filtrados
 */
function filterProducts(filters = {}) {
  const {
    category = "all",
    search = "",
    onSale = false,
    subcategory = "all",
    colors = [],
    sizes = [],
    minPrice = null,
    maxPrice = null,
  } = filters;

  return products.filter((product) => {
    // Filtro por categoría
    let matchesCategory;
    if (category === "otros") {
      // Para la categoría "otros", incluir productos de calzado, ropa-interior y accesorios
      matchesCategory = ["calzado", "ropa-interior", "accesorios"].includes(
        product.category
      );
    } else {
      matchesCategory = category === "all" || product.category === category;
    }

    // Filtro por búsqueda
    const matchesSearch =
      search === "" ||
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase());

    // Filtro por ofertas
    const matchesSale = !onSale || product.onSale;

    // Filtro por colores
    const matchesColors =
      colors.length === 0 ||
      colors.some((color) => product.colors.includes(color));

    // Filtro por tallas
    const matchesSizes =
      sizes.length === 0 || sizes.some((size) => product.sizes.includes(size));

    // Filtro por precio
    const matchesMinPrice = minPrice === null || product.price >= minPrice;
    const matchesMaxPrice = maxPrice === null || product.price <= maxPrice;

    // Filtro por subcategoría - MEJORADO CON TAGS
    let matchesSubcategory = true;
    if (subcategory !== "all") {
      // Verificar si el producto tiene tags y si coincide con la subcategoría
      if (product.tags && Array.isArray(product.tags)) {
        matchesSubcategory = product.tags.includes(subcategory);
      } else {
        // Fallback para productos sin tags - usar lógica anterior
        if (category === "otros") {
          matchesSubcategory = product.category === subcategory;
        } else {
          matchesSubcategory = true;
        }
      }
    }

    return (
      matchesCategory &&
      matchesSearch &&
      matchesSale &&
      matchesColors &&
      matchesSizes &&
      matchesMinPrice &&
      matchesMaxPrice &&
      matchesSubcategory
    );
  });
}

/**
 * Ordena productos según el criterio especificado
 * @param {Array} products - Array de productos a ordenar
 * @param {string} sortBy - Criterio de ordenamiento
 * @returns {Array} Array de productos ordenados
 */
function sortProducts(products, sortBy = "featured") {
  const sortedProducts = [...products];

  switch (sortBy) {
    case "price-low":
      return sortedProducts.sort((a, b) => a.price - b.price);
    case "price-high":
      return sortedProducts.sort((a, b) => b.price - a.price);
    case "name":
      return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
    case "newest":
      return sortedProducts.sort((a, b) => b.id - a.id);
    case "featured":
    default:
      return sortedProducts.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
  }
}

/**
 * Obtiene productos destacados
 * @returns {Array} Array de productos destacados
 */
function getFeaturedProducts() {
  return products.filter((product) => product.featured);
}

/**
 * Obtiene productos en oferta
 * @returns {Array} Array de productos en oferta
 */
function getOnSaleProducts() {
  return products.filter((product) => product.onSale);
}

/**
 * Obtiene un producto por su ID
 * @param {number} id - ID del producto
 * @returns {Object|null} Producto encontrado o null
 */
function getProductById(id) {
  return products.find((product) => product.id === id) || null;
}

/**
 * Obtiene productos relacionados (misma categoría, excluyendo el producto actual)
 * @param {number} productId - ID del producto actual
 * @param {number} limit - Número máximo de productos relacionados
 * @returns {Array} Array de productos relacionados
 */
function getRelatedProducts(productId, limit = 4) {
  const currentProduct = getProductById(productId);
  if (!currentProduct) return [];

  return products
    .filter(
      (product) =>
        product.id !== productId && product.category === currentProduct.category
    )
    .slice(0, limit);
}

/**
 * Obtiene todas las categorías disponibles
 * @returns {Array} Array de categorías únicas
 */
function getCategories() {
  const categories = [...new Set(products.map((product) => product.category))];
  return categories;
}

/**
 * Obtiene todos los colores disponibles
 * @returns {Array} Array de colores únicos
 */
function getAvailableColors() {
  const colors = [...new Set(products.flatMap((product) => product.colors))];
  return colors.sort();
}

/**
 * Obtiene todas las tallas disponibles
 * @returns {Array} Array de tallas únicas
 */
function getAvailableSizes() {
  const sizes = [...new Set(products.flatMap((product) => product.sizes))];
  return sizes.sort();
}

/**
 * Obtiene el rango de precios
 * @returns {Object} Objeto con precio mínimo y máximo
 */
function getPriceRange() {
  if (products.length === 0) return { min: 0, max: 0 };

  const prices = products.map((product) => product.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

/**
 * Obtiene estadísticas de productos
 * @returns {Object} Objeto con estadísticas
 */
function getProductStats() {
  return {
    total: products.length,
    featured: products.filter((p) => p.featured).length,
    onSale: products.filter((p) => p.onSale).length,
    categories: getCategories().length,
    outOfStock: products.filter((p) => p.stock === 0).length,
  };
}

// Exportar funciones y variables
export {
  products,
  categorySubcategories,
  loadProducts,
  loadProductsFromRoot,
  filterProducts,
  sortProducts,
  getFeaturedProducts,
  getOnSaleProducts,
  getProductById,
  getRelatedProducts,
  getCategories,
  getAvailableColors,
  getAvailableSizes,
  getPriceRange,
  getProductStats,
};
