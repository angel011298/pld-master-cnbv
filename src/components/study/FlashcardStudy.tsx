"use client";

import * as React from "react";
import { RotateCw, ChevronLeft, ChevronRight, CheckCircle2, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudyQuestion {
  id: number;
  bloque: number;
  dificultad: string;
  stem: string;
  correct_answer: { answer?: string };
  explanation: string;
  source_document: string;
}

interface FlashcardStudyProps {
  questions: StudyQuestion[];
  onFinish: (correct: number, total: number) => void;
}

export function FlashcardStudy({ questions, onFinish }: FlashcardStudyProps) {
  const [index, setIndex] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  const [known, setKnown] = React.useState<Set<number>>(new Set());

  const q = questions[index];
  const progress = ((index + 1) / questions.length) * 100;

  const handleFlip = () => setFlipped((f) => !f);

  const handleKnew = () => {
    setKnown((prev) => new Set(prev).add(index));
    advance();
  };

  const handleDidntKnow = () => {
    advance();
  };

  const advance = () => {
    if (index + 1 >= questions.length) {
      onFinish(known.size, questions.length);
    } else {
      setFlipped(false);
      setIndex((i) => i + 1);
    }
  };

  const goBack = () => {
    if (index > 0) {
      setFlipped(false);
      setIndex((i) => i - 1);
    }
  };

  const DIFICULTAD_COLOR: Record<string, string> = {
    basico: "bg-emerald-100 text-emerald-700",
    intermedio: "bg-amber-100 text-amber-700",
    avanzado: "bg-red-100 text-red-700",
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Progress bar */}
      <div className="w-full">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Tarjeta {index + 1} de {questions.length}</span>
          <span>{known.size} sabidas</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card flip container */}
      <div
        className="relative w-full max-w-lg cursor-pointer"
        style={{ perspective: "1000px", minHeight: "280px" }}
        onClick={handleFlip}
      >
        <div
          className="relative w-full h-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            minHeight: "280px",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 border-slate-200 bg-white p-8 shadow-sm"
            style={{ backfaceVisibility: "hidden" }}
          >
            <BookOpen className="mb-4 h-8 w-8 text-indigo-400" />
            <p className="text-center text-xl font-bold text-slate-900">{q.stem}</p>
            <span className={cn("mt-4 rounded-full px-3 py-1 text-xs font-semibold", DIFICULTAD_COLOR[q.dificultad] || "bg-slate-100 text-slate-600")}>
              Bloque {q.bloque} · {q.dificultad}
            </span>
            <p className="mt-6 text-xs text-slate-400 flex items-center gap-1">
              <RotateCw className="h-3 w-3" /> Click para revelar
            </p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 flex flex-col rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-8 shadow-sm overflow-auto"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <p className="text-sm font-bold text-indigo-600 mb-3 uppercase tracking-wide">Definición</p>
            <p className="text-base text-slate-800 leading-relaxed flex-1">
              {q.correct_answer?.answer || ""}
            </p>
            {q.explanation && (
              <p className="mt-4 text-xs text-slate-500 border-t border-indigo-100 pt-3">
                {q.explanation}
              </p>
            )}
            <p className="mt-3 text-[11px] text-slate-400">Fuente: {q.source_document}</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 w-full max-w-lg">
        <button
          onClick={(e) => { e.stopPropagation(); goBack(); }}
          disabled={index === 0}
          className="flex items-center gap-1 rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:border-slate-300 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {flipped ? (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); handleDidntKnow(); }}
              className="flex-1 rounded-xl border-2 border-red-200 bg-red-50 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100 transition-colors"
            >
              No la sabía
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleKnew(); }}
              className="flex-1 rounded-xl border-2 border-emerald-200 bg-emerald-50 py-2.5 text-sm font-bold text-emerald-600 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1"
            >
              <CheckCircle2 className="h-4 w-4" /> ¡La sabía!
            </button>
          </>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); handleFlip(); }}
            className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1"
          >
            <RotateCw className="h-4 w-4" /> Voltear tarjeta
          </button>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); advance(); }}
          className="flex items-center gap-1 rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:border-slate-300 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
