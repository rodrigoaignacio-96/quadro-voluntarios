"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthChange, signIn, signOutUser } from "@/lib/firebase/auth";
import { db } from "@/lib/firebase/config";
import { AppUser } from "@/types";

/* ─────────────────────────────────────────
   Tipos
───────────────────────────────────────── */
interface AuthContextValue {
  user:        User | null;
  appUser:     AppUser | null;   // dados extras (role, name) do Firestore
  loading:     boolean;
  authError:   string | null;
  login:       (email: string, password: string) => Promise<void>;
  logout:      () => Promise<void>;
  clearError:  () => void;
}

/* ─────────────────────────────────────────
   Context
───────────────────────────────────────── */
const AuthContext = createContext<AuthContextValue | null>(null);

/* ─────────────────────────────────────────
   Provider
───────────────────────────────────────── */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<User | null>(null);
  const [appUser,   setAppUser]   = useState<AppUser | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  /* Busca dados extras do Firestore para o usuário logado */
  const fetchAppUser = useCallback(async (firebaseUser: User) => {
    try {
      const ref  = doc(db, "users", firebaseUser.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setAppUser({ id: snap.id, ...snap.data() } as AppUser);
      } else {
        /* Primeira vez: cria registro básico */
        const newUser: Omit<AppUser, "id"> = {
          uid:       firebaseUser.uid,
          email:     firebaseUser.email ?? "",
          name:      firebaseUser.displayName ?? firebaseUser.email?.split("@")[0] ?? "Admin",
          role:      "admin",
          createdAt: new Date() as unknown as import("firebase/firestore").Timestamp,
        };
        await setDoc(ref, newUser);
        setAppUser({ id: firebaseUser.uid, ...newUser });
      }
    } catch (err) {
      console.error("Erro ao buscar dados do usuário:", err);
    }
  }, []);

  /* Observer Firebase Auth */
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchAppUser(firebaseUser);
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [fetchAppUser]);

  /* Login */
  async function login(email: string, password: string) {
    setAuthError(null);
    try {
      await signIn(email, password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setAuthError(translateError(msg));
      throw err;
    }
  }

  /* Logout */
  async function logout() {
    await signOutUser();
    setUser(null);
    setAppUser(null);
  }

  const clearError = () => setAuthError(null);

  return (
    <AuthContext.Provider value={{ user, appUser, loading, authError, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ─────────────────────────────────────────
   Hook de consumo
───────────────────────────────────────── */
export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside <AuthProvider>");
  return ctx;
}

/* ─────────────────────────────────────────
   Tradução de erros Firebase → PT-BR
───────────────────────────────────────── */
function translateError(msg: string): string {
  if (msg.includes("user-not-found"))     return "Nenhuma conta com este e-mail.";
  if (msg.includes("wrong-password"))     return "Senha incorreta. Tente novamente.";
  if (msg.includes("invalid-email"))      return "Formato de e-mail inválido.";
  if (msg.includes("invalid-credential")) return "E-mail ou senha inválidos.";
  if (msg.includes("too-many-requests"))  return "Muitas tentativas. Aguarde e tente novamente.";
  if (msg.includes("network-request-failed")) return "Sem conexão. Verifique sua internet.";
  if (msg.includes("user-disabled"))      return "Esta conta foi desativada.";
  return "Erro ao entrar. Verifique suas credenciais.";
}
