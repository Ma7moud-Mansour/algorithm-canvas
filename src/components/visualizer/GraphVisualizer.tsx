import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { VisualizationStep } from '@/types/algorithm';

interface GraphVisualizerProps {
  currentStep: VisualizationStep | null;
  className?: string;
}

interface NodePosition {
  x: number;
  y: number;
}

export function GraphVisualizer({ currentStep, className }: GraphVisualizerProps) {
  const { nodes, edges, visited, queue, stack, currentNode, checkingNeighbor } = useMemo(() => {
    if (!currentStep) {
      return {
        nodes: [] as number[],
        edges: [] as [number, number][],
        visited: [] as number[],
        queue: [] as number[],
        stack: [] as number[],
        currentNode: -1,
        checkingNeighbor: -1,
      };
    }

    const payload = currentStep.payload as Record<string, unknown>;
    
    return {
      nodes: (payload.nodes as number[]) || [],
      edges: (payload.edges as [number, number][]) || [],
      visited: (payload.visited as number[]) || [],
      queue: (payload.queue as number[]) || [],
      stack: (payload.stack as number[]) || [],
      currentNode: (payload.node as number) ?? -1,
      checkingNeighbor: (payload.neighbor as number) ?? -1,
    };
  }, [currentStep]);

  // Calculate node positions in a circle
  const nodePositions = useMemo((): Record<number, NodePosition> => {
    const positions: Record<number, NodePosition> = {};
    const centerX = 200;
    const centerY = 150;
    const radius = 100;

    nodes.forEach((node, index) => {
      const angle = (2 * Math.PI * index) / nodes.length - Math.PI / 2;
      positions[node] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });

    return positions;
  }, [nodes]);

  if (nodes.length === 0) {
    return (
      <div className={cn('glass-panel flex items-center justify-center', className)}>
        <p className="text-muted-foreground">No graph to visualize</p>
      </div>
    );
  }

  return (
    <div className={cn('glass-panel p-4', className)}>
      <div className="flex flex-col lg:flex-row gap-4 h-full">
        {/* Graph SVG */}
        <div className="flex-1 flex items-center justify-center">
          <svg viewBox="0 0 400 300" className="w-full h-full max-h-[250px]">
            {/* Edges */}
            {edges.map(([a, b], idx) => {
              const posA = nodePositions[a];
              const posB = nodePositions[b];
              if (!posA || !posB) return null;

              const isActiveEdge = 
                (currentNode === a && checkingNeighbor === b) ||
                (currentNode === b && checkingNeighbor === a);

              return (
                <line
                  key={`edge-${idx}`}
                  x1={posA.x}
                  y1={posA.y}
                  x2={posB.x}
                  y2={posB.y}
                  className={cn(
                    'transition-all duration-300',
                    isActiveEdge ? 'stroke-primary' : 'stroke-muted-foreground/40'
                  )}
                  strokeWidth={isActiveEdge ? 3 : 2}
                />
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const pos = nodePositions[node];
              if (!pos) return null;

              const isVisited = visited.includes(node);
              const isCurrent = currentNode === node;
              const isChecking = checkingNeighbor === node;
              const isInQueue = queue.includes(node);
              const isInStack = stack.includes(node);

              return (
                <g key={`node-${node}`}>
                  {/* Glow effect */}
                  {(isCurrent || isChecking) && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={28}
                      className={cn(
                        'animate-pulse',
                        isCurrent ? 'fill-primary/30' : 'fill-secondary/30'
                      )}
                    />
                  )}
                  
                  {/* Node circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={22}
                    className={cn(
                      'transition-all duration-300 stroke-2',
                      isCurrent && 'fill-primary stroke-primary-foreground',
                      isChecking && !isCurrent && 'fill-secondary stroke-secondary-foreground',
                      isVisited && !isCurrent && !isChecking && 'fill-success stroke-success',
                      (isInQueue || isInStack) && !isVisited && !isCurrent && !isChecking && 'fill-info stroke-info',
                      !isVisited && !isCurrent && !isChecking && !isInQueue && !isInStack && 'fill-muted stroke-muted-foreground'
                    )}
                  />
                  
                  {/* Node label */}
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className={cn(
                      'text-sm font-bold select-none',
                      (isCurrent || isVisited) ? 'fill-foreground' : 'fill-muted-foreground'
                    )}
                  >
                    {node}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend and state */}
        <div className="lg:w-48 space-y-3">
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary" />
              <span className="text-muted-foreground">Checking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-muted-foreground">Visited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-info" />
              <span className="text-muted-foreground">In Queue/Stack</span>
            </div>
          </div>

          {queue.length > 0 && (
            <div className="border-t border-panel-border pt-2">
              <p className="text-xs text-muted-foreground mb-1">Queue:</p>
              <div className="flex flex-wrap gap-1">
                {queue.map((n, i) => (
                  <span key={i} className="px-2 py-0.5 text-xs bg-info/20 text-info rounded">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          )}

          {stack.length > 0 && (
            <div className="border-t border-panel-border pt-2">
              <p className="text-xs text-muted-foreground mb-1">Stack:</p>
              <div className="flex flex-wrap gap-1">
                {stack.map((n, i) => (
                  <span key={i} className="px-2 py-0.5 text-xs bg-info/20 text-info rounded">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          )}

          {visited.length > 0 && (
            <div className="border-t border-panel-border pt-2">
              <p className="text-xs text-muted-foreground mb-1">Visited:</p>
              <div className="flex flex-wrap gap-1">
                {visited.map((n, i) => (
                  <span key={i} className="px-2 py-0.5 text-xs bg-success/20 text-success rounded">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}