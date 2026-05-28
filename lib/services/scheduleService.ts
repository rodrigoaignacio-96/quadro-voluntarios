import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, Timestamp, getDoc, writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Schedule, ScheduleEntry, ScheduleEntryFormData } from "@/types";
import { getSunday, sundayLabel, monthKey } from "@/lib/utils/dates";

const COL_SCHEDULES = "schedules";
const COL_ENTRIES   = "scheduleEntries";
const COL_HISTORY   = "history";

/* ─── Buscar ou criar escala do domingo ─── */
export async function getOrCreateWeekSchedule(referenceDate: Date = new Date()): Promise<Schedule> {
  const sunday = getSunday(referenceDate);
  const sundayTs = Timestamp.fromDate(sunday);
  const label = sundayLabel(referenceDate);

  const snap = await getDocs(
    query(
      collection(db, COL_SCHEDULES),
      where("sunday", "==", sundayTs)
    )
  );

  if (!snap.empty) {
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as Schedule;
  }

  const ref = await addDoc(collection(db, COL_SCHEDULES), {
    sunday:      sundayTs,
    sundayLabel: label,
    weekLabel:   label,
    createdBy:   "system",
    createdAt:   Timestamp.now(),
    updatedAt:   Timestamp.now(),
  });

  const created = await getDoc(ref);
  return { id: created.id, ...created.data() } as Schedule;
}

/* ─── Listar escalas ─── */
export async function getSchedules(): Promise<Schedule[]> {
  const snap = await getDocs(
    query(collection(db, COL_SCHEDULES), orderBy("sunday", "desc"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Schedule));
}

/* ─── Entradas de uma escala ─── */
export async function getScheduleEntries(scheduleId: string): Promise<ScheduleEntry[]> {
  const snap = await getDocs(
    query(
      collection(db, COL_ENTRIES),
      where("scheduleId", "==", scheduleId)
    )
  );
  const result = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ScheduleEntry));
  result.sort((a, b) => {
    const cultoOrder = ["09h", "11h", "18h"];
    const cultoA = cultoOrder.indexOf(a.culto ?? "09h");
    const cultoB = cultoOrder.indexOf(b.culto ?? "09h");
    if (cultoA !== cultoB) return cultoA - cultoB;
    return a.ministryName.localeCompare(b.ministryName, "pt-BR");
  });
  return result;
}

/* ─── Adicionar voluntário a uma escala ─── */
export async function addScheduleEntry(data: ScheduleEntryFormData): Promise<string> {
  const batch = writeBatch(db);

  // Remove campos undefined antes de salvar no Firestore
  const entryData: Record<string, unknown> = {
    scheduleId:    data.scheduleId,
    culto:         data.culto,
    ministryId:    data.ministryId,
    ministryName:  data.ministryName,
    ministryColor: data.ministryColor,
    volunteerId:   data.volunteerId,
    volunteerName: data.volunteerName,
    date:          data.date,
    createdAt:     Timestamp.now(),
  };
  if (data.role)              entryData.role              = data.role;
  if (data.volunteerPhotoUrl) entryData.volunteerPhotoUrl = data.volunteerPhotoUrl;

  const entryRef = doc(collection(db, COL_ENTRIES));
  batch.set(entryRef, entryData);

  // Registro no histórico
  const historyData: Record<string, unknown> = {
    volunteerId:   data.volunteerId,
    volunteerName: data.volunteerName,
    ministryId:    data.ministryId,
    ministryName:  data.ministryName,
    scheduleId:    data.scheduleId,
    culto:         data.culto,
    servedAt:      data.date,
    month:         monthKey(data.date.toDate()),
  };

  const historyRef = doc(collection(db, COL_HISTORY));
  batch.set(historyRef, historyData);

  await batch.commit();
  return entryRef.id;
}

/* ─── Remover entrada de uma escala ─── */
export async function removeScheduleEntry(entryId: string): Promise<void> {
  await deleteDoc(doc(db, COL_ENTRIES, entryId));
}

/* ─── Atualizar função do voluntário na escala ─── */
export async function updateScheduleEntry(entryId: string, role: string): Promise<void> {
  await updateDoc(doc(db, COL_ENTRIES, entryId), { role });
}

/* ─── Histórico de um voluntário ─── */
export async function getVolunteerHistory(volunteerId: string, limitMonths = 6) {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - limitMonths);

  const snap = await getDocs(
    query(
      collection(db, COL_HISTORY),
      where("volunteerId", "==", volunteerId),
      where("servedAt", ">=", Timestamp.fromDate(cutoff)),
      orderBy("servedAt", "desc")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* ─── Histórico geral (ranking) ─── */
export async function getHistoryForMonth(month?: string) {
  const key  = month ?? monthKey();
  const snap = await getDocs(
    query(
      collection(db, COL_HISTORY),
      where("month", "==", key),
      orderBy("servedAt", "desc")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}