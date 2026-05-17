"use client";

import * as React from "react";
import { CheckCircle2, XCircle, ChevronRight, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudyQuestion {
  id: number;
  bloque: number;
  dificultad: string;
  stem: string;
  correct_answer: { value?: boolean };
  explanation: string;
  source_document: string;
}

interface TrueFalseStudyProps {
  questions: StudyQuestion[];
  onFinish: (correct: number, total: number) => void;
}

export function TrueFalseStudy({ questions, onFinish }: TrueFalseStudyProps) {
  const [index, setIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<boolean | null>(null);
  const [score, setScore] = React.useState(0);

  const q = questions[index];
  const correctValue = q.correct_answer?.value ?? true;
  const answered = selected !== null;
  const isCorrect = answered && selected === correctValue;

  const DIFICULTAD_COLOR: Record<string, string> = {
    basico: "bg-emerald-100 text-emerald-700",
    intermedio: "bg-amber-100 text-amber-700",
    avanzado: "bg-red-100 text-red-700",
  };

  const handleSelect = (value: boolean) => {
    if (answered) return;
    setSelected(value);
    if (value === correctValue) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (index + 1 >= questions.length) {
      onFinish(score, questions.length);
    } else {
      setSelected(null);
      setIndex((i) => i + 1);
    }
  };

  const btnStyle = (value: boolean) => {
    if (!answered) {
      return "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer";
    }
    if (value === correctValue) return "border-emerald-400 bg-emerald-50 text-emerald-800";
    if (value === selected) return "border-red-400 bg-red-50 text-red-800";
    return "border-slate-100 bg-slate-50 text-slate-400";
  };

  const progress = ((index + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col gap-5">
      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Afirmación {index + 1} de {questions.length}</span>
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
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-8 text-center">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-4">
          ¿Verdadero o Falso?
        </p>
        <p className="text-lg font-semibold text-slate-900 leading-relaxed">{q.stem}</p>
        <p className="mt-3 text-xs text-slate-400">Bloque {q.bloque}</p>
      </div>

      {/* Result badge */}
      {answered && (
        <div className={cn(
          "flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold",
          isCorrect ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
        )}>
          {isCorrect ? (
            <><CheckCircle2 className="h-5 w-5" /> ¡Correcto! La afirmación es {correctValue ? "Verdadera" : "Falsa"}</>
          ) : (
            <><XCircle className="h-5 w-5" /> Incorrecto. Es {correctValue ? "Verdadera" : "Falsa"}</>
          )}
        </div>
      )}

      {/* V/F Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {[true, false].map((v) => (
          <button
            key={String(v)}
            onClick={() => handleSelect(v)}
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 py-6 font-bold transition-all text-lg",
              btnStyle(v)
            )}
          >
            {answered && v === correctValue && <CheckCircle2 className="h-6 w-6 text-emerald-500" />}
            {answered && v === selected && v !== correctValue && <XCircle className="h-6 w-6 text-red-500" />}
            {v ? "✓ Verdadero" : "✗ Falso"}
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
