import { cn } from "@/lib/utils/cn";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "ministry";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?:     boolean;
}

const variantMap: Record<BadgeVariant, string> = {
  default:  "bg-surface-300 text-white/70 border border-surface-400/50",
  success:  "bg-emerald-500/12 text-emerald-400 border border-emerald-500/20",
  warning:  "bg-brand-500/12 text-brand-400 border border-brand-500/20",
  danger:   "bg-red-500/12 text-red-400 border border-red-500/20",
  info:     "bg-blue-500/12 text-blue-400 border border-blue-500/20",
  ministry: "bg-purple-500/12 text-purple-400 border border-purple-500/20",
};

export function Badge({ variant = "default", dot = false, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn("badge", variantMap[variant], className)}
      {...props}
    >
      {dot && (
        <span className={cn(
          "w-1.5 h-1.5 rounded-full",
          variant === "success" ? "bg-emerald-400" :
          variant === "warning" ? "bg-brand-400" :
          variant === "danger"  ? "bg-red-400" :
          variant === "info"    ? "bg-blue-400" :
          "bg-white/40"
        )} />
      )}
      {children}
    </span>
  );
}
