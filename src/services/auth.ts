import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export async function registerWithEmail(
  name: string,
  email: string,
  password: string
) {
  const result = await createUserWithEmailAndPassword(auth, email, password);

  if (auth.currentUser) {
    await updateProfile(auth.currentUser, {
      displayName: name,
    });
  }

  await setDoc(doc(db, 'users', result.user.uid), {
    uid: result.user.uid,
    name,
    email,
    createdAt: serverTimestamp(),
    xp: 0,
    level: 1,
    finCoin: 0,
    isGuest: false,
  });

  return result.user;
}

export async function loginWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function loginAsGuest() {
  const result = await signInAnonymously(auth);

  const userRef = doc(db, 'users', result.user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: result.user.uid,
      name: 'Гость',
      email: null,
      createdAt: serverTimestamp(),
      xp: 0,
      level: 1,
      finCoin: 0,
      isGuest: true,
    });
  }

  return result.user;
}

export async function logout() {
  await signOut(auth);
}