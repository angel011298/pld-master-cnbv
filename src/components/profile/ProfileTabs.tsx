"use client";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
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

// Active tab = black pill with white text.
// Using data-active:! (Tailwind !important) to override the Base UI default active styles.
const triggerClass =
  "h-auto flex-1 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 " +
  "text-neutral-500 hover:text-neutral-700 " +
  "data-active:!bg-neutral-900 data-active:!text-white data-active:shadow-sm " +
  "data-active:after:!opacity-0";

export function ProfileTabs({
  profile,
  stats,
  activity,
  achievements,
  onProfileUpdate,
  onGoalChange,
  showToast,
}: ProfileTabsProps) {
  return (
    // flex-col is explicit because the Base UI Tabs root uses data-orientation="horizontal"
    // which does NOT match the data-horizontal: Tailwind shorthand in the default className.
    <Tabs defaultValue={0} className="flex-col gap-0">
      <div className="sticky top-0 z-20 bg-white py-3 border-b border-neutral-100">
        {/* Pill container — visual styling is on this wrapper; TabsList is transparent inside */}
        <div className="rounded-2xl bg-neutral-100 p-1">
          <TabsList
            className="!h-auto w-full !gap-1 !rounded-none !bg-transparent p-0"
          >
            <TabsTrigger value={0} className={triggerClass}>
              Perfil
            </TabsTrigger>
            <TabsTrigger value={1} className={triggerClass}>
              Estadísticas
            </TabsTrigger>
            <TabsTrigger value={2} className={triggerClass}>
              Ajustes
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      <TabsContent value={0} className="pt-6">
        <TabPerfil profile={profile} achievements={achievements} />
      </TabsContent>

      <TabsContent value={1} className="pt-6">
        <TabEstadisticas
          profile={profile}
          stats={stats}
          activity={activity}
          onGoalChange={onGoalChange}
        />
      </TabsContent>

      <TabsContent value={2} className="pt-6">
        <TabAjustes
          profile={profile}
          onProfileUpdate={onProfileUpdate}
          showToast={showToast}
        />
      </TabsContent>
    </Tabs>
  );
}
