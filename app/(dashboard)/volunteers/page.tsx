"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useVolunteers } from "@/hooks/useVolunteers";
import { useMinistries } from "@/hooks/useMinistries";
import { Volunteer, VolunteerFormData } from "@/types";
import { Modal, ModalCancelButton } from "@/components/ui/Modal";
import { FormField, Input, Textarea, Select } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils/cn";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Timestamp } from "firebase/firestore";
import {
  UserPlus, Search, Filter, MoreVertical,
  Phone, Pencil, Trash2, Power, Loader2,
  Users, CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

/* ── Schema — telefone OPCIONAL ── */
const schema = z.object({
  name:        z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  phone:       z.string().optional().or(z.literal("")),   // ← era min(8), agora opcional
  email:       z.string().email("E-mail inválido").optional().or(z.literal("")),
  notes:       z.string().optional(),
  status:      z.enum(["active", "inactive"]),
  ministryIds: z.array(z.string()),
});
type FormData = z.infer<typeof schema>;

/* ── Card de voluntário ── */
function VolunteerCard({
  vol, ministries, onEdit, onDelete, onToggle,
}: {
  vol:        Volunteer;
  ministries: { id: string; name: string; color: string }[];
  onEdit:     (v: Volunteer) => void;
  onDelete:   (v: Volunteer) => void;
  onToggle:   (v: Volunteer) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const volMin = ministries.filter((m) => vol.ministryIds?.includes(m.id));

  return (
    <div className={cn("card p-4 transition-all duration-200 hover:border-white/10 group", vol.status === "inactive" && "opacity-60")}>
      <div className="flex items-start gap-3">
        <Avatar name={vol.name} photoUrl={vol.photoUrl} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-semibold text-white truncate">{vol.name}</p>
            <Badge variant={vol.status === "active" ? "success" : "default"} dot>
              {vol.status === "active" ? "Ativo" : "Inativo"}
            </Badge>
          </div>
          {vol.phone && (
            <p className="text-[12px] text-white/35 mt-0.5 flex items-center gap-1">
              <Phone className="w-3 h-3" /> {vol.phone}
            </p>
          )}
          {volMin.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {volMin.map((m) => (
                <span
                  key={m.id}
                  className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                  style={{ backgroundColor: `${m.color}20`, color: m.color, border: `1px solid ${m.color}30` }}
                >
                  {m.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1.5 rounded-lg text-white/20 hover:text-white/70 hover:bg-white/[0.06] transition-all opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-8 z-20 w-40 bg-surface-100 border border-surface-400/60 rounded-xl shadow-card overflow-hidden">
                <button onClick={() => { onEdit(vol); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-white/70 hover:bg-white/[0.05] transition-colors">
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </button>
                <button onClick={() => { onToggle(vol); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-white/70 hover:bg-white/[0.05] transition-colors">
                  <Power className="w-3.5 h-3.5" /> {vol.status === "active" ? "Desativar" : "Ativar"}
                </button>
                <button onClick={() => { onDelete(vol); setMenuOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-red-400 hover:bg-red-500/[0.06] transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Remover
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Formulário ── */
function VolunteerForm({
  initial, ministries, onSave, onClose,
}: {
  initial?:   Volunteer;
  ministries: { id: string; name: string; color: string }[];
  onSave:     (data: FormData) => Promise<void>;
  onClose:    () => void;
}) {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:        initial?.name        ?? "",
      phone:       initial?.phone       ?? "",
      email:       initial?.email       ?? "",
      notes:       initial?.notes       ?? "",
      status:      initial?.status      ?? "active",
      ministryIds: initial?.ministryIds ?? [],
    },
  });

  const selectedMinistries = watch("ministryIds");

  function toggleMinistry(id: string) {
    const cur = selectedMinistries ?? [];
    setValue("ministryIds", cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  }

  async function onSubmit(data: FormData) {
    setSaving(true);
    try { await onSave(data); onClose(); }
    catch { toast.error("Erro ao salvar."); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Nome completo" error={errors.name?.message} required>
        <Input {...register("name")} placeholder="Maria da Silva" error={!!errors.name} />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        {/* telefone: não é mais required */}
        <FormField label="Telefone" error={errors.phone?.message}>
          <Input {...register("phone")} placeholder="(11) 99999-9999" />
        </FormField>
        <FormField label="Status">
          <Select {...register("status")} options={[{ value:"active",label:"Ativo" },{ value:"inactive",label:"Inativo" }]} />
        </FormField>
      </div>

      <FormField label="E-mail" error={errors.email?.message}>
        <Input {...register("email")} type="email" placeholder="maria@email.com" />
      </FormField>

      {ministries.length > 0 && (
        <FormField label="Ministérios">
          <div className="flex flex-wrap gap-2 mt-1">
            {ministries.map((m) => {
              const selected = selectedMinistries?.includes(m.id);
              return (
                <button
                  key={m.id} type="button"
                  onClick={() => toggleMinistry(m.id)}
                  className={cn(
                    "text-[12px] px-2.5 py-1 rounded-lg border transition-all font-medium",
                    selected ? "border-current" : "border-surface-400/40 text-white/40 hover:border-surface-400"
                  )}
                  style={selected ? { backgroundColor: `${m.color}18`, color: m.color, borderColor: `${m.color}40` } : {}}
                >
                  {m.name}
                </button>
              );
            })}
          </div>
        </FormField>
      )}

      <FormField label="Observações internas">
        <Textarea {...register("notes")} placeholder="Anotações sobre disponibilidade, contatos, etc." rows={2} />
      </FormField>

      <div className="flex justify-end gap-3 pt-2">
        <ModalCancelButton onClick={onClose} />
        <button type="submit" disabled={saving} className="btn-primary px-5">
          {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Salvando...</> : (initial ? "Salvar alterações" : "Adicionar voluntário")}
        </button>
      </div>
    </form>
  );
}

/* ── Página ── */
export default function VolunteersPage() {
  const setPageTitle = useAppStore((s) => s.setPageTitle);
  const { volunteers, loading, create, update, remove, toggleStatus } = useVolunteers();
  const { ministries } = useMinistries();

  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState<"all"|"active"|"inactive">("all");
  const [modal,    setModal]    = useState<"add"|"edit"|null>(null);
  const [selected, setSelected] = useState<Volunteer | null>(null);
  const [deleting, setDeleting] = useState<Volunteer | null>(null);

  useEffect(() => { setPageTitle("Voluntários"); }, [setPageTitle]);

  const filtered = useMemo(() => {
    return volunteers.filter((v) => {
      const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) ||
                          (v.phone ?? "").includes(search);
      const matchFilter = filter === "all" || v.status === filter;
      return matchSearch && matchFilter;
    });
  }, [volunteers, search, filter]);

  const ministriesForCard = ministries.map((m) => ({ id: m.id, name: m.name, color: m.color }));

  async function handleSave(data: FormData) {
    const payload = {
      ...data,
      phone:     data.phone    ?? "",
      email:     data.email    ?? "",
      notes:     data.notes    ?? "",
      photoUrl:  selected?.photoUrl ?? "",
      joinedAt:  selected?.joinedAt ?? Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    if (selected) await update(selected.id, payload);
    else          await create(payload);
  }

  async function handleDelete() {
    if (!deleting) return;
    await remove(deleting.id);
    setDeleting(null);
  }

  return (
    <div className="p-5 sm:p-6 space-y-5 page-enter">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-semibold text-white">Voluntários</h1>
          <p className="text-[12px] text-white/35 mt-0.5">
            {volunteers.length} cadastrados · {volunteers.filter(v=>v.status==="active").length} ativos
          </p>
        </div>
        <button onClick={() => { setSelected(null); setModal("add"); }} className="btn-primary flex-shrink-0">
          <UserPlus className="w-4 h-4" /> Adicionar voluntário
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou telefone..."
            className="input-base pl-9 w-full"
          />
        </div>
        <div className="flex items-center gap-1 bg-surface-100 border border-surface-400/40 rounded-xl p-1">
          {(["all","active","inactive"] as const).map((f) => (
            <button
              key={f} onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all",
                filter === f ? "bg-surface-300 text-white" : "text-white/35 hover:text-white/60"
              )}
            >
              {f === "all" ? "Todos" : f === "active" ? "Ativos" : "Inativos"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {Array(6).fill(0).map((_,i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="w-12 h-12 text-white/10 mb-3" />
          <p className="text-[14px] text-white/30">{search ? "Nenhum voluntário encontrado" : "Nenhum voluntário cadastrado"}</p>
          <p className="text-[12px] text-white/20 mt-1">
            {search ? "Tente outro termo de busca" : "Clique em 'Adicionar voluntário' para começar"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((vol) => (
            <VolunteerCard
              key={vol.id} vol={vol} ministries={ministriesForCard}
              onEdit={(v) => { setSelected(v); setModal("edit"); }}
              onDelete={setDeleting}
              onToggle={toggleStatus}
            />
          ))}
        </div>
      )}

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal === "edit" ? "Editar voluntário" : "Novo voluntário"}
        subtitle={modal === "edit" ? selected?.name : "Preencha os dados do voluntário"}
        size="md"
      >
        <VolunteerForm
          initial={modal === "edit" ? selected ?? undefined : undefined}
          ministries={ministriesForCard}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      </Modal>

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Remover voluntário"
        subtitle="Esta ação não pode ser desfeita"
        size="sm"
        footer={
          <>
            <ModalCancelButton onClick={() => setDeleting(null)} />
            <button onClick={handleDelete} className="btn-primary bg-red-500 hover:bg-red-400 px-4">
              <Trash2 className="w-3.5 h-3.5" /> Remover
            </button>
          </>
        }
      >
        <p className="text-[13px] text-white/60">
          Tem certeza que deseja remover <strong className="text-white">{deleting?.name}</strong>?
          O histórico de escalas será mantido.
        </p>
      </Modal>
    </div>
  );
}
