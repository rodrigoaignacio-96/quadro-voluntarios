"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useSchedules } from "@/hooks/useSchedules";
import { useVolunteers } from "@/hooks/useVolunteers";
import { useMinistries } from "@/hooks/useMinistries";
import { ScheduleEntry, CultoSlot, CULTO_LABELS } from "@/types";
import { Modal, ModalCancelButton } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils/cn";
import { Timestamp } from "firebase/firestore";
import { sundayFullLabel } from "@/lib/utils/dates";
import {
  ChevronLeft, ChevronRight, CalendarDays, Plus,
  Trash2, Loader2, Home, RefreshCw, Clock,
} from "lucide-react";
import toast from "react-hot-toast";

const CULTOS: CultoSlot[] = ["09h", "11h", "18h"];

/* ── Card de ministério dentro de um culto ── */
function MinistryCard({
  ministryName, ministryColor, entries, onRemove,
}: {
  ministryName:  string;
  ministryColor: string;
  entries:       ScheduleEntry[];
  onRemove:      (id: string) => void;
}) {
  return (
    <div className="bg-surface-200 rounded-xl p-3 border border-white/[0.05]">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ministryColor }} />
        <p className="text-[12px] font-semibold text-white/80">{ministryName}</p>
        <span className="ml-auto text-[10px] text-white/25">{entries.length}</span>
      </div>
      <div className="space-y-1.5">
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-center gap-2 group">
            <Avatar name={entry.volunteerName} photoUrl={entry.volunteerPhotoUrl} size="xs" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-white/70 truncate">{entry.volunteerName}</p>
              {entry.role && <p className="text-[10px] text-white/30">{entry.role}</p>}
            </div>
            <button
              onClick={() => onRemove(entry.id)}
              className="p-1 rounded text-white/10 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Seção de culto ── */
function CultoSection({
  culto, entriesByMinistry, ministries, onRemove,
}: {
  culto:             CultoSlot;
  entriesByMinistry: Record<string, ScheduleEntry[]>;
  ministries:        { id: string; name: string; color: string }[];
  onRemove:          (id: string) => void;
}) {
  const totalVol = Object.values(entriesByMinistry).flat().length;

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
          <Clock className="w-4 h-4 text-brand-400" />
        </div>
        <div>
          <h3 className="text-[14px] font-semibold text-white">{CULTO_LABELS[culto]}</h3>
          <p className="text-[11px] text-white/30">{totalVol} voluntário{totalVol !== 1 ? "s" : ""} escalado{totalVol !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {Object.keys(entriesByMinistry).length === 0 ? (
        <p className="text-[12px] text-white/20 text-center py-4">Nenhum voluntário escalado</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {ministries
            .filter((m) => entriesByMinistry[m.id])
            .map((m) => (
              <MinistryCard
                key={m.id}
                ministryName={m.name}
                ministryColor={m.color}
                entries={entriesByMinistry[m.id]}
                onRemove={onRemove}
              />
            ))}
        </div>
      )}
    </div>
  );
}

