const GRID_SIZE = 14;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export interface PlacedWord {
  word: string;
  cells: [number, number][];
}

export interface WordSearchGrid {
  grid: string[][];
  placed: PlacedWord[];
}

/**
 * Generates a word search grid with given words placed horizontally, vertically, or diagonally.
 * Fills empty cells with random letters.
 */
export function generateGrid(rawWords: string[]): WordSearchGrid {
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
