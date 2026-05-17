"use client";

import { cn } from "@/lib/utils";
import type { ActivityDay } from "./types";

interface ActivityCalendarProps {
  days: ActivityDay[];
}

function getIntensity(count: number): string {
  if (count === 0) return "bg-neutral-100";
  if (count <= 4) return "bg-brand-100";
  if (count <= 9) return "bg-brand-300";
  return "bg-brand-600";
}

export function ActivityCalendar({ days }: ActivityCalendarProps) {
  const dayMap = new Map(days.map((d) => [d.date, d.count]));

  const cells: { date: string; count: number; dayOfWeek: number }[] = [];
  const today = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    cells.push({
      date: iso,
      count: dayMap.get(iso) || 0,
      dayOfWeek: d.getDay(),
    });
  }

  const weeks: typeof cells[] = [];
  let currentWeek: typeof cells = [];
  for (const cell of cells) {
    if (cell.dayOfWeek === 1 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(cell);
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500 mb-4">
        Actividad (últimos 90 días)
      </p>

      <div className="flex gap-[3px] overflow-x-auto pb-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {Array.from({ length: 7 }, (_, dayIdx) => {
              const mondayIdx = (dayIdx + 1) % 7;
              const cell = week.find((c) => c.dayOfWeek === mondayIdx);
              if (!cell) {
                return (
                  <div
                    key={dayIdx}
                    className="h-3 w-3 rounded-sm bg-transparent"
                  />
                );
              }
              return (
                <div
                  key={dayIdx}
                  title={`${cell.count} actividad${cell.count !== 1 ? "es" : ""} · ${cell.date.split("-").reverse().join("/")}`}
                  className={cn(
                    "h-3 w-3 rounded-sm transition-colors",
                    getIntensity(cell.count)
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[10px] text-neutral-400">
        <span>Menos</span>
        <div className="h-3 w-3 rounded-sm bg-neutral-100" />
        <div className="h-3 w-3 rounded-sm bg-brand-100" />
        <div className="h-3 w-3 rounded-sm bg-brand-300" />
        <div className="h-3 w-3 rounded-sm bg-brand-600" />
        <span>Más</span>
      </div>
    </div>
  );
}
