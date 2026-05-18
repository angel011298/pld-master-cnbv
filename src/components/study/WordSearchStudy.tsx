"use client";

import * as React from "react";
import { CheckCircle2, Trophy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudySession, type StudyMeta } from "@/hooks/useStudySession";
import { generateGrid, type WordSearchGrid, type PlacedWord } from "@/lib/word-search-utils";

interface StudyQuestion {
  id: number;
  bloque: number;
  dificultad: string;
  stem: string;
  correct_answer: { words?: string[] };
  explanation: string;
  source_document: string;
}


function cellKey(r: number, c: number) {
  return `${r},${c}`;
}

function areCellsInLine(
  start: [number, number],
  end: [number, number]
): [number, number][] | null {
  const [r1, c1] = start;
  const [r2, c2] = end;
  const dr = r2 - r1;
  const dc = c2 - c1;

  // Must be horizontal, vertical, or diagonal
  if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null;

  const len = Math.max(Math.abs(dr), Math.abs(dc)) + 1;
  const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
  const stepC = dc === 0 ? 0 : dc / Math.abs(dc);

  return Array.from({ length: len }, (_, i): [number, number] => [
    r1 + stepR * i,
    c1 + stepC * i,
  ]);
}

const FOUND_COLORS = [
  "bg-indigo-200 text-indigo-900",
  "bg-emerald-200 text-emerald-900",
  "bg-amber-200 text-amber-900",
  "bg-pink-200 text-pink-900",
  "bg-sky-200 text-sky-900",
  "bg-violet-200 text-violet-900",
];

interface WordSearchStudyProps {
  questions: StudyQuestion[];
  onFinish: (correct: number, total: number) => void;
  studyMeta?: StudyMeta;
  preGeneratedGrids?: Record<number, WordSearchGrid>; // Pre-generated grids by question ID
}

