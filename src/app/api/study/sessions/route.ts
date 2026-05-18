import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/security";

export const dynamic = "force-dynamic";

const VALID_FORMATOS = new Set([
  "flashcard",
  "multiple_choice",
  "true_false",
  "case_study",
  "fill_blank",
  "crossword",
  "word_search",
]);

const VALID_DIFICULTADES = new Set(["basico", "intermedio", "avanzado"]);

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/study/sessions
// Body: { formato, bloque?, dificultad?, total_questions }
// Returns: { session_id }
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const raw = body as {
    formato?: unknown;
    bloque?: unknown;
    dificultad?: unknown;
    total_questions?: unknown;
  };

  // Validate formato
  const formato = typeof raw.formato === "string" ? raw.formato.trim() : "";
  if (!VALID_FORMATOS.has(formato)) {
    return NextResponse.json(
      {
        error: `formato inválido. Valores permitidos: ${[...VALID_FORMATOS].join(", ")}`,
      },
      { status: 400 }
    );
  }

  // Validate optional bloque (1-8)
  let bloque: number | null = null;
  if (raw.bloque !== undefined && raw.bloque !== null) {
    const b = Number(raw.bloque);
    if (!Number.isInteger(b) || b < 1 || b > 8) {
      return NextResponse.json(
        { error: "bloque debe ser un entero entre 1 y 8" },
        { status: 400 }
      );
    }
    bloque = b;
  }

  // Validate optional dificultad
  let dificultad: string | null = null;
  if (raw.dificultad !== undefined && raw.dificultad !== null) {
    const d = typeof raw.dificultad === "string" ? raw.dificultad.trim() : "";
    if (!VALID_DIFICULTADES.has(d)) {
      return NextResponse.json(
        {
          error: `dificultad inválida. Valores permitidos: ${[...VALID_DIFICULTADES].join(", ")}`,
        },
        { status: 400 }
      );
    }
    dificultad = d;
  }

  // Validate total_questions
  const totalQuestions = Number(raw.total_questions);
  if (!Number.isInteger(totalQuestions) || totalQuestions < 1 || totalQuestions > 200) {
    return NextResponse.json(
      { error: "total_questions debe ser un entero entre 1 y 200" },
      { status: 400 }
    );
  }

  const admin = supabaseAdmin();

  const { data: session, error } = await admin
    .from("study_sessions")
    .insert({
      user_id: userId,
      formato,
      bloque,
      dificultad,
      total_questions: totalQuestions,
      correct_count: 0,
      score_percentage: null,
      xp_earned: 0,
      status: "in_progress",
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    console.error("[study/sessions POST] insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ session_id: session.id }, { status: 201 });
}
