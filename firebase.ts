
import { initializeApp } from "firebase/app";
// Import getFirestore correctly from the modular firestore path
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC7Xc4KjM5lWlnzVb--EWd23RrEIHKyukg",
  authDomain: "yarey-spa.firebaseapp.com",
  projectId: "yarey-spa",
  storageBucket: "yarey-spa.firebasestorage.app",
  messagingSenderId: "142078873366",
  appId: "1:142078873366:web:6ec0776cdb78589286ca37"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
