"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

/* ── Loading screen elegante ── */
function AuthLoadingScreen() {
  return (
    <div className="fixed inset-0 bg-surface-0 flex flex-col items-center justify-center gap-4 z-50">
      <div className="relative">
        <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center">
          <svg className="w-5 h-5 text-brand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        {/* Spinner ao redor */}
        <div className="absolute inset-0 -m-1.5">
          <svg className="w-13 h-13 animate-spin" viewBox="0 0 52 52" fill="none">
            <circle cx="26" cy="26" r="23" stroke="rgba(234,179,8,0.15)" strokeWidth="2"/>
            <path d="M26 3 A23 23 0 0 1 49 26" stroke="#eab308" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
      <p className="text-xs text-white/25 animate-pulse">Verificando sessão...</p>
    </div>
  );
}

/* ── Layout protegido ── */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, router, pathname]);

  if (loading)  return <AuthLoadingScreen />;
  if (!user)    return null;

  return (
    <div className="min-h-screen bg-surface-0 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-[240px] min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
