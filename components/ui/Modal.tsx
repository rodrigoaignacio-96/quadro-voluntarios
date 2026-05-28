"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ModalProps {
  open:       boolean;
  onClose:    () => void;
  title:      string;
  subtitle?:  string;
  children:   React.ReactNode;
  size?:      "sm" | "md" | "lg";
  footer?:    React.ReactNode;
}

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-xl",
};

export function Modal({ open, onClose, title, subtitle, children, size = "md", footer }: ModalProps) {
  /* Fecha com ESC */
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, handleKey]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-[3px]"
        onClick={onClose}
        aria-hidden
        style={{ animation: "fadeIn 0.2s ease" }}
      />

      {/* Painel */}
      <div
        className={cn(
          "relative w-full rounded-2xl",
          "bg-[#0f0f1a] border border-white/[0.08]",
          "shadow-[0_24px_80px_rgba(0,0,0,0.6)]",
          "flex flex-col max-h-[90vh]",
          sizeMap[size],
        )}
        style={{ animation: "modalEnter 0.3s cubic-bezier(0.16,1,0.3,1)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-white/[0.07] flex-shrink-0">
          <div>
            <h2 id="modal-title" className="text-[15px] font-semibold text-white">{title}</h2>
            {subtitle && <p className="text-[12px] text-white/35 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.07] transition-all ml-4 flex-shrink-0"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex-shrink-0 p-5 pt-0 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes modalEnter {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
      `}</style>
    </div>
  );
}

/* Botão de cancelar padrão para usar no footer */
export function ModalCancelButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="btn-ghost px-4 py-2">
      Cancelar
    </button>
  );
}
