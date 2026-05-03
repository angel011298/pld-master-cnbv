"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen, ClipboardList, AlertTriangle, FileText, Scale,
  Star, Layers, ArrowLeft, Trophy, Zap, CheckCircle, XCircle, ChevronRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { buildAuthHeaders } from "@/lib/auth-client";
import { QuizCard, QuizCardSkeleton } from "@/components/quiz/QuizCard";
import type { QuizQuestion } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// ── Types ─────────────────────────────────────────────────────────────────────

interface QuizBankRow {
  id: number;
  pregunta: string;
  opciones: string[];
  respuesta_correcta: number;
  explicacion: string;
  tema: string;
  dificultad: string;
  fuente: string;
}

interface TopicMeta {
  name: string;
  description: string;
  tema: string;
  icon: React.ComponentType<{ className?: string }>;
}

type LessonState = "inicio" | "cargando" | "leccion" | "resultados";

interface LessonResults {
  correct: number;
  total: number;
  xp: number;
}

// ── Topic catalogue ───────────────────────────────────────────────────────────

const TOPIC_MAP: Record<string, TopicMeta> = {
  definiciones: {
    name: "Definiciones PLD/FT",
    description: "Conceptos fundamentales sobre Prevención de Lavado de Dinero y Financiamiento al Terrorismo.",
    tema: "Definiciones PLD/FT",
    icon: BookOpen,
  },
  procedimientos: {
    name: "Procedimientos de Cumplimiento",
    description: "Políticas, controles y procedimientos para implementar el programa de PLD.",
    tema: "Procedimientos de Cumplimiento",
    icon: ClipboardList,
  },
  identificacion: {
    name: "Identificación de Operaciones Sospechosas",
    description: "Señales de alerta y tipologías para detectar operaciones irregulares.",
    tema: "Identificación de Operaciones Sospechosas",
    icon: AlertTriangle,
  },
  reportes: {
    name: "Reportes y Documentación",
    description: "Elaboración y presentación de reportes ante la CNBV y autoridades.",
    tema: "Reportes y Documentación",
    icon: FileText,
  },
  "marco-regulatorio": {
    name: "Marco Regulatorio y Autoridades",
    description: "Leyes, reglamentos, autoridades competentes y organismos internacionales.",
    tema: "Marco Regulatorio y Autoridades",
    icon: Scale,
  },
  actitud: {
    name: "Actitud y Ética Profesional",
    description: "Principios éticos y conducta esperada del profesional certificado en PLD.",
    tema: "Actitud y Ética Profesional",
    icon: Star,
  },
  "casos-practicos": {
    name: "Casos Prácticos Aplicados",
    description: "Aplicación práctica de conocimientos a situaciones reales del sector financiero.",
    tema: "Casos Prácticos Aplicados",
    icon: Layers,
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function bankRowToQuestion(row: QuizBankRow, seqId: number): QuizQuestion {
  const labels = ["A)", "B)", "C)", "D)"];
  const indices = shuffleArray([0, 1, 2, 3]);
  const options = indices.map((origIdx, pos) => `${labels[pos]} ${row.opciones[origIdx]}`);
  const correctPos = indices.indexOf(row.respuesta_correcta);
  return {
    id: seqId,
    question_id: row.id,
    question: row.pregunta,
    options,
    answer: options[correctPos],
    justification: `${row.explicacion}${row.fuente ? ` (Fuente: ${row.fuente})` : ""}`,
    source: "bank",
  };
}

function motivationalMessage(score: number): string {
  if (score >= 90) return "¡Excelente! Dominas este tema a la perfección.";
  if (score >= 70) return "¡Muy bien! Sigue practicando para alcanzar la excelencia.";
  if (score >= 50) return "Buen intento. Repasa los conceptos clave y vuelve a intentarlo.";
  return "¡Sigue adelante! Con práctica constante dominarás este tema.";
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LeccionPage() {
  const params = useParams();
  const router = useRouter();
  const temaSlug = params.tema as string;
  const topicInfo = TOPIC_MAP[temaSlug];

  const [lessonState, setLessonState] = useState<LessonState>("inicio");
  const [dueCount, setDueCount] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<LessonResults | null>(null);

  // Refs avoid stale-closure issues in async callbacks
  const correctRef = useRef(0);
  const xpRef = useRef(0);
  const sessionIdRef = useRef<string | null>(null);
  const questionStartRef = useRef(Date.now());

  // Fetch pending review count on mount
  useEffect(() => {
    if (!topicInfo) return;
    const sb = supabase();
    sb.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: bankRows } = await sb
        .from("quiz_bank")
        .select("id")
        .eq("tema", topicInfo.tema);
      const ids = (bankRows ?? []).map((r: { id: number }) => r.id);
      if (ids.length === 0) { setDueCount(0); return; }
      const { count } = await sb
        .from("spaced_reviews")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .in("question_id", ids)
        .lte("next_review_at", new Date().toISOString());
      setDueCount(count ?? 0);
    });
  }, [topicInfo]);

  const startLesson = useCallback(async () => {
    if (!topicInfo) return;
    setLessonState("cargando");

    const sb = supabase();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { router.push("/"); return; }

    // Fetch all questions for this topic
    const { data: bankRows } = await sb
      .from("quiz_bank")
      .select("*")
      .eq("tema", topicInfo.tema);
    const allRows = (bankRows ?? []) as QuizBankRow[];

    // Find which are due for review
    const dueSet = new Set<number>();
    if (allRows.length > 0) {
      const { data: dueRows } = await sb
        .from("spaced_reviews")
        .select("question_id")
        .eq("user_id", user.id)
        .in("question_id", allRows.map((r) => r.id))
        .lte("next_review_at", new Date().toISOString());
      (dueRows ?? []).forEach((r: { question_id: number }) => dueSet.add(r.question_id));
    }

    // Due reviews first, then new questions – capped at 10
    const ordered = [
      ...shuffleArray(allRows.filter((r) => dueSet.has(r.id))),
      ...shuffleArray(allRows.filter((r) => !dueSet.has(r.id))),
    ].slice(0, 10);

    if (ordered.length === 0) {
      setLessonState("inicio");
      return;
    }

    const quizQuestions = ordered.map((row, i) => bankRowToQuestion(row, i + 1));

    // Create exam session
    const { data: session } = await sb
      .from("exam_sessions")
      .insert({ user_id: user.id, exam_type: "repaso", total_questions: quizQuestions.length })
      .select("id")
      .single();

    // Update streak
    try {
      const headers = await buildAuthHeaders({ "Content-Type": "application/json" });
      fetch("/api/streak", { method: "POST", headers }).catch(console.error);
    } catch {
      // streak update failed, continue anyway
    }

    // Reset counters
    correctRef.current = 0;
    xpRef.current = 0;
    questionStartRef.current = Date.now();
    sessionIdRef.current = session?.id ?? null;

    setQuestions(quizQuestions);
    setCurrentIndex(0);
    setResults(null);
    setLessonState("leccion");
  }, [topicInfo, router]);

  const handleAnswer = useCallback(
    async (isCorrect: boolean, questionId?: number, selectedOption?: string) => {
      if (isCorrect) correctRef.current++;
      xpRef.current += isCorrect ? 10 : 3;
      if (!questionId) return;

      const elapsed = Math.round((Date.now() - questionStartRef.current) / 1000);
      try {
        const headers = await buildAuthHeaders({ "Content-Type": "application/json" });
        fetch("/api/answer", {
          method: "POST",
          headers,
          body: JSON.stringify({
            session_id: sessionIdRef.current,
            question_id: questionId,
            opcion_elegida: selectedOption?.charAt(0) ?? null,
            es_correcta: isCorrect,
            tiempo_respuesta_seg: elapsed,
          }),
        }).catch(console.error);
      } catch {
        // session expired – continue lesson anyway
      }
    },
    []
  );

  const handleNext = useCallback(async () => {
    const next = currentIndex + 1;

    if (next >= questions.length) {
      // Close the exam session
      const sid = sessionIdRef.current;
      if (sid) {
        const sb = supabase();
        const finalCorrect = correctRef.current;
        const finalTotal = questions.length;
        sb.from("exam_sessions")
          .update({
            estado: "completado",
            correct_answers: finalCorrect,
            score: finalTotal > 0 ? Number(((finalCorrect / finalTotal) * 100).toFixed(2)) : 0,
            completed_at: new Date().toISOString(),
          })
          .eq("id", sid)
          .then(({ error }) => {
            if (error) console.error("Failed to close session:", error);
          });
      }
      setResults({ correct: correctRef.current, total: questions.length, xp: xpRef.current });
      setLessonState("resultados");
    } else {
      setCurrentIndex(next);
      questionStartRef.current = Date.now();
    }
  }, [currentIndex, questions.length]);

  // ── Topic not found ──────────────────────────────────────────────────────────
  if (!topicInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Tema no encontrado</h1>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </div>
    );
  }

  const TopicIcon = topicInfo.icon;
  const progress = questions.length > 0 ? (currentIndex / questions.length) * 100 : 0;

  // ── Inicio ───────────────────────────────────────────────────────────────────
  if (lessonState === "inicio") {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 flex flex-col gap-6">
        <Button onClick={() => router.back()} variant="ghost" size="sm" className="self-start gap-2 text-slate-500">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>

        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
            <TopicIcon className="h-7 w-7 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">{topicInfo.name}</h1>
            <p className="text-sm text-slate-500 mt-1">{topicInfo.description}</p>
          </div>
        </div>

        {/* Pending reviews counter */}
        <div className="rounded-2xl border-2 border-blue-100 bg-blue-50 p-5 flex items-center gap-4">
          <div className="text-center min-w-[64px]">
            <p className="text-3xl font-black text-blue-700">
              {dueCount === null ? "…" : dueCount}
            </p>
            <p className="text-xs font-bold text-blue-500 uppercase tracking-wide">pendientes</p>
          </div>
          <div className="border-l border-blue-200 pl-4">
            <p className="text-sm font-semibold text-blue-800">Repasos vencidos en este tema</p>
            <p className="text-xs text-blue-500 mt-0.5">
              {dueCount === null
                ? "Calculando…"
                : dueCount > 0
                ? "Se priorizarán al inicio de la lección."
                : "¡Al día! Practicarás preguntas nuevas."}
            </p>
          </div>
        </div>

        {/* Info list */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Esta lección incluye</p>
          {[
            "10 preguntas seleccionadas inteligentemente",
            "Repasos vencidos primero, luego preguntas nuevas",
            "+10 XP por correcta · +3 XP por incorrecta",
            "SM-2: ajusta automáticamente el intervalo de repaso",
          ].map((text) => (
            <div key={text} className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>

        <Button
          onClick={startLesson}
          className="w-full py-6 text-lg font-black rounded-2xl bg-blue-600 hover:bg-blue-700 text-white border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all"
        >
          Comenzar lección <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    );
  }

  // ── Cargando ─────────────────────────────────────────────────────────────────
  if (lessonState === "cargando") {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-blue-500 rounded-full animate-pulse" />
          </div>
          <p className="text-sm text-slate-400 text-center">Preparando tu lección…</p>
        </div>
        <QuizCardSkeleton />
      </div>
    );
  }

  // ── Lección ──────────────────────────────────────────────────────────────────
  if (lessonState === "leccion") {
    const q = questions[currentIndex];
    return (
      <div className="max-w-2xl mx-auto py-6 px-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TopicIcon className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-bold text-slate-700 truncate max-w-[200px]">{topicInfo.name}</span>
          </div>
          <Badge variant="outline" className="text-xs font-bold shrink-0">
            {currentIndex + 1} / {questions.length}
          </Badge>
        </div>

        <Progress value={progress} className="h-2" />

        {q && (
          <QuizCard
            key={currentIndex}
            question={q}
            onAnswer={handleAnswer}
            onNext={handleNext}
          />
        )}
      </div>
    );
  }

  // ── Resultados ───────────────────────────────────────────────────────────────
  if (lessonState === "resultados" && results) {
    const score = results.total > 0 ? Math.round((results.correct / results.total) * 100) : 0;
    const incorrect = results.total - results.correct;

    return (
      <div className="max-w-2xl mx-auto py-8 px-4 flex flex-col gap-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center">
            <Trophy className="h-10 w-10 text-amber-500" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Lección completada</h1>
          <p className="text-slate-500 mt-1 text-sm">{motivationalMessage(score)}</p>
        </div>

        {/* Score cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: "Puntaje",
              value: `${score}%`,
              color: score >= 70 ? "text-emerald-600" : "text-orange-500",
              bg: score >= 70 ? "bg-emerald-50 border-emerald-100" : "bg-orange-50 border-orange-100",
            },
            { label: "Correctas", value: `${results.correct}/${results.total}`, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
            { label: "XP ganado", value: `+${results.xp}`, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-2xl border ${stat.bg} p-4 text-center`}>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* XP breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Desglose de XP</p>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              Respuestas correctas
            </div>
            <span className="font-bold text-emerald-600">
              {results.correct} × 10 = +{results.correct * 10} XP
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <XCircle className="h-4 w-4 text-red-400" />
              Respuestas incorrectas
            </div>
            <span className="font-bold text-slate-500">
              {incorrect} × 3 = +{incorrect * 3} XP
            </span>
          </div>
          <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-sm font-black">
            <div className="flex items-center gap-2 text-slate-800">
              <Zap className="h-4 w-4 text-amber-500" /> Total
            </div>
            <span className="text-amber-600">+{results.xp} XP</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={startLesson} className="flex-1 font-bold">
            Repetir lección
          </Button>
          <Button
            onClick={() => router.push("/dashboard")}
            className="flex-1 font-bold bg-blue-600 hover:bg-blue-700 text-white"
          >
            Continuar <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
