import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/security";

export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/study/sessions/failed-questions
// Returns questions the user answered incorrectly in the last 30 days,
// deduped by question_id (most recent failure per question).
//
// Shape:
// {
//   questions:  up to 50 full question objects (shuffled)
//   total:      distinct failed question count
//   by_formato: [{ formato, count }]   — counts from all 50
//   by_bloque:  [{ bloque, count }]    — counts from all 50
// }
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const admin = supabaseAdmin();
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  // ── 1. User's completed sessions in the last 30 days ─────────────────────
  const { data: sessions, error: sessErr } = await admin
    .from("study_sessions")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "completed")
    .gte("created_at", thirtyDaysAgo)
    .limit(300);

  if (sessErr) {
    console.error("[failed-questions] sessions error:", sessErr);
    return NextResponse.json({ error: sessErr.message }, { status: 500 });
  }

  const sessionIds = (sessions ?? []).map((s: { id: string }) => s.id);

  if (sessionIds.length === 0) {
    return NextResponse.json({
      questions: [],
      total: 0,
      by_formato: [],
      by_bloque: [],
    });
  }

  // ── 2. Failed responses in those sessions (30-day window) ─────────────────
  const { data: failedResponses, error: respErr } = await admin
    .from("study_question_responses")
    .select("question_id, answered_at")
    .in("session_id", sessionIds)
    .eq("is_correct", false)
    .gte("answered_at", thirtyDaysAgo)
    .order("answered_at", { ascending: false })
    .limit(500);

  if (respErr) {
    console.error("[failed-questions] responses error:", respErr);
    return NextResponse.json({ error: respErr.message }, { status: 500 });
  }

  // Deduplicate: keep most-recently-failed entry per question_id (cap at 50)
  const seenIds = new Set<number>();
  const failedIds: number[] = [];

  for (const r of (failedResponses ?? [])) {
    if (!seenIds.has(r.question_id)) {
      seenIds.add(r.question_id);
      failedIds.push(r.question_id);
      if (failedIds.length >= 50) break;
    }
  }

  if (failedIds.length === 0) {
    return NextResponse.json({
      questions: [],
      total: 0,
      by_formato: [],
      by_bloque: [],
    });
  }

  // ── 3. Fetch full question details ────────────────────────────────────────
  const { data: questionRows, error: qErr } = await admin
    .from("question_bank")
    .select(
      "id, bloque, dificultad, formato, stem, options, correct_answer, explanation, source_document"
    )
    .in("id", failedIds)
    .eq("status", "active");

  if (qErr) {
    console.error("[failed-questions] questions error:", qErr);
    return NextResponse.json({ error: qErr.message }, { status: 500 });
  }

  const questions = (questionRows ?? []).sort(() => Math.random() - 0.5);

  // ── 4. Aggregate by_formato and by_bloque for filter UI ──────────────────
  const formatoMap = new Map<string, number>();
  const bloqueMap = new Map<number, number>();

  for (const q of questions) {
    formatoMap.set(q.formato, (formatoMap.get(q.formato) ?? 0) + 1);
    if (q.bloque) {
      bloqueMap.set(q.bloque, (bloqueMap.get(q.bloque) ?? 0) + 1);
    }
  }

  const byFormato = [...formatoMap.entries()]
    .map(([formato, count]) => ({ formato, count }))
    .sort((a, b) => b.count - a.count);

  const byBloque = [...bloqueMap.entries()]
    .map(([bloque, count]) => ({ bloque, count }))
    .sort((a, b) => a.bloque - b.bloque);

  return NextResponse.json({
    questions,
    total: questions.length,
    by_formato: byFormato,
    by_bloque: byBloque,
  });
}
