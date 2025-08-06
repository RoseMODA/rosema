// js/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAMbdKhLxdzaigZW95MC9G0hPGR4r-b5d0",
  authDomain: "rosema-pos.firebaseapp.com",
  projectId: "rosema-pos",
  storageBucket: "rosema-pos.firebasestorage.app",
  messagingSenderId: "1097595627472",
  appId: "1:1097595627472:web:18e4f622b01b4ec8643bd5",
  measurementId: "G-D7RDWF848P"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { app, db, storage, analytics };
