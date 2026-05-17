"use client";

import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

interface XPGoalPickerProps {
  currentGoal: number;
  xpToday: number;
  onGoalChange: (goal: number) => void;
}

const GOALS = [10, 25, 50, 100] as const;

export function XPGoalPicker({
  currentGoal,
  xpToday,
  onGoalChange,
}: XPGoalPickerProps) {
  const pct = Math.min(100, Math.round((xpToday / currentGoal) * 100));

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500 mb-4">
        Meta diaria de XP
      </p>

      <div className="flex gap-2 mb-4">
        {GOALS.map((goal) => (
          <button
            key={goal}
            type="button"
            onClick={() => onGoalChange(goal)}
            className={cn(
              "flex-1 rounded-xl border py-2.5 text-sm font-semibold transition-all duration-200",
              goal === currentGoal
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
            )}
          >
            {goal}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm mb-2">
        <div className="flex items-center gap-1.5 font-medium text-neutral-600">
          <Zap className="h-4 w-4 text-brand-500" />
          <span>{xpToday} / {currentGoal} XP</span>
        </div>
        <span className="font-semibold text-neutral-900 tabular-nums">
          {pct}%
        </span>
      </div>

      <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
