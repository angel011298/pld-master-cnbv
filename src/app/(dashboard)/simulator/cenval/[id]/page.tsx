"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { Clock, ChevronLeft, ChevronRight, Flag, Loader2 } from "lucide-react";
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

type Question = {
  id: number;
  stem: string;
  options: string[];
  bloque: number;
  dificultad: string;
};

type ExamAnswer = {
  question_id: number;
  opcion_elegida: string;
};

type SessionData = {
  id: string;
  estado: string;
  total_questions: number;
  expires_at: string;
  fecha: string;
};

function formatTimeLeft(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(
    sec
  ).padStart(2, "0")}`;
}

export default function CenvalExamPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const sessionId = params.id;

  const [session, setSession] = React.useState<SessionData | null>(null);
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [answers, setAnswers] = React.useState<Record<number, string>>({});
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [timeLeft, setTimeLeft] = React.useState<number>(0);
  const [finishing, setFinishing] = React.useState(false);
  const [confirmFinish, setConfirmFinish] = React.useState(false);

  // ── Load session ────────────────────────────────────────────────────
  React.useEffect(() => {
    (async () => {
      try {
        const res = await authFetch(`/api/exam/${sessionId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error cargando examen");

        if (data.session.estado === "completado") {
          router.replace(`/simulator/cenval/${sessionId}/resultado`);
          return;
        }

        setSession(data.session);
        setQuestions(data.questions);
        // Map server answers to local state
        const mapped: Record<number, string> = {};
        for (const [qid, a] of Object.entries(data.answers || {})) {
          mapped[Number(qid)] = (a as ExamAnswer).opcion_elegida;
        }
        setAnswers(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId, router]);

  // ── Timer tick ──────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!session?.expires_at) return;
    const tick = () => {
      const ms = new Date(session.expires_at).getTime() - Date.now();
      setTimeLeft(ms);
      if (ms <= 0) {
        // Auto-finish on time out
        handleFinish(true);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.expires_at]);

  const handleSelect = async (questionId: number, letter: string) => {
    // Optimistic local update
    setAnswers((prev) => ({ ...prev, [questionId]: letter }));
    try {
      await authFetch(`/api/exam/${sessionId}/answer`, {
        method: "POST",
        body: JSON.stringify({
          question_id: questionId,
          opcion_elegida: letter,
        }),
      });
    } catch {
      // Silently swallow — answer is in optimistic state; user can retry
    }
  };

  const handleFinish = async (auto = false) => {
    if (!auto && !confirmFinish) {
      setConfirmFinish(true);
      return;
    }
    setFinishing(true);
    try {
      await authFetch(`/api/exam/${sessionId}/finish`, { method: "POST" });
      router.replace(`/simulator/cenval/${sessionId}/resultado`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al finalizar");
      setFinishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (error || !session || questions.length === 0) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <p className="mb-4 text-sm text-neutral-500">
          {error || "No se pudo cargar el examen"}
        </p>
        <button
          onClick={() => router.push("/simulator/cenval")}
          className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white"
        >
          Volver
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const isLowTime = timeLeft < 10 * 60 * 1000; // less than 10 minutes

  return (
    <div className="mx-auto max-w-5xl px-4 py-4">
      {/* ── Sticky top bar: timer + progress + finish ── */}
      <div className="sticky top-0 z-20 -mx-4 mb-4 bg-white/95 px-4 py-3 backdrop-blur border-b border-neutral-200">
        <div className="flex items-center justify-between gap-4">
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl px-3 py-2 font-mono text-base font-bold tabular-nums",
              isLowTime
                ? "bg-red-50 text-red-700"
                : "bg-neutral-100 text-neutral-900"
            )}
          >
            <Clock className="h-4 w-4" />
            {formatTimeLeft(timeLeft)}
          </div>
          <div className="hidden flex-1 sm:block">
            <div className="flex items-center gap-2 text-xs text-neutral-600">
              <span className="font-semibold">
                {answeredCount} / {questions.length}
              </span>
              <span>respondidas</span>
              <div className="ml-2 h-1.5 flex-1 rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-neutral-900 transition-all"
                  style={{
                    width: `${(answeredCount / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
          <button
            onClick={() => handleFinish(false)}
            disabled={finishing}
            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            <Flag className="h-4 w-4" />
            Finalizar
          </button>
        </div>
      </div>

      {/* ── Confirm finish modal ── */}
      {confirmFinish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold tracking-tight text-neutral-900">
              ¿Finalizar simulacro?
            </h3>
            <p className="mt-2 text-sm text-neutral-600">
              Has respondido <strong>{answeredCount}</strong> de{" "}
              <strong>{questions.length}</strong> preguntas. Las preguntas sin
              responder se marcarán como incorrectas. Esta acción no se puede
              deshacer.
            </p>
            <div className="mt-5 flex gap-2 justify-end">
              <button
                onClick={() => setConfirmFinish(false)}
                className="rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Continuar examen
              </button>
              <button
                onClick={() => handleFinish(true)}
                disabled={finishing}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {finishing ? "Finalizando..." : "Sí, finalizar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
        {/* ── Question display ── */}
        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Pregunta {currentIdx + 1} de {questions.length}
            </span>
            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-600">
              Bloque {currentQ.bloque}
            </span>
          </div>

          <p className="mb-6 text-base leading-relaxed text-neutral-900">
            {currentQ.stem}
          </p>

          <div className="space-y-2">
            {currentQ.options.map((opt, i) => {
              const letter = String.fromCharCode(65 + i); // A, B, C, D
              const isSelected = answers[currentQ.id] === letter;
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(currentQ.id, letter)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all duration-150",
                    isSelected
                      ? "border-neutral-900 bg-neutral-50"
                      : "border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      isSelected
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 text-neutral-700"
                    )}
                  >
                    {letter}
                  </span>
                  <span className="text-sm text-neutral-800">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0}
              className="flex items-center gap-1 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </button>
            <button
              onClick={() =>
                setCurrentIdx(Math.min(questions.length - 1, currentIdx + 1))
              }
              disabled={currentIdx === questions.length - 1}
              className="flex items-center gap-1 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-40"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Question navigator grid ── */}
        <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Navegador
          </p>
          <div className="grid grid-cols-6 gap-1.5 lg:grid-cols-5">
            {questions.map((q, i) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = i === currentIdx;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(i)}
                  className={cn(
                    "flex h-8 items-center justify-center rounded text-[11px] font-semibold transition-all",
                    isCurrent
                      ? "bg-neutral-900 text-white ring-2 ring-neutral-900 ring-offset-1"
                      : isAnswered
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-3 space-y-1 text-[10px] text-neutral-500">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-neutral-900" /> Actual
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-emerald-100" /> Respondida
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-neutral-100" /> Sin responder
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
