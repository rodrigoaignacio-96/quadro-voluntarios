import Image from "next/image";
import { cn } from "@/lib/utils/cn";

interface AvatarProps {
  name:       string;
  photoUrl?:  string;
  size?:      "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  xs: { wrapper: "w-6  h-6",  text: "text-[9px]"  },
  sm: { wrapper: "w-8  h-8",  text: "text-xs"      },
  md: { wrapper: "w-10 h-10", text: "text-sm"      },
  lg: { wrapper: "w-12 h-12", text: "text-base"    },
  xl: { wrapper: "w-16 h-16", text: "text-lg"      },
};

/* Gera uma cor determinística baseada no nome */
function nameToColor(name: string): string {
  const colors = [
    "bg-purple-500/20 text-purple-300",
    "bg-blue-500/20   text-blue-300",
    "bg-emerald-500/20 text-emerald-300",
    "bg-brand-500/20  text-brand-300",
    "bg-pink-500/20   text-pink-300",
    "bg-orange-500/20 text-orange-300",
    "bg-cyan-500/20   text-cyan-300",
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function Avatar({ name, photoUrl, size = "md", className }: AvatarProps) {
  const { wrapper, text } = sizeMap[size];

  if (photoUrl) {
    return (
      <div className={cn("relative rounded-full overflow-hidden flex-shrink-0", wrapper, className)}>
        <Image
          src={photoUrl}
          alt={name}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex-shrink-0 flex items-center justify-center font-semibold",
        wrapper,
        text,
        nameToColor(name),
        className
      )}
      title={name}
    >
      {initials(name)}
    </div>
  );
}

/* Stack de avatares sobrepostos */
export function AvatarGroup({
  items,
  max = 4,
  size = "sm",
}: {
  items: { name: string; photoUrl?: string }[];
  max?: number;
  size?: AvatarProps["size"];
}) {
  const visible  = items.slice(0, max);
  const overflow = items.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((item, i) => (
        <div
          key={i}
          className="ring-2 ring-surface-100 rounded-full"
          title={item.name}
        >
          <Avatar name={item.name} photoUrl={item.photoUrl} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            "ring-2 ring-surface-100 rounded-full flex items-center justify-center",
            "bg-surface-300 text-white/60 text-xs font-medium flex-shrink-0",
            sizeMap[size].wrapper
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
