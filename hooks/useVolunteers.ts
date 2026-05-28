"use client";

import { useState, useEffect, useCallback } from "react";
import { Volunteer, VolunteerFormData } from "@/types";
import {
  getVolunteers, createVolunteer, updateVolunteer,
  deleteVolunteer, updateVolunteerPhoto,
} from "@/lib/services/volunteerService";
import { uploadVolunteerPhoto } from "@/lib/firebase/storage";
import toast from "react-hot-toast";

export function useVolunteers(onlyActive = false) {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getVolunteers(onlyActive);
      setVolunteers(data);
    } catch { setError("Erro ao carregar voluntários."); }
    finally   { setLoading(false); }
  }, [onlyActive]);

  useEffect(() => { load(); }, [load]);

  async function create(data: VolunteerFormData, photoFile?: File) {
    const id = await createVolunteer(data);
    if (photoFile) {
      const url = await uploadVolunteerPhoto(id, photoFile);
      await updateVolunteerPhoto(id, url);
    }
    toast.success("Voluntário adicionado!");
    load();
    return id;
  }

  async function update(id: string, data: Partial<VolunteerFormData>, photoFile?: File) {
    await updateVolunteer(id, data);
    if (photoFile) {
      const url = await uploadVolunteerPhoto(id, photoFile);
      await updateVolunteerPhoto(id, url);
    }
    toast.success("Voluntário atualizado!");
    load();
  }

  async function remove(id: string) {
    await deleteVolunteer(id);
    toast.success("Voluntário removido.");
    load();
  }

  async function toggleStatus(volunteer: Volunteer) {
    const newStatus = volunteer.status === "active" ? "inactive" : "active";
    await updateVolunteer(volunteer.id, { status: newStatus });
    toast.success(newStatus === "active" ? "Voluntário ativado." : "Voluntário desativado.");
    load();
  }

  return { volunteers, loading, error, refetch: load, create, update, remove, toggleStatus };
}
