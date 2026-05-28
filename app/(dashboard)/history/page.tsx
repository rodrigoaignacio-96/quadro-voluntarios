"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useVolunteers } from "@/hooks/useVolunteers";
import { useMinistries } from "@/hooks/useMinistries";
import { getHistoryForMonth } from "@/lib/services/scheduleService";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils/cn";
import { toDate, formatShort, monthKey, monthName } from "@/lib/utils/dates";
import { Timestamp } from "firebase/firestore";
import {
  Trophy, Search, ChevronLeft, ChevronRight,
  Calendar, BarChart3, Users,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";

type HistoryEntry = {
  id: string; volunteerId: string; volunteerName: string;
  ministryId: string; ministryName: string;
  scheduleId: string; servedAt: Timestamp; month: string;
};

type VolRanking = {
  volunteerId: string; volunteerName: string; photoUrl?: string;
  count: number; ministries: string[];
};

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: {value:number}[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-100 border border-surface-400/60 rounded-xl px-3 py-2 shadow-card text-[12px]">
      <p className="text-white/40 mb-0.5">{label}</p>
      <p className="text-white font-semibold">{payload[0].value} serviços</p>
    </div>
  );
}

export default function HistoryPage() {
  const setPageTitle = useAppStore((s) => s.setPageTitle);
  const { volunteers } = useVolunteers();
  const { ministries } = useMinistries();

  const [monthRef,  setMonthRef]  = useState(new Date());
  const [history,   setHistory]   = useState<HistoryEntry[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [viewMode,  setViewMode]  = useState<"ranking"|"list">("ranking");

  useEffect(() => { setPageTitle("Histórico"); }, [setPageTitle]);

  useEffect(() => {
    setLoading(true);
    getHistoryForMonth(monthKey(monthRef))
      .then((data) => setHistory(data as HistoryEntry[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [monthRef]);

  /* Ranking de voluntários */
  const ranking = useMemo((): VolRanking[] => {
    const map: Record<string, VolRanking> = {};
    history.forEach((h) => {
      if (!map[h.volunteerId]) {
        const vol = volunteers.find((v) => v.id === h.volunteerId);
        map[h.volunteerId] = {
          volunteerId: h.volunteerId,
          volunteerName: h.volunteerName,
          photoUrl: vol?.photoUrl,
          count: 0,
          ministries: [],
        };
      }
      map[h.volunteerId].count++;
      if (!map[h.volunteerId].ministries.includes(h.ministryName)) {
        map[h.volunteerId].ministries.push(h.ministryName);
      }
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [history, volunteers]);

  /* Atividade por ministério */
  const byMinistry = useMemo(() => {
    const map: Record<string, number> = {};
    history.forEach((h) => { map[h.ministryName] = (map[h.ministryName] ?? 0) + 1; });
    return Object.entries(map).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count);
  }, [history]);

  const filteredRanking = ranking.filter((r) =>
    r.volunteerName.toLowerCase().includes(search.toLowerCase())
  );

  const currentMonthName = monthName(monthRef);
  const currentYear = monthRef.getFullYear();

  function prevMonth() { setMonthRef((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1)); }
  function nextMonth() { setMonthRef((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1)); }

  const MINISTRY_COLORS = ["#eab308","#8b5cf6","#3b82f6","#10b981","#ec4899","#f97316","#06b6d4"];

  return (
    <div className="p-5 sm:p-6 space-y-5 page-enter">

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-semibold text-white">Histórico</h1>
          <p className="text-[12px] text-white/35 mt-0.5">{history.length} registros em {currentMonthName} de {currentYear}</p>
        </div>
        {/* Navegação de mês */}
        <div className="flex items-center gap-1 bg-surface-100 border border-surface-400/40 rounded-xl p-1">
          <button onClick={prevMonth} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 text-[13px] font-medium text-white/70 min-w-[120px] text-center capitalize">
            {currentMonthName} {currentYear}
          </span>
          <button onClick={nextMonth} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats rápidos */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Serviços no mês", value: history.length,           icon: Calendar, color: "text-brand-400" },
          { label: "Voluntários ativos", value: ranking.length,         icon: Users,    color: "text-blue-400" },
          { label: "Ministérios",       value: byMinistry.length,       icon: BarChart3,color: "text-violet-400" },
        ].map((s) => (
          <div key={s.label} className="card p-3 text-center">
            <s.icon className={cn("w-4 h-4 mx-auto mb-1", s.color)} />
            <p className={cn("text-[22px] font-semibold", s.color)}>{loading ? "–" : s.value}</p>
            <p className="text-[10px] text-white/30 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Gráfico por ministério */}
      {!loading && byMinistry.length > 0 && (
        <div className="card p-5">
          <h2 className="text-[14px] font-semibold text-white mb-4">Serviços por ministério</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={byMinistry} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="count" radius={[6,6,0,0]}>
                {byMinistry.map((_, i) => (
                  <Cell key={i} fill={MINISTRY_COLORS[i % MINISTRY_COLORS.length]} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Ranking */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[14px] font-semibold text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-brand-400" /> Ranking de voluntários
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..." className="input-base pl-8 py-1.5 text-[12px] w-44"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">{Array(5).fill(0).map((_,i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : filteredRanking.length === 0 ? (
          <div className="py-12 text-center">
            <Trophy className="w-8 h-8 text-white/10 mx-auto mb-2" />
            <p className="text-[13px] text-white/25">Nenhum serviço registrado neste mês</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-400/30">
            {filteredRanking.map((vol, i) => (
              <div key={vol.volunteerId} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0",
                  i === 0 && "bg-brand-500/20 text-brand-300",
                  i === 1 && "bg-white/8 text-white/50",
                  i === 2 && "bg-orange-500/12 text-orange-400",
                  i > 2  && "text-white/25 text-[12px]"
                )}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                </div>
                <Avatar name={vol.volunteerName} photoUrl={vol.photoUrl} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-white/85 truncate">{vol.volunteerName}</p>
                  <p className="text-[11px] text-white/30 truncate">{vol.ministries.join(" · ")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block w-24 h-1.5 bg-surface-300 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full transition-all"
                         style={{ width: `${(vol.count / (filteredRanking[0]?.count || 1)) * 100}%` }} />
                  </div>
                  <span className="text-[12px] font-semibold text-white/50 tabular-nums w-10 text-right">
                    {vol.count}×
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lista completa de entradas */}
      {!loading && history.length > 0 && (
        <div className="card p-5">
          <h2 className="text-[14px] font-semibold text-white mb-4">Todas as entradas</h2>
          <div className="divide-y divide-surface-400/30 max-h-80 overflow-y-auto pr-1">
            {history.map((h) => {
              const ministry = ministries.find((m) => m.id === h.ministryId);
              return (
                <div key={h.id} className="flex items-center gap-3 py-2.5 first:pt-0">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ministry?.color ?? "#eab308" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-white/75 truncate">{h.volunteerName}</p>
                    <p className="text-[11px] text-white/30">{h.ministryName}</p>
                  </div>
                  <p className="text-[11px] text-white/30 flex-shrink-0">{formatShort(h.servedAt)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
