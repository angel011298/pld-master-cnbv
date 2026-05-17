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
              className="h-20 w-20 shrink-0 rounded-full border-2 border-white object-cover shadow-sm"
            />
          ) : (
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-2xl font-bold text-white shadow-sm"
              style={{ backgroundColor: avatarBg }}
            >
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-neutral-900">
                {displayName}
              </h2>
              <span
                className={cn(
                  "shrink-0 rounded-full border px-3 py-0.5 text-xs font-semibold",
                  planColor
                )}
              >
                {planLabel}
              </span>
            </div>
            <p className="mt-1 text-sm text-neutral-500">
              Miembro desde {getMemberSince(profile.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white px-4 py-4 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50">
            <Flame className="h-5 w-5 text-orange-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold tabular-nums tracking-tight text-neutral-900">
              {profile.current_streak}
            </p>
            <p className="text-[11px] font-medium leading-tight text-neutral-500">Racha días</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white px-4 py-4 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50">
            <Zap className="h-5 w-5 text-brand-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold tabular-nums tracking-tight text-neutral-900">
              {profile.total_xp.toLocaleString()}
            </p>
            <p className="text-[11px] font-medium leading-tight text-neutral-500">XP Total</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white px-4 py-4 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
            <Target className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold tabular-nums tracking-tight text-neutral-900">
              {profile.pass_probability !== null
                ? `${profile.pass_probability}%`
                : "—"}
            </p>
            <p className="text-[11px] font-medium leading-tight text-neutral-500">
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
