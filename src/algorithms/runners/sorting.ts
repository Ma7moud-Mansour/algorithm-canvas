import { VisualizationStep, AlgorithmRunner } from '@/types/algorithm';

export interface SortingInput {
  array: number[];
}

export const bubbleSortRunner: AlgorithmRunner<SortingInput> = {
  getInitialInput: () => ({ array: [64, 34, 25, 12, 22, 11, 90] }),
  generateSteps: (input: SortingInput): VisualizationStep[] => {
    const steps: VisualizationStep[] = [];
    const arr = [...input.array];
    const n = arr.length;
    steps.push({ kind: 'init', payload: { array: [...arr] }, codeLine: 0, description: 'Initialize the array' });
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        steps.push({ kind: 'compare', payload: { indices: [j, j + 1], array: [...arr] }, codeLine: 6, description: `Compare arr[${j}]=${arr[j]} with arr[${j + 1}]=${arr[j + 1]}` });
        if (arr[j] > arr[j + 1]) {
          steps.push({ kind: 'swap', payload: { indices: [j, j + 1], array: [...arr] }, codeLine: 8, description: `Swap ${arr[j]} and ${arr[j + 1]}` });
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          steps.push({ kind: 'after-swap', payload: { indices: [j, j + 1], array: [...arr] }, codeLine: 8, description: `After swap` });
        }
      }
      steps.push({ kind: 'sorted', payload: { index: n - 1 - i, array: [...arr] }, codeLine: 11, description: `Element at position ${n - 1 - i} is now sorted` });
    }
    steps.push({ kind: 'complete', payload: { array: [...arr] }, codeLine: 13, description: 'Array is fully sorted!' });
    return steps;
  },
  validateInput: (input: SortingInput) => {
    if (!Array.isArray(input.array) || input.array.length === 0) return { valid: false, error: 'Please provide a non-empty array' };
    return { valid: true };
  },
};

export const selectionSortRunner: AlgorithmRunner<SortingInput> = {
  getInitialInput: () => ({ array: [64, 25, 12, 22, 11] }),
  generateSteps: (input: SortingInput): VisualizationStep[] => {
    const steps: VisualizationStep[] = [];
    const arr = [...input.array];
    const n = arr.length;
    steps.push({ kind: 'init', payload: { array: [...arr] }, codeLine: 0, description: 'Initialize the array' });
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        steps.push({ kind: 'compare', payload: { indices: [minIdx, j], array: [...arr] }, codeLine: 8, description: `Compare arr[${minIdx}]=${arr[minIdx]} with arr[${j}]=${arr[j]}` });
        if (arr[j] < arr[minIdx]) minIdx = j;
      }
      if (minIdx !== i) {
        steps.push({ kind: 'swap', payload: { indices: [i, minIdx], array: [...arr] }, codeLine: 15, description: `Swap arr[${i}]=${arr[i]} with arr[${minIdx}]=${arr[minIdx]}` });
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        steps.push({ kind: 'after-swap', payload: { indices: [i, minIdx], array: [...arr] }, codeLine: 15, description: `After swap` });
      }
      steps.push({ kind: 'sorted', payload: { index: i, array: [...arr] }, codeLine: 17, description: `Element at position ${i} is now sorted` });
    }
    steps.push({ kind: 'complete', payload: { array: [...arr] }, codeLine: 19, description: 'Array is fully sorted!' });
    return steps;
  },
  validateInput: (input: SortingInput) => {
    if (!Array.isArray(input.array) || input.array.length === 0) return { valid: false, error: 'Please provide a non-empty array' };
    return { valid: true };
  },
};

export const insertionSortRunner: AlgorithmRunner<SortingInput> = {
  getInitialInput: () => ({ array: [12, 11, 13, 5, 6] }),
  generateSteps: (input: SortingInput): VisualizationStep[] => {
    const steps: VisualizationStep[] = [];
    const arr = [...input.array];
    steps.push({ kind: 'init', payload: { array: [...arr] }, codeLine: 0, description: 'Initialize the array' });
    for (let i = 1; i < arr.length; i++) {
      const key = arr[i];
      let j = i - 1;
      steps.push({ kind: 'compare', payload: { indices: [i], array: [...arr] }, codeLine: 2, description: `Key = ${key} at index ${i}` });
      while (j >= 0 && arr[j] > key) {
        steps.push({ kind: 'compare', payload: { indices: [j, j + 1], array: [...arr] }, codeLine: 6, description: `Compare arr[${j}]=${arr[j]} > key ${key}` });
        arr[j + 1] = arr[j];
        steps.push({ kind: 'swap', payload: { indices: [j, j + 1], array: [...arr] }, codeLine: 7, description: `Shift arr[${j}] to position ${j + 1}` });
        j--;
      }
      arr[j + 1] = key;
      steps.push({ kind: 'after-swap', payload: { indices: [j + 1], array: [...arr] }, codeLine: 11, description: `Insert key ${key} at position ${j + 1}` });
    }
    steps.push({ kind: 'complete', payload: { array: [...arr] }, codeLine: 14, description: 'Array is fully sorted!' });
    return steps;
  },
  validateInput: (input: SortingInput) => {
    if (!Array.isArray(input.array) || input.array.length === 0) return { valid: false, error: 'Please provide a non-empty array' };
    return { valid: true };
  },
};

