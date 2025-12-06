import { VisualizationStep, AlgorithmRunner } from '@/types/algorithm';

export interface FibonacciInput {
  n: number;
}

export const fibonacciRunner: AlgorithmRunner<FibonacciInput> = {
  getInitialInput: () => ({
    n: 10,
  }),

  generateSteps: (input: FibonacciInput): VisualizationStep[] => {
    const steps: VisualizationStep[] = [];
    const n = input.n;

    steps.push({
      kind: 'init',
      payload: { n, dp: [] },
      codeLine: 0,
      description: `Computing Fibonacci(${n}) using dynamic programming`,
    });

    if (n <= 1) {
      steps.push({
        kind: 'base-case',
        payload: { n, result: n, dp: [n] },
        codeLine: 2,
        description: `Base case: Fibonacci(${n}) = ${n}`,
      });

      steps.push({
        kind: 'complete',
        payload: { n, result: n, dp: [n] },
        codeLine: 15,
        description: `Result: Fibonacci(${n}) = ${n}`,
      });

      return steps;
    }

    const dp: number[] = new Array(n + 1).fill(0);
    dp[0] = 0;
    dp[1] = 1;

    steps.push({
      kind: 'init-dp',
      payload: { dp: [...dp], n },
      codeLine: 6,
      description: `Initialize DP table: dp[0] = 0, dp[1] = 1`,
    });

    for (let i = 2; i <= n; i++) {
      steps.push({
        kind: 'compute',
        payload: {
          i,
          prev1: dp[i - 1],
          prev2: dp[i - 2],
          dp: [...dp],
          n,
        },
        codeLine: 10,
        description: `Computing dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]}`,
      });

      dp[i] = dp[i - 1] + dp[i - 2];

      steps.push({
        kind: 'store',
        payload: {
          i,
          value: dp[i],
          dp: [...dp],
          n,
        },
        codeLine: 11,
        description: `Store dp[${i}] = ${dp[i]}`,
      });
    }

    steps.push({
      kind: 'complete',
      payload: { n, result: dp[n], dp },
      codeLine: 14,
      description: `Result: Fibonacci(${n}) = ${dp[n]}`,
    });

    return steps;
  },

  validateInput: (input: FibonacciInput) => {
    if (!Number.isInteger(input.n) || input.n < 0 || input.n > 40) {
      return { valid: false, error: 'N must be an integer between 0 and 40' };
    }
    return { valid: true };
  },
};
