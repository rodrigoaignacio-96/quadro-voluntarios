import { Timestamp } from "firebase/firestore";

/* ─────────────────────────────────────────
   USUÁRIO / AUTH
───────────────────────────────────────── */
export interface AppUser {
  id:        string;
  uid:       string;
  email:     string;
  name:      string;
  photoUrl?: string;
  role:      "admin" | "viewer";
  createdAt: Timestamp;
}

/* ─────────────────────────────────────────
   VOLUNTÁRIO
───────────────────────────────────────── */
export interface Volunteer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  photoUrl?: string;
  ministryIds: string[];
  status: "active" | "inactive";
  notes?: string;
  joinedAt: Timestamp;
  updatedAt: Timestamp;
}

export type VolunteerFormData = Omit<Volunteer, "id" | "joinedAt" | "updatedAt">;

/* ─────────────────────────────────────────
   MINISTÉRIO
───────────────────────────────────────── */
export interface Ministry {
  id: string;
  name: string;
  leaderId: string;
  leaderName: string;
  color: string;
  icon: string;
  volunteerIds: string[];
  createdAt: Timestamp;
}

export type MinistryFormData = Omit<Ministry, "id" | "createdAt">;

/* ─────────────────────────────────────────
   CULTO — identifica qual dos 3 cultos do domingo
───────────────────────────────────────── */
export type CultoSlot = "09h" | "11h" | "18h";

export const CULTO_LABELS: Record<CultoSlot, string> = {
  "09h": "Culto das 09h",
  "11h": "Culto das 11h",
  "18h": "Culto das 18h",
};

/* ─────────────────────────────────────────
   ESCALA DOMINICAL
───────────────────────────────────────── */
export interface Schedule {
  id: string;
  sunday: Timestamp;          // O domingo da escala
  sundayLabel: string;        // "01/06/2026"
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // mantidos para compatibilidade retroativa
  weekStart?: Timestamp;
  weekEnd?: Timestamp;
  weekLabel?: string;
}

export interface ScheduleEntry {
  id: string;
  scheduleId: string;
  culto: CultoSlot;           // "09h" | "11h" | "18h"
  ministryId: string;
  ministryName: string;
  ministryColor: string;
  volunteerId: string;
  volunteerName: string;
  volunteerPhotoUrl?: string;
  date: Timestamp;            // o domingo
  role?: string;
  createdAt: Timestamp;
}

export type ScheduleEntryFormData = Omit<ScheduleEntry, "id" | "createdAt">;

/* ─────────────────────────────────────────
   HISTÓRICO
───────────────────────────────────────── */
export interface HistoryEntry {
  id: string;
  volunteerId: string;
  volunteerName: string;
  ministryId: string;
  ministryName: string;
  scheduleId: string;
  culto?: CultoSlot;
  servedAt: Timestamp;
  month: string;
}

/* ─────────────────────────────────────────
   DASHBOARD / STATS
───────────────────────────────────────── */
export interface DashboardStats {
  totalVolunteers: number;
  activeVolunteers: number;
  totalMinistries: number;
  scheduledThisWeek: number;
  activeThisMonth: number;
}

export interface VolunteerRanking {
  volunteerId: string;
  volunteerName: string;
  volunteerPhotoUrl?: string;
  count: number;
  ministries: string[];
}

/* ─────────────────────────────────────────
   UI HELPERS
───────────────────────────────────────── */
export type NavItem = {
  label: string;
  href: string;
  icon: string;
  badge?: number;
};