"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useMinistries } from "@/hooks/useMinistries";
import { useVolunteers } from "@/hooks/useVolunteers";
import { Ministry, MinistryFormData, Volunteer } from "@/types";
import { Modal, ModalCancelButton } from "@/components/ui/Modal";
import { FormField, Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils/cn";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Church, Plus, Pencil, Trash2, Users, Loader2 } from "lucide-react";
import { MINISTRY_COLORS } from "@/lib/services/ministryService";
import toast from "react-hot-toast";

const schema = z.object({
  name:       z.string().min(2, "Nome obrigatório"),
  leaderId:   z.string().min(1, "Selecione um líder"),
  leaderName: z.string(),
  color:      z.string(),
  icon:       z.string(),
});
type FormData = z.infer<typeof schema>;

/* Modal de voluntários */
function MinistryVolunteersModal({ ministry, volunteers, onClose }: {
  ministry:   Ministry;
  volunteers: Volunteer[];
  onClose:    () => void;
}) {
  const ministryVolunteers = volunteers.filter((v) => v.ministryIds?.includes(ministry.id));
  const active   = ministryVolunteers.filter((v) => v.status === "active");
  const inactive = ministryVolunteers.filter((v) => v.status === "inactive");

  return (
    <Modal open onClose={onClose} title={ministry.name} subtitle={`${ministryVolunteers.length} voluntário${ministryVolunteers.length !== 1 ? "s" : ""}`} size="md">
      {ministryVolunteers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Users className="w-10 h-10 text-white/10 mb-3" />
          <p className="text-[13px] text-white/30">Nenhum voluntário neste ministério</p>
          <p className="text-[11px] text-white/20 mt-1">Vincule voluntários pelo módulo de Voluntários</p>
        </div>
      ) : (
        <div className="space-y-5">
          {active.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/25 mb-3">Ativos ({active.length})</p>
              <div className="space-y-2">
                {active.map((v) => (
                  <div key={v.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-200 hover:bg-surface-300 transition-colors">
                    <Avatar name={v.name} photoUrl={v.photoUrl} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-white truncate">{v.name}</p>
                      {v.phone && <p className="text-[11px] text-white/35">{v.phone}</p>}
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Ativo</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {inactive.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/25 mb-3">Inativos ({inactive.length})</p>
              <div className="space-y-2">
                {inactive.map((v) => (
                  <div key={v.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-200 opacity-50">
                    <Avatar name={v.name} photoUrl={v.photoUrl} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-white truncate">{v.name}</p>
                      {v.phone && <p className="text-[11px] text-white/35">{v.phone}</p>}
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-300 text-white/30">Inativo</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

/* Card de ministério */
function MinistryCard({ ministry, volunteerCount, onEdit, onDelete, onViewVolunteers }: {
  ministry:         Ministry;
  volunteerCount:   number;
  onEdit:           (m: Ministry) => void;
  onDelete:         (m: Ministry) => void;
  onViewVolunteers: (m: Ministry) => void;
}) {
  return (
    <div className="card p-5 hover:border-white/10 transition-all duration-200 group cursor-pointer" onClick={() => onViewVolunteers(ministry)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ backgroundColor: `${ministry.color}18`, border: `1px solid ${ministry.color}30` }}>
            <Church className="w-5 h-5" style={{ color: ministry.color }} />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-white">{ministry.name}</p>
            <p className="text-[11px] text-white/35 mt-0.5">Líder: {ministry.leaderName || "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => onEdit(ministry)} className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(ministry)} className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/[0.06] transition-all">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[12px] text-white/40">
        <Users className="w-3.5 h-3.5" />
        <span>{volunteerCount} voluntário{volunteerCount !== 1 ? "s" : ""}</span>
        <span className="ml-auto text-[10px] text-white/20 group-hover:text-white/40 transition-colors">Ver lista →</span>
      </div>
      <div className="mt-4 h-0.5 rounded-full" style={{ backgroundColor: `${ministry.color}30` }}>
        <div className="h-full rounded-full" style={{ backgroundColor: ministry.color, width: `${Math.min(100, volunteerCount * 10)}%` }} />
      </div>
    </div>
  );
}

/* Formulário */
function MinistryForm({ initial, volunteers, onSave, onClose }: {
  initial?:   Ministry;
  volunteers: { id: string; name: string }[];
  onSave:     (data: FormData) => Promise<void>;
  onClose:    () => void;
}) {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:       initial?.name       ?? "",
      leaderId:   initial?.leaderId   ?? "",
      leaderName: initial?.leaderName ?? "",
      color:      initial?.color      ?? "#eab308",
      icon:       initial?.icon       ?? "church",
    },
  });
  const selectedColor = watch("color");

  function onLeaderChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const vol = volunteers.find((v) => v.id === e.target.value);
    setValue("leaderId",   e.target.value);
    setValue("leaderName", vol?.name ?? "");
  }

  async function onSubmit(data: FormData) {
    setSaving(true);
    try { await onSave(data); onClose(); }
    catch { toast.error("Erro ao salvar."); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Nome do ministério" error={errors.name?.message} required>
        <Input {...register("name")} placeholder="Ex: Louvor, Mídia, Kids..." error={!!errors.name} />
      </FormField>
      <FormField label="Líder responsável" error={errors.leaderId?.message} required>
        <select {...register("leaderId")} onChange={onLeaderChange} defaultValue={initial?.leaderId ?? ""} className="input-base appearance-none">
          <option value="">Selecione um voluntário...</option>
          {volunteers.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </FormField>
      <FormField label="Cor do ministério">
        <div className="flex flex-wrap gap-2 mt-1">
          {MINISTRY_COLORS.map((c) => (
            <button key={c.value} type="button" onClick={() => setValue("color", c.value)}
              className={cn("w-8 h-8 rounded-lg border-2 transition-all", selectedColor === c.value ? "border-white scale-110" : "border-transparent hover:scale-105")}
              style={{ backgroundColor: c.value }} title={c.label} />
          ))}
        </div>
      </FormField>
      <div className="flex justify-end gap-3 pt-2">
        <ModalCancelButton onClick={onClose} />
        <button type="submit" disabled={saving} className="btn-primary px-5">
          {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Salvando...</> : (initial ? "Salvar" : "Criar ministério")}
        </button>
      </div>
    </form>
  );
}

/* Página principal */
export default function MinistriesPage() {
  const setPageTitle = useAppStore((s) => s.setPageTitle);
  const { ministries, loading, create, update, remove } = useMinistries();
  const { volunteers } = useVolunteers();

  const [modal,           setModal]           = useState<"add"|"edit"|null>(null);
  const [selected,        setSelected]        = useState<Ministry | null>(null);
  const [deleting,        setDeleting]        = useState<Ministry | null>(null);
  const [viewingMinistry, setViewingMinistry] = useState<Ministry | null>(null);

  useEffect(() => { setPageTitle("Ministérios"); }, [setPageTitle]);

  const volOptions = volunteers.filter(v => v.status === "active").map((v) => ({ id: v.id, name: v.name }));

  async function handleSave(data: FormData) {
    const payload: MinistryFormData = { ...data, volunteerIds: selected?.volunteerIds ?? [] };
    if (selected) await update(selected.id, payload);
    else await create(payload);
  }

  async function handleDelete() {
    if (!deleting) return;
    await remove(deleting.id);
    setDeleting(null);
  }

  function getVolunteerCount(ministry: Ministry) {
    return volunteers.filter((v) => v.ministryIds?.includes(ministry.id)).length;
  }

  return (
    <div className="p-5 sm:p-6 space-y-5 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-white">Ministérios</h1>
          <p className="text-[12px] text-white/35 mt-0.5">{ministries.length} ministérios cadastrados</p>
        </div>
        <button onClick={() => { setSelected(null); setModal("add"); }} className="btn-primary">
          <Plus className="w-4 h-4" /> Novo ministério
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array(4).fill(0).map((_,i) => <Skeleton key={i} className="h-36" />)}
        </div>
      ) : ministries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Church className="w-12 h-12 text-white/10 mb-3" />
          <p className="text-[14px] text-white/30">Nenhum ministério cadastrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {ministries.map((m) => (
            <MinistryCard key={m.id} ministry={m} volunteerCount={getVolunteerCount(m)}
              onEdit={(v) => { setSelected(v); setModal("edit"); }}
              onDelete={setDeleting}
              onViewVolunteers={setViewingMinistry}
            />
          ))}
        </div>
      )}

      {viewingMinistry && (
        <MinistryVolunteersModal ministry={viewingMinistry} volunteers={volunteers} onClose={() => setViewingMinistry(null)} />
      )}

      <Modal open={modal !== null} onClose={() => setModal(null)}
             title={modal === "edit" ? "Editar ministério" : "Novo ministério"} size="md">
        <MinistryForm initial={modal === "edit" ? selected ?? undefined : undefined}
          volunteers={volOptions} onSave={handleSave} onClose={() => setModal(null)} />
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Remover ministério" size="sm"
             footer={<><ModalCancelButton onClick={() => setDeleting(null)} />
               <button onClick={handleDelete} className="btn-primary bg-red-500 hover:bg-red-400 px-4">
                 <Trash2 className="w-3.5 h-3.5" /> Remover
               </button></>}>
        <p className="text-[13px] text-white/60">
          Remover <strong className="text-white">{deleting?.name}</strong>? Os voluntários não serão removidos.
        </p>
      </Modal>
    </div>
  );
}
