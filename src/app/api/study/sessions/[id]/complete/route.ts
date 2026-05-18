import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/security";

export const dynamic = "force-dynamic";

// XP formula: base 5 + 3 per correct answer, capped at 300 per session
function calcXp(correctCount: number, totalCount: number): number {
  const base = 5;
  const perCorrect = 3;
  const raw = base + correctCount * perCorrect;
  // Small bonus for high-accuracy sessions (≥ 80%)
  const accuracy = totalCount > 0 ? correctCount / totalCount : 0;
  const bonus = accuracy >= 0.8 ? 10 : 0;
  return Math.min(raw + bonus, 300);
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/study/sessions/[id]/complete
// Body: { correct_count, total_count }
// Returns: { success: true, score_percentage, xp_earned }
//
// Marks the session as completed, computes the final score and XP,
// persists both to study_sessions, then calls /api/update-xp to credit
// the user's profile XP and streak.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: sessionId } = await params;
  if (!sessionId) {
    return NextResponse.json({ error: "session id requerido" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const raw = body as { correct_count?: unknown; total_count?: unknown };

  const correctCount = Number(raw.correct_count);
  const totalCount = Number(raw.total_count);

  if (!Number.isInteger(correctCount) || correctCount < 0) {
    return NextResponse.json({ error: "correct_count inválido" }, { status: 400 });
  }
  if (!Number.isInteger(totalCount) || totalCount < 1) {
    return NextResponse.json({ error: "total_count inválido" }, { status: 400 });
  }
  if (correctCount > totalCount) {
    return NextResponse.json(
      { error: "correct_count no puede ser mayor que total_count" },
      { status: 400 }
    );
  }

  const admin = supabaseAdmin();

  // ── Verify session ownership and status ───────────────────────────────────
  const { data: session, error: sessionErr } = await admin
    .from("study_sessions")
    .select("id, status, dificultad, bloque, started_at")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();

  if (sessionErr || !session) {
    return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
  }

  if (session.status === "completed") {
    return NextResponse.json(
      { error: "La sesión ya está completada" },
      { status: 409 }
    );
  }

  // ── Compute derived values ────────────────────────────────────────────────
  const now = new Date();
  const scorePercentage = parseFloat(((correctCount / totalCount) * 100).toFixed(2));
  const xpEarned = calcXp(correctCount, totalCount);

  // ── Update session to completed ───────────────────────────────────────────
  const { error: updateErr } = await admin
    .from("study_sessions")
    .update({
      status: "completed",
      completed_at: now.toISOString(),
      correct_count: correctCount,
      total_questions: totalCount,
      score_percentage: scorePercentage,
      xp_earned: xpEarned,
    })
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (updateErr) {
    console.error("[study/sessions/[id]/complete POST] update error:", updateErr);
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // ── Credit XP and streak via /api/update-xp ───────────────────────────────
  // Derive difficulty label for the study event
  const difficultyLabel =
    session.dificultad === "avanzado"
      ? "Avanzado"
      : session.dificultad === "intermedio"
        ? "Intermedio"
        : session.dificultad === "basico"
          ? "Básico"
          : undefined;

  const durationMs = now.getTime() - new Date(session.started_at).getTime();
  const origin = new URL(req.url).origin;

  try {
    const xpRes = await fetch(`${origin}/api/update-xp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Forward the original Bearer token so update-xp can authenticate
        Authorization: req.headers.get("authorization") ?? "",
      },
      body: JSON.stringify({
        xpGained: xpEarned,
        correct: scorePercentage >= 50,
        topic: session.bloque ? `Bloque ${session.bloque}` : "Estudio general",
        difficulty: difficultyLabel,
        responseTimeMs: Math.floor(durationMs / Math.max(totalCount, 1)),
      }),
    });

    if (!xpRes.ok) {
      // Non-critical — session is already completed; log the failure
      console.warn(
        "[study/sessions/[id]/complete POST] update-xp responded with",
        xpRes.status
      );
    }
  } catch (xpErr) {
    // Network / internal error — swallow so the session completion still succeeds
    console.error("[study/sessions/[id]/complete POST] update-xp fetch error:", xpErr);
  }

  return NextResponse.json({
    success: true,
    score_percentage: scorePercentage,
    xp_earned: xpEarned,
  });
}
