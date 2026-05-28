import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  isSameWeek,
  formatDistanceToNow,
  nextSunday,
  previousSunday,
  isSunday,
  addDays,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Timestamp } from "firebase/firestore";

/* Converte Firestore Timestamp para Date */
export function toDate(ts: Timestamp | Date | null | undefined): Date {
  if (!ts) return new Date();
  if (ts instanceof Date) return ts;
  return ts.toDate();
}

/* Formata data completa: "12 de junho de 2025" */
export function formatFull(ts: Timestamp | Date): string {
  return format(toDate(ts), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

/* Formata data curta: "12/06/2025" */
export function formatShort(ts: Timestamp | Date): string {
  return format(toDate(ts), "dd/MM/yyyy");
}

/* ─── Funções de Domingo ─────────────────────────────────── */

/* Retorna o domingo mais próximo (atual se hoje for domingo) */
export function getSunday(date: Date = new Date()): Date {
  if (isSunday(date)) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  // Vai para o próximo domingo
  const d = nextSunday(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/* Label do domingo: "01/06/2026" */
export function sundayLabel(date: Date = new Date()): string {
  const sunday = getSunday(date);
  return format(sunday, "dd/MM/yyyy");
}

/* Label amigável: "Domingo, 01 de junho de 2026" */
export function sundayFullLabel(date: Date = new Date()): string {
  const sunday = getSunday(date);
  return format(sunday, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

/* Navegar entre domingos */
export const nextSundayDate = (d: Date) => {
  const sunday = getSunday(d);
  return addWeeks(sunday, 1);
};

export const prevSundayDate = (d: Date) => {
  const sunday = getSunday(d);
  return subWeeks(sunday, 1);
};

/* ─── Funções de Semana (mantidas para compatibilidade) ──── */

/* Label da semana: "01/06 – 07/06/2025" */
export function weekLabel(date: Date = new Date()): string {
  const start = startOfWeek(date, { weekStartsOn: 0 });
  const end   = endOfWeek(date, { weekStartsOn: 0 });
  return `${format(start, "dd/MM")} – ${format(end, "dd/MM/yyyy")}`;
}

/* Início da semana (Domingo) */
export function getWeekStart(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 0 });
}

/* Fim da semana (Sábado) */
export function getWeekEnd(date: Date = new Date()): Date {
  return endOfWeek(date, { weekStartsOn: 0 });
}

/* Navegar semanas */
export const nextWeek  = (d: Date) => addWeeks(d, 1);
export const prevWeek  = (d: Date) => subWeeks(d, 1);

/* Verifica se data está na semana atual */
export const isCurrentWeek = (d: Date) => isSameWeek(d, new Date(), { weekStartsOn: 0 });

/* Tempo relativo: "há 3 dias" */
export function timeAgo(ts: Timestamp | Date): string {
  return formatDistanceToNow(toDate(ts), { addSuffix: true, locale: ptBR });
}

/* Mês para query: "2025-06" */
export function monthKey(date: Date = new Date()): string {
  return format(date, "yyyy-MM");
}

/* Nome do mês: "Junho" */
export function monthName(date: Date = new Date()): string {
  return format(date, "MMMM", { locale: ptBR });
}