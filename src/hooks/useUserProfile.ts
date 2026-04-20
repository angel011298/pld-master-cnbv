"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface UserProfile {
  userId: string;
  totalXp: number;
  currentStreak: number;
  examScorePrediction: number | null;
  passProbability: number | null;
  tier: "free" | "premium";
  examDate: string | null;
  onboardingCompleted: boolean;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const sb = supabase();
    const { data: { session } } = await sb.auth.getSession();
    if (!session?.user?.id) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const { data } = await sb
      .from("user_profiles")
      .select("user_id, total_xp, current_streak, exam_score_prediction, pass_probability, tier, exam_date, onboarding_completed")
      .eq("user_id", session.user.id)
      .single();

    if (data) {
      setProfile({
        userId: data.user_id,
        totalXp: data.total_xp ?? 0,
        currentStreak: data.current_streak ?? 0,
        examScorePrediction: data.exam_score_prediction ?? null,
        passProbability: data.pass_probability ?? null,
        tier: (data.tier as "free" | "premium") ?? "free",
        examDate: data.exam_date ?? null,
        onboardingCompleted: data.onboarding_completed ?? false,
      });
    } else {
      setProfile({ userId: session.user.id, totalXp: 0, currentStreak: 0, examScorePrediction: null, passProbability: null, tier: "free", examDate: null, onboardingCompleted: false });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfile();

    const sb = supabase();
    const { data: { subscription } } = sb.auth.onAuthStateChange(() => {
      fetchProfile();
    });
    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  return { profile, loading, refetch: fetchProfile };
}
