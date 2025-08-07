import { salesCollection, onSnapshot, query, orderBy, addDoc, updateDoc, doc } from '../../../src/firebase/config.js';

class SalesManager {
  constructor() {
    this.sales = [];
    this.listeners = [];
  }

  subscribe(callback) {
    const q = query(salesCollection, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      this.sales = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(this.sales);
    });
    
    this.listeners.push(unsubscribe);
    return unsubscribe;
  }

  async createSale(saleData) {
    const docRef = await addDoc(salesCollection, {
      ...saleData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  }

  async updateSale(id, updates) {
    await updateDoc(doc(salesCollection, id), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  destroy() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners = [];
  }
}

export default new SalesManager();
