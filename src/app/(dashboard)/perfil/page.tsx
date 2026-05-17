"use client";

import * as React from "react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import type {
  ProfileData,
  StatsData,
  ActivityDay,
  Achievement,
} from "@/components/profile/types";

async function authFetch(
  url: string,
  init?: RequestInit
): Promise<Response> {
  const sb = supabase();
  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session?.access_token) throw new Error("No autenticado");
  return fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
      Authorization: `Bearer ${session.access_token}`,
    },
  });
}

export default function PerfilPage() {
  const [profile, setProfile] = React.useState<ProfileData | null>(null);
  const [stats, setStats] = React.useState<StatsData | null>(null);
  const [activity, setActivity] = React.useState<ActivityDay[]>([]);
  const [achievements, setAchievements] = React.useState<Achievement[]>(
    []
  );
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = React.useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
    },
    []
  );

  const fetchAll = React.useCallback(async () => {
    try {
      const [profileRes, statsRes, activityRes] = await Promise.all([
        authFetch("/api/profile"),
        authFetch("/api/profile/stats"),
        authFetch("/api/profile/activity"),
      ]);

      if (!profileRes.ok) {
        if (profileRes.status === 401) {
          window.location.href = "/";
          return;
        }
        throw new Error("Error cargando perfil");
      }

      const profileJson = await profileRes.json();
      const statsJson = statsRes.ok ? await statsRes.json() : null;
      const activityJson = activityRes.ok
        ? await activityRes.json()
        : { days: [] };

      setProfile({
        ...profileJson.profile,
        email: profileJson.user_email,
        provider: profileJson.provider,
      });
      setAchievements(profileJson.achievements || []);
      setStats(statsJson);
      setActivity(activityJson.days || []);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error desconocido"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleProfileUpdate = React.useCallback(
    async (fields: Record<string, unknown>) => {
      const res = await authFetch("/api/profile", {
        method: "PATCH",
        body: JSON.stringify(fields),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error || "Error al actualizar"
        );
      }
      const { profile: updated } = await res.json();
      setProfile((prev) => (prev ? { ...prev, ...updated } : prev));
    },
    []
  );

  const handleGoalChange = React.useCallback(
    async (goal: number) => {
      try {
        await handleProfileUpdate({ daily_xp_goal: goal });
        showToast("Meta actualizada");
      } catch {
        showToast("Error al cambiar meta", "error");
      }
    },
    [handleProfileUpdate, showToast]
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 py-4">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-neutral-100" />
        <div className="h-8 w-full animate-pulse rounded-lg bg-neutral-100" />
        <div className="h-24 w-full animate-pulse rounded-2xl bg-neutral-100" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl bg-neutral-100"
            />
          ))}
        </div>
        <div className="h-20 w-full animate-pulse rounded-2xl bg-neutral-100" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-neutral-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-3xl py-12 text-center">
        <p className="mb-4 text-sm text-neutral-500">
          {error || "No se pudo cargar el perfil. Intenta de nuevo."}
        </p>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            fetchAll();
          }}
          className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl py-4">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-neutral-900">
        Mi perfil
      </h1>

      <ProfileTabs
        profile={profile}
        stats={stats}
        activity={activity}
        achievements={achievements}
        onProfileUpdate={handleProfileUpdate}
        onGoalChange={handleGoalChange}
        showToast={showToast}
      />

      {toast && (
        <div
          className={cn(
            "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl px-5 py-3 text-sm font-medium shadow-lg transition-all duration-300",
            toast.type === "error"
              ? "bg-red-600 text-white"
              : "bg-neutral-900 text-white"
          )}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
