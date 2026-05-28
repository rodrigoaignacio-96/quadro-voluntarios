"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils/cn";

interface PageWrapperProps {
  title:      string;
  children:   React.ReactNode;
  className?: string;
  action?:    React.ReactNode; // botão de ação no topo (ex: "Adicionar")
}

export function PageWrapper({ title, children, className, action }: PageWrapperProps) {
  const setPageTitle = useAppStore((s) => s.setPageTitle);

  useEffect(() => {
    setPageTitle(title);
  }, [title, setPageTitle]);

  return (
    <div className={cn("page-enter flex flex-col gap-6 p-6", className)}>
      {/* Cabeçalho da página */}
      {action && (
        <div className="flex items-center justify-between">
          <p className="text-white/40 text-sm">{title}</p>
          {action}
        </div>
      )}

      {children}
    </div>
  );
}
