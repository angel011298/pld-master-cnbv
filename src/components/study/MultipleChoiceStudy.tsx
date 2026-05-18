"use client";

import * as React from "react";
import { CheckCircle2, XCircle, ChevronRight, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudySession, type StudyMeta } from "@/hooks/useStudySession";

interface StudyQuestion {
  id: number;
  bloque: number;
  dificultad: string;
  stem: string;
  options: string[];
  correct_answer: { index?: number };
  explanation: string;
  source_document: string;
}

interface MultipleChoiceStudyProps {
  questions: StudyQuestion[];
  onFinish: (correct: number, total: number) => void;
  isCaseStudy?: boolean;
  studyMeta?: StudyMeta;
}

export function MultipleChoiceStudy({
  questions,
  onFinish,
  isCaseStudy = false,
  studyMeta,
}: MultipleChoiceStudyProps) {
  const { startSession, recordAnswer, completeSession } = useStudySession();
  const [index, setIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [score, setScore] = React.useState(0);

  // ── Start a study session on mount ──────────────────────────────────────
  React.useEffect(() => {
    if (studyMeta) startSession(studyMeta, questions.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const q = questions[index];
  const correctIndex = q.correct_answer?.index ?? 0;
  const answered = selected !== null;

  const DIFICULTAD_COLOR: Record<string, string> = {
    basico: "bg-emerald-100 text-emerald-700",
    intermedio: "bg-amber-100 text-amber-700",
    avanzado: "bg-red-100 text-red-700",
  };

  const handleSelect = (i: number) => {
    if (answered) return;
    const isCorrect = i === correctIndex;
    setSelected(i);
    if (isCorrect) setScore((s) => s + 1);
    recordAnswer(q.id, String.fromCharCode(65 + i), isCorrect);
  };

  const handleNext = async () => {
    if (index + 1 >= questions.length) {
      await completeSession(score, questions.length);
      onFinish(score, questions.length);
    } else {
      setSelected(null);
      setIndex((i) => i + 1);
    }
  };

  const getOptionStyle = (i: number) => {
    if (!answered) {
      return "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer";
    }
    if (i === correctIndex) return "border-emerald-400 bg-emerald-50 text-emerald-900";
    if (i === selected) return "border-red-400 bg-red-50 text-red-900";
    return "border-slate-100 bg-slate-50 text-slate-400";
  };

  const progress = ((index + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col gap-5">
      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Pregunta {index + 1} de {questions.length}</span>
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", DIFICULTAD_COLOR[q.dificultad] ?? "bg-slate-100 text-slate-600")}>
            {q.dificultad}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Stem */}
      <div className={cn("rounded-2xl border-2 border-slate-200 bg-white p-6", isCaseStudy && "text-sm leading-relaxed")}>
        {isCaseStudy && (
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-indigo-500">
            Caso práctico · Bloque {q.bloque}
          </p>
        )}
        <p className="text-slate-900 font-medium whitespace-pre-wrap">{q.stem}</p>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2" role="group" aria-label="Opciones de respuesta">
        {(q.options ?? []).map((opt, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            disabled={answered}
            aria-pressed={selected === i}
            className={cn(
              "flex items-center gap-3 rounded-xl border-2 px-4 min-h-[44px] py-3 text-left text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1",
              getOptionStyle(i)
            )}
          >
            <span className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
              !answered && "bg-slate-100 text-slate-600",
              answered && i === correctIndex && "bg-emerald-500 text-white",
              answered && i === selected && i !== correctIndex && "bg-red-500 text-white",
              answered && i !== correctIndex && i !== selected && "bg-slate-100 text-slate-400"
            )} aria-hidden="true">
              {answered && i === correctIndex ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : answered && i === selected ? (
                <XCircle className="h-4 w-4" />
              ) : (
                String.fromCharCode(65 + i)
              )}
            </span>
            {opt}
          </button>
        ))}
      </div>

      {/* Feedback live region */}
      <div role="status" aria-live="polite" className="sr-only">
        {answered
          ? selected === correctIndex
            ? "¡Correcto!"
            : `Incorrecto. La respuesta correcta es: ${q.options?.[correctIndex] ?? ""}`
          : ""}
      </div>

      {/* Explanation */}
      {answered && q.explanation && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
          <Lightbulb className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-xs font-bold text-amber-700 mb-1">Explicación</p>
            <p className="text-sm text-amber-900">{q.explanation}</p>
          </div>
        </div>
      )}

      {/* Next */}
      {answered && (
        <button
          onClick={handleNext}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 min-h-[44px] py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1"
        >
          {index + 1 >= questions.length ? "Ver resultados" : "Siguiente"}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