export const mergeSortRunner: AlgorithmRunner<SortingInput> = {
  getInitialInput: () => ({ array: [38, 27, 43, 3, 9, 82, 10] }),
  generateSteps: (input: SortingInput): VisualizationStep[] => {
    const steps: VisualizationStep[] = [];
    const arr = [...input.array];
    steps.push({ kind: 'init', payload: { array: [...arr] }, codeLine: 0, description: 'Initialize the array' });

    function mergeSort(start: number, end: number) {
      if (start >= end) return;
      const mid = Math.floor((start + end) / 2);
      steps.push({ kind: 'compare', payload: { indices: [start, mid, end], array: [...arr] }, codeLine: 3, description: `Divide array [${start}...${end}] at mid=${mid}` });
      mergeSort(start, mid);
      mergeSort(mid + 1, end);
      merge(start, mid, end);
    }

    function merge(start: number, mid: number, end: number) {
      const left = arr.slice(start, mid + 1);
      const right = arr.slice(mid + 1, end + 1);
      let i = 0, j = 0, k = start;
      while (i < left.length && j < right.length) {
        steps.push({ kind: 'compare', payload: { indices: [start + i, mid + 1 + j], array: [...arr] }, codeLine: 14, description: `Compare ${left[i]} with ${right[j]}` });
        if (left[i] <= right[j]) {
          arr[k] = left[i++];
        } else {
          arr[k] = right[j++];
        }
        steps.push({ kind: 'swap', payload: { indices: [k], array: [...arr] }, codeLine: 16, description: `Place ${arr[k]} at position ${k}` });
        k++;
      }
      while (i < left.length) { arr[k++] = left[i++]; }
      while (j < right.length) { arr[k++] = right[j++]; }
      steps.push({ kind: 'after-swap', payload: { indices: Array.from({length: end - start + 1}, (_, idx) => start + idx), array: [...arr] }, codeLine: 22, description: `Merged [${start}...${end}]` });
    }

    mergeSort(0, arr.length - 1);
    steps.push({ kind: 'complete', payload: { array: [...arr] }, codeLine: 23, description: 'Array is fully sorted!' });
    return steps;
  },
  validateInput: (input: SortingInput) => {
    if (!Array.isArray(input.array) || input.array.length === 0) return { valid: false, error: 'Please provide a non-empty array' };
    return { valid: true };
  },
};

export const quickSortRunner: AlgorithmRunner<SortingInput> = {
  getInitialInput: () => ({ array: [38, 27, 43, 3, 9, 82, 10] }),
  generateSteps: (input: SortingInput): VisualizationStep[] => {
    const steps: VisualizationStep[] = [];
    const arr = [...input.array];
    steps.push({ kind: 'init', payload: { array: [...arr] }, codeLine: 0, description: 'Initialize the array' });

    const partition = (low: number, high: number): number => {
      const pivot = arr[high];
      steps.push({ kind: 'pivot-select', payload: { pivotIndex: high, pivot, array: [...arr] }, codeLine: 14, description: `Select pivot: ${pivot}` });
      let i = low - 1;
      for (let j = low; j < high; j++) {
        steps.push({ kind: 'compare', payload: { indices: [j, high], array: [...arr] }, codeLine: 18, description: `Compare arr[${j}]=${arr[j]} with pivot ${pivot}` });
        if (arr[j] <= pivot) {
          i++;
          if (i !== j) {
            steps.push({ kind: 'swap', payload: { indices: [i, j], array: [...arr] }, codeLine: 20, description: `Swap arr[${i}] and arr[${j}]` });
            [arr[i], arr[j]] = [arr[j], arr[i]];
          }
        }
      }
      steps.push({ kind: 'swap', payload: { indices: [i + 1, high], array: [...arr] }, codeLine: 24, description: `Place pivot at position ${i + 1}` });
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      steps.push({ kind: 'pivot-placed', payload: { pivotIndex: i + 1, array: [...arr] }, codeLine: 24, description: `Pivot placed at ${i + 1}` });
      return i + 1;
    };

    const quickSort = (low: number, high: number) => {
      if (low < high) {
        const pivotIdx = partition(low, high);
        quickSort(low, pivotIdx - 1);
        quickSort(pivotIdx + 1, high);
      }
    };

    quickSort(0, arr.length - 1);
    steps.push({ kind: 'complete', payload: { array: [...arr] }, codeLine: 10, description: 'Array is fully sorted!' });
    return steps;
  },
  validateInput: (input: SortingInput) => {
    if (!Array.isArray(input.array) || input.array.length === 0) return { valid: false, error: 'Please provide a non-empty array' };
    return { valid: true };
  },
};