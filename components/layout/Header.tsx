"use client";

import { usePathname } from "next/navigation";
import { Bell, ChevronRight } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/Avatar";
import { SidebarToggle } from "./Sidebar";

/* ── Mapa de rota → label de breadcrumb ── */
const ROUTE_LABELS: Record<string, string> = {
  "dashboard":   "Dashboard",
  "schedules":   "Escalas Semanais",
  "volunteers":  "Voluntários",
  "ministries":  "Ministérios",
  "history":     "Histórico",
};

function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean); // ["dashboard", "volunteers", ...]

  return (
    <nav className="hidden sm:flex items-center gap-1.5 text-[13px]" aria-label="Breadcrumb">
      {segments.map((seg, i) => {
        const label   = ROUTE_LABELS[seg] ?? seg;
        const isLast  = i === segments.length - 1;
        return (
          <span key={seg} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="w-3 h-3 text-white/20" />}
            <span className={isLast ? "text-white/80 font-medium" : "text-white/30"}>
              {label}
            </span>
          </span>
        );
      })}
    </nav>
  );
}

export function Header() {
  const { appUser } = useAuth();
  const pageTitle   = useAppStore((s) => s.pageTitle);

  return (
    <header className="sticky top-0 z-10 h-16 flex items-center gap-3 px-5 flex-shrink-0
                       bg-surface-0/85 backdrop-blur-md border-b border-white/[0.055]">

      {/* Hamburguer mobile */}
      <SidebarToggle />

      {/* Breadcrumb (desktop) / Título (mobile) */}
      <div className="flex-1 min-w-0">
        <Breadcrumb />
        {/* Mobile: só o título da página */}
        <p className="sm:hidden text-[14px] font-semibold text-white truncate">{pageTitle}</p>
      </div>

      {/* Ações direita */}
      <div className="flex items-center gap-1.5">
        {/* Notificações — placeholder funcional */}
        <button
          className="relative flex items-center justify-center w-9 h-9 rounded-xl
                     text-white/40 hover:text-white/80 hover:bg-white/[0.06]
                     transition-all duration-150"
          aria-label="Notificações"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-brand-400 ring-1 ring-surface-0" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-white/[0.08] mx-1" />

        {/* Avatar do usuário */}
        {appUser && (
          <div className="flex items-center gap-2.5 pl-1">
            <div className="hidden sm:block text-right">
              <p className="text-[12px] font-medium text-white/70 leading-tight">{appUser.name}</p>
              <p className="text-[10px] text-white/30 leading-tight">{appUser.role === "admin" ? "Administrador" : "Visualizador"}</p>
            </div>
            <Avatar name={appUser.name} photoUrl={appUser.photoUrl} size="sm" />
          </div>
        )}
      </div>
    </header>
  );
}
