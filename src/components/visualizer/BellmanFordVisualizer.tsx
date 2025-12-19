import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { VisualizationStep } from '@/types/algorithm';

interface BellmanFordVisualizerProps {
  currentStep: VisualizationStep | null;
  className?: string;
}

export function BellmanFordVisualizer({ currentStep, className }: BellmanFordVisualizerProps) {
  const { dist, vertices, edges, nodePositions, u, v, edgeIndex, canRelax, hasNegativeCycle, source, kind } = useMemo(() => {
    if (!currentStep?.payload) {
      return { dist: [], vertices: 0, edges: [], nodePositions: [] };
    }
    return currentStep.payload as {
      dist: number[];
      vertices: number;
      edges: Array<{ u: number; v: number; weight: number }>;
      nodePositions: Array<{ id: number; x: number; y: number }>;
      u?: number;
      v?: number;
      edgeIndex?: number;
      canRelax?: boolean;
      hasNegativeCycle?: boolean;
      source?: number;
      kind?: string;
    };
  }, [currentStep]);

  if (!dist || dist.length === 0) {
    return (
      <div className={cn('glass-panel p-4 flex items-center justify-center', className)}>
        <p className="text-muted-foreground">No data to visualize</p>
      </div>
    );
  }

  const svgWidth = 320;
  const svgHeight = 280;
  const nodeRadius = 24;

  return (
    <div className={cn('glass-panel p-4 overflow-auto', className)}>
      <div className="flex flex-col gap-4">
        {/* Distance table */}
        <div className="flex gap-2 flex-wrap">
          {dist.map((d, idx) => (
            <div
              key={idx}
              className={cn(
                'px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors',
                source === idx
                  ? 'bg-primary/30 border-primary text-primary'
                  : v === idx && kind === 'relax'
                  ? 'bg-success/30 border-success text-success'
                  : u === idx || v === idx
                  ? 'bg-info/20 border-info text-info'
                  : 'bg-muted/30 border-border text-foreground'
              )}
            >
              d[{idx}] = {d === Infinity ? '∞' : d}
            </div>
          ))}
        </div>

        {/* Graph visualization */}
        <div className="flex justify-center">
          <svg
            width={svgWidth}
            height={svgHeight}
            className="bg-background/50 rounded-lg border border-border"
          >
            {/* Draw edges */}
            {edges.map((edge, idx) => {
              const fromNode = nodePositions.find((n) => n.id === edge.u);
              const toNode = nodePositions.find((n) => n.id === edge.v);
              if (!fromNode || !toNode) return null;

              const isCurrentEdge = edgeIndex === idx;
              const dx = toNode.x - fromNode.x;
              const dy = toNode.y - fromNode.y;
              const len = Math.sqrt(dx * dx + dy * dy);
              const offsetX = (dx / len) * nodeRadius;
              const offsetY = (dy / len) * nodeRadius;

              // Arrow points
              const startX = fromNode.x + offsetX;
              const startY = fromNode.y + offsetY;
              const endX = toNode.x - offsetX;
              const endY = toNode.y - offsetY;

              // Midpoint for weight label
              const midX = (startX + endX) / 2;
              const midY = (startY + endY) / 2;

              return (
                <g key={idx}>
                  <defs>
                    <marker
                      id={`arrow-${idx}`}
                      markerWidth="10"
                      markerHeight="10"
                      refX="9"
                      refY="3"
                      orient="auto"
                      markerUnits="strokeWidth"
                    >
                      <path
                        d="M0,0 L0,6 L9,3 z"
                        fill={
                          isCurrentEdge
                            ? kind === 'relax'
                              ? 'hsl(var(--success))'
                              : canRelax
                              ? 'hsl(var(--warning))'
                              : 'hsl(var(--info))'
                            : 'hsl(var(--muted-foreground))'
                        }
                      />
                    </marker>
                  </defs>
                  <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke={
                      isCurrentEdge
                        ? kind === 'relax'
                          ? 'hsl(var(--success))'
                          : canRelax
                          ? 'hsl(var(--warning))'
                          : 'hsl(var(--info))'
                        : 'hsl(var(--muted-foreground))'
                    }
                    strokeWidth={isCurrentEdge ? 2.5 : 1.5}
                    markerEnd={`url(#arrow-${idx})`}
                    className="transition-all"
                  />
                  <text
                    x={midX}
                    y={midY - 5}
                    textAnchor="middle"
                    className={cn(
                      'text-[10px] font-mono',
                      isCurrentEdge ? 'fill-primary' : 'fill-muted-foreground'
                    )}
                  >
                    {edge.weight}
                  </text>
                </g>
              );
            })}

            {/* Draw nodes */}
            {nodePositions.map((node) => {
              const isSource = source === node.id;
              const isActiveU = u === node.id;
              const isActiveV = v === node.id;
              const distVal = dist[node.id];

              return (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={nodeRadius}
                    className={cn(
                      'transition-colors',
                      isSource
                        ? 'fill-primary/30 stroke-primary'
                        : isActiveV && kind === 'relax'
                        ? 'fill-success/30 stroke-success'
                        : isActiveU || isActiveV
                        ? 'fill-info/30 stroke-info'
                        : 'fill-muted/30 stroke-border'
                    )}
                    strokeWidth={2}
                  />
                  <text
                    x={node.x}
                    y={node.y - 4}
                    textAnchor="middle"
                    className="text-xs font-bold fill-foreground"
                  >
                    {node.id}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 10}
                    textAnchor="middle"
                    className="text-[10px] font-mono fill-muted-foreground"
                  >
                    {distVal === Infinity ? '∞' : distVal}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Status */}
        {hasNegativeCycle && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
            <p className="text-sm font-medium text-destructive">
              Negative Cycle Detected!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Shortest paths are undefined when a negative cycle exists.
            </p>
          </div>
        )}

        {kind === 'complete' && !hasNegativeCycle && (
          <div className="p-3 bg-success/10 border border-success/30 rounded-lg">
            <p className="text-sm font-medium text-success">
              Shortest paths computed successfully!
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-primary/30 border border-primary" />
            <span className="text-muted-foreground">Source</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-success/30 border border-success" />
            <span className="text-muted-foreground">Relaxed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-info/30 border border-info" />
            <span className="text-muted-foreground">Current Edge</span>
          </div>
        </div>
      </div>
    </div>
  );
}
