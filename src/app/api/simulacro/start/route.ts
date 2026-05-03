import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/security";
import { TOPIC_DISTRIBUTION } from "@/lib/simulacro-config";
import {
  TRIAL_SIMULACRO_QUESTIONS,
  TRIAL_SIMULACRO_LIMIT,
} from "@/lib/plan-limits";

type BankRow = {
  id: number;
  pregunta: string;
  opciones: string[];
  tema: string;
};

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
    }

    const sb = supabaseAdmin();

    // Fetch user plan
    const { data: profile } = await sb
      .from("user_profiles")
      .select("plan")
      .eq("user_id", userId)
      .single();

    const plan = profile?.plan ?? "trial";
    const isPremium = plan === "premium_individual" || plan === "corporativo";

    // Trial: enforce simulacro limit
    if (!isPremium) {
      const { count } = await sb
        .from("exam_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("exam_type", "simulacro");

      if ((count ?? 0) >= TRIAL_SIMULACRO_LIMIT) {
        return NextResponse.json(
          { error: "Límite de simulacros gratuitos alcanzado.", upgrade: true },
          { status: 403 }
        );
      }
    }

    const questions: Array<{
      id: number;
      question: string;
      options: string[];
      tema: string;
      topic_key: string;
      topic_label: string;
    }> = [];

    // For trial: proportionally reduce to TRIAL_SIMULACRO_QUESTIONS
    const totalTarget = isPremium ? 60 : TRIAL_SIMULACRO_QUESTIONS;

    for (const { key, tema, count, label } of TOPIC_DISTRIBUTION) {
      const { data, error } = await sb
        .from("quiz_bank")
        .select("id, pregunta, opciones, tema")
        .eq("tema", tema);

      if (error) throw error;

      // Scale count proportionally for trial
      const topicCount = isPremium
        ? count
        : Math.max(1, Math.round((count / 60) * totalTarget));

      const rows = shuffleArray((data ?? []) as BankRow[]).slice(0, topicCount);

      for (const row of rows) {
        const labels = ["A)", "B)", "C)", "D)"];
        const options = (row.opciones as string[]).map((o, i) => `${labels[i]} ${o}`);
        questions.push({
          id: row.id,
          question: row.pregunta,
          options,
          tema: row.tema,
          topic_key: key,
          topic_label: label,
        });
      }
    }

    // Trim to exact target for trial (rounding may overshoot)
    const finalQuestions = isPremium ? questions : questions.slice(0, totalTarget);

    if (finalQuestions.length === 0) {
      return NextResponse.json({ error: "No hay preguntas disponibles." }, { status: 500 });
    }

    // Create exam session
    const { data: session, error: sessionError } = await sb
      .from("exam_sessions")
      .insert({
        user_id: userId,
        exam_type: "simulacro",
        total_questions: finalQuestions.length,
      })
      .select("id")
      .single();

    if (sessionError || !session) {
      throw sessionError ?? new Error("No se pudo crear la sesión.");
    }

    return NextResponse.json({
      session_id: (session as { id: string }).id,
      questions: finalQuestions,
      isTrial: !isPremium,
    });
  } catch (error: unknown) {
    console.error("simulacro/start error:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
