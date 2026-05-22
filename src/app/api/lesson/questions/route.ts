import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/security";

/**
 * GET /api/lesson/questions?tema=<slug>
 *
 * Returns active questions from `question_bank` for the given bloque,
 * plus the IDs of spaced-review questions due today for the user.
 *
 * Slug → bloque mapping (matches URL slugs in /estudiar/[tema]):
 *   tipologias     → 1   gafi           → 2   sanciones      → 3
 *   kyc_cdd        → 4   reportes_cnbv  → 5   marco_legal    → 6
 *   une            → 7
 *
 * question_bank options/correct_answer have two live formats:
 *   Format A: options = string[]           correct_answer = { index: number }
 *   Format B: options = {key,texto}[]      correct_answer = "A"…"D"
 * Both are normalised to: opciones string[], respuesta_correcta number (0-based).
 */

const SLUG_TO_BLOQUE: Record<string, number> = {
  tipologias:    1,
  gafi:          2,
  sanciones:     3,
  kyc_cdd:       4,
  reportes_cnbv: 5,
  marco_legal:   6,
  une:           7,
};

function isValidSlug(t: string | null): t is keyof typeof SLUG_TO_BLOQUE {
  return t !== null && t in SLUG_TO_BLOQUE;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normaliseRow(row: any) {
  // ── Options ────────────────────────────────────────────────────────────────
  let opciones: string[] = [];
  const raw = row.options;

  if (Array.isArray(raw) && raw.length > 0) {
    if (typeof raw[0] === "string") {
      // Format A: plain string array
      opciones = raw as string[];
    } else if (typeof raw[0] === "object" && raw[0] !== null) {
      // Format B: [{ key: "A", texto: "..." }, ...]
      opciones = raw.map(
        (o: { texto?: string; text?: string; key?: string }) =>
          o.texto ?? o.text ?? String(o.key ?? "")
      );
    }
  }

  // ── Correct answer index (0-based) ────────────────────────────────────────
  let respuesta_correcta = 0;
  const ca = row.correct_answer;

  if (ca !== null && ca !== undefined) {
    if (typeof ca === "object" && typeof ca.index === "number") {
      // Format A: { index: 1 }
      respuesta_correcta = ca.index;
    } else if (typeof ca === "string" && ca.length === 1) {
      // Format B: "B" → 1
      respuesta_correcta = ca.toUpperCase().charCodeAt(0) - 65;
    } else if (typeof ca === "number") {
      respuesta_correcta = ca;
    }
  }

  // Clamp to valid range
  if (respuesta_correcta < 0 || respuesta_correcta >= opciones.length) {
    respuesta_correcta = 0;
  }

  return {
    id: row.id as number,                              // bigint → number
    pregunta: (row.stem ?? row.pregunta ?? "") as string,
    opciones,
    respuesta_correcta,
    explicacion: (row.explanation ?? row.explicacion ?? "") as string,
    fuente: (row.source_document ?? row.fuente ?? "") as string,
    tema: String(row.bloque ?? ""),
    dificultad: String(row.dificultad ?? "1"),
  };
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Debes iniciar sesión." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const tema = searchParams.get("tema");

    if (!isValidSlug(tema)) {
      return NextResponse.json({ error: "Tema inválido." }, { status: 400 });
    }

    const bloque = SLUG_TO_BLOQUE[tema];
    const sb = supabaseAdmin();

    // ── Fetch active questions ────────────────────────────────────────────
    const { data: rows, error: qErr } = await sb
      .from("question_bank")
      .select(
        "id, bloque, stem, options, correct_answer, explanation, source_document, dificultad"
      )
      .eq("bloque", bloque)
      .eq("status", "active");

    if (qErr) {
      console.error("[lesson/questions] question_bank error:", qErr.message);
      return NextResponse.json({ error: qErr.message }, { status: 500 });
    }

    const questions = (rows ?? []).map(normaliseRow);

    // ── Fetch due spaced-review IDs for this user ─────────────────────────
    let dueIds: number[] = [];
    if (questions.length > 0) {
      const allIds = questions.map((q) => q.id);
      const { data: dueRows } = await sb
        .from("spaced_reviews")
        .select("question_id")
        .eq("user_id", userId)
        .in("question_id", allIds)
        .lte("next_review_at", new Date().toISOString());

      dueIds = (dueRows ?? []).map(
        (r: { question_id: number }) => r.question_id
      );
    }

    return NextResponse.json({ questions, dueIds });
  } catch (error: unknown) {
    console.error("[lesson/questions] unexpected error:", error);
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
