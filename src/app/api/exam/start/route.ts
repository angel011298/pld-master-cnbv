import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

    const body = (await req.json()) as { mode?: string; area?: string; count?: number };
    const mode = ["diagnostic", "simulacro", "estudio"].includes(body.mode ?? "")
      ? (body.mode as string)
      : "simulacro";
    const area = body.area ? String(body.area).slice(0, 50) : null;
    const defaultCount = mode === "diagnostic" ? 10 : mode === "simulacro" ? 60 : 15;
    const count = Math.min(Math.max(Math.floor(Number(body.count) || defaultCount), 5), 135);

    const sb = supabaseAdmin();

    let q = sb.from("exam_questions").select("id, question, option_a, option_b, option_c, option_d, area, difficulty").eq("active", true);
    if (area) q = q.eq("area", area);

    const { data: questions, error: qErr } = await q;
    if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });

    const pool = questions ?? [];
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, count);

    const { data: attempt, error: aErr } = await sb
      .from("exam_attempts")
      .insert({
        user_id: userId,
        mode,
        area,
        total_questions: shuffled.length,
      })
      .select("id")
      .single();

    if (aErr || !attempt) {
      return NextResponse.json({ error: aErr?.message ?? "No se pudo iniciar." }, { status: 500 });
    }

    return NextResponse.json({ attempt_id: attempt.id, questions: shuffled });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
