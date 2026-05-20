import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sb = supabaseAdmin();

    const { data: allQuestions, error } = await sb
      .from("question_bank")
      .select("id, status, bloque, dificultad, formato");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const questions = allQuestions || [];
    const total = questions.length;

    // Count by status
    const statusCounts: Record<string, number> = {};
    const bloqueCounts: Record<number, number> = {};
    const difCounts: Record<string, number> = {};
    const fmtCounts: Record<string, number> = {};
    const cross: Record<string, number> = {};

    questions.forEach((q: any) => {
      statusCounts[q.status] = (statusCounts[q.status] || 0) + 1;

      if (q.status === "active") {
        bloqueCounts[q.bloque] = (bloqueCounts[q.bloque] || 0) + 1;
        difCounts[q.dificultad] = (difCounts[q.dificultad] || 0) + 1;
        fmtCounts[q.formato] = (fmtCounts[q.formato] || 0) + 1;
        const key = `${q.bloque}-${q.dificultad}`;
        cross[key] = (cross[key] || 0) + 1;
      }
    });

    const activeCount = statusCounts["active"] || 0;
    const bloqueNames = [
      "",
      "Marco Legal PLD/FT",
      "Definiciones",
      "KYC / Identificación del Cliente",
      "Reportes a CNBV",
      "Estructura UNE / Oficial Cumplimiento",
      "Sanciones y Listas",
      "Tipologías y Operaciones Sospechosas",
      "40 Recomendaciones GAFI",
    ];

    return NextResponse.json({
      total,
      byStatus: statusCounts,
      active: {
        total: activeCount,
        byBloque: bloqueCounts,
        bloqueNames: Object.fromEntries(
          Object.entries(bloqueCounts).map(([k, v]) => [
            bloqueNames[parseInt(k)],
            v,
          ])
        ),
        byDificultad: difCounts,
        byFormato: fmtCounts,
        cross: cross,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
