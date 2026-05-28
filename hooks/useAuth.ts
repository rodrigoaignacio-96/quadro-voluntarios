"use client";

/*
  Re-exporta o hook do AuthContext para manter compatibilidade
  com componentes que já importam de @/hooks/useAuth.
  O AuthContext é a fonte da verdade — este hook apenas delega.
*/
export { useAuthContext as useAuth } from "@/contexts/AuthContext";