/* ── Formulário de adicionar ── */
function AddEntryForm({
  ministries, volunteers, onAdd, onClose,
}: {
  ministries: { id: string; name: string; color: string }[];
  volunteers: { id: string; name: string; photoUrl?: string }[];
  onAdd:      (data: { culto: CultoSlot; ministryId: string; volunteerId: string; role?: string }) => Promise<void>;
  onClose:    () => void;
}) {
  const [culto,       setCulto]       = useState<CultoSlot>("09h");
  const [ministryId,  setMinistryId]  = useState("");
  const [volunteerId, setVolunteerId] = useState("");
  const [role,        setRole]        = useState("");
  const [saving,      setSaving]      = useState(false);

  async function handleAdd() {
    if (!ministryId || !volunteerId) {
      toast.error("Selecione o ministério e o voluntário.");
      return;
    }
    setSaving(true);
    try {
      await onAdd({ culto, ministryId, volunteerId, role: role || undefined });
      onClose();
    } catch {
      toast.error("Erro ao adicionar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Seleção de culto */}
      <FormField label="Culto" required>
        <div className="grid grid-cols-3 gap-2">
          {CULTOS.map((c) => (
            <button
              key={c} type="button"
              onClick={() => setCulto(c)}
              className={cn(
                "py-2.5 rounded-xl text-[13px] font-medium border transition-all",
                culto === c
                  ? "bg-brand-500/10 border-brand-500/40 text-brand-300"
                  : "border-surface-400/40 text-white/40 hover:border-surface-400 hover:text-white/70"
              )}
            >
              {CULTO_LABELS[c]}
            </button>
          ))}
        </div>
      </FormField>

      <FormField label="Ministério" required>
        <select
          value={ministryId}
          onChange={(e) => setMinistryId(e.target.value)}
          className="input-base appearance-none"
        >
          <option value="">Selecione um ministério...</option>
          {ministries.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </FormField>

      <FormField label="Voluntário" required>
        <select
          value={volunteerId}
          onChange={(e) => setVolunteerId(e.target.value)}
          className="input-base appearance-none"
        >
          <option value="">Selecione um voluntário...</option>
          {volunteers.length === 0 && (
            <option disabled>Nenhum voluntário ativo cadastrado</option>
          )}
          {volunteers.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
      </FormField>

      <FormField label="Função (opcional)" hint="Ex: Baterista, Câmera, Recepcionista">
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Função na escala..."
          className="input-base"
        />
      </FormField>

      <div className="flex justify-end gap-3 pt-2">
        <ModalCancelButton onClick={onClose} />
        <button
          onClick={handleAdd}
          disabled={saving || !ministryId || !volunteerId}
          className="btn-primary px-5"
        >
          {saving
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Adicionando...</>
            : "Adicionar à escala"}
        </button>
      </div>
    </div>
  );
}

/* ── Página principal ── */
export default function SchedulesPage() {
  const setPageTitle = useAppStore((s) => s.setPageTitle);
  const {
    schedule, entries, loading, entriesByCulto, referenceDate,
    goNextWeek, goPrevWeek, goToday,
    addEntry, removeEntry, refetch,
  } = useSchedules();
  const { volunteers } = useVolunteers(true);
  const { ministries } = useMinistries();

  const [modal, setModal] = useState(false);

  useEffect(() => { setPageTitle("Escala Dominical"); }, [setPageTitle]);

  const ministriesForForm = ministries.map((m) => ({ id: m.id, name: m.name, color: m.color }));
  const volunteersForForm = volunteers.map((v) => ({ id: v.id, name: v.name, photoUrl: v.photoUrl }));

  async function handleAdd(data: { culto: CultoSlot; ministryId: string; volunteerId: string; role?: string }) {
    const ministry  = ministries.find((m) => m.id === data.ministryId)!;
    const volunteer = volunteers.find((v) => v.id === data.volunteerId)!;
    await addEntry({
      scheduleId:        schedule!.id,
      culto:             data.culto,
      ministryId:        data.ministryId,
      ministryName:      ministry.name,
      ministryColor:     ministry.color,
      volunteerId:       data.volunteerId,
      volunteerName:     volunteer.name,
      volunteerPhotoUrl: volunteer.photoUrl,
      date:              Timestamp.fromDate(referenceDate),
      role:              data.role,
    });
  }

  const totalEscalados = entries.length;

  return (
    <div className="p-5 sm:p-6 space-y-5 page-enter">

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-semibold text-white">Escala Dominical</h1>
          <p className="text-[12px] text-white/35 mt-0.5 capitalize">
            {schedule ? sundayFullLabel(referenceDate) : "Carregando..."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refetch} disabled={loading} className="p-2 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/[0.04] transition-all">
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          <div className="flex items-center gap-1 bg-surface-100 border border-surface-400/40 rounded-xl p-1">
            <button onClick={goPrevWeek} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={goToday} className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-white/50 hover:text-white hover:bg-white/[0.06] transition-all flex items-center gap-1">
              <Home className="w-3 h-3" /> Hoje
            </button>
            <button onClick={goNextWeek} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button onClick={() => setModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Escalar voluntário
          </button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Culto 09h", value: Object.values(entriesByCulto["09h"] ?? {}).flat().length, color: "text-blue-400" },
          { label: "Culto 11h", value: Object.values(entriesByCulto["11h"] ?? {}).flat().length, color: "text-brand-400" },
          { label: "Culto 18h", value: Object.values(entriesByCulto["18h"] ?? {}).flat().length, color: "text-violet-400" },
        ].map((s) => (
          <div key={s.label} className="card p-3 text-center">
            <p className={cn("text-[22px] font-semibold", s.color)}>{loading ? "–" : s.value}</p>
            <p className="text-[11px] text-white/30 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Seções de culto */}
      {loading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_,i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : totalEscalados === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CalendarDays className="w-12 h-12 text-white/10 mb-3" />
          <p className="text-[14px] text-white/30">Nenhum voluntário escalado neste domingo</p>
          <p className="text-[12px] text-white/20 mt-1">Clique em "Escalar voluntário" para começar</p>
          <button onClick={() => setModal(true)} className="btn-primary mt-5 text-sm">
            <Plus className="w-4 h-4" /> Escalar voluntário
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {CULTOS.map((culto) => (
            <CultoSection
              key={culto}
              culto={culto}
              entriesByMinistry={entriesByCulto[culto] ?? {}}
              ministries={ministriesForForm}
              onRemove={removeEntry}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Escalar voluntário"
        subtitle={schedule ? sundayFullLabel(referenceDate) : ""}
        size="md"
      >
        <AddEntryForm
          ministries={ministriesForForm}
          volunteers={volunteersForForm}
          onAdd={handleAdd}
          onClose={() => setModal(false)}
        />
      </Modal>
    </div>
  );
}
