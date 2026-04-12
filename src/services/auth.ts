import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

// Регистрация
export async function registerWithEmail(
  name: string,
  email: string,
  password: string
) {
  const result = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, 'users', result.user.uid), {
    uid: result.user.uid,
    name,
    email,
    createdAt: serverTimestamp(),

    xp: 0,
    level: 1,
    finCoin: 0,

    mortgage: {
      isActive: false,
      isCompleted: false,
      totalSeconds: 120,
      remainingSeconds: 120,
    },

    isGuest: false,
    onboardingCompleted: false,
    role: 'user',
  });

  return result.user;
}

// Вход
export async function loginWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

// Выход
export async function logout() {
  await signOut(auth);
}