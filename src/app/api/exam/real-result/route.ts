import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/security";

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId(req);
  if (!userId) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  const body = (await req.json()) as {
    passed?: boolean;
    exam_date?: string;
    exam_cycle?: string;
  };

  const passed = Boolean(body.passed);
  const exam_cycle = body.exam_cycle === "oct_2026" ? "oct_2026" : "jun_2026";
  const exam_date = body.exam_date ?? null;

  const sb = supabaseAdmin();
  const { error } = await sb
    .from("exam_results_real")
    .upsert(
      { user_id: userId, exam_cycle, passed, exam_date },
      { onConflict: "user_id,exam_cycle" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
