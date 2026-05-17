"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

async function authFetch(url: string, init?: RequestInit) {
  const sb = supabase();
  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session?.access_token) throw new Error("No autenticado");
  return fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
      Authorization: `Bearer ${session.access_token}`,
    },
  });
}

type ReviewQuestion = {
  id: number;
  stem: string;
  options: string[];
  correct_answer: { index: number };
  explanation: string | null;
  source_document: string | null;
  bloque: number;
  dificultad: string;
};

type SessionData = {
  id: string;
  estado: string;
  score: number | null;
  total_questions: number;
  correct_answers: number;
  duracion_seg: number | null;
  completed_at: string | null;
};

type Answer = {
  question_id: number;
  opcion_elegida: string;
  es_correcta: boolean;
};

function formatDuration(seconds: number): string {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

export default function CenvalResultPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const sessionId = params.id;

  const [session, setSession] = React.useState<SessionData | null>(null);
  const [questions, setQuestions] = React.useState<ReviewQuestion[]>([]);
  const [answers, setAnswers] = React.useState<Record<number, Answer>>({});
  const [loading, setLoading] = React.useState(true);
  const [showReview, setShowReview] = React.useState(false);
  const [filter, setFilter] = React.useState<"all" | "wrong" | "right">("all");

  React.useEffect(() => {
    (async () => {
      try {
        const res = await authFetch(`/api/exam/${sessionId}`);
        const data = await res.json();
        setSession(data.session);
        setQuestions(data.questions);
        setAnswers(data.answers || {});
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center text-sm text-neutral-500">
        Sesión no encontrada
      </div>
    );
  }

  const score = session.score ?? 0;
  const passed = score >= 70;

  const filteredQuestions = questions.filter((q) => {
    const ans = answers[q.id];
    if (filter === "wrong") return !ans?.es_correcta;
    if (filter === "right") return ans?.es_correcta;
    return true;
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <button
        onClick={() => router.push("/simulator/cenval")}
        className="mb-4 text-sm text-neutral-500 hover:text-neutral-700"
      >
        ← Volver
      </button>

      {/* ── Score banner ── */}
      <div
        className={cn(
          "rounded-2xl p-8 text-white shadow-lg",
          passed
            ? "bg-gradient-to-br from-emerald-600 to-emerald-700"
            : "bg-gradient-to-br from-orange-600 to-red-600"
        )}
      >
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
          {passed ? (
            <Trophy className="h-6 w-6" />
          ) : (
            <XCircle className="h-6 w-6" />
          )}
        </div>
        <p className="text-sm font-medium uppercase tracking-wide text-white/70">
          {passed ? "¡Aprobado!" : "No aprobado"}
        </p>
        <p className="mt-1 text-5xl font-bold tracking-tight">
          {score.toFixed(1)}%
        </p>
        <p className="mt-2 text-sm text-white/80">
          {passed
            ? "Excelente. Sigue practicando para mejorar tu margen."
            : "Necesitas 70% o más para aprobar. ¡Sigue practicando!"}
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
          <CheckCircle2 className="mb-2 h-5 w-5 text-emerald-500" />
          <p className="text-2xl font-bold tracking-tight text-neutral-900">
            {session.correct_answers}
          </p>
          <p className="text-xs text-neutral-500">Correctas</p>
        </div>
        <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
          <XCircle className="mb-2 h-5 w-5 text-red-500" />
          <p className="text-2xl font-bold tracking-tight text-neutral-900">
            {session.total_questions - session.correct_answers}
          </p>
          <p className="text-xs text-neutral-500">Incorrectas</p>
        </div>
        <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
          <Clock className="mb-2 h-5 w-5 text-neutral-400" />
          <p className="text-2xl font-bold tracking-tight text-neutral-900">
            {formatDuration(session.duracion_seg || 0)}
          </p>
          <p className="text-xs text-neutral-500">Duración</p>
        </div>
      </div>

      {/* ── Toggle review ── */}
      <button
        onClick={() => setShowReview(!showReview)}
        className="mt-6 flex w-full items-center justify-between rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-colors hover:bg-neutral-50"
      >
        <div className="text-left">
          <p className="text-sm font-semibold text-neutral-900">
            Detalle de respuestas
          </p>
          <p className="text-xs text-neutral-500">
            Revisa cada pregunta con la respuesta correcta y explicación
          </p>
        </div>
        {showReview ? (
          <ChevronUp className="h-5 w-5 text-neutral-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-neutral-400" />
        )}
      </button>

      {/* ── Review list ── */}
      {showReview && (
        <div className="mt-4 space-y-3">
          {/* Filter pills */}
          <div className="flex gap-2">
            {[
              { id: "all", label: "Todas" },
              { id: "wrong", label: "Incorrectas" },
              { id: "right", label: "Correctas" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as typeof filter)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  filter === f.id
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filteredQuestions.map((q, idx) => {
            const userAns = answers[q.id];
            const correctIdx = q.correct_answer?.index ?? 0;
            const correctLetter = ["A", "B", "C", "D"][correctIdx];
            const isCorrect = userAns?.es_correcta;
            const wasAnswered = !!userAns;

            return (
              <div
                key={q.id}
                className={cn(
                  "rounded-2xl border bg-white p-5 shadow-sm",
                  !wasAnswered
                    ? "border-neutral-200"
                    : isCorrect
                      ? "border-emerald-200"
                      : "border-red-200"
                )}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-500">
                      #{idx + 1}
                    </span>
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
                      Bloque {q.bloque}
                    </span>
                  </div>
                  {!wasAnswered ? (
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-neutral-500">
                      Sin responder
                    </span>
                  ) : isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>

                <p className="mb-4 text-sm font-medium leading-relaxed text-neutral-900">
                  {q.stem}
                </p>

                <div className="space-y-1.5">
                  {q.options.map((opt, i) => {
                    const letter = String.fromCharCode(65 + i);
                    const isCorrectOpt = letter === correctLetter;
                    const isUserChoice = userAns?.opcion_elegida === letter;
                    return (
                      <div
                        key={i}
                        className={cn(
                          "flex items-start gap-2.5 rounded-lg border p-2.5 text-sm",
                          isCorrectOpt
                            ? "border-emerald-300 bg-emerald-50"
                            : isUserChoice
                              ? "border-red-300 bg-red-50"
                              : "border-neutral-100 bg-white"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                            isCorrectOpt
                              ? "bg-emerald-600 text-white"
                              : isUserChoice
                                ? "bg-red-600 text-white"
                                : "bg-neutral-100 text-neutral-600"
                          )}
                        >
                          {letter}
                        </span>
                        <span className="flex-1 text-neutral-800">{opt}</span>
                        {isCorrectOpt && (
                          <span className="text-[10px] font-bold uppercase text-emerald-700">
                            Correcta
                          </span>
                        )}
                        {isUserChoice && !isCorrectOpt && (
                          <span className="text-[10px] font-bold uppercase text-red-700">
                            Tu respuesta
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="mt-4 rounded-xl bg-neutral-50 p-3 text-xs text-neutral-700">
                    <p className="mb-1 font-semibold uppercase tracking-wide text-neutral-500">
                      Explicación
                    </p>
                    <p className="leading-relaxed">{q.explanation}</p>
                    {q.source_document && (
                      <p className="mt-2 text-[10px] text-neutral-400">
                        Fuente: {q.source_document}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
