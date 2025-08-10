import { productsCollection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc } from '../../../src/firebase/config.js';

class POSProductManager {
  constructor() {
    this.products = [];
    this.listeners = [];
  }

  subscribe(callback) {
    const q = query(productsCollection, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      this.products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(this.products);
    });
    
    this.listeners.push(unsubscribe);
    return unsubscribe;
  }

  async addProduct(product) {
    const docRef = await addDoc(productsCollection, {
      ...product,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  }

  async updateProduct(id, updates) {
    await updateDoc(doc(productsCollection, id), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  async deleteProduct(id) {
    await deleteDoc(doc(productsCollection, id));
  }

  destroy() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners = [];
  }
}

export default new POSProductManager();