export function WordSearchStudy({ questions, onFinish, studyMeta, preGeneratedGrids = {} }: WordSearchStudyProps) {
  const { startSession, recordAnswer, completeSession } = useStudySession();
  const [index, setIndex] = React.useState(0);

  // ── Start a study session on mount ──────────────────────────────────────
  React.useEffect(() => {
    if (studyMeta) startSession(studyMeta, questions.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const q = questions[index];
  const rawWords = q.correct_answer?.words ?? [];

  // Use pre-generated grid if available; otherwise generate on-demand (< 1s)
  const { grid, placed } = React.useMemo(
    () => preGeneratedGrids[q.id] ?? generateGrid(rawWords),
    [q.id, preGeneratedGrids, rawWords]
  );

  // Show spinner if grid not yet in cache (only visible if user navigates before pre-gen completes)
  const isGenerating = !preGeneratedGrids[q.id] && Object.keys(preGeneratedGrids).length > 0;

  const [foundWords, setFoundWords] = React.useState<
    { word: string; cells: [number, number][]; colorIdx: number }[]
  >([]);
  const [selecting, setSelecting] = React.useState(false);
  const [startCell, setStartCell] = React.useState<[number, number] | null>(null);
  const [hoverCell, setHoverCell] = React.useState<[number, number] | null>(null);

  const foundSet = new Set(foundWords.map((f) => f.word));
  const selectionCells = React.useMemo(() => {
    if (!startCell || !hoverCell) return null;
    return areCellsInLine(startCell, hoverCell);
  }, [startCell, hoverCell]);

  const foundCellMap = React.useMemo(() => {
    const map = new Map<string, number>();
    foundWords.forEach((f, fi) => {
      f.cells.forEach(([r, c]) => map.set(cellKey(r, c), fi));
    });
    return map;
  }, [foundWords]);

  const handleCellDown = (r: number, c: number) => {
    setSelecting(true);
    setStartCell([r, c]);
    setHoverCell([r, c]);
  };

  const handleCellEnter = (r: number, c: number) => {
    if (selecting) setHoverCell([r, c]);
  };

  const handleCellUp = () => {
    if (!startCell || !hoverCell) {
      setSelecting(false);
      return;
    }
    const cells = areCellsInLine(startCell, hoverCell);
    if (cells && cells.length > 1) {
      const selectedWord = cells.map(([r, c]) => grid[r][c]).join("");
      const reversed = [...selectedWord].reverse().join("");

      // Check against placed words
      for (const pw of placed) {
        if (
          (pw.word === selectedWord || pw.word === reversed) &&
          !foundSet.has(pw.word)
        ) {
          setFoundWords((prev) => [
            ...prev,
            { word: pw.word, cells: pw.cells, colorIdx: prev.length % FOUND_COLORS.length },
          ]);
          break;
        }
      }
    }

    setSelecting(false);
    setStartCell(null);
    setHoverCell(null);
  };

  const handleNext = async () => {
    // Record one response per word-search puzzle: correct if all placed words found
    recordAnswer(
      q.id,
      `${foundWords.length}/${placed.length} encontradas`,
      foundWords.length === placed.length
    );
    if (index + 1 >= questions.length) {
      await completeSession(foundWords.length, placed.length);
      onFinish(foundWords.length, placed.length);
    } else {
      setFoundWords([]);
      setStartCell(null);
      setHoverCell(null);
      setIndex((i) => i + 1);
    }
  };

  const allFound = foundSet.size >= placed.length;
  const progress = ((index + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col gap-5">
      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Sopa {index + 1} de {questions.length}</span>
          <span>{foundSet.size} / {placed.length} encontradas</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Topic */}
      <div className="rounded-xl border-2 border-slate-200 bg-white px-5 py-3">
        <p className="text-xs font-bold uppercase tracking-wide text-indigo-500 mb-0.5">
          Bloque {q.bloque} · Sopa de letras
        </p>
        <p className="text-sm font-semibold text-slate-800">{q.stem}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Grid */}
        <div
          className="relative overflow-auto rounded-xl border-2 border-slate-200 bg-white p-3 select-none"
          style={{ touchAction: "none" }}
          onPointerLeave={() => {
            if (selecting) handleCellUp();
          }}
        >
          {/* Loading overlay for grid generation */}
          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg z-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" aria-hidden="true" />
                <p className="text-xs text-slate-500">Generando sopa...</p>
              </div>
            </div>
          )}
          <table className="border-collapse" role="grid" aria-label="Sopa de letras">
            <tbody>
              {grid.map((row, r) => (
                <tr key={r}>
                  {row.map((letter, c) => {
                    const fIdx = foundCellMap.get(cellKey(r, c));
                    const isFound = fIdx !== undefined;
                    const isSel =
                      selectionCells?.some(([sr, sc]) => sr === r && sc === c) ?? false;

                    return (
                      <td
                        key={c}
                        role="gridcell"
                        aria-selected={isSel || isFound}
                        className={cn(
                          "h-8 w-8 cursor-pointer text-center text-xs font-bold rounded-sm transition-colors",
                          isFound
                            ? FOUND_COLORS[fIdx % FOUND_COLORS.length]
                            : isSel
                            ? "bg-indigo-300 text-indigo-900"
                            : "text-slate-700 hover:bg-slate-100"
                        )}
                        onPointerDown={() => handleCellDown(r, c)}
                        onPointerEnter={() => handleCellEnter(r, c)}
                        onPointerUp={handleCellUp}
                      >
                        {letter}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Word list */}
        <div className="flex flex-col gap-2 min-w-[180px]" aria-label="Palabras a encontrar">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Palabras a encontrar
          </p>
          {placed.map((pw, i) => {
            const found = foundWords.find((f) => f.word === pw.word);
            return (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all",
                  found
                    ? cn("line-through", FOUND_COLORS[found.colorIdx])
                    : "bg-slate-100 text-slate-600"
                )}
              >
                {found && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
                {pw.word}
              </div>
            );
          })}
          {rawWords.filter((w) => !placed.find((p) => p.word === w.toUpperCase())).map((w, i) => (
            <div key={`notplaced-${i}`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 line-through">
              {w.toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      {/* Complete message */}
      <div role="status" aria-live="polite">
        {allFound && (
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border-2 border-emerald-200 px-5 py-4">
            <Trophy className="h-6 w-6 text-emerald-500 shrink-0" aria-hidden="true" />
            <p className="font-bold text-emerald-800">¡Encontraste todas las palabras!</p>
          </div>
        )}
      </div>

      {/* Next */}
      <button
        onClick={handleNext}
        aria-label={index + 1 >= questions.length ? "Ver resultados finales" : "Siguiente sopa de letras"}
        className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 min-h-[44px] py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1"
      >
        {index + 1 >= questions.length ? "Ver resultados" : "Siguiente sopa"}
      </button>
    </div>
  );
}
