import { VisualizationStep, AlgorithmRunner } from '@/types/algorithm';

export interface Knapsack01Input {
  weights: number[];
  values: number[];
  capacity: number;
}

export const knapsack01Runner: AlgorithmRunner<Knapsack01Input> = {
  getInitialInput: () => ({
    weights: [2, 3, 4, 5],
    values: [3, 4, 5, 6],
    capacity: 5,
  }),

  generateSteps: (input: Knapsack01Input): VisualizationStep[] => {
    const steps: VisualizationStep[] = [];
    const { weights, values, capacity } = input;
    const n = weights.length;

    const dp: number[][] = Array(n + 1)
      .fill(null)
      .map(() => Array(capacity + 1).fill(0));

    steps.push({
      kind: 'init',
      payload: {
        dp: dp.map(row => [...row]),
        weights,
        values,
        capacity,
        n,
        items: weights.map((w, i) => ({ weight: w, value: values[i], index: i })),
      },
      codeLine: 0,
      description: `Initialize DP table for ${n} items with capacity ${capacity}`,
    });

    for (let i = 1; i <= n; i++) {
      for (let w = 0; w <= capacity; w++) {
        steps.push({
          kind: 'compare',
          payload: {
            dp: dp.map(row => [...row]),
            i,
            w,
            itemWeight: weights[i - 1],
            itemValue: values[i - 1],
            weights,
            values,
            capacity,
          },
          codeLine: 7,
          description: `Item ${i}: weight=${weights[i - 1]}, value=${values[i - 1]}. Capacity w=${w}`,
        });

        if (weights[i - 1] <= w) {
          const include = dp[i - 1][w - weights[i - 1]] + values[i - 1];
          const exclude = dp[i - 1][w];
          dp[i][w] = Math.max(include, exclude);

          steps.push({
            kind: 'update',
            payload: {
              dp: dp.map(row => [...row]),
              i,
              w,
              include,
              exclude,
              chosen: include > exclude ? 'include' : 'exclude',
              weights,
              values,
              capacity,
            },
            codeLine: include > exclude ? 10 : 9,
            description: `Include: ${include}, Exclude: ${exclude}. Choose ${include > exclude ? 'include' : 'exclude'} → dp[${i}][${w}] = ${dp[i][w]}`,
          });
        } else {
          dp[i][w] = dp[i - 1][w];
          steps.push({
            kind: 'skip',
            payload: {
              dp: dp.map(row => [...row]),
              i,
              w,
              weights,
              values,
              capacity,
            },
            codeLine: 13,
            description: `Item ${i} too heavy (${weights[i - 1]} > ${w}). dp[${i}][${w}] = ${dp[i][w]}`,
          });
        }
      }
    }

    // Backtrack to find selected items
    const selectedItems: number[] = [];
    let remainingCapacity = capacity;
    for (let i = n; i > 0 && remainingCapacity > 0; i--) {
      if (dp[i][remainingCapacity] !== dp[i - 1][remainingCapacity]) {
        selectedItems.push(i - 1);
        remainingCapacity -= weights[i - 1];
      }
    }

    steps.push({
      kind: 'complete',
      payload: {
        dp: dp.map(row => [...row]),
        maxValue: dp[n][capacity],
        selectedItems: selectedItems.reverse(),
        weights,
        values,
        capacity,
      },
      codeLine: 18,
      description: `Maximum value: ${dp[n][capacity]}. Selected items: ${selectedItems.reverse().map(i => i + 1).join(', ') || 'none'}`,
    });

    return steps;
  },

  validateInput: (input: Knapsack01Input) => {
    if (input.weights.length !== input.values.length) {
      return { valid: false, error: 'Weights and values must have same length' };
    }
    if (input.weights.length === 0 || input.weights.length > 8) {
      return { valid: false, error: 'Number of items must be between 1 and 8' };
    }
    if (input.capacity < 1 || input.capacity > 20) {
      return { valid: false, error: 'Capacity must be between 1 and 20' };
    }
    return { valid: true };
  },
};
