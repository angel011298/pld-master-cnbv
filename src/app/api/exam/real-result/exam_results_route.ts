import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const sb = supabaseAdmin();

    // Obtener resultados del examen
    const { data: result, error } = await sb
      .from("exam_attempts")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !result) {
      return NextResponse.json(
        { success: false, error: "Exam results not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      attempt_id: result.id,
      user_id: result.user_id,
      score_percentage: result.score_percentage,
      score_total: result.score_total,
      results_by_topic: result.results_by_topic || {},
      created_at: result.created_at,
      completed_at: result.completed_at,
      passed: (result.score_percentage || 0) >= 70, // 70% es aprobado
    });
  } catch (error) {
    console.error("GET exam results error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
