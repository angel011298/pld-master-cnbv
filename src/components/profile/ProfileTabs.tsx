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

const triggerClass =
  "rounded-none px-5 py-3 text-sm font-semibold after:bg-brand-500 after:h-[2px] data-active:text-brand-700 data-active:bg-transparent hover:text-neutral-700";

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
      <div className="sticky top-0 z-20 bg-white">
        <TabsList
          variant="line"
          className="h-auto w-full gap-0 rounded-none border-b border-neutral-200 bg-transparent p-0"
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
