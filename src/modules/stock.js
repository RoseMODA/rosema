import { productsCollection, doc, updateDoc, getDoc } from '../../../src/firebase/config.js';

class StockManager {
  async updateStock(productId, newStock) {
    await updateDoc(doc(productsCollection, productId), {
      stock: newStock,
      updatedAt: new Date().toISOString()
    });
  }

  async decreaseStock(productId, quantity) {
    const productRef = doc(productsCollection, productId);
    const productDoc = await getDoc(productRef);
    
    if (productDoc.exists()) {
      const currentStock = productDoc.data().stock || 0;
      const newStock = Math.max(0, currentStock - quantity);
      
      await updateDoc(productRef, {
        stock: newStock,
        updatedAt: new Date().toISOString()
      });
      
      return newStock;
    }
    
    return 0;
  }

  async increaseStock(productId, quantity) {
    const productRef = doc(productsCollection, productId);
    const productDoc = await getDoc(productRef);
    
    if (productDoc.exists()) {
      const currentStock = productDoc.data().stock || 0;
      const newStock = currentStock + quantity;
      
      await updateDoc(productRef, {
        stock: newStock,
        updatedAt: new Date().toISOString()
      });
      
      return newStock;
    }
    
    return 0;
  }
}

export default new StockManager();
