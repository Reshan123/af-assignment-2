import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAtyjXvnFyyvFXVFs7QCbrZ47Y5dPvWp5Y",
  authDomain: "af-assignment-2-46801.firebaseapp.com",
  projectId: "af-assignment-2-46801",
  storageBucket: "af-assignment-2-46801.firebasestorage.app",
  messagingSenderId: "1068677614989",
  appId: "1:1068677614989:web:562f6bdc5f9449b6f081c4",
  measurementId: "G-95ZYBN9819"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
