import { VisualizationStep, AlgorithmRunner } from '@/types/algorithm';

export interface BellmanFordInput {
  vertices: number;
  edges: Array<{ u: number; v: number; weight: number }>;
  source: number;
}

export const bellmanFordRunner: AlgorithmRunner<BellmanFordInput> = {
  getInitialInput: () => ({
    vertices: 5,
    edges: [
      { u: 0, v: 1, weight: -1 },
      { u: 0, v: 2, weight: 4 },
      { u: 1, v: 2, weight: 3 },
      { u: 1, v: 3, weight: 2 },
      { u: 1, v: 4, weight: 2 },
      { u: 3, v: 2, weight: 5 },
      { u: 3, v: 1, weight: 1 },
      { u: 4, v: 3, weight: -3 },
    ],
    source: 0,
  }),

  generateSteps: (input: BellmanFordInput): VisualizationStep[] => {
    const steps: VisualizationStep[] = [];
    const { vertices, edges, source } = input;

    const dist: number[] = Array(vertices).fill(Infinity);
    dist[source] = 0;

    const nodePositions = Array.from({ length: vertices }, (_, i) => ({
      id: i,
      x: 150 + 100 * Math.cos((2 * Math.PI * i) / vertices),
      y: 150 + 100 * Math.sin((2 * Math.PI * i) / vertices),
    }));

    steps.push({
      kind: 'init',
      payload: {
        dist: [...dist],
        vertices,
        edges,
        source,
        nodePositions,
      },
      codeLine: 0,
      description: `Initialize distances. Source node ${source} = 0, all others = ∞`,
    });

    // Main relaxation loop
    for (let iteration = 0; iteration < vertices - 1; iteration++) {
      let updated = false;

      steps.push({
        kind: 'iteration-start',
        payload: {
          dist: [...dist],
          iteration: iteration + 1,
          vertices,
          edges,
          nodePositions,
        },
        codeLine: 5,
        description: `Iteration ${iteration + 1} of ${vertices - 1}: Relax all edges`,
      });

      for (let e = 0; e < edges.length; e++) {
        const { u, v, weight } = edges[e];

        steps.push({
          kind: 'check-edge',
          payload: {
            dist: [...dist],
            u,
            v,
            weight,
            edgeIndex: e,
            vertices,
            edges,
            nodePositions,
            canRelax: dist[u] !== Infinity && dist[u] + weight < dist[v],
          },
          codeLine: 7,
          description: `Check edge (${u}→${v}, w=${weight}): dist[${u}]=${dist[u] === Infinity ? '∞' : dist[u]}, dist[${v}]=${dist[v] === Infinity ? '∞' : dist[v]}`,
        });

        if (dist[u] !== Infinity && dist[u] + weight < dist[v]) {
          const oldDist = dist[v];
          dist[v] = dist[u] + weight;
          updated = true;

          steps.push({
            kind: 'relax',
            payload: {
              dist: [...dist],
              u,
              v,
              weight,
              oldDist,
              newDist: dist[v],
              edgeIndex: e,
              vertices,
              edges,
              nodePositions,
            },
            codeLine: 9,
            description: `Relax! dist[${v}] = ${oldDist === Infinity ? '∞' : oldDist} → ${dist[v]}`,
          });
        }
      }

      if (!updated) {
        steps.push({
          kind: 'early-exit',
          payload: {
            dist: [...dist],
            iteration: iteration + 1,
            vertices,
            edges,
            nodePositions,
          },
          codeLine: 12,
          description: `No updates in iteration ${iteration + 1}. Converged early!`,
        });
        break;
      }
    }

    // Check for negative cycles
    let hasNegativeCycle = false;
    for (const { u, v, weight } of edges) {
      if (dist[u] !== Infinity && dist[u] + weight < dist[v]) {
        hasNegativeCycle = true;

        steps.push({
          kind: 'negative-cycle',
          payload: {
            dist: [...dist],
            u,
            v,
            weight,
            vertices,
            edges,
            nodePositions,
          },
          codeLine: 17,
          description: `Negative cycle detected! Edge (${u}→${v}) can still be relaxed.`,
        });
        break;
      }
    }

    steps.push({
      kind: 'complete',
      payload: {
        dist: [...dist],
        vertices,
        edges,
        source,
        nodePositions,
        hasNegativeCycle,
      },
      codeLine: 22,
      description: hasNegativeCycle
        ? 'Negative cycle detected! Shortest paths undefined.'
        : `Shortest distances from node ${source}: [${dist.map(d => (d === Infinity ? '∞' : d)).join(', ')}]`,
    });

    return steps;
  },

  validateInput: (input: BellmanFordInput) => {
    if (input.vertices < 2 || input.vertices > 8) {
      return { valid: false, error: 'Number of vertices must be between 2 and 8' };
    }
    if (input.source < 0 || input.source >= input.vertices) {
      return { valid: false, error: 'Source must be a valid vertex' };
    }
    if (input.edges.length === 0) {
      return { valid: false, error: 'Graph must have at least one edge' };
    }
    return { valid: true };
  },
};
