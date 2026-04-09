import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAkOO0jeqriQbPUVznBMQUB4LoAZgZW_NY',
  authDomain: 'finityapp-98abc.firebaseapp.com',
  projectId: 'finityapp-98abc',
  storageBucket: 'finityapp-98abc.firebasestorage.app',
  messagingSenderId: '260350683915',
  appId: '1:260350683915:web:c0d7d0be78dba774a4100e',
};

// защита от повторной инициализации
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// просто обычный auth (без RN persistence)
export const auth = getAuth(app);

// Firestore
export const db = getFirestore(app);

export default app;