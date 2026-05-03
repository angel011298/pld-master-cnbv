import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/security";

interface AnswerPayload {
  session_id?: string;
  question_id: number;
  opcion_elegida?: string | null;
  es_correcta: boolean;
  tiempo_respuesta_seg?: number | null;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
    }

    const body = (await req.json()) as AnswerPayload;
    const { session_id, question_id, opcion_elegida, es_correcta, tiempo_respuesta_seg } = body;

    if (!question_id || typeof es_correcta !== "boolean") {
      return NextResponse.json({ error: "question_id y es_correcta son requeridos." }, { status: 400 });
    }

    const sb = supabaseAdmin();

    // 1. Register answer in exam_answers (only if session exists)
    if (session_id) {
      const letra = typeof opcion_elegida === "string" ? opcion_elegida.charAt(0).toUpperCase() : null;
      const letraValida = letra && ["A", "B", "C", "D"].includes(letra) ? letra : null;

      const { error: answerErr } = await sb.from("exam_answers").insert({
        session_id,
        question_id,
        opcion_elegida: letraValida,
        es_correcta,
        tiempo_respuesta_seg: typeof tiempo_respuesta_seg === "number" ? tiempo_respuesta_seg : null,
      });

      if (answerErr) {
        console.error("exam_answers insert error:", answerErr.message);
      }
    }

    // 2. Fetch current SM-2 state for this (user, question)
    const { data: existing } = await sb
      .from("spaced_reviews")
      .select("interval_days, ease_factor, repetitions")
      .eq("user_id", userId)
      .eq("question_id", question_id)
      .maybeSingle();

    const curInterval = existing?.interval_days ?? 1;
    const curEase = Number(existing?.ease_factor ?? 2.5);
    const curReps = existing?.repetitions ?? 0;

    // 3. SM-2 simplified update
    let newInterval: number;
    let newEase: number;
    let newReps: number;

    if (es_correcta) {
      newInterval = Math.max(1, Math.floor(curInterval * curEase));
      newEase = Math.min(parseFloat((curEase + 0.1).toFixed(2)), 5.0);
      newReps = curReps + 1;
    } else {
      newInterval = 1;
      newEase = Math.max(1.3, parseFloat((curEase - 0.2).toFixed(2)));
      newReps = 0;
    }

    const nextReviewAt = new Date(
      Date.now() + newInterval * 24 * 60 * 60 * 1000
    ).toISOString();

    await sb.from("spaced_reviews").upsert(
      {
        user_id: userId,
        question_id,
        interval_days: newInterval,
        ease_factor: newEase,
        repetitions: newReps,
        next_review_at: nextReviewAt,
        last_reviewed_at: new Date().toISOString(),
        last_quality: es_correcta ? 4 : 1,
      },
      { onConflict: "user_id,question_id" }
    );

    // 4. Add XP to user_profiles
    const xpGained = es_correcta ? 10 : 3;

    const { data: profile } = await sb
      .from("user_profiles")
      .select("total_xp")
      .eq("user_id", userId)
      .single();

    const newXp = (profile?.total_xp ?? 0) + xpGained;

    await sb
      .from("user_profiles")
      .upsert({ user_id: userId, total_xp: newXp }, { onConflict: "user_id" });

    return NextResponse.json({
      success: true,
      xpGained,
      totalXp: newXp,
      sm2: { interval: newInterval, ease: newEase, repetitions: newReps, nextReviewAt },
    });
  } catch (error: unknown) {
    console.error("answer route error:", error);
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
