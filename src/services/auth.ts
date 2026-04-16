import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const DEFAULT_MORTGAGE = {
  isActive: false,
  isCompleted: false,
  totalSeconds: 120,
  durationSeconds: 120,
  startedAt: null,
};

// 🔐 Регистрация
export async function registerWithEmail(
  name: string,
  email: string,
  password: string
) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  // сохраняем имя в Firebase Auth
  await updateProfile(cred.user, {
    displayName: name,
  });

  // ✅ СОЗДАЁМ ДОКУМЕНТ В FIRESTORE
  await setDoc(doc(db, 'users', cred.user.uid), {
    name,
    email,
    xp: 0,
    finCoin: 0,
    onboardingCompleted: false, // важно
    mortgage: DEFAULT_MORTGAGE,
    role: 'user',
    createdAt: Date.now(),
  });

  return cred.user;
}

// 🔑 Вход
export async function loginWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

// 🚪 Выход
export async function logout() {
  return signOut(auth);
}