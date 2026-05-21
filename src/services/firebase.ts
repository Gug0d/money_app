import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  // @ts-ignore
  getReactNativePersistence,
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
} from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

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

export const auth = (() => {
  try {
    return initializeAuth(app, {
      // @ts-ignore
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
})();

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