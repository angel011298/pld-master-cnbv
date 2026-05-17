"use client";

import * as React from "react";
import { CheckCircle2, XCircle, ChevronRight, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface FillBlankStudyProps {
  questions: StudyQuestion[];
  onFinish: (correct: number, total: number) => void;
}

/** Renders the stem with the blank highlighted */
function StemWithBlank({ stem }: { stem: string }) {
  const parts = stem.split("______");
  if (parts.length === 1) return <p className="text-slate-900 font-medium">{stem}</p>;
  return (
    <p className="text-slate-900 font-medium leading-relaxed">
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {part}
          {i < parts.length - 1 && (
            <span className="inline-block min-w-[6rem] border-b-2 border-indigo-400 mx-1 text-center font-bold text-indigo-400 align-bottom">
              ______
            </span>
          )}
        </React.Fragment>
      ))}
    </p>
  );
}

export function FillBlankStudy({ questions, onFinish }: FillBlankStudyProps) {
  const [index, setIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [score, setScore] = React.useState(0);

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
    setSelected(i);
    if (i === correctIndex) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (index + 1 >= questions.length) {
      onFinish(score, questions.length);
    } else {
      setSelected(null);
      setIndex((i) => i + 1);
    }
  };

  const getOptionStyle = (i: number) => {
    if (!answered) return "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer text-slate-700";
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
          <span>Ejercicio {index + 1} de {questions.length}</span>
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

      {/* Stem with blank */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-indigo-500 mb-3">
          Completa el espacio · Bloque {q.bloque}
        </p>
        <StemWithBlank stem={q.stem} />
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {(q.options ?? []).map((opt, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            className={cn(
              "flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all",
              getOptionStyle(i)
            )}
          >
            <span className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
              !answered && "bg-slate-100 text-slate-600",
              answered && i === correctIndex && "bg-emerald-500 text-white",
              answered && i === selected && i !== correctIndex && "bg-red-500 text-white",
              answered && i !== correctIndex && i !== selected && "bg-slate-100 text-slate-400"
            )}>
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

      {/* Explanation */}
      {answered && q.explanation && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
          <Lightbulb className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
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
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
        >
          {index + 1 >= questions.length ? "Ver resultados" : "Siguiente"}
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
