import { supabaseAdmin } from "@/lib/supabase";

export const TRIAL_QUESTION_LIMIT = 15;
export const TRIAL_SIMULACRO_QUESTIONS = 15;
export const TRIAL_SIMULACRO_LIMIT = 1;

export type UserPlan = "trial" | "premium_individual" | "corporativo";

export interface PlanInfo {
  plan: UserPlan;
  trialQuestionsUsed: number;
  trialQuestionsRemaining: number;
  canUseSpacedRepetition: boolean;
  canStartSimulacro: boolean;
  isPremium: boolean;
}

export async function getUserPlanInfo(userId: string): Promise<PlanInfo> {
  const sb = supabaseAdmin();

  const { data: profile } = await sb
    .from("user_profiles")
    .select("plan, trial_questions_used")
    .eq("user_id", userId)
    .single();

  const plan = (profile?.plan ?? "trial") as UserPlan;
  const trialQuestionsUsed = profile?.trial_questions_used ?? 0;
  const isPremium = plan === "premium_individual" || plan === "corporativo";

  if (isPremium) {
    return {
      plan,
      trialQuestionsUsed: 0,
      trialQuestionsRemaining: Infinity,
      canUseSpacedRepetition: true,
      canStartSimulacro: true,
      isPremium: true,
    };
  }

  // Trial: count existing simulacro sessions
  const { count: simulacroCount } = await sb
    .from("exam_sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("exam_type", "simulacro");

  return {
    plan,
    trialQuestionsUsed,
    trialQuestionsRemaining: Math.max(0, TRIAL_QUESTION_LIMIT - trialQuestionsUsed),
    canUseSpacedRepetition: false,
    canStartSimulacro: (simulacroCount ?? 0) < TRIAL_SIMULACRO_LIMIT,
    isPremium: false,
  };
}
