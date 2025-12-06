import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { VisualizationStep } from '@/types/algorithm';

interface GridVisualizerProps {
  currentStep: VisualizationStep | null;
  className?: string;
}

export function GridVisualizer({ currentStep, className }: GridVisualizerProps) {
  const { board, n, tryingRow, tryingCol, isSafe, solutionFound } = useMemo(() => {
    if (!currentStep) {
      return {
        board: [] as number[],
        n: 0,
        tryingRow: -1,
        tryingCol: -1,
        isSafe: true,
        solutionFound: false,
      };
    }

    const payload = currentStep.payload as Record<string, unknown>;
    
    return {
      board: (payload.board as number[]) || [],
      n: (payload.n as number) || 0,
      tryingRow: (payload.row as number) ?? -1,
      tryingCol: (payload.col as number) ?? -1,
      isSafe: (payload.safe as boolean) ?? true,
      solutionFound: currentStep.kind === 'solution-found',
    };
  }, [currentStep]);

  if (n === 0) {
    return (
      <div className={cn('glass-panel flex items-center justify-center', className)}>
        <p className="text-muted-foreground">No grid to visualize</p>
      </div>
    );
  }

  // Create grid cells
  const cells = [];
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      const hasQueen = board[row] === col;
      const isTrying = tryingRow === row && tryingCol === col;
      const isInTryingRow = tryingRow === row;
      const isAttacked = hasQueen && isTrying && !isSafe;
      const isDarkSquare = (row + col) % 2 === 1;

      cells.push(
        <div
          key={`${row}-${col}`}
          className={cn(
            'flex items-center justify-center transition-all duration-200',
            'border border-panel-border',
            isDarkSquare ? 'bg-muted/50' : 'bg-background',
            isTrying && isSafe && 'ring-2 ring-success bg-success/20',
            isTrying && !isSafe && 'ring-2 ring-destructive bg-destructive/20',
            isInTryingRow && !isTrying && 'bg-secondary/10',
            solutionFound && hasQueen && 'bg-success/30'
          )}
          style={{
            width: `${Math.min(100 / n, 60)}px`,
            height: `${Math.min(100 / n, 60)}px`,
          }}
        >
          {hasQueen && (
            <span
              className={cn(
                'text-2xl transition-all duration-200',
                solutionFound && 'animate-pulse',
                isAttacked && 'text-destructive'
              )}
            >
              ♛
            </span>
          )}
          {isTrying && !hasQueen && (
            <span
              className={cn(
                'text-2xl opacity-50',
                isSafe ? 'text-success' : 'text-destructive'
              )}
            >
              ♛
            </span>
          )}
        </div>
      );
    }
  }

  return (
    <div className={cn('glass-panel p-4', className)}>
      <div className="h-full flex flex-col items-center justify-center gap-4">
        {/* Chessboard */}
        <div
          className="grid gap-0 border-2 border-panel-border rounded overflow-hidden"
          style={{
            gridTemplateColumns: `repeat(${n}, 1fr)`,
          }}
        >
          {cells}
        </div>

        {/* Status */}
        <div className="text-center">
          {solutionFound && (
            <p className="text-success font-semibold animate-pulse">
              ✓ Solution Found!
            </p>
          )}
          {tryingRow >= 0 && !solutionFound && (
            <p className="text-sm text-muted-foreground">
              Trying row {tryingRow}, column {tryingCol}
              {!isSafe && <span className="text-destructive ml-2">✗ Not safe</span>}
              {isSafe && tryingCol >= 0 && <span className="text-success ml-2">✓ Safe</span>}
            </p>
          )}
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="text-lg">♛</span>
            <span>Queen</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-success/30 border border-success rounded" />
            <span>Safe</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-destructive/30 border border-destructive rounded" />
            <span>Conflict</span>
          </div>
        </div>
      </div>
    </div>
  );
}