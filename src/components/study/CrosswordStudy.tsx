"use client";

import * as React from "react";
import { CheckCircle2, XCircle, Eye, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudySession, type StudyMeta } from "@/hooks/useStudySession";

interface CrosswordWord {
  word: string;
  clue: string;
}

interface StudyQuestion {
  id: number;
  bloque: number;
  dificultad: string;
  stem: string;
  correct_answer: { words?: CrosswordWord[] };
  explanation: string;
  source_document: string;
}

interface CrosswordStudyProps {
  questions: StudyQuestion[];
  onFinish: (correct: number, total: number) => void;
  studyMeta?: StudyMeta;
}

/** Single crossword clue card */
function ClueCard({
  word,
  clue,
  number,
  revealed,
  onReveal,
}: {
  word: string;
  clue: string;
  number: number;
  revealed: boolean;
  onReveal: () => void;
}) {
  const [userInput, setUserInput] = React.useState("");
  const [checked, setChecked] = React.useState(false);

  const isCorrect = userInput.trim().toUpperCase() === word.toUpperCase();

  const handleCheck = () => setChecked(true);
  const handleReveal = () => {
    onReveal();
    setUserInput(word);
    setChecked(true);
  };

  return (
    <div className={cn(
      "rounded-xl border-2 p-4 transition-all",
      !checked && !revealed ? "border-slate-200 bg-white" :
      revealed || isCorrect ? "border-emerald-200 bg-emerald-50" :
      "border-red-200 bg-red-50"
    )}>
      <div className="flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700" aria-hidden="true">
          {number}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-700 mb-3" id={`clue-${number}`}>{clue}</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => { setUserInput(e.target.value.toUpperCase()); setChecked(false); }}
              placeholder={`${word.length} letras`}
              maxLength={word.length + 5}
              aria-label={`Pista ${number}: ${clue} (${word.length} letras)`}
              aria-describedby={checked ? `feedback-${number}` : undefined}
              className={cn(
                "flex-1 rounded-lg border-2 px-3 min-h-[44px] py-1.5 text-sm font-mono font-bold uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1",
                !checked && "border-slate-200 focus:border-indigo-400",
                checked && isCorrect && "border-emerald-400 bg-emerald-50 text-emerald-700",
                checked && !isCorrect && "border-red-400 bg-red-50 text-red-700"
              )}
              disabled={revealed}
              onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            />
            <button
              onClick={handleCheck}
              disabled={!userInput.trim() || revealed}
              aria-label={`Verificar respuesta para pista ${number}`}
              className="rounded-lg bg-indigo-600 px-3 min-h-[44px] py-1.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1"
            >
              Verificar
            </button>
          </div>
          {checked && (
            <div
              id={`feedback-${number}`}
              role="status"
              aria-live="polite"
              className={cn("flex items-center gap-1 mt-2 text-xs font-semibold", isCorrect ? "text-emerald-600" : "text-red-600")}
            >
              {isCorrect ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : <XCircle className="h-3.5 w-3.5" aria-hidden="true" />}
              {isCorrect ? "¡Correcto!" : `Respuesta: ${word}`}
            </div>
          )}
        </div>
        <button
          onClick={handleReveal}
          disabled={revealed || (checked && isCorrect)}
          aria-label={`Revelar respuesta para pista ${number}`}
          className="shrink-0 rounded-lg border border-slate-200 px-2 min-h-[44px] py-1.5 text-xs text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1"
        >
          <Eye className="h-3 w-3" aria-hidden="true" />
          <span className="sr-only">Revelar respuesta</span>
        </button>
      </div>
    </div>
  );
}

export function CrosswordStudy({ questions, onFinish, studyMeta }: CrosswordStudyProps) {
  const { startSession, recordAnswer, completeSession } = useStudySession();
  const [index, setIndex] = React.useState(0);
  const [revealed, setRevealed] = React.useState<Set<number>>(new Set());
  const [score, setScore] = React.useState(0);

  // ── Start a study session on mount ──────────────────────────────────────
  React.useEffect(() => {
    if (studyMeta) startSession(studyMeta, questions.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const q = questions[index];
  const words: CrosswordWord[] = q.correct_answer?.words ?? [];

  const handleReveal = (i: number) => {
    setRevealed((prev) => new Set(prev).add(i));
  };

  const handleNext = async () => {
    const notRevealed = words.length - revealed.size;
    // Record one response per crossword puzzle: correct if all words guessed without reveal
    recordAnswer(
      q.id,
      `${notRevealed}/${words.length} sin pistas`,
      notRevealed === words.length
    );
    setScore((s) => s + notRevealed);
    if (index + 1 >= questions.length) {
      const finalScore = score + notRevealed;
      const totalWords = questions.reduce(
        (acc, sq) => acc + ((sq.correct_answer?.words ?? []).length),
        0
      );
      await completeSession(finalScore, totalWords);
      onFinish(finalScore, totalWords);
    } else {
      setRevealed(new Set());
      setIndex((i) => i + 1);
    }
  };

  const handleReset = () => setRevealed(new Set());

  const progress = ((index + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col gap-5">
      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Crucigrama {index + 1} de {questions.length}</span>
          <span>{words.length} palabras</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Topic */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white px-6 py-4">
        <p className="text-xs font-bold uppercase tracking-wide text-indigo-500 mb-1">
          Bloque {q.bloque} · Crucigrama
        </p>
        <p className="text-base font-semibold text-slate-800">{q.stem}</p>
        {q.explanation && <p className="mt-1 text-xs text-slate-500">{q.explanation}</p>}
      </div>

      {/* Clues */}
      <div className="flex flex-col gap-3">
        {words.map((w, i) => (
          <ClueCard
            key={i}
            word={w.word}
            clue={w.clue}
            number={i + 1}
            revealed={revealed.has(i)}
            onReveal={() => handleReveal(i)}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleReset}
          aria-label="Reiniciar crucigrama"
          className="flex items-center gap-1.5 rounded-xl border-2 border-slate-200 px-4 min-h-[44px] py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reiniciar
        </button>
        <button
          onClick={handleNext}
          aria-label={index + 1 >= questions.length ? "Ver resultados finales" : "Siguiente crucigrama"}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 min-h-[44px] py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1"
        >
          {index + 1 >= questions.length ? "Ver resultados" : "Siguiente crucigrama"}
        </button>
      </div>
    </div>
  );
}
