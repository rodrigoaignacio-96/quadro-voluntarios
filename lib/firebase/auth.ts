import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { auth } from "./config";

/* Sessão persistente entre recarregamentos */
export async function initPersistence() {
  await setPersistence(auth, browserLocalPersistence);
}

/* Login com email e senha */
export async function signIn(email: string, password: string) {
  await initPersistence();
  return signInWithEmailAndPassword(auth, email, password);
}

/* Logout */
export async function signOutUser() {
  return signOut(auth);
}

/* Observer de mudança de estado — usado no AuthProvider */
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/* Usuário atual sincronamente */
export function getCurrentUser() {
  return auth.currentUser;
}
