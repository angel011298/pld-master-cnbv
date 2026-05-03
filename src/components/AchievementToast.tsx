"use client";

import { useEffect, useState } from "react";
import { Trophy, X, Sparkles, Flame, Zap, CheckCircle, Award, Target, Crown } from "lucide-react";

export interface Achievement {
  key: string;
  name: string;
  description: string;
  icon: string;
}

interface AchievementToastProps {
  achievement: Achievement | null;
  onClose: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Trophy: <Trophy className="h-5 w-5" />,
  Sparkles: <Sparkles className="h-5 w-5" />,
  Flame: <Flame className="h-5 w-5" />,
  Zap: <Zap className="h-5 w-5" />,
  CheckCircle: <CheckCircle className="h-5 w-5" />,
  Award: <Award className="h-5 w-5" />,
  Target: <Target className="h-5 w-5" />,
  Crown: <Crown className="h-5 w-5" />
};

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!achievement) {
      setIsVisible(false);
      return;
    }

    // Show after 1 second
    const showTimer = setTimeout(() => setIsVisible(true), 1000);

    // Auto-close after 4 seconds
    const closeTimer = setTimeout(() => {
      setIsVisible(false);
      const hideTimer = setTimeout(onClose, 300); // Wait for fade animation
      return () => clearTimeout(hideTimer);
    }, 4000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(closeTimer);
    };
  }, [achievement, onClose]);

  if (!achievement) return null;

  const icon = iconMap[achievement.icon] || <Trophy className="h-5 w-5" />;

  return (
    <div
      className={`fixed bottom-4 right-4 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-lg shadow-lg p-4 text-white max-w-sm transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-white mt-0.5">{icon}</div>
        <div className="flex-1">
          <h3 className="font-bold text-sm">{achievement.name}</h3>
          <p className="text-xs text-white/90 mt-1">{achievement.description}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
