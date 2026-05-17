import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakDisplayProps {
  streak: number;
}

function getMessage(streak: number): string {
  if (streak === 0) return "Comienza tu racha hoy";
  if (streak <= 2) return "¡Buen inicio!";
  if (streak <= 6) return "¡Buen comienzo, sigue así!";
  if (streak <= 29) return "¡Racha imparable! 🔥";
  return "¡Leyenda PLD! ⚡";
}

export function StreakDisplay({ streak }: StreakDisplayProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm">
      <div
        className={cn(
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl",
          streak > 0 ? "bg-orange-50" : "bg-neutral-50"
        )}
      >
        <Flame
          className={cn(
            "h-7 w-7",
            streak > 0
              ? "text-orange-500 fill-orange-500"
              : "text-neutral-300"
          )}
        />
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight text-neutral-900">
          {streak} <span className="text-base font-medium text-neutral-500">día{streak !== 1 ? "s" : ""}</span>
        </p>
        <p className="text-sm font-medium text-neutral-500">
          {getMessage(streak)}
        </p>
      </div>
    </div>
  );
}
