import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { VisualizationStep } from '@/types/algorithm';

interface DPVisualizerProps {
  currentStep: VisualizationStep | null;
  className?: string;
}

export function DPVisualizer({ currentStep, className }: DPVisualizerProps) {
  const { dp, n, currentIndex, result, prev1Index, prev2Index } = useMemo(() => {
    if (!currentStep) {
      return {
        dp: [] as number[],
        n: 0,
        currentIndex: -1,
        result: -1,
        prev1Index: -1,
        prev2Index: -1,
      };
    }

    const payload = currentStep.payload as Record<string, unknown>;
    const dpTable = (payload.dp as number[]) || [];
    const i = (payload.i as number) ?? -1;

    return {
      dp: dpTable,
      n: (payload.n as number) || 0,
      currentIndex: i,
      result: (payload.result as number) ?? -1,
      prev1Index: i >= 2 ? i - 1 : -1,
      prev2Index: i >= 2 ? i - 2 : -1,
    };
  }, [currentStep]);

  if (dp.length === 0) {
    return (
      <div className={cn('glass-panel flex items-center justify-center', className)}>
        <p className="text-muted-foreground">No data to visualize</p>
      </div>
    );
  }

  const isComplete = currentStep?.kind === 'complete';

  return (
    <div className={cn('glass-panel p-4', className)}>
      <div className="h-full flex flex-col items-center justify-center gap-6">
        {/* Title */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">
            Fibonacci DP Table
          </h3>
          <p className="text-sm text-muted-foreground">
            Computing F({n})
          </p>
        </div>

        {/* DP Table visualization */}
        <div className="flex flex-wrap gap-2 justify-center max-w-full overflow-x-auto p-2">
          {dp.map((value, index) => {
            const isCurrent = index === currentIndex;
            const isPrev1 = index === prev1Index && currentIndex >= 2;
            const isPrev2 = index === prev2Index && currentIndex >= 2;
            const isResult = isComplete && index === n;
            const isFilled = value !== undefined && value !== null;

            return (
              <div
                key={index}
                className={cn(
                  'flex flex-col items-center gap-1 transition-all duration-300'
                )}
              >
                {/* Index label */}
                <span className={cn(
                  'text-xs font-mono',
                  isCurrent ? 'text-primary font-bold' : 'text-muted-foreground'
                )}>
                  F({index})
                </span>

                {/* Value cell */}
                <div
                  className={cn(
                    'w-12 h-12 flex items-center justify-center rounded-lg border-2 transition-all duration-300 font-mono font-bold',
                    isResult && 'bg-success border-success text-success-foreground scale-110 animate-pulse',
                    isCurrent && !isResult && 'bg-primary border-primary text-primary-foreground scale-105',
                    isPrev1 && !isCurrent && 'bg-secondary border-secondary text-secondary-foreground',
                    isPrev2 && !isCurrent && 'bg-info border-info text-foreground',
                    !isCurrent && !isPrev1 && !isPrev2 && !isResult && isFilled && 'bg-muted border-muted-foreground/30',
                    !isFilled && 'border-dashed border-muted-foreground/30'
                  )}
                >
                  {isFilled ? value : '?'}
                </div>

                {/* Arrow indicator for dependencies */}
                {(isPrev1 || isPrev2) && currentIndex >= 2 && (
                  <span className="text-xs text-muted-foreground">↗</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Formula display */}
        {currentIndex >= 2 && !isComplete && (
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="font-mono text-sm">
              <span className="text-primary">F({currentIndex})</span>
              {' = '}
              <span className="text-secondary">F({currentIndex - 1})</span>
              {' + '}
              <span className="text-info">F({currentIndex - 2})</span>
              {' = '}
              <span className="text-secondary">{dp[currentIndex - 1]}</span>
              {' + '}
              <span className="text-info">{dp[currentIndex - 2]}</span>
              {' = '}
              <span className="text-primary font-bold">{dp[currentIndex]}</span>
            </p>
          </div>
        )}

        {/* Result display */}
        {isComplete && (
          <div className="text-center p-4 bg-success/20 rounded-lg border border-success">
            <p className="text-lg font-bold text-success">
              Fibonacci({n}) = {result}
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground justify-center">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-primary rounded" />
            <span>Current</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-secondary rounded" />
            <span>F(i-1)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-info rounded" />
            <span>F(i-2)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-success rounded" />
            <span>Result</span>
          </div>
        </div>
      </div>
    </div>
  );
}