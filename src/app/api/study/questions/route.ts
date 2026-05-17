import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/study/questions
 * Query params:
 *   formato  — required (flashcard | multiple_choice | true_false | case_study | fill_blank | crossword | word_search)
 *   bloque   — optional, 1-8 or "all"
 *   dificultad — optional, basico|intermedio|avanzado or "all"
 *   limit    — optional, default 10, max 50
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const formato = searchParams.get("formato");
  const bloque = searchParams.get("bloque");
  const dificultad = searchParams.get("dificultad");
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

  if (!formato) {
    return NextResponse.json({ error: "formato requerido" }, { status: 400 });
  }

  const admin = supabaseAdmin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = admin
    .from("question_bank")
    .select(
      "id, bloque, dificultad, formato, stem, options, correct_answer, explanation, source_document"
    )
    .eq("status", "active")
    .eq("formato", formato);

  if (bloque && bloque !== "all") {
    query = query.eq("bloque", parseInt(bloque));
  }
  if (dificultad && dificultad !== "all") {
    query = query.eq("dificultad", dificultad);
  }

  // Fetch up to 4× requested so we have enough to shuffle
  const { data, error } = await query.limit(Math.min(limit * 4, 200));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Shuffle in JS and take the requested limit
  const shuffled = ((data as unknown[]) || [])
    .sort(() => Math.random() - 0.5)
    .slice(0, limit);

  return NextResponse.json({ questions: shuffled, total: (data || []).length });
}
