import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";
import { AlertCircle } from "lucide-react";

/* ─── Field wrapper com label e erro ─── */
export function FormField({
  label,
  error,
  required,
  children,
  hint,
}: {
  label:    string;
  error?:   string;
  required?: boolean;
  hint?:    string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-white/40">
        {label}
        {required && <span className="text-brand-400">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-white/25">{hint}</p>}
      {error && (
        <p className="text-[11px] text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

/* ─── Input ─── */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ error, className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "input-base",
          error && "border-red-500/50 focus:border-red-500/60 focus:ring-red-500/10",
          className
        )}
        {...props}
      />
    );
  }
);

/* ─── Textarea ─── */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ error, className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "input-base resize-none min-h-[80px]",
          error && "border-red-500/50",
          className
        )}
        {...props}
      />
    );
  }
);

/* ─── Select ─── */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?:   boolean;
  options:  { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ error, options, placeholder, className, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          "input-base appearance-none cursor-pointer",
          "[&>option]:bg-surface-200 [&>option]:text-white",
          error && "border-red-500/50",
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    );
  }
);

/* ─── Checkbox com estilo ─── */
export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked:  boolean;
  onChange: (v: boolean) => void;
  label:    string;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div
        className={cn(
          "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all",
          checked
            ? "bg-brand-500 border-brand-500"
            : "bg-surface-200 border-surface-400/60 group-hover:border-brand-500/40"
        )}
        onClick={() => onChange(!checked)}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-surface-0" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <span className="text-[13px] text-white/70 select-none">{label}</span>
    </label>
  );
}
