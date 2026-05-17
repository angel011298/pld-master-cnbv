"use client";

import * as React from "react";
import { CheckCircle2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudyQuestion {
  id: number;
  bloque: number;
  dificultad: string;
  stem: string;
  correct_answer: { words?: string[] };
  explanation: string;
  source_document: string;
}

interface PlacedWord {
  word: string;
  cells: [number, number][];
}

const GRID_SIZE = 14;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function generateGrid(rawWords: string[]): {
  grid: string[][];
  placed: PlacedWord[];
} {
  const words = rawWords
    .map((w) => w.toUpperCase().replace(/[^A-Z]/g, ""))
    .filter((w) => w.length > 1 && w.length <= GRID_SIZE);

  const grid: string[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill("")
  );
  const placed: PlacedWord[] = [];

  // Directions: right, down, diagonal down-right
  const dirs: [number, number][] = [
    [0, 1],
    [1, 0],
    [1, 1],
  ];

  for (const word of words) {
    let success = false;
    for (let attempt = 0; attempt < 80 && !success; attempt++) {
      const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
      const maxR = dr === 0 ? GRID_SIZE : GRID_SIZE - word.length;
      const maxC = dc === 0 ? GRID_SIZE : GRID_SIZE - word.length;
      if (maxR <= 0 || maxC <= 0) continue;

      const r = Math.floor(Math.random() * maxR);
      const c = Math.floor(Math.random() * maxC);

      const cells: [number, number][] = [];
      let fits = true;

      for (let i = 0; i < word.length; i++) {
        const nr = r + dr * i;
        const nc = c + dc * i;
        if (grid[nr][nc] !== "" && grid[nr][nc] !== word[i]) {
          fits = false;
          break;
        }
        cells.push([nr, nc]);
      }

      if (fits) {
        for (let i = 0; i < word.length; i++) {
          grid[cells[i][0]][cells[i][1]] = word[i];
        }
        placed.push({ word, cells });
        success = true;
      }
    }
  }

  // Fill empty cells with random letters
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!grid[r][c]) {
        grid[r][c] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
      }
    }
  }

  return { grid, placed };
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
}

export function WordSearchStudy({ questions, onFinish }: WordSearchStudyProps) {
  const [index, setIndex] = React.useState(0);
  const q = questions[index];
  const rawWords = q.correct_answer?.words ?? [];

  const { grid, placed } = React.useMemo(
    () => generateGrid(rawWords),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q.id]
  );

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

  const handleNext = () => {
    if (index + 1 >= questions.length) {
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
          className="overflow-auto rounded-xl border-2 border-slate-200 bg-white p-3 select-none"
          onMouseLeave={() => {
            if (selecting) handleCellUp();
          }}
        >
          <table className="border-collapse">
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
                        className={cn(
                          "h-8 w-8 cursor-pointer text-center text-xs font-bold rounded-sm transition-colors",
                          isFound
                            ? FOUND_COLORS[fIdx % FOUND_COLORS.length]
                            : isSel
                            ? "bg-indigo-300 text-indigo-900"
                            : "text-slate-700 hover:bg-slate-100"
                        )}
                        onMouseDown={() => handleCellDown(r, c)}
                        onMouseEnter={() => handleCellEnter(r, c)}
                        onMouseUp={handleCellUp}
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
        <div className="flex flex-col gap-2 min-w-[180px]">
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
      {allFound && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border-2 border-emerald-200 px-5 py-4">
          <Trophy className="h-6 w-6 text-emerald-500 shrink-0" />
          <p className="font-bold text-emerald-800">¡Encontraste todas las palabras!</p>
        </div>
      )}

      {/* Next */}
      <button
        onClick={handleNext}
        className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
      >
        {index + 1 >= questions.length ? "Ver resultados" : "Siguiente sopa"}
      </button>
    </div>
  );
}
