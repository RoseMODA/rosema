/**
 * Firebase Products Functions - Funciones para manejar productos en Firebase
 */

import { db } from "../firebase.js";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  limit,
} from "firebase/firestore";

const PRODUCTS_COLLECTION = "products";

/**
 * Obtiene todos los productos de Firebase
 * @returns {Promise<Array>} Array de productos
 */
export async function getProducts() {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsRef, orderBy("name", "asc"));
    const querySnapshot = await getDocs(q);

    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return products;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    throw error;
  }
}

/**
 * Obtiene productos con stock bajo (menos de 10 unidades)
 * @returns {Promise<Array>} Array de productos con stock bajo
 */
export async function getLowStockProducts() {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(
      productsRef,
      where("stock", "<", 2),
      orderBy("stock", "asc")
    );
    const querySnapshot = await getDocs(q);

    const lowStockProducts = [];
    querySnapshot.forEach((doc) => {
      lowStockProducts.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return lowStockProducts;
  } catch (error) {
    console.error("Error al obtener productos con stock bajo:", error);
    throw error;
  }
}

/**
 * Obtiene un producto por ID
 * @param {string} productId - ID del producto
 * @returns {Promise<Object|null>} Producto o null si no existe
 */
export async function getProductById(productId) {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    const productSnap = await getDoc(productRef);

    if (productSnap.exists()) {
      return {
        id: productSnap.id,
        ...productSnap.data(),
      };
    }

    return null;
  } catch (error) {
    console.error("Error al obtener producto:", error);
    throw error;
  }
}

/**
 * Agrega un nuevo producto
 * @param {Object} productData - Datos del producto
 * @returns {Promise<Object>} Producto creado con ID
 */
export async function addProduct(productData) {
  try {
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      ...productData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return {
      id: docRef.id,
      ...productData,
    };
  } catch (error) {
    console.error("Error al agregar producto:", error);
    throw error;
  }
}

/**
 * Actualiza un producto existente
 * @param {string} productId - ID del producto
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<void>}
 */
export async function updateProduct(productId, updateData) {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    await updateDoc(productRef, {
      ...updateData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    throw error;
  }
}

/**
 * Elimina un producto
 * @param {string} productId - ID del producto
 * @returns {Promise<void>}
 */
export async function deleteProduct(productId) {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(productRef);
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    throw error;
  }
}

/**
 * Busca productos por nombre o SKU
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Promise<Array>} Productos encontrados
 */
export async function searchProducts(searchTerm) {
  try {
    const products = await getProducts();

    return products.filter(
      (product) =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error("Error al buscar productos:", error);
    throw error;
  }
}

// Importar getDoc si no está importado
import { getDoc } from "firebase/firestore";
