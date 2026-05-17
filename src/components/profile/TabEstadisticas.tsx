"use client";

import { FileText, Award, BarChart3, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProfileData, StatsData, ActivityDay } from "./types";
import { BLOQUE_NAMES } from "./types";
import { StatCard } from "./StatCard";
import { XPGoalPicker } from "./XPGoalPicker";
import { ActivityCalendar } from "./ActivityCalendar";

interface TabEstadisticasProps {
  profile: ProfileData;
  stats: StatsData | null;
  activity: ActivityDay[];
  onGoalChange: (goal: number) => void;
}

export function TabEstadisticas({
  profile,
  stats,
  activity,
  onGoalChange,
}: TabEstadisticasProps) {
  const examStats = stats?.exam_stats;
  const bloqueProgress = stats?.bloque_progress || [];
  const predictions = stats?.predictions;

  return (
    <div className="space-y-6">
      {/* XP Goal */}
      <XPGoalPicker
        currentGoal={profile.daily_xp_goal}
        xpToday={profile.xp_today}
        onGoalChange={onGoalChange}
      />

      {/* Exam Stats */}
      <div>
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Resumen de exámenes
        </p>
        {!examStats || examStats.total === 0 ? (
          <div className="rounded-2xl border border-neutral-100 bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-neutral-500">
              Aún no has completado ningún simulacro.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Simulacros completados"
              value={examStats.total}
              icon={<FileText className="h-4 w-4" />}
            />
            <StatCard
              label="Mejor puntaje"
              value={`${examStats.best_score}%`}
              icon={<Award className="h-4 w-4" />}
            />
            <StatCard
              label="Promedio"
              value={`${examStats.avg_score}%`}
              icon={<BarChart3 className="h-4 w-4" />}
            />
            <StatCard
              label="Tiempo promedio"
              value={`${examStats.avg_duration_min} min`}
              icon={<Clock className="h-4 w-4" />}
            />
          </div>
        )}
      </div>

      <div className="border-t border-neutral-100" />

      {/* Block Progress */}
      <div>
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Progreso por bloque
        </p>
        <div className="space-y-4 rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          {bloqueProgress.length === 0 ? (
            <p className="text-center text-sm text-neutral-500">
              Sin datos de progreso aún.
            </p>
          ) : (
            bloqueProgress.map((b) => (
              <div key={b.bloque}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-neutral-700">
                    Bloque {b.bloque}: {BLOQUE_NAMES[b.bloque] || "—"}
                  </span>
                  <span className="text-xs font-semibold tabular-nums text-neutral-500">
                    {b.correct}/{b.total} · {b.pct}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      b.pct >= 80
                        ? "bg-emerald-500"
                        : b.pct >= 50
                          ? "bg-brand-500"
                          : "bg-orange-400"
                    )}
                    style={{ width: `${b.pct}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="border-t border-neutral-100" />

      {/* Activity Calendar */}
      <ActivityCalendar days={activity} />

      <div className="border-t border-neutral-100" />

      {/* Prediction */}
      <div>
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Predicción de puntaje
        </p>
        {predictions?.exam_score_prediction != null ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm sm:flex-row sm:gap-8">
            <div className="relative flex shrink-0 items-center justify-center">
              <svg
                className="h-28 w-28 -rotate-90"
                viewBox="0 0 128 128"
              >
                <circle
                  cx="64"
                  cy="64"
                  r="52"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  className="text-neutral-100"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="52"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 52}
                  strokeDashoffset={
                    2 * Math.PI * 52 -
                    (2 *
                      Math.PI *
                      52 *
                      (predictions.exam_score_prediction || 0)) /
                      100
                  }
                  className={
                    (predictions.exam_score_prediction ?? 0) >= 70
                      ? "text-emerald-500"
                      : "text-orange-500"
                  }
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-2xl font-bold tracking-tight text-neutral-900">
                {predictions.exam_score_prediction}%
              </span>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-lg font-bold tracking-tight text-neutral-900">
                Predicción de examen
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Probabilidad de aprobar:{" "}
                <span className="font-semibold text-neutral-700">
                  {predictions.pass_probability != null
                    ? `${predictions.pass_probability}%`
                    : "—"}
                </span>
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-100 bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-neutral-500">
              Completa 20 reactivos para ver tu predicción.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
