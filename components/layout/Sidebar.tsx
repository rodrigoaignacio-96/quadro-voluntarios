	"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, CalendarDays, Users, Church,
  History, LogOut, X, Menu, ChevronRight, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/Avatar";
import toast from "react-hot-toast";

/* ── Navegação principal ── */
const NAV_ITEMS = [
  { label: "Dashboard",   href: "/",            icon: LayoutDashboard, exact: true  },
  { label: "Escalas",     href: "/schedules",   icon: CalendarDays,    exact: false },
  { label: "Voluntários", href: "/volunteers",  icon: Users,           exact: false },
  { label: "Ministérios", href: "/ministries",  icon: Church,          exact: false },
  { label: "Histórico",   href: "/history",     icon: History,         exact: false },
];

/* ── Componente principal ── */
export function Sidebar() {
  const pathname    = usePathname();
  const router      = useRouter();
  const { logout, appUser } = useAuth();
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebar  = useAppStore((s) => s.setSidebar);

  async function handleLogout() {
    try {
      await logout();
      toast.success("Sessão encerrada.");
      router.replace("/auth/login");
    } catch {
      toast.error("Erro ao encerrar sessão.");
    }
  }

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <>
      {/* ── Overlay mobile ── */}
      <div
        className={cn(
          "fixed inset-0 z-20 bg-black/70 backdrop-blur-[2px] lg:hidden",
          "transition-opacity duration-300",
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebar(false)}
        aria-hidden
      />

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 h-full w-[240px]",
          "flex flex-col",
          "bg-[#0c0c16] border-r border-white/[0.055]",
          "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* ── Logo ── */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/[0.055] flex-shrink-0">
          <Link href="/" className="flex items-center gap-3 group" onClick={() => setSidebar(false)}>
            <div className="w-8 h-8 rounded-lg bg-brand-500/15 border border-brand-500/25 flex items-center justify-center transition-all duration-200 group-hover:border-brand-500/40 group-hover:bg-brand-500/20">
              <Church className="w-4 h-4 text-brand-400" />
            </div>
            <div className="leading-tight">
              <p className="text-[13px] font-semibold text-white">Voluntários</p>
              <p className="text-[10px] text-white/35">Gestão ministerial</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebar(false)}
            className="lg:hidden p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Navegação ── */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
          <p className="px-3 mb-3 text-[9px] font-bold uppercase tracking-[0.15em] text-white/20 select-none">
            Navegação
          </p>

          {NAV_ITEMS.map(({ label, href, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebar(false)}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium",
                  "transition-all duration-150 group overflow-hidden",
                  active
                    ? "text-brand-200 bg-brand-500/10"
                    : "text-white/45 hover:text-white/85 hover:bg-white/[0.04]"
                )}
              >
                {/* Pill indicador ativo */}
                <span className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all duration-200",
                  active ? "h-5 bg-brand-400" : "h-0 bg-transparent"
                )} />

                <Icon className={cn(
                  "w-[18px] h-[18px] flex-shrink-0 transition-colors duration-150",
                  active ? "text-brand-400" : "text-white/30 group-hover:text-white/60"
                )} />

                <span className="flex-1 truncate">{label}</span>

                <ChevronRight className={cn(
                  "w-3.5 h-3.5 transition-all duration-150 flex-shrink-0",
                  active ? "text-brand-400/60 opacity-100" : "opacity-0 group-hover:opacity-30"
                )} />
              </Link>
            );
          })}
        </nav>

        {/* ── Footer: perfil + sair ── */}
        <div className="flex-shrink-0 border-t border-white/[0.055]">
          {/* Perfil */}
          {appUser && (
            <div className="px-4 py-3 flex items-center gap-3">
              <Avatar name={appUser.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-white/80 truncate">{appUser.name}</p>
                <p className="text-[10px] text-white/30 truncate">{appUser.email}</p>
              </div>
              <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-500/15 text-brand-400 border border-brand-500/20 flex-shrink-0">
                Admin
              </span>
            </div>
          )}

          {/* Ações */}
          <div className="px-3 pb-3 space-y-0.5">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-[13px]
                         text-white/35 hover:text-red-400 hover:bg-red-500/[0.07]
                         transition-all duration-150 group"
            >
              <LogOut className="w-4 h-4 flex-shrink-0 group-hover:scale-90 transition-transform" />
              <span>Sair da conta</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ── Botão hamburguer ── */
export function SidebarToggle() {
  const toggle = useAppStore((s) => s.toggleSidebar);
  return (
    <button
      onClick={toggle}
      className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.06] transition-all"
      aria-label="Abrir menu"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
}
