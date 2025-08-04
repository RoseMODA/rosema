/**
 * Firebase Products - Manejo de productos en Firestore
 * CRUD completo para productos con Firebase Storage para imágenes
 * Usando Firebase compat API
 */

/**
 * Sube una imagen a Firebase Storage
 */
async function uploadProductImage(file, productId) {
  try {
    const db = window.firebaseDB();
    const storage = window.firebaseStorage();
    
    if (!storage) {
      throw new Error('Firebase Storage no está disponible');
    }
    
    // Crear referencia única para la imagen
    const timestamp = Date.now();
    const fileName = `${productId}_${timestamp}_${file.name}`;
    const storageRef = storage.ref(`products/${fileName}`);
    
    console.log(`📤 Subiendo imagen: ${fileName}`);
    
    // Subir archivo
    const snapshot = await storageRef.put(file);
    
    // Obtener URL de descarga
    const downloadURL = await snapshot.ref.getDownloadURL();
    
    console.log(`✅ Imagen subida exitosamente: ${downloadURL}`);
    return downloadURL;
    
  } catch (error) {
    console.error('❌ Error al subir imagen:', error);
    throw new Error('Error al subir la imagen');
  }
}

/**
 * Elimina una imagen de Firebase Storage
 */
async function deleteProductImage(imageUrl) {
  try {
    if (!imageUrl || !imageUrl.includes('firebase')) return;
    
    const storage = window.firebaseStorage();
    if (!storage) return;
    
    const imageRef = storage.refFromURL(imageUrl);
    await imageRef.delete();
    console.log(`🗑️ Imagen eliminada: ${imageUrl}`);
    
  } catch (error) {
    console.error('❌ Error al eliminar imagen:', error);
    // No lanzar error, ya que el producto puede eliminarse aunque falle la imagen
  }
}

/**
 * Crea un nuevo producto
 */
