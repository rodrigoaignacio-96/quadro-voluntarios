import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  QueryConstraint,
  DocumentData,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";

/* Re-exporta tipos úteis para os services */
export { serverTimestamp, Timestamp };

/* ─── Leitura única ─── */
export async function getDocument<T>(
  collectionName: string,
  docId: string
): Promise<T | null> {
  const ref  = doc(db, collectionName, docId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as T;
}

/* ─── Leitura de collection com filtros opcionais ─── */
export async function getCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  const ref  = collection(db, collectionName);
  const q    = query(ref, ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
}

/* ─── Criar documento com ID auto-gerado ─── */
export async function createDocument(
  collectionName: string,
  data: DocumentData
): Promise<string> {
  const ref  = collection(db, collectionName);
  const docRef = await addDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/* ─── Criar documento com ID específico ─── */
export async function setDocument(
  collectionName: string,
  docId: string,
  data: DocumentData
): Promise<void> {
  const ref = doc(db, collectionName, docId);
  await setDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/* ─── Atualizar campos específicos ─── */
export async function updateDocument(
  collectionName: string,
  docId: string,
  data: Partial<DocumentData>
): Promise<void> {
  const ref = doc(db, collectionName, docId);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/* ─── Deletar documento ─── */
export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  const ref = doc(db, collectionName, docId);
  await deleteDoc(ref);
}

/* ─── Listener em tempo real ─── */
export function subscribeToCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[],
  callback: (data: T[]) => void
): () => void {
  const ref  = collection(db, collectionName);
  const q    = query(ref, ...constraints);
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as T));
    callback(data);
  });
}

/* Re-exporta construtores de query para os services */
export { collection, doc, where, orderBy, limit, query, db };
