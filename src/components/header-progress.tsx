"use client";

import { Flame, Zap } from "lucide-react";
import { useUserProgress } from "@/hooks/useUserProgress";
import { cn } from "@/lib/utils";

export function HeaderProgress() {
  const { xp, racha, leccionesHoy, cargando } = useUserProgress();

  const progressPct = Math.min((leccionesHoy / 20) * 100, 100);

  if (cargando) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 ml-auto">
      {/* Streak */}
      {racha >= 2 && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-bold text-orange-700">{racha} días</span>
        </div>
      )}

      {/* XP */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200">
        <Zap className="h-4 w-4 text-blue-500" />
        <span className="text-sm font-bold text-blue-700">{xp} XP</span>
      </div>

      {/* Daily progress bar */}
      <div className="flex flex-col gap-1 min-w-[100px]">
        <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {leccionesHoy}/20 {leccionesHoy >= 20 ? "¡Meta!" : ""}
        </span>
      </div>
    </div>
  );
}
