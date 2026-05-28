import {
  collection, query, where, getDocs, orderBy, limit, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { getWeekStart, getWeekEnd, monthKey } from "@/lib/utils/dates";
import { DashboardStats, VolunteerRanking } from "@/types";

/* ─── Stats gerais do dashboard ─── */
export async function getDashboardStats(): Promise<DashboardStats> {
  const [volunteers, ministries, entries] = await Promise.all([
    getDocs(collection(db, "volunteers")),
    getDocs(collection(db, "ministries")),
    getDocs(
      query(
        collection(db, "scheduleEntries"),
        where("date", ">=", Timestamp.fromDate(getWeekStart())),
        where("date", "<=", Timestamp.fromDate(getWeekEnd()))
      )
    ),
  ]);

  const activeVols = volunteers.docs.filter((d) => d.data().status === "active");

  // Voluntários ativos este mês (apareceram em alguma escala)
  const monthStart = new Date();
  monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const monthEntries = await getDocs(
    query(
      collection(db, "scheduleEntries"),
      where("date", ">=", Timestamp.fromDate(monthStart))
    )
  );
  const activeThisMonth = new Set(monthEntries.docs.map((d) => d.data().volunteerId)).size;

  return {
    totalVolunteers:  volunteers.size,
    activeVolunteers: activeVols.length,
    totalMinistries:  ministries.size,
    scheduledThisWeek: new Set(entries.docs.map((d) => d.data().volunteerId)).size,
    activeThisMonth,
  };
}

/* ─── Atividade mensal (últimos 6 meses) ─── */
export async function getMonthlyActivity(): Promise<{ month: string; count: number }[]> {
  const results: { month: string; count: number }[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key   = monthKey(d);
    const label = d.toLocaleString("pt-BR", { month: "short" });

    const snap = await getDocs(
      query(collection(db, "scheduleEntries"), where("month", "==", key))
    );
    results.push({ month: label.charAt(0).toUpperCase() + label.slice(1), count: snap.size });
  }
  return results;
}

/* ─── Ranking de voluntários mais ativos do mês ─── */
export async function getTopVolunteers(limitN = 5): Promise<VolunteerRanking[]> {
  const key  = monthKey();
  const snap = await getDocs(
    query(collection(db, "scheduleEntries"), where("month", "==", key))
  );

  const map: Record<string, VolunteerRanking> = {};
  snap.docs.forEach((d) => {
    const data = d.data();
    const id   = data.volunteerId as string;
    if (!map[id]) {
      map[id] = {
        volunteerId:       id,
        volunteerName:     data.volunteerName,
        volunteerPhotoUrl: data.volunteerPhotoUrl,
        count:             0,
        ministries:        [],
      };
    }
    map[id].count++;
    if (!map[id].ministries.includes(data.ministryName)) {
      map[id].ministries.push(data.ministryName);
    }
  });

  return Object.values(map)
    .sort((a, b) => b.count - a.count)
    .slice(0, limitN);
}

/* ─── Escalas da semana com entradas agrupadas ─── */
export async function getWeekScheduleSummary() {
  const snap = await getDocs(
    query(
      collection(db, "scheduleEntries"),
      where("date", ">=", Timestamp.fromDate(getWeekStart())),
      where("date", "<=", Timestamp.fromDate(getWeekEnd())),
      orderBy("date")
    )
  );

  const groups: Record<string, { ministryName: string; ministryColor: string; volunteers: string[] }> = {};
  snap.docs.forEach((d) => {
    const data = d.data();
    const mid  = data.ministryId as string;
    if (!groups[mid]) {
      groups[mid] = { ministryName: data.ministryName, ministryColor: data.ministryColor ?? "#eab308", volunteers: [] };
    }
    if (!groups[mid].volunteers.includes(data.volunteerName)) {
      groups[mid].volunteers.push(data.volunteerName);
    }
  });

  return Object.values(groups);
}
