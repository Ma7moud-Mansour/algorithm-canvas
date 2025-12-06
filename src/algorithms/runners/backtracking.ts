import { VisualizationStep, AlgorithmRunner } from '@/types/algorithm';

export interface NQueensInput {
  n: number;
}

export const nQueensRunner: AlgorithmRunner<NQueensInput> = {
  getInitialInput: () => ({
    n: 4,
  }),

  generateSteps: (input: NQueensInput): VisualizationStep[] => {
    const steps: VisualizationStep[] = [];
    const n = input.n;
    const board: number[] = Array(n).fill(-1);

    steps.push({
      kind: 'init',
      payload: { n, board: [...board] },
      codeLine: 0,
      description: `Solving ${n}-Queens problem`,
    });

    function isSafe(row: number, col: number): boolean {
      for (let i = 0; i < row; i++) {
        const c = board[i];
        if (c === col) return false;
        if (Math.abs(c - col) === Math.abs(i - row)) return false;
      }
      return true;
    }

    let solutionFound = false;

    function solve(row: number): boolean {
      if (row === n) {
        steps.push({
          kind: 'solution-found',
          payload: { board: [...board], n },
          codeLine: 16,
          description: `Solution found!`,
        });
        solutionFound = true;
        return true;
      }

      steps.push({
        kind: 'try-row',
        payload: { row, board: [...board], n },
        codeLine: 14,
        description: `Trying to place queen in row ${row}`,
      });

      for (let col = 0; col < n; col++) {
        steps.push({
          kind: 'try-col',
          payload: { row, col, board: [...board], n },
          codeLine: 20,
          description: `Try column ${col} for row ${row}`,
        });

        const safe = isSafe(row, col);

        steps.push({
          kind: 'check-safe',
          payload: { row, col, safe, board: [...board], n },
          codeLine: 21,
          description: safe
            ? `Position (${row}, ${col}) is safe`
            : `Position (${row}, ${col}) is not safe (attacks existing queen)`,
        });

        if (safe) {
          board[row] = col;

          steps.push({
            kind: 'place-queen',
            payload: { row, col, board: [...board], n },
            codeLine: 22,
            description: `Place queen at (${row}, ${col})`,
          });

          if (solve(row + 1)) {
            return true;
          }

          board[row] = -1;

          steps.push({
            kind: 'backtrack',
            payload: { row, col, board: [...board], n },
            codeLine: 24,
            description: `Backtrack: remove queen from (${row}, ${col})`,
          });
        }
      }

      return false;
    }

    solve(0);

    if (!solutionFound) {
      steps.push({
        kind: 'no-solution',
        payload: { n },
        codeLine: 29,
        description: `No solution found for ${n}-Queens`,
      });
    }

    steps.push({
      kind: 'complete',
      payload: { board: [...board], n, solutionFound },
      codeLine: 30,
      description: solutionFound ? 'Algorithm complete - solution found!' : 'Algorithm complete - no solution exists',
    });

    return steps;
  },

  validateInput: (input: NQueensInput) => {
    if (!input.n || input.n < 1 || input.n > 8) {
      return { valid: false, error: 'N must be between 1 and 8' };
    }
    return { valid: true };
  },
};
