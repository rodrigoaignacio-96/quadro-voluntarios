import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, orderBy, Timestamp, getDoc, arrayUnion, arrayRemove,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Ministry, MinistryFormData } from "@/types";

const COL = "ministries";

/* ─── Listar todos ─── */
export async function getMinistries(): Promise<Ministry[]> {
  const snap = await getDocs(query(collection(db, COL), orderBy("name")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Ministry));
}

/* ─── Buscar por ID ─── */
export async function getMinistry(id: string): Promise<Ministry | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Ministry;
}

/* ─── Criar ─── */
export async function createMinistry(data: MinistryFormData): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    volunteerIds: data.volunteerIds ?? [],
    createdAt:    Timestamp.now(),
  });
  return ref.id;
}

/* ─── Atualizar ─── */
export async function updateMinistry(id: string, data: Partial<MinistryFormData>): Promise<void> {
  await updateDoc(doc(db, COL, id), data);
}

/* ─── Remover ─── */
export async function deleteMinistry(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

/* ─── Adicionar voluntário ao ministério ─── */
export async function addVolunteerToMinistry(ministryId: string, volunteerId: string): Promise<void> {
  await updateDoc(doc(db, COL, ministryId), { volunteerIds: arrayUnion(volunteerId) });
}

/* ─── Remover voluntário do ministério ─── */
export async function removeVolunteerFromMinistry(ministryId: string, volunteerId: string): Promise<void> {
  await updateDoc(doc(db, COL, ministryId), { volunteerIds: arrayRemove(volunteerId) });
}

/* Cores padrão disponíveis para ministérios */
export const MINISTRY_COLORS = [
  { label: "Âmbar",   value: "#eab308" },
  { label: "Violeta", value: "#8b5cf6" },
  { label: "Azul",    value: "#3b82f6" },
  { label: "Esmeralda",value:"#10b981" },
  { label: "Rosa",    value: "#ec4899" },
  { label: "Laranja", value: "#f97316" },
  { label: "Ciano",   value: "#06b6d4" },
  { label: "Vermelho",value: "#ef4444" },
];
