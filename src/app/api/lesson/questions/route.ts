import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/security";

/**
 * GET /api/lesson/questions?tema=<pld_topic_enum_key>
 *
 * Fetches active quiz_bank questions for a given topic using the service-role
 * client (bypasses RLS). Normalises both possible column layouts:
 *   • Legacy:  opcion_a / opcion_b / opcion_c / opcion_d  + respuesta_correcta char('A'–'D')
 *   • Array:   opciones text[]                            + respuesta_correcta int (index)
 *
 * Also returns the IDs of spaced-review questions that are due today for
 * the authenticated user, so the lesson can prioritise them.
 */

const VALID_TOPICS = [
  "tipologias",
  "gafi",
  "sanciones",
  "kyc_cdd",
  "reportes_cnbv",
  "marco_legal",
  "une",
] as const;

type ValidTopic = (typeof VALID_TOPICS)[number];

function isValidTopic(t: string | null): t is ValidTopic {
  return VALID_TOPICS.includes(t as ValidTopic);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normaliseRow(row: any) {
  // ── Options array ──────────────────────────────────────────────────────────
  let opciones: string[];
  if (Array.isArray(row.opciones) && row.opciones.length >= 2) {
    // Array schema: opciones text[]
    opciones = row.opciones as string[];
  } else {
    // Individual-column schema: opcion_a … opcion_d
    opciones = [row.opcion_a, row.opcion_b, row.opcion_c, row.opcion_d].filter(
      (o): o is string => typeof o === "string" && o.length > 0
    );
  }

  // ── Correct answer index ───────────────────────────────────────────────────
  let respuesta_correcta: number;
  if (typeof row.respuesta_correcta === "number") {
    // Already an index (0–3)
    respuesta_correcta = row.respuesta_correcta;
  } else if (
    typeof row.respuesta_correcta === "string" &&
    row.respuesta_correcta.length === 1
  ) {
    // char 'A'→0, 'B'→1, 'C'→2, 'D'→3
    respuesta_correcta =
      row.respuesta_correcta.toUpperCase().charCodeAt(0) - 65;
  } else {
    respuesta_correcta = 0;
  }

  return {
    id: row.id as string,                       // uuid
    pregunta: row.pregunta as string,
    opciones,
    respuesta_correcta,
    explicacion: (row.explicacion as string) ?? "",
    fuente: (row.fuente_documento as string) ?? "",
    tema: row.tema as string,
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

    if (!isValidTopic(tema)) {
      return NextResponse.json({ error: "Tema inválido." }, { status: 400 });
    }

    const sb = supabaseAdmin();

    // ── Fetch active questions (admin bypasses RLS) ────────────────────────
    const { data: rows, error: qErr } = await sb
      .from("quiz_bank")
      .select(
        "id, pregunta, opcion_a, opcion_b, opcion_c, opcion_d, opciones, " +
          "respuesta_correcta, explicacion, fuente_documento, tema, dificultad"
      )
      .eq("tema", tema)
      .eq("active", true);

    if (qErr) {
      console.error("[lesson/questions] quiz_bank error:", qErr.message);
      return NextResponse.json({ error: qErr.message }, { status: 500 });
    }

    const questions = (rows ?? []).map(normaliseRow);

    // ── Fetch due spaced-review question IDs for this user ─────────────────
    let dueIds: string[] = [];
    if (questions.length > 0) {
      const allIds = questions.map((q) => q.id);
      const { data: dueRows } = await sb
        .from("spaced_reviews")
        .select("question_id")
        .eq("user_id", userId)
        .in("question_id", allIds)
        .lte("next_review_at", new Date().toISOString());

      dueIds = (dueRows ?? []).map(
        (r: { question_id: string }) => r.question_id
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
