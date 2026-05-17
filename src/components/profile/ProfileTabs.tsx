"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type {
  ProfileData,
  StatsData,
  ActivityDay,
  Achievement,
} from "./types";
import { TabPerfil } from "./TabPerfil";
import { TabEstadisticas } from "./TabEstadisticas";
import { TabAjustes } from "./TabAjustes";

interface ProfileTabsProps {
  profile: ProfileData;
  stats: StatsData | null;
  activity: ActivityDay[];
  achievements: Achievement[];
  onProfileUpdate: (fields: Record<string, unknown>) => Promise<void>;
  onGoalChange: (goal: number) => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}

const TABS = [
  { id: 0, label: "Perfil" },
  { id: 1, label: "Estadísticas" },
  { id: 2, label: "Ajustes" },
] as const;

// Custom tab bar using plain React state + native buttons so the black-pill
// active style is fully in our control — no Base UI CSS specificity fights.
export function ProfileTabs({
  profile,
  stats,
  activity,
  achievements,
  onProfileUpdate,
  onGoalChange,
  showToast,
}: ProfileTabsProps) {
  const [active, setActive] = React.useState<0 | 1 | 2>(0);

  return (
    <div className="flex flex-col">
      {/* ── Sticky tab bar ── */}
      <div className="sticky top-0 z-20 bg-white py-3 border-b border-neutral-100">
        <div className="flex gap-1 rounded-2xl bg-neutral-100 p-1">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActive(id)}
              className={cn(
                "flex-1 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200",
                active === id
                  ? "bg-neutral-900 text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700 hover:bg-white/60"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab panels ── */}
      <div className="pt-6">
        {active === 0 && (
          <TabPerfil profile={profile} achievements={achievements} />
        )}
        {active === 1 && (
          <TabEstadisticas
            profile={profile}
            stats={stats}
            activity={activity}
            onGoalChange={onGoalChange}
          />
        )}
        {active === 2 && (
          <TabAjustes
            profile={profile}
            onProfileUpdate={onProfileUpdate}
            showToast={showToast}
          />
        )}
      </div>
    </div>
  );
}
