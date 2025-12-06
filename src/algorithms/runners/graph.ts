import { VisualizationStep, AlgorithmRunner } from '@/types/algorithm';

export interface GraphInput {
  nodes: number[];
  edges: [number, number][];
  startNode: number;
}

export const bfsRunner: AlgorithmRunner<GraphInput> = {
  getInitialInput: () => ({
    nodes: [0, 1, 2, 3, 4, 5],
    edges: [
      [0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [3, 5], [4, 5]
    ] as [number, number][],
    startNode: 0,
  }),

  generateSteps: (input: GraphInput): VisualizationStep[] => {
    const steps: VisualizationStep[] = [];
    const { nodes, edges, startNode } = input;

    // Build adjacency list
    const graph: Record<number, number[]> = {};
    nodes.forEach(n => graph[n] = []);
    edges.forEach(([a, b]) => {
      graph[a].push(b);
      graph[b].push(a);
    });

    steps.push({
      kind: 'init',
      payload: { nodes, edges, graph, startNode },
      codeLine: 0,
      description: `Starting BFS from node ${startNode}`,
    });

    const visited = new Set<number>();
    const queue: number[] = [startNode];
    visited.add(startNode);

    steps.push({
      kind: 'enqueue',
      payload: { node: startNode, queue: [...queue], visited: [...visited], nodes, edges },
      codeLine: 5,
      description: `Add start node ${startNode} to queue and mark visited`,
    });

    while (queue.length > 0) {
      const node = queue.shift()!;

      steps.push({
        kind: 'dequeue',
        payload: { node, queue: [...queue], visited: [...visited], nodes, edges },
        codeLine: 8,
        description: `Dequeue node ${node} and process it`,
      });

      steps.push({
        kind: 'visit',
        payload: { node, queue: [...queue], visited: [...visited], nodes, edges },
        codeLine: 9,
        description: `Visit node ${node}`,
      });

      for (const neighbor of graph[node]) {
        steps.push({
          kind: 'check-neighbor',
          payload: { node, neighbor, queue: [...queue], visited: [...visited], nodes, edges },
          codeLine: 12,
          description: `Check neighbor ${neighbor} of node ${node}`,
        });

        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);

          steps.push({
            kind: 'enqueue',
            payload: { node: neighbor, parent: node, queue: [...queue], visited: [...visited], nodes, edges },
            codeLine: 15,
            description: `Add neighbor ${neighbor} to queue and mark visited`,
          });
        } else {
          steps.push({
            kind: 'already-visited',
            payload: { neighbor, nodes, edges, visited: [...visited], queue: [...queue] },
            codeLine: 13,
            description: `Neighbor ${neighbor} already visited, skip`,
          });
        }
      }
    }

    steps.push({
      kind: 'complete',
      payload: { visited: [...visited], nodes, edges },
      codeLine: 20,
      description: `BFS complete! Visited nodes: ${[...visited].join(', ')}`,
    });

    return steps;
  },

  validateInput: (input: GraphInput) => {
    if (!input.nodes || input.nodes.length === 0) {
      return { valid: false, error: 'Please provide at least one node' };
    }
    if (!input.nodes.includes(input.startNode)) {
      return { valid: false, error: 'Start node must be in the nodes list' };
    }
    return { valid: true };
  },
};

export const dfsRunner: AlgorithmRunner<GraphInput> = {
  getInitialInput: () => ({
    nodes: [0, 1, 2, 3, 4, 5],
    edges: [
      [0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [3, 5], [4, 5]
    ] as [number, number][],
    startNode: 0,
  }),

  generateSteps: (input: GraphInput): VisualizationStep[] => {
    const steps: VisualizationStep[] = [];
    const { nodes, edges, startNode } = input;

    const graph: Record<number, number[]> = {};
    nodes.forEach(n => graph[n] = []);
    edges.forEach(([a, b]) => {
      graph[a].push(b);
      graph[b].push(a);
    });

    steps.push({
      kind: 'init',
      payload: { nodes, edges, graph, startNode },
      codeLine: 0,
      description: `Starting DFS from node ${startNode}`,
    });

    const visited = new Set<number>();
    const stack: number[] = [];

    function dfs(node: number) {
      visited.add(node);
      stack.push(node);

      steps.push({
        kind: 'visit',
        payload: { node, stack: [...stack], visited: [...visited], nodes, edges },
        codeLine: 5,
        description: `Visit node ${node}`,
      });

      for (const neighbor of graph[node]) {
        steps.push({
          kind: 'check-neighbor',
          payload: { node, neighbor, stack: [...stack], visited: [...visited], nodes, edges },
          codeLine: 9,
          description: `Check neighbor ${neighbor} of node ${node}`,
        });

        if (!visited.has(neighbor)) {
          steps.push({
            kind: 'recurse',
            payload: { from: node, to: neighbor, stack: [...stack], visited: [...visited], nodes, edges },
            codeLine: 11,
            description: `Recurse into neighbor ${neighbor}`,
          });
          dfs(neighbor);
        } else {
          steps.push({
            kind: 'already-visited',
            payload: { neighbor, nodes, edges, visited: [...visited], stack: [...stack] },
            codeLine: 10,
            description: `Neighbor ${neighbor} already visited, skip`,
          });
        }
      }

      stack.pop();
      steps.push({
        kind: 'backtrack',
        payload: { node, stack: [...stack], visited: [...visited], nodes, edges },
        codeLine: 14,
        description: `Backtrack from node ${node}`,
      });
    }

    dfs(startNode);

    steps.push({
      kind: 'complete',
      payload: { visited: [...visited], nodes, edges },
      codeLine: 17,
      description: `DFS complete! Visited nodes: ${[...visited].join(', ')}`,
    });

    return steps;
  },

  validateInput: (input: GraphInput) => {
    if (!input.nodes || input.nodes.length === 0) {
      return { valid: false, error: 'Please provide at least one node' };
    }
    if (!input.nodes.includes(input.startNode)) {
      return { valid: false, error: 'Start node must be in the nodes list' };
    }
    return { valid: true };
  },
};
