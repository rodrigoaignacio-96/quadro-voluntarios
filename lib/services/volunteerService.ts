import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, Timestamp, getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Volunteer, VolunteerFormData } from "@/types";

const COL = "volunteers";

export async function getVolunteers(onlyActive = false): Promise<Volunteer[]> {
  let snap;

  if (onlyActive) {
    snap = await getDocs(
      query(collection(db, COL), where("status", "==", "active"))
    );
  } else {
    snap = await getDocs(
      query(collection(db, COL), orderBy("name"))
    );
  }

  const result = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Volunteer));

  if (onlyActive) {
    result.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }

  return result;
}

export async function getVolunteer(id: string): Promise<Volunteer | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Volunteer;
}

export async function createVolunteer(data: VolunteerFormData): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    ...data,
    phone:       data.phone       ?? "",
    ministryIds: data.ministryIds ?? [],
    status:      data.status      ?? "active",
    joinedAt:    Timestamp.now(),
    updatedAt:   Timestamp.now(),
  });
  return ref.id;
}

export async function updateVolunteer(id: string, data: Partial<VolunteerFormData>): Promise<void> {
  await updateDoc(doc(db, COL, id), { ...data, updatedAt: Timestamp.now() });
}

export async function deleteVolunteer(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

export async function getVolunteersByMinistry(ministryId: string): Promise<Volunteer[]> {
  const snap = await getDocs(
    query(
      collection(db, COL),
      where("ministryIds", "array-contains", ministryId)
    )
  );
  const result = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Volunteer));
  result.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  return result;
}

export async function updateVolunteerPhoto(id: string, photoUrl: string): Promise<void> {
  await updateDoc(doc(db, COL, id), { photoUrl, updatedAt: Timestamp.now() });
}