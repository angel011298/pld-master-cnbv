import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sb = supabaseAdmin();
    
    // Obtener 135 preguntas aleatorias SIN la respuesta correcta
    const { data: questions, error } = await sb
      .from("questions")
      .select("id, question, options, topic, difficulty")
      .limit(135);

    if (error) {
      console.error("DB error:", error);
      return NextResponse.json(
        { success: false, error: "Error fetching questions" },
        { status: 500 }
      );
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { success: false, error: "No questions found" },
        { status: 404 }
      );
    }

    // Randomizar orden
    const shuffled = questions.sort(() => 0.5 - Math.random());

    return NextResponse.json({
      success: true,
      questions: shuffled,
      total: shuffled.length,
    });
  } catch (error) {
    console.error("Questions API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const sb = supabaseAdmin();
    const body = await req.json();
    
    const { answers, exam_id } = body;
    
    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid answers format" },
        { status: 400 }
      );
    }

    // Obtener todas las preguntas para validar respuestas
    const { data: allQuestions, error: questionsError } = await sb
      .from("questions")
      .select("id, correct_answer_index");

    if (questionsError || !allQuestions) {
      return NextResponse.json(
        { success: false, error: "Error validating answers" },
        { status: 500 }
      );
    }

    // Calcular puntuación
    let correctCount = 0;
    const results: Record<string, { correct: number; total: number }> = {};

    for (const [questionId, userAnswerIndex] of Object.entries(answers)) {
      const question = allQuestions.find((q) => q.id === questionId);
      
      if (!question) continue;

      const isCorrect = userAnswerIndex === question.correct_answer_index;
      if (isCorrect) correctCount++;

      const topic = "General"; // Adjust if needed
      if (!results[topic]) {
        results[topic] = { correct: 0, total: 0 };
      }
      results[topic].total++;
      if (isCorrect) results[topic].correct++;
    }

    const percentage = Math.round(
      (correctCount / Object.keys(answers).length) * 100
    );

    return NextResponse.json({
      success: true,
      score_percentage: percentage,
      score_total: correctCount,
      total_questions: Object.keys(answers).length,
      results_by_topic: results,
    });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
