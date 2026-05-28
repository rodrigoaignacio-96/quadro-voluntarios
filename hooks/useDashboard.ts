"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getDashboardStats,
  getMonthlyActivity,
  getTopVolunteers,
  getWeekScheduleSummary,
} from "@/lib/services/dashboardService";
import { DashboardStats, VolunteerRanking } from "@/types";

interface DashboardData {
  stats:           DashboardStats | null;
  monthlyActivity: { month: string; count: number }[];
  topVolunteers:   VolunteerRanking[];
  weekSummary:     { ministryName: string; ministryColor: string; volunteers: string[] }[];
  loading:         boolean;
  error:           string | null;
  refetch:         () => void;
}

export function useDashboard(): DashboardData {
  const [stats,           setStats]           = useState<DashboardStats | null>(null);
  const [monthlyActivity, setMonthlyActivity] = useState<{ month: string; count: number }[]>([]);
  const [topVolunteers,   setTopVolunteers]   = useState<VolunteerRanking[]>([]);
  const [weekSummary,     setWeekSummary]     = useState<{ ministryName: string; ministryColor: string; volunteers: string[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, ma, tv, ws] = await Promise.all([
        getDashboardStats(),
        getMonthlyActivity(),
        getTopVolunteers(),
        getWeekScheduleSummary(),
      ]);
      setStats(s);
      setMonthlyActivity(ma);
      setTopVolunteers(tv);
      setWeekSummary(ws);
    } catch (err) {
      setError("Erro ao carregar dados. Verifique sua conexão.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { stats, monthlyActivity, topVolunteers, weekSummary, loading, error, refetch: load };
}
