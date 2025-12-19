import { VisualizationStep, AlgorithmRunner } from '@/types/algorithm';

export interface LCSInput {
  str1: string;
  str2: string;
}

export const lcsRunner: AlgorithmRunner<LCSInput> = {
  getInitialInput: () => ({
    str1: 'ABCDGH',
    str2: 'AEDFHR',
  }),

  generateSteps: (input: LCSInput): VisualizationStep[] => {
    const steps: VisualizationStep[] = [];
    const { str1, str2 } = input;
    const m = str1.length;
    const n = str2.length;

    const dp: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    steps.push({
      kind: 'init',
      payload: {
        dp: dp.map(row => [...row]),
        str1,
        str2,
        m,
        n,
      },
      codeLine: 0,
      description: `Initialize DP table for "${str1}" and "${str2}"`,
    });

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        steps.push({
          kind: 'compare',
          payload: {
            dp: dp.map(row => [...row]),
            i,
            j,
            char1: str1[i - 1],
            char2: str2[j - 1],
            str1,
            str2,
          },
          codeLine: 7,
          description: `Compare str1[${i - 1}]='${str1[i - 1]}' with str2[${j - 1}]='${str2[j - 1]}'`,
        });

        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
          steps.push({
            kind: 'match',
            payload: {
              dp: dp.map(row => [...row]),
              i,
              j,
              char1: str1[i - 1],
              char2: str2[j - 1],
              str1,
              str2,
            },
            codeLine: 8,
            description: `Match! '${str1[i - 1]}' = '${str2[j - 1]}' → dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]}`,
          });
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
          steps.push({
            kind: 'no-match',
            payload: {
              dp: dp.map(row => [...row]),
              i,
              j,
              char1: str1[i - 1],
              char2: str2[j - 1],
              str1,
              str2,
              fromTop: dp[i - 1][j],
              fromLeft: dp[i][j - 1],
            },
            codeLine: 10,
            description: `No match. max(dp[${i - 1}][${j}]=${dp[i - 1][j]}, dp[${i}][${j - 1}]=${dp[i][j - 1]}) → dp[${i}][${j}] = ${dp[i][j]}`,
          });
        }
      }
    }

    // Backtrack to find LCS
    let lcsStr = '';
    const backtrackPath: Array<{ i: number; j: number; matched: boolean }> = [];
    let i = m;
    let j = n;

    while (i > 0 && j > 0) {
      if (str1[i - 1] === str2[j - 1]) {
        lcsStr = str1[i - 1] + lcsStr;
        backtrackPath.unshift({ i, j, matched: true });
        i--;
        j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        backtrackPath.unshift({ i, j, matched: false });
        i--;
      } else {
        backtrackPath.unshift({ i, j, matched: false });
        j--;
      }
    }

    steps.push({
      kind: 'backtrack',
      payload: {
        dp: dp.map(row => [...row]),
        str1,
        str2,
        backtrackPath,
        lcsStr,
        lcsLength: dp[m][n],
      },
      codeLine: 18,
      description: `Backtracking to find LCS...`,
    });

    steps.push({
      kind: 'complete',
      payload: {
        dp: dp.map(row => [...row]),
        str1,
        str2,
        lcsStr,
        lcsLength: dp[m][n],
        backtrackPath,
      },
      codeLine: 29,
      description: `LCS: "${lcsStr}" with length ${dp[m][n]}`,
    });

    return steps;
  },

  validateInput: (input: LCSInput) => {
    if (input.str1.length === 0 || input.str1.length > 10) {
      return { valid: false, error: 'String 1 must be 1-10 characters' };
    }
    if (input.str2.length === 0 || input.str2.length > 10) {
      return { valid: false, error: 'String 2 must be 1-10 characters' };
    }
    return { valid: true };
  },
};
