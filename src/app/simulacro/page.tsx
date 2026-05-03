"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Timer, ChevronRight, AlertCircle, BookOpen, CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { buildAuthHeaders } from "@/lib/auth-client";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import {
  TOPIC_DISTRIBUTION,
  TOTAL_QUESTIONS,
  EXAM_DURATION_SEC,
  formatTime,
} from "@/lib/simulacro-config";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ExamQuestion {
  id: number;
  question: string;
  options: string[];
  tema: string;
  topic_key: string;
  topic_label: string;
}

type PageState = "lobby" | "loading" | "exam" | "submitting";

const LETTERS = ["A", "B", "C", "D"] as const;

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SimulacroPage() {
  const router = useRouter();

  const [pageState, setPageState] = useState<PageState>("lobby");
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_SEC);

  // Refs to read up-to-date values from timer callbacks without stale closures
  const sessionIdRef = useRef<string | null>(null);
  const questionsRef = useRef<ExamQuestion[]>([]);
  const answersRef = useRef<Record<number, string>>({});
  const timeLeftRef = useRef(EXAM_DURATION_SEC);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submittingRef = useRef(false);

  // ── Auth check ───────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase().auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/");
    });
  }, [router]);

  // ── Warn on unload during exam ───────────────────────────────────────────────
  useEffect(() => {
    if (pageState !== "exam") return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [pageState]);

  // ── Submit ───────────────────────────────────────────────────────────────────
  const submitExam = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    setPageState("submitting");

    try {
      const headers = await buildAuthHeaders({ "Content-Type": "application/json" });
      const elapsed = EXAM_DURATION_SEC - timeLeftRef.current;
      const answersArray = questionsRef.current.map((q) => ({
        question_id: q.id,
        opcion_elegida: answersRef.current[q.id] ?? null,
      }));

      const res = await fetch("/api/simulacro/submit", {
        method: "POST",
        headers,
        body: JSON.stringify({
          session_id: sessionIdRef.current,
          answers: answersArray,
          duracion_seg: elapsed,
        }),
      });

      if (!res.ok) throw new Error((await res.json()).error ?? "Error al enviar");
      router.push(`/simulacro/${sessionIdRef.current}/resultado`);
    } catch (err) {
      console.error("submit error:", err);
      submittingRef.current = false;
      setPageState("exam"); // allow retry
    }
  }, [router]);

  // ── Timer ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (pageState !== "exam") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        timeLeftRef.current = next;
        if (next <= 0) {
          clearInterval(timerRef.current!);
          submitExam();
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [pageState, submitExam]);

  // ── Start ────────────────────────────────────────────────────────────────────
  const startExam = useCallback(async () => {
    setPageState("loading");
    try {
      const headers = await buildAuthHeaders({ "Content-Type": "application/json" });
      const res = await fetch("/api/simulacro/start", { method: "POST", headers });
      if (!res.ok) throw new Error((await res.json()).error ?? "Error al iniciar");
      const data = await res.json();

      const q: ExamQuestion[] = data.questions;
      const sid: string = data.session_id;

      questionsRef.current = q;
      sessionIdRef.current = sid;
      answersRef.current = {};
      timeLeftRef.current = EXAM_DURATION_SEC;
      submittingRef.current = false;

      setQuestions(q);
      setAnswers({});
      setCurrentIndex(0);
      setTimeLeft(EXAM_DURATION_SEC);
      setPageState("exam");
    } catch (err) {
      console.error("start error:", err);
      setPageState("lobby");
    }
  }, []);

  // ── Select answer ────────────────────────────────────────────────────────────
  const selectAnswer = useCallback((letter: string) => {
    const q = questions[currentIndex];
    if (!q) return;
    setAnswers((prev) => {
      const next = { ...prev, [q.id]: letter };
      answersRef.current = next;
      return next;
    });
  }, [questions, currentIndex]);

  // ── Navigate ─────────────────────────────────────────────────────────────────
  const goNext = useCallback(() => {
    const next = currentIndex + 1;
    if (next >= questions.length) {
      submitExam();
    } else {
      setCurrentIndex(next);
    }
  }, [currentIndex, questions.length, submitExam]);

  // ── Renders ──────────────────────────────────────────────────────────────────

  // ── LOBBY ────────────────────────────────────────────────────────────────────
  if (pageState === "lobby") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-black text-slate-900">Simulacro CNBV</h1>
            <p className="text-slate-500">Examen de certificación PLD/FT — {TOTAL_QUESTIONS} preguntas · 90 minutos</p>
          </div>

          {/* Topic distribution */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Distribución de temas</p>
            </div>
            <div className="divide-y divide-slate-100">
              {TOPIC_DISTRIBUTION.map((t) => (
                <div key={t.key} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-sm text-slate-700 font-medium">{t.label}</span>
                  <Badge variant="outline" className="text-xs font-bold">{t.count} preguntas</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Rules */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-2">
            <p className="text-xs font-bold text-amber-700 uppercase tracking-widest flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" /> Instrucciones importantes
            </p>
            {[
              "No es posible regresar a una pregunta anterior.",
              "El examen se envía automáticamente al llegar a 00:00.",
              "Puedes finalizar antes contestando todas las preguntas.",
              "Las respuestas sin selección cuentan como incorrectas.",
            ].map((rule) => (
              <div key={rule} className="flex items-start gap-2">
                <span className="text-amber-500 text-sm shrink-0">•</span>
                <p className="text-sm text-amber-800">{rule}</p>
              </div>
            ))}
          </div>

          <Button
            onClick={startExam}
            className="w-full py-6 text-lg font-black rounded-2xl bg-blue-600 hover:bg-blue-700 text-white border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all"
          >
            Iniciar Simulacro <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  // ── LOADING ──────────────────────────────────────────────────────────────────
  if (pageState === "loading" || pageState === "submitting") {
    const msg = pageState === "loading" ? "Preparando el simulacro…" : "Enviando respuestas…";
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
        <p className="text-slate-500 font-medium">{msg}</p>
      </div>
    );
  }

  // ── EXAM ─────────────────────────────────────────────────────────────────────
  if (pageState === "exam") {
    const q = questions[currentIndex];
    const isLast = currentIndex === questions.length - 1;
    const selected = q ? answers[q.id] : undefined;
    const answered = Object.keys(answers).length;
    const progressPct = (currentIndex / questions.length) * 100;
    const isLowTime = timeLeft <= 5 * 60;

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between gap-4">
          {/* Timer */}
          <div className={cn(
            "flex items-center gap-2 font-mono text-xl font-black tabular-nums min-w-[80px]",
            isLowTime ? "text-red-600" : "text-slate-800"
          )}>
            <Timer className={cn("h-5 w-5", isLowTime && "animate-pulse")} />
            {formatTime(timeLeft)}
          </div>

          {/* Progress label */}
          <div className="flex flex-col items-center gap-0.5 flex-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Pregunta {currentIndex + 1} de {questions.length}
            </p>
            <p className="text-xs text-slate-400 hidden sm:block truncate max-w-[200px]">
              {q?.topic_label}
            </p>
          </div>

          {/* Answered count */}
          <div className="text-right min-w-[60px]">
            <p className="text-xs font-bold text-slate-500">{answered}/{questions.length}</p>
            <p className="text-xs text-slate-400">respondidas</p>
          </div>
        </header>

        {/* Progress bar */}
        <Progress value={progressPct} className="h-1 rounded-none" />

        {/* Question */}
        <main className="flex-1 flex flex-col items-center justify-start p-4 pt-8">
          <div className="w-full max-w-2xl space-y-6">
            {q && (
              <>
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <p className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3">
                    {q.topic_label}
                  </p>
                  <p className="text-lg font-semibold text-slate-900 leading-relaxed">
                    {q.question}
                  </p>
                </div>

                <div className="space-y-3">
                  {q.options.map((option, i) => {
                    const letter = LETTERS[i];
                    const isSelected = selected === letter;
                    return (
                      <button
                        key={letter}
                        onClick={() => selectAnswer(letter)}
                        className={cn(
                          "w-full text-left px-5 py-4 rounded-xl border-2 transition-all font-medium text-sm",
                          isSelected
                            ? "border-blue-500 bg-blue-50 text-blue-900"
                            : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40 text-slate-800"
                        )}
                      >
                        <span className={cn(
                          "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black mr-3 shrink-0",
                          isSelected ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-600"
                        )}>
                          {letter}
                        </span>
                        {option.replace(/^[A-D]\)\s*/, "")}
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={goNext}
                    disabled={!selected}
                    className={cn(
                      "font-black px-8 py-5 rounded-xl text-base",
                      isLast
                        ? "bg-emerald-600 hover:bg-emerald-700 border-b-4 border-emerald-800"
                        : "bg-blue-600 hover:bg-blue-700 border-b-4 border-blue-800",
                      "text-white active:border-b-0 active:translate-y-1 transition-all"
                    )}
                  >
                    {isLast ? (
                      <><CheckCircle className="mr-2 h-5 w-5" /> Finalizar Simulacro</>
                    ) : (
                      <>Siguiente <ChevronRight className="ml-1 h-5 w-5" /></>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    );
  }

  return null;
}
