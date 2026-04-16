import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAkOO0jeqriQbPUVznBMQUB4LoAZgZW_NY',
  authDomain: 'finityapp-98abc.firebaseapp.com',
  projectId: 'finityapp-98abc',
  storageBucket: 'finityapp-98abc.firebasestorage.app',
  messagingSenderId: '260350683915',
  appId: '1:260350683915:web:c0d7d0be78dba774a4100e',
  measurementId: 'G-LNREXVSWE2',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = (() => {
  try {
    return initializeFirestore(app, {
      experimentalForceLongPolling: true,
      experimentalAutoDetectLongPolling: false,
    });
  } catch {
    return getFirestore(app);
  }
})();

export default app;