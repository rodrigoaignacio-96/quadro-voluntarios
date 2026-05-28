"use client";

import { useState, useEffect, useCallback } from "react";
import { Ministry, MinistryFormData } from "@/types";
import {
  getMinistries, createMinistry, updateMinistry, deleteMinistry,
} from "@/lib/services/ministryService";
import toast from "react-hot-toast";

export function useMinistries() {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMinistries();
      setMinistries(data);
    } catch { setError("Erro ao carregar ministérios."); }
    finally   { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function create(data: MinistryFormData) {
    await createMinistry(data);
    toast.success("Ministério criado!");
    load();
  }

  async function update(id: string, data: Partial<MinistryFormData>) {
    await updateMinistry(id, data);
    toast.success("Ministério atualizado!");
    load();
  }

  async function remove(id: string) {
    await deleteMinistry(id);
    toast.success("Ministério removido.");
    load();
  }

  return { ministries, loading, error, refetch: load, create, update, remove };
}
