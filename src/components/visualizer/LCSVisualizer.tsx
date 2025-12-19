import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { VisualizationStep } from '@/types/algorithm';

interface LCSVisualizerProps {
  currentStep: VisualizationStep | null;
  className?: string;
}

export function LCSVisualizer({ currentStep, className }: LCSVisualizerProps) {
  const { dp, str1, str2, i, j, char1, char2, lcsStr, lcsLength, backtrackPath, kind } = useMemo(() => {
    if (!currentStep?.payload) {
      return { dp: [], str1: '', str2: '' };
    }
    return currentStep.payload as {
      dp: number[][];
      str1: string;
      str2: string;
      i?: number;
      j?: number;
      char1?: string;
      char2?: string;
      lcsStr?: string;
      lcsLength?: number;
      backtrackPath?: Array<{ i: number; j: number; matched: boolean }>;
      kind?: string;
    };
  }, [currentStep]);

  if (!dp || dp.length === 0) {
    return (
      <div className={cn('glass-panel p-4 flex items-center justify-center', className)}>
        <p className="text-muted-foreground">No data to visualize</p>
      </div>
    );
  }

  const cellSize = 36;
  const isBacktracking = kind === 'backtrack' || kind === 'complete';

  return (
    <div className={cn('glass-panel p-4 overflow-auto', className)}>
      <div className="flex flex-col gap-4">
        {/* String comparison display */}
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">String 1:</span>
            <div className="flex gap-0.5">
              {str1.split('').map((char, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'w-7 h-7 flex items-center justify-center rounded text-sm font-mono border transition-colors',
                    i !== undefined && idx === i - 1
                      ? kind === 'match'
                        ? 'bg-success/30 border-success text-success'
                        : 'bg-primary/30 border-primary text-primary'
                      : lcsStr?.includes(char) && isBacktracking
                      ? 'bg-success/20 border-success/50 text-success'
                      : 'bg-muted/30 border-border text-foreground'
                  )}
                >
                  {char}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">String 2:</span>
            <div className="flex gap-0.5">
              {str2.split('').map((char, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'w-7 h-7 flex items-center justify-center rounded text-sm font-mono border transition-colors',
                    j !== undefined && idx === j - 1
                      ? kind === 'match'
                        ? 'bg-success/30 border-success text-success'
                        : 'bg-primary/30 border-primary text-primary'
                      : lcsStr?.includes(char) && isBacktracking
                      ? 'bg-success/20 border-success/50 text-success'
                      : 'bg-muted/30 border-border text-foreground'
                  )}
                >
                  {char}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DP Matrix */}
        <div className="overflow-auto">
          <div className="inline-block">
            {/* Header row */}
            <div className="flex">
              <div
                style={{ width: cellSize, height: cellSize }}
                className="flex items-center justify-center text-xs font-medium text-muted-foreground border border-border bg-muted/20"
              />
              <div
                style={{ width: cellSize, height: cellSize }}
                className="flex items-center justify-center text-xs font-medium text-muted-foreground border border-border bg-muted/20"
              >
                ε
              </div>
              {str2.split('').map((char, idx) => (
                <div
                  key={idx}
                  style={{ width: cellSize, height: cellSize }}
                  className={cn(
                    'flex items-center justify-center text-xs font-medium border border-border',
                    j !== undefined && idx === j - 1
                      ? 'bg-info/20 text-info'
                      : 'bg-muted/20 text-muted-foreground'
                  )}
                >
                  {char}
                </div>
              ))}
            </div>

            {/* DP rows */}
            {dp.map((row, rowIdx) => (
              <div key={rowIdx} className="flex">
                {/* Row header */}
                <div
                  style={{ width: cellSize, height: cellSize }}
                  className={cn(
                    'flex items-center justify-center text-xs font-medium border border-border',
                    i === rowIdx
                      ? 'bg-secondary/20 text-secondary'
                      : 'bg-muted/20 text-muted-foreground'
                  )}
                >
                  {rowIdx === 0 ? 'ε' : str1[rowIdx - 1]}
                </div>

                {/* DP cells */}
                {row.map((val, colIdx) => {
                  const isCurrentCell = i === rowIdx && j === colIdx;
                  const isOnBacktrackPath = backtrackPath?.some(
                    (p) => p.i === rowIdx && p.j === colIdx
                  );
                  const isMatchedCell = backtrackPath?.some(
                    (p) => p.i === rowIdx && p.j === colIdx && p.matched
                  );

                  return (
                    <div
                      key={colIdx}
                      style={{ width: cellSize, height: cellSize }}
                      className={cn(
                        'flex items-center justify-center text-xs font-mono border transition-colors',
                        isCurrentCell
                          ? kind === 'match'
                            ? 'bg-success/30 border-success text-success font-bold'
                            : kind === 'no-match'
                            ? 'bg-warning/30 border-warning text-warning font-bold'
                            : 'bg-primary/30 border-primary text-primary'
                          : isMatchedCell && isBacktracking
                          ? 'bg-success/30 border-success text-success font-bold'
                          : isOnBacktrackPath && isBacktracking
                          ? 'bg-info/20 border-info text-info'
                          : val > 0
                          ? 'bg-primary/10 border-border text-foreground'
                          : 'bg-background/50 border-border text-muted-foreground'
                      )}
                    >
                      {val}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Result */}
        {isBacktracking && lcsStr !== undefined && (
          <div className="p-3 bg-success/10 border border-success/30 rounded-lg">
            <p className="text-sm font-medium text-success">
              LCS: "{lcsStr}" (Length: {lcsLength})
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-success/30 border border-success" />
            <span className="text-muted-foreground">Match</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-warning/30 border border-warning" />
            <span className="text-muted-foreground">No Match</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-info/20 border border-info" />
            <span className="text-muted-foreground">Backtrack Path</span>
          </div>
        </div>
      </div>
    </div>
  );
}
