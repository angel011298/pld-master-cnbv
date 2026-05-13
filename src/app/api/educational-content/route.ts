import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const bloque = request.nextUrl.searchParams.get("bloque");

  if (!bloque) {
    return NextResponse.json({ error: "Parámetro 'bloque' requerido" }, { status: 400 });
  }

  const bloqueNum = parseInt(bloque, 10);
  if (isNaN(bloqueNum) || bloqueNum < 1 || bloqueNum > 10) {
    return NextResponse.json({ error: "Bloque inválido" }, { status: 400 });
  }

  const sb = supabaseAdmin();

  const [contentResult, ejerciciosResult] = await Promise.all([
    sb
      .from("educational_content")
      .select("id, bloque, tema, subtema, tipo, contenido, fuente_detallada, orden")
      .eq("bloque", bloqueNum)
      .order("orden", { ascending: true }),
    sb
      .from("ejercicios_didacticos")
      .select("id, bloque, tema, tipo, titulo, instrucciones, contenido, solucion, dificultad, tiempo_estimado")
      .eq("bloque", bloqueNum),
  ]);

  return NextResponse.json({
    content: contentResult.data ?? [],
    ejercicios: ejerciciosResult.data ?? [],
    contentError: contentResult.error?.message ?? null,
    ejerciciosError: ejerciciosResult.error?.message ?? null,
  });
}
