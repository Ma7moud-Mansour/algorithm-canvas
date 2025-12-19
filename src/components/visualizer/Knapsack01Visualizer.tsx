import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { VisualizationStep } from '@/types/algorithm';

interface Knapsack01VisualizerProps {
  currentStep: VisualizationStep | null;
  className?: string;
}

export function Knapsack01Visualizer({ currentStep, className }: Knapsack01VisualizerProps) {
  const { dp, i, w, weights, values, capacity, selectedItems, maxValue, chosen, kind } = useMemo(() => {
    if (!currentStep?.payload) {
      return { dp: [], weights: [], values: [], capacity: 0 };
    }
    return currentStep.payload as {
      dp: number[][];
      i?: number;
      w?: number;
      weights: number[];
      values: number[];
      capacity: number;
      selectedItems?: number[];
      maxValue?: number;
      chosen?: string;
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

  const n = weights?.length || 0;
  const cellSize = 36;

  return (
    <div className={cn('glass-panel p-4 overflow-auto', className)}>
      <div className="flex flex-col gap-4">
        {/* Items Display */}
        <div className="flex flex-wrap gap-2">
          {weights?.map((weight, idx) => (
            <div
              key={idx}
              className={cn(
                'px-3 py-2 rounded-lg border text-xs font-mono transition-colors',
                selectedItems?.includes(idx)
                  ? 'bg-success/20 border-success text-success'
                  : i !== undefined && idx === i - 1
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'bg-muted/30 border-border text-muted-foreground'
              )}
            >
              Item {idx + 1}: w={weight}, v={values?.[idx]}
            </div>
          ))}
        </div>

        {/* DP Table */}
        <div className="overflow-auto">
          <div className="inline-block">
            {/* Header row with capacity values */}
            <div className="flex">
              <div
                style={{ width: cellSize, height: cellSize }}
                className="flex items-center justify-center text-xs font-medium text-muted-foreground border border-border bg-muted/20"
              />
              {Array.from({ length: (capacity || 0) + 1 }, (_, c) => (
                <div
                  key={c}
                  style={{ width: cellSize, height: cellSize }}
                  className={cn(
                    'flex items-center justify-center text-xs font-medium border border-border',
                    w === c ? 'bg-info/20 text-info' : 'bg-muted/20 text-muted-foreground'
                  )}
                >
                  {c}
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
                    i === rowIdx ? 'bg-secondary/20 text-secondary' : 'bg-muted/20 text-muted-foreground'
                  )}
                >
                  {rowIdx}
                </div>

                {/* DP cells */}
                {row.map((val, colIdx) => {
                  const isCurrentCell = i === rowIdx && w === colIdx;
                  const isSelected =
                    currentStep?.kind === 'complete' &&
                    selectedItems?.some((itemIdx) => {
                      let cap = capacity || 0;
                      for (const si of selectedItems) {
                        if (si === itemIdx && rowIdx === si + 1) {
                          if (colIdx <= cap && colIdx > cap - (weights?.[si] || 0)) return true;
                        }
                        cap -= weights?.[si] || 0;
                      }
                      return false;
                    });

                  return (
                    <div
                      key={colIdx}
                      style={{ width: cellSize, height: cellSize }}
                      className={cn(
                        'flex items-center justify-center text-xs font-mono border transition-colors',
                        isCurrentCell
                          ? kind === 'update'
                            ? chosen === 'include'
                              ? 'bg-success/30 border-success text-success font-bold'
                              : 'bg-warning/30 border-warning text-warning font-bold'
                            : kind === 'skip'
                            ? 'bg-destructive/20 border-destructive text-destructive'
                            : 'bg-primary/30 border-primary text-primary'
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
        {currentStep?.kind === 'complete' && (
          <div className="p-3 bg-success/10 border border-success/30 rounded-lg">
            <p className="text-sm font-medium text-success">
              Maximum Value: {maxValue}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Selected Items: {selectedItems?.map((i) => `Item ${i + 1}`).join(', ') || 'None'}
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-success/30 border border-success" />
            <span className="text-muted-foreground">Include</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-warning/30 border border-warning" />
            <span className="text-muted-foreground">Exclude</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-destructive/20 border border-destructive" />
            <span className="text-muted-foreground">Too Heavy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