async function createProduct(productData, imageFiles = []) {
  try {
    console.log('📦 Creando nuevo producto:', productData.name);
    
    const db = window.firebaseDB();
    if (!db) {
      throw new Error('Firebase no está disponible');
    }
    
    // Validar datos requeridos
    if (!productData.name || !productData.category || !productData.price) {
      throw new Error('Faltan datos requeridos: nombre, categoría y precio');
    }
    
    // Preparar datos del producto
    const newProduct = {
      ...productData,
      price: parseFloat(productData.price),
      originalPrice: productData.originalPrice ? parseFloat(productData.originalPrice) : null,
      stock: parseInt(productData.stock) || 0,
      featured: productData.featured || false,
      onSale: productData.onSale || false,
      images: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Crear documento en Firestore
    const docRef = await db.collection('products').add(newProduct);
    const productId = docRef.id;
    
    console.log(`✅ Producto creado con ID: ${productId}`);
    
    // Subir imágenes si existen
    if (imageFiles && imageFiles.length > 0) {
      const imageUrls = [];
      
      for (const file of imageFiles) {
        try {
          const imageUrl = await uploadProductImage(file, productId);
          imageUrls.push(imageUrl);
        } catch (error) {
          console.error('❌ Error al subir imagen:', error);
          // Continuar con otras imágenes
        }
      }
      
      // Actualizar producto con URLs de imágenes
      if (imageUrls.length > 0) {
        await docRef.update({
          images: imageUrls,
          updatedAt: new Date().toISOString()
        });
      }
    }
    
    showNotification(`Producto "${productData.name}" creado exitosamente`, 'success');
    return { success: true, id: productId };
    
  } catch (error) {
    console.error('❌ Error al crear producto:', error);
    showNotification(`Error al crear producto: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

/**
 * Actualiza un producto existente
 */
async function updateProduct(productId, updatedData, newImageFiles = []) {
  try {
    console.log(`📝 Actualizando producto: ${productId}`);
    
    const db = window.firebaseDB();
    if (!db) {
      throw new Error('Firebase no está disponible');
    }
    
    // Preparar datos actualizados
    const updateData = {
      ...updatedData,
      price: parseFloat(updatedData.price),
      originalPrice: updatedData.originalPrice ? parseFloat(updatedData.originalPrice) : null,
      stock: parseInt(updatedData.stock) || 0,
      updatedAt: new Date().toISOString()
    };
    
    // Obtener producto actual para manejar imágenes
    const productRef = db.collection('products').doc(productId);
    const productSnap = await productRef.get();
    
    if (!productSnap.exists) {
      throw new Error('Producto no encontrado');
    }
    
    const currentProduct = productSnap.data();
    let imageUrls = [...(currentProduct.images || [])];
    
    // Subir nuevas imágenes si existen
    if (newImageFiles && newImageFiles.length > 0) {
      for (const file of newImageFiles) {
        try {
          const imageUrl = await uploadProductImage(file, productId);
          imageUrls.push(imageUrl);
        } catch (error) {
          console.error('❌ Error al subir nueva imagen:', error);
        }
      }
      
      updateData.images = imageUrls;
    }
    
    // Actualizar documento
    await productRef.update(updateData);
    
    console.log(`✅ Producto actualizado: ${productId}`);
    showNotification(`Producto actualizado exitosamente`, 'success');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error al actualizar producto:', error);
    showNotification(`Error al actualizar producto: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

/**
 * Elimina un producto
 */
async function deleteProduct(productId) {
  try {
    console.log(`🗑️ Eliminando producto: ${productId}`);
    
    const db = window.firebaseDB();
    if (!db) {
      throw new Error('Firebase no está disponible');
    }
    
    // Obtener producto para eliminar imágenes
    const productRef = db.collection('products').doc(productId);
    const productSnap = await productRef.get();
    
    if (productSnap.exists) {
      const productData = productSnap.data();
      
      // Eliminar imágenes de Storage
      if (productData.images && productData.images.length > 0) {
        for (const imageUrl of productData.images) {
          await deleteProductImage(imageUrl);
        }
      }
    }
    
    // Eliminar documento de Firestore
    await productRef.delete();
    
    console.log(`✅ Producto eliminado: ${productId}`);
    showNotification('Producto eliminado exitosamente', 'success');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error al eliminar producto:', error);
    showNotification(`Error al eliminar producto: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene todos los productos
 */
async function getProducts() {
  try {
    console.log('📋 Obteniendo productos...');
    
    const db = window.firebaseDB();
    if (!db) {
      console.warn('Firebase no disponible, retornando array vacío');
      return [];
    }
    
    const querySnapshot = await db.collection('products').get();
    const products = [];
    
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ ${products.length} productos obtenidos`);
    return products;
    
  } catch (error) {
    console.error('❌ Error al obtener productos:', error);
    showNotification('Error al cargar productos', 'error');
    return [];
  }
}

/**
 * Obtiene un producto por ID
 */
async function getProductById(productId) {
  try {
    const db = window.firebaseDB();
    if (!db) return null;
    
    const productRef = db.collection('products').doc(productId);
    const productSnap = await productRef.get();
    
    if (productSnap.exists) {
      return {
        id: productSnap.id,
        ...productSnap.data()
      };
    } else {
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error al obtener producto:', error);
    return null;
  }
}

/**
 * Busca productos por SKU
 */
async function getProductBySKU(sku) {
  try {
    const db = window.firebaseDB();
    if (!db) return null;
    
    const querySnapshot = await db.collection('products')
      .where('sku', '==', sku)
      .limit(1)
      .get();
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    }
    
    return null;
    
  } catch (error) {
    console.error('❌ Error al buscar producto por SKU:', error);
    return null;
  }
}

/**
 * Obtiene productos por categoría
 */
async function getProductsByCategory(category) {
  try {
    const db = window.firebaseDB();
    if (!db) return [];
    
    const querySnapshot = await db.collection('products')
      .where('category', '==', category)
      .get();
    const products = [];
    
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return products;
    
  } catch (error) {
    console.error('❌ Error al obtener productos por categoría:', error);
    return [];
  }
}

/**
 * Obtiene productos con stock bajo
 */
async function getLowStockProducts(threshold = 5) {
  try {
    const products = await getProducts();
    return products.filter(product => (product.stock || 0) <= threshold);
    
  } catch (error) {
    console.error('❌ Error al obtener productos con stock bajo:', error);
    return [];
  }
}

/**
 * Actualiza el stock de un producto
 */
async function updateProductStock(productId, newStock) {
  try {
    const db = window.firebaseDB();
    if (!db) {
      throw new Error('Firebase no está disponible');
    }
    
    const productRef = db.collection('products').doc(productId);
    await productRef.update({
      stock: parseInt(newStock),
      updatedAt: new Date().toISOString()
    });
    
    console.log(`📦 Stock actualizado para producto ${productId}: ${newStock}`);
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error al actualizar stock:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Migra productos desde products.json a Firestore
 */
async function migrateProductsFromJSON() {
  try {
    console.log('🔄 Iniciando migración de productos...');
    
    const db = window.firebaseDB();
    if (!db) {
      throw new Error('Firebase no está disponible');
    }
    
    // Cargar productos desde JSON
    const response = await fetch('../products.json');
    const jsonProducts = await response.json();
    
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const product of jsonProducts) {
      try {
        // Preparar datos del producto
        const productData = {
          ...product,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Crear en Firestore
        await db.collection('products').add(productData);
        migratedCount++;
        
        console.log(`✅ Migrado: ${product.name}`);
        
      } catch (error) {
        console.error(`❌ Error al migrar ${product.name}:`, error);
        errorCount++;
      }
    }
    
    const message = `Migración completada: ${migratedCount} productos migrados, ${errorCount} errores`;
    console.log(message);
    showNotification(message, migratedCount > 0 ? 'success' : 'warning');
    
    return { success: true, migrated: migratedCount, errors: errorCount };
    
  } catch (error) {
    console.error('❌ Error en migración:', error);
    showNotification(`Error en migración: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}
