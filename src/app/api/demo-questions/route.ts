import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { supabaseAdmin } from "@/lib/supabase";

export interface DemoQuestion {
  id: string;
  pregunta: string;
  opciones: { key: string; texto: string }[];
  respuesta_correcta: string;
  explicacion: string;
}

export async function GET() {
  try {
    const sb = supabaseAdmin();

    const { data, error } = await sb
      .from("quiz_bank")
      .select("id, pregunta, opcion_a, opcion_b, opcion_c, opcion_d, respuesta_correcta, explicacion")
      .eq("tema", "gafi")
      .eq("active", true)
      .limit(20);

    if (error || !data || data.length === 0) {
      return NextResponse.json({ questions: getFallbackQuestions() });
    }

    // Pick 3 random from the pool
    const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, 3);

    const questions: DemoQuestion[] = shuffled.map((row) => ({
      id: row.id,
      pregunta: row.pregunta,
      opciones: [
        { key: "A", texto: row.opcion_a },
        { key: "B", texto: row.opcion_b },
        { key: "C", texto: row.opcion_c },
        { key: "D", texto: row.opcion_d },
      ],
      respuesta_correcta: row.respuesta_correcta,
      explicacion: row.explicacion,
    }));

    return NextResponse.json({ questions });
  } catch {
    return NextResponse.json({ questions: getFallbackQuestions() });
  }
}

function getFallbackQuestions(): DemoQuestion[] {
  return [
    {
      id: "demo-1",
      pregunta: "¿Cuáles son las 40 Recomendaciones del GAFI diseñadas para combatir?",
      opciones: [
        { key: "A", texto: "El lavado de dinero y el financiamiento al terrorismo" },
        { key: "B", texto: "La evasión fiscal y el contrabando" },
        { key: "C", texto: "El fraude bancario y la estafa digital" },
        { key: "D", texto: "El tráfico de influencias y la corrupción" },
      ],
      respuesta_correcta: "A",
      explicacion: "Las 40 Recomendaciones del GAFI son el estándar internacional para combatir el lavado de dinero (LD) y el financiamiento al terrorismo (FT), adoptadas por más de 200 jurisdicciones.",
    },
    {
      id: "demo-2",
      pregunta: "¿En qué año fue fundado el Grupo de Acción Financiera Internacional (GAFI)?",
      opciones: [
        { key: "A", texto: "1975" },
        { key: "B", texto: "1989" },
        { key: "C", texto: "2001" },
        { key: "D", texto: "1995" },
      ],
      respuesta_correcta: "B",
      explicacion: "El GAFI fue fundado en 1989 por el G7 en la Cumbre de París para establecer estándares internacionales contra el lavado de dinero.",
    },
    {
      id: "demo-3",
      pregunta: "¿Qué lista emite el GAFI para identificar países con deficiencias estratégicas en su sistema ALD/CFT?",
      opciones: [
        { key: "A", texto: "Lista de entidades financieras autorizadas" },
        { key: "B", texto: "Lista gris y lista negra (jurisdicciones bajo monitoreo)" },
        { key: "C", texto: "Lista OFAC de personas bloqueadas" },
        { key: "D", texto: "Registro global de beneficiarios finales" },
      ],
      respuesta_correcta: "B",
      explicacion: "El GAFI publica la 'lista gris' (jurisdicciones bajo monitoreo reforzado) y la 'lista negra' (llamada de Acción para jurisdicciones de alto riesgo) para señalar países con deficiencias en sus sistemas ALD/CFT.",
    },
  ];
}
