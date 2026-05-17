"use client";

import { Flame, Zap, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProfileData, Achievement } from "./types";
import { ACHIEVEMENT_DEFINITIONS } from "./types";
import { StreakDisplay } from "./StreakDisplay";
import { AchievementCard } from "./AchievementCard";

interface TabPerfilProps {
  profile: ProfileData;
  achievements: Achievement[];
}

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash % 360)}, 55%, 45%)`;
}

function getInitials(name: string | null, email: string): string {
  const source = name || email.split("@")[0] || "U";
  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}

function getMemberSince(createdAt: string): string {
  const date = new Date(createdAt);
  const months = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function TabPerfil({ profile, achievements }: TabPerfilProps) {
  const displayName =
    profile.full_name || profile.email.split("@")[0] || "Usuario";
  const initials = getInitials(profile.full_name, profile.email);
  const avatarBg = getAvatarColor(displayName);
  const unlockedKeys = new Set(
    achievements.filter((a) => a.unlocked_at).map((a) => a.key)
  );

  const planLabel = profile.tier === "premium" ? "PREMIUM" : "PRUEBA";
  const planColor =
    profile.tier === "premium"
      ? "bg-brand-50 text-brand-700 border-brand-200"
      : "bg-orange-50 text-orange-700 border-orange-200";

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-5">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={displayName}
              className="h-16 w-16 rounded-full border-2 border-white object-cover shadow-sm"
            />
          ) : (
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white shadow-sm"
              style={{ backgroundColor: avatarBg }}
            >
              {initials}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="truncate text-xl font-bold tracking-tight text-neutral-900">
                {displayName}
              </h2>
              <span
                className={cn(
                  "rounded-full border px-3 py-0.5 text-xs font-semibold",
                  planColor
                )}
              >
                {planLabel}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-neutral-500">
              Miembro desde {getMemberSince(profile.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-2.5 rounded-2xl border border-neutral-100 bg-white px-4 py-3 shadow-sm">
          <Flame className="h-5 w-5 shrink-0 text-orange-500" />
          <div>
            <p className="text-lg font-bold tracking-tight text-neutral-900">
              {profile.current_streak}
            </p>
            <p className="text-[11px] font-medium text-neutral-500">Racha</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-2xl border border-neutral-100 bg-white px-4 py-3 shadow-sm">
          <Zap className="h-5 w-5 shrink-0 text-brand-500" />
          <div>
            <p className="text-lg font-bold tracking-tight text-neutral-900">
              {profile.total_xp.toLocaleString()}
            </p>
            <p className="text-[11px] font-medium text-neutral-500">XP Total</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-2xl border border-neutral-100 bg-white px-4 py-3 shadow-sm">
          <Target className="h-5 w-5 shrink-0 text-emerald-500" />
          <div>
            <p className="text-lg font-bold tracking-tight text-neutral-900">
              {profile.pass_probability !== null
                ? `${profile.pass_probability}%`
                : "—"}
            </p>
            <p className="text-[11px] font-medium text-neutral-500">
              Predicción
            </p>
          </div>
        </div>
      </div>

      {/* Streak Display */}
      <StreakDisplay streak={profile.current_streak} />

      {/* Achievements */}
      <div>
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Logros
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Object.entries(ACHIEVEMENT_DEFINITIONS).map(([key, def]) => {
            const achievement = achievements.find((a) => a.key === key);
            return (
              <AchievementCard
                key={key}
                icon={def.icon}
                title={def.title}
                description={def.desc}
                unlocked={unlockedKeys.has(key)}
                unlockedAt={achievement?.unlocked_at}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
