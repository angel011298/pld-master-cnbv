export interface ProfileData {
  user_id: string;
  full_name: string | null;
  email: string;
  provider: string;
  public_customer_id: string | null;
  total_xp: number;
  current_streak: number;
  exam_score_prediction: number | null;
  pass_probability: number | null;
  tier: string;
  exam_target_date: string | null;
  password_changed_at: string | null;
  daily_xp_goal: number;
  notification_email_enabled: boolean;
  notification_study_reminder: boolean;
  created_at: string;
  avatar_url: string | null;
  xp_today: number;
}

export interface Achievement {
  key: string;
  unlocked_at: string | null;
}

export interface ExamStats {
  total: number;
  best_score: number;
  avg_score: number;
  avg_duration_min: number;
}

export interface BloqueProgress {
  bloque: number;
  correct: number;
  total: number;
  pct: number;
}

export interface StatsData {
  exam_stats: ExamStats;
  bloque_progress: BloqueProgress[];
  predictions: {
    exam_score_prediction: number | null;
    pass_probability: number | null;
  };
}

export interface ActivityDay {
  date: string;
  count: number;
}

export const ACHIEVEMENT_DEFINITIONS: Record<
  string,
  { icon: string; title: string; desc: string }
> = {
  PRIMERA_PREGUNTA: {
    icon: "🎯",
    title: "Primera pregunta",
    desc: "Respondiste tu primera pregunta",
  },
  RACHA_7: {
    icon: "🔥",
    title: "Racha de 7 días",
    desc: "7 días consecutivos estudiando",
  },
  RACHA_30: {
    icon: "⚡",
    title: "Racha de 30 días",
    desc: "30 días consecutivos estudiando",
  },
  SIMULACRO_COMPLETADO: {
    icon: "📝",
    title: "Primer simulacro",
    desc: "Completaste tu primer simulacro",
  },
  PUNTAJE_80: {
    icon: "🏆",
    title: "Experto PLD",
    desc: "Obtuviste 80% o más en un simulacro",
  },
  PUNTAJE_90: {
    icon: "💎",
    title: "Maestro PLD",
    desc: "Obtuviste 90% o más en un simulacro",
  },
  XP_1000: {
    icon: "⭐",
    title: "1,000 XP",
    desc: "Acumulaste 1,000 XP",
  },
  XP_5000: {
    icon: "🌟",
    title: "5,000 XP",
    desc: "Acumulaste 5,000 XP",
  },
  TODOS_BLOQUES: {
    icon: "📚",
    title: "Explorador",
    desc: "Estudiaste los 7 bloques",
  },
};

export const BLOQUE_NAMES: Record<number, string> = {
  1: "Marco Legal",
  2: "GAFI",
  3: "KYC / CDD",
  4: "Reportes CNBV",
  5: "UNE",
  6: "Sanciones",
  7: "Tipologías",
};
