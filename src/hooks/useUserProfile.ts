"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const SUPER_ADMIN_EMAIL = "553angelortiz@gmail.com";

export interface UserProfile {
  userId: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  publicCustomerId: string | null;
  totalXp: number;
  currentStreak: number;
  examScorePrediction: number | null;
  passProbability: number | null;
  tier: "free" | "premium";
  effectiveTier: "free" | "premium";
  isSuperAdmin: boolean;
  examDate: string | null;
  onboardingCompleted: boolean;
  answeredQuestions: number;
  correctAnswers: number;
  lastStudyDates: string[];
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const sb = supabase();
    const { data: { session } } = await sb.auth.getSession();
    const user = session?.user;
    if (!user?.id) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const email = user.email ?? null;
    const isSuperAdmin = email === SUPER_ADMIN_EMAIL;
    const metadata = user.user_metadata ?? {};
    const metadataName =
      typeof metadata.full_name === "string"
        ? metadata.full_name
        : typeof metadata.name === "string"
          ? metadata.name
          : null;
    const avatarUrl =
      typeof metadata.avatar_url === "string"
        ? metadata.avatar_url
        : typeof metadata.picture === "string"
          ? metadata.picture
          : null;

    const { data } = await sb
      .from("user_profiles")
      .select("user_id, public_customer_id, full_name, total_xp, current_streak, exam_score_prediction, pass_probability, tier, exam_date, onboarding_completed")
      .eq("user_id", user.id)
      .single();

    const { data: events } = await sb
      .from("study_events")
      .select("correct, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(500);

    const answeredQuestions = events?.length ?? 0;
    const correctAnswers = events?.filter((event) => event.correct === true).length ?? 0;
    const lastStudyDates = Array.from(
      new Set(
        events
          ?.map((event) => (typeof event.created_at === "string" ? event.created_at.slice(0, 10) : null))
          .filter((date): date is string => Boolean(date)) ?? []
      )
    );

    const tier = ((data?.tier as "free" | "premium" | undefined) ?? "free");
    const fullName = data?.full_name ?? metadataName ?? email?.split("@")[0] ?? null;

    if (data) {
      setProfile({
        userId: data.user_id,
        email,
        fullName,
        avatarUrl,
        publicCustomerId: data.public_customer_id ?? null,
        totalXp: data.total_xp ?? 0,
        currentStreak: data.current_streak ?? 0,
        examScorePrediction: data.exam_score_prediction ?? null,
        passProbability: data.pass_probability ?? null,
        tier,
        effectiveTier: isSuperAdmin ? "premium" : tier,
        isSuperAdmin,
        examDate: data.exam_date ?? null,
        onboardingCompleted: data.onboarding_completed ?? false,
        answeredQuestions,
        correctAnswers,
        lastStudyDates,
      });
    } else {
      setProfile({
        userId: user.id,
        email,
        fullName,
        avatarUrl,
        publicCustomerId: null,
        totalXp: 0,
        currentStreak: 0,
        examScorePrediction: null,
        passProbability: null,
        tier: "free",
        effectiveTier: isSuperAdmin ? "premium" : "free",
        isSuperAdmin,
        examDate: null,
        onboardingCompleted: false,
        answeredQuestions,
        correctAnswers,
        lastStudyDates,
      });
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
