import { initializeApp } from 'firebase/app';
import { initializeFirestore, memoryLocalCache, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyDgLi2xcW8CLrMoFGdT4okHWCC3-RnLk0A",
  authDomain: "nalia-medcore.firebaseapp.com",
  projectId: "nalia-medcore",
  storageBucket: "nalia-medcore.firebasestorage.app",
  messagingSenderId: "540116649649",
  appId: "1:540116649649:web:6e36ff15a57737770f8490",
  measurementId: "G-93PM6JNKGK"
};

const app = initializeApp(firebaseConfig);

// Inicialización optimizada para Electron (evita bloqueos de escritura en disco)
export const db = initializeFirestore(app, {
  localCache: memoryLocalCache()
});

export const auth = getAuth(app);
