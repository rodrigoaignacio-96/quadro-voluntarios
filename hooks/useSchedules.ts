"use client";
import { useState, useEffect, useCallback } from "react";
import { Schedule, ScheduleEntry, ScheduleEntryFormData } from "@/types";
import {
  getOrCreateWeekSchedule,
  getScheduleEntries,
  addScheduleEntry,
  removeScheduleEntry,
  updateScheduleEntry,
  getSchedules,
} from "@/lib/services/scheduleService";
import { nextSundayDate, prevSundayDate, getSunday } from "@/lib/utils/dates";
import toast from "react-hot-toast";

export function useSchedules() {
  const [referenceDate, setReferenceDate] = useState(() => getSunday(new Date()));
  const [schedule,      setSchedule]      = useState<Schedule | null>(null);
  const [entries,       setEntries]       = useState<ScheduleEntry[]>([]);
  const [allSchedules,  setAllSchedules]  = useState<Schedule[]>([]);
  const [loading,       setLoading]       = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sched, all] = await Promise.all([
        getOrCreateWeekSchedule(referenceDate),
        getSchedules(),
      ]);
      setSchedule(sched);
      setAllSchedules(all);
      const entriesData = await getScheduleEntries(sched.id);
      setEntries(entriesData);
    } catch (err) {
      console.error("Erro ao carregar escala:", err);
      toast.error("Erro ao carregar escalas.");
    } finally {
      setLoading(false);
    }
  }, [referenceDate]);

  useEffect(() => { load(); }, [load]);

  const goNextWeek = () => setReferenceDate((d) => nextSundayDate(d));
  const goPrevWeek = () => setReferenceDate((d) => prevSundayDate(d));
  const goToday    = () => setReferenceDate(getSunday(new Date()));

  async function addEntry(data: ScheduleEntryFormData) {
    if (!schedule) {
      console.error("ERRO: schedule é null!");
      toast.error("Escala não encontrada.");
      return;
    }
    // Verifica duplicata: mesmo voluntário, mesmo ministério, mesmo culto
    const exists = entries.some(
      (e) =>
        e.volunteerId === data.volunteerId &&
        e.ministryId  === data.ministryId  &&
        e.culto       === data.culto
    );
    if (exists) {
      toast.error("Este voluntário já está escalado neste culto e ministério.");
      return;
    }
    try {
      await addScheduleEntry({ ...data, scheduleId: schedule.id });
      toast.success("Voluntário escalado!");
      load();
    } catch (err) {
      console.error("ERRO ao adicionar entrada:", err);
      toast.error("Erro ao adicionar.");
    }
  }

  async function removeEntry(entryId: string) {
    await removeScheduleEntry(entryId);
    toast.success("Removido da escala.");
    load();
  }

  async function updateRole(entryId: string, role: string) {
    await updateScheduleEntry(entryId, role);
    load();
  }

  // Agrupa por culto → ministério
  const entriesByCulto = entries.reduce<Record<string, Record<string, ScheduleEntry[]>>>(
    (acc, entry) => {
      const culto = entry.culto ?? "09h";
      if (!acc[culto]) acc[culto] = {};
      if (!acc[culto][entry.ministryId]) acc[culto][entry.ministryId] = [];
      acc[culto][entry.ministryId].push(entry);
      return acc;
    },
    {}
  );

  // Mantido para compatibilidade
  const entriesByMinistry = entries.reduce<Record<string, ScheduleEntry[]>>((acc, entry) => {
    if (!acc[entry.ministryId]) acc[entry.ministryId] = [];
    acc[entry.ministryId].push(entry);
    return acc;
  }, {});

  return {
    schedule, entries, allSchedules, loading,
    entriesByMinistry, entriesByCulto, referenceDate,
    goNextWeek, goPrevWeek, goToday,
    addEntry, removeEntry, updateRole,
    refetch: load,
  };
}