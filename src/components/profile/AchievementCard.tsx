import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AchievementCardProps {
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string | null;
}

export function AchievementCard({
  icon,
  title,
  description,
  unlocked,
  unlockedAt,
}: AchievementCardProps) {
  const formattedDate = unlockedAt
    ? new Date(unlockedAt).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div
      className={cn(
        "relative rounded-2xl border p-4 transition-all duration-200",
        unlocked
          ? "border-brand-200 bg-white shadow-sm"
          : "border-neutral-100 bg-neutral-50"
      )}
    >
      {!unlocked && (
        <Lock className="absolute right-3 top-3 h-3.5 w-3.5 text-neutral-300" />
      )}
      <span
        className={cn("text-2xl", !unlocked && "grayscale opacity-40")}
        aria-hidden
      >
        {icon}
      </span>
      <p
        className={cn(
          "mt-2 text-sm font-semibold leading-tight",
          unlocked ? "text-neutral-900" : "text-neutral-400"
        )}
      >
        {title}
      </p>
      <p
        className={cn(
          "mt-0.5 text-xs leading-snug",
          unlocked ? "text-neutral-500" : "text-neutral-400"
        )}
      >
        {description}
      </p>
      {unlocked && formattedDate && (
        <p className="mt-2 text-[10px] font-medium text-brand-600">
          {formattedDate}
        </p>
      )}
    </div>
  );
}
