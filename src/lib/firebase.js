import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDJtdVgaL8YKIzC5KlHcBuxuFw4OxMio6c",
  authDomain: "lovelink-81048.firebaseapp.com",
  projectId: "lovelink-81048",
  storageBucket: "lovelink-81048.firebasestorage.app",
  messagingSenderId: "456623557713",
  appId: "1:456623557713:web:7a7b8169296dcca1acfc70"
};

// Initialize Firebase only if it hasn't been initialized yet (Next.js hot reload safe)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Auth & Google Provider
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Database & Storage
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, googleProvider, db, storage };
