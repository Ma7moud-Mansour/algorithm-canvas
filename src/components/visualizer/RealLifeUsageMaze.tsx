import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Play, RotateCcw } from 'lucide-react';

export function RealLifeUsageMaze() {
    const [grid, setGrid] = useState<number[][]>([]);
    const [currentPos, setCurrentPos] = useState<{ r: number; c: number } | null>(null);
    const [pathStack, setPathStack] = useState<{ r: number; c: number }[]>([]);
    const [visited, setVisited] = useState<boolean[][]>([]);
    const [failedPaths, setFailedPaths] = useState<boolean[][]>([]); // To color RED
    const [successPath, setSuccessPath] = useState<boolean[][]>([]); // To color GREEN
    const [message, setMessage] = useState<string>('');
    const [isRunning, setIsRunning] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    const size = 5;
    const start = { r: 0, c: 0 };
    const end = { r: size - 1, c: size - 1 };

    // Fixed maze for the scenario
    // 0: Free, 1: Blocked
    const initialMaze = [
        [0, 0, 0, 1, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 1, 0],
        [1, 0, 1, 1, 0],
        [1, 0, 0, 0, 0]
    ];

    const directions = [
        { r: 0, c: 1 }, // Right
        { r: 1, c: 0 }, // Down
        { r: 0, c: -1 }, // Left
        { r: -1, c: 0 } // Up
    ];

    useEffect(() => {
        resetSimulation();
    }, []);

    const resetSimulation = () => {
        setGrid(initialMaze);
        setCurrentPos(start);
        setPathStack([start]);
        setVisited(Array(size).fill(0).map(() => Array(size).fill(false)));
        setFailedPaths(Array(size).fill(0).map(() => Array(size).fill(false)));
        setSuccessPath(Array(size).fill(0).map(() => Array(size).fill(false)));
        setMessage('دوس "ابدأ" عشان نشوف هنوصل إزاي');
        setIsRunning(false);
        setIsFinished(false);
    };

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const runSimulation = async () => {
        if (isRunning) return;
        setIsRunning(true);
        setIsFinished(false);
        setMessage('تمام، نبدأ الرحلة...');

        // Reset needed states but keep grid
        const visitedState = Array(size).fill(0).map(() => Array(size).fill(false));
        const failedState = Array(size).fill(0).map(() => Array(size).fill(false));
        const successState = Array(size).fill(0).map(() => Array(size).fill(false));

        setVisited(visitedState);
        setFailedPaths(failedState);
        setSuccessPath(successState);
        setPathStack([start]);

        await solve(start.r, start.c, visitedState, failedState, successState);

        setIsRunning(false);
        setIsFinished(true);
    };

    const solve = async (r: number, c: number, visitedState: boolean[][], failedState: boolean[][], successState: boolean[][]): Promise<boolean> => {
        setCurrentPos({ r, c });
        visitedState[r][c] = true;
        setVisited([...visitedState]);

        // Check if reached destination
        if (r === end.r && c === end.c) {
            successState[r][c] = true;
            setSuccessPath([...successState]);
            setMessage('كده وصلنا 👌\nالخوارزمية فضلت تجرب طرق مختلفة\nوأي طريق كان مقفول كانت بترجع\nلحد ما لقت الطريق اللي يوصل');
            return true;
        }

        setMessage('خلينا نجرب من هنا');
        await delay(600);

        for (const dir of directions) {
            const nr = r + dir.r;
            const nc = c + dir.c;

            if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
                if (grid[nr][nc] === 1) {
                    // Blocked
                    // Visual only: maybe blink red?
                } else if (!visitedState[nr][nc]) {
                    // Try moving
                    setPathStack(prev => [...prev, { r: nr, c: nc }]);

                    if (await solve(nr, nc, visitedState, failedState, successState)) {
                        successState[r][c] = true;
                        setSuccessPath([...successState]);
                        return true;
                    }

                    // Backtrack
                    setMessage('الطريق ده طلع مقفول');
                    await delay(800);

                    setMessage('نرجع خطوة كده');
                    setCurrentPos({ r, c }); // Back to current
                    setPathStack(prev => prev.slice(0, -1));
                    await delay(800);

                    setMessage('خلينا نجرب طريق تاني');
                    await delay(600);
                }
            }
        }

        // If we are here, no path found from this cell
        failedState[r][c] = true;
        setFailedPaths([...failedState]);
        setMessage('لا، كده مش هنوصل');
        await delay(600);
        return false;
    };

    return (
        <div className="mt-4 p-4 border-2 border-primary/20 rounded-lg bg-background/50">
            <h4 className="text-lg font-bold mb-4 text-center text-primary">رحلة البحث عن الطريق</h4>

            <div className="flex flex-col items-center gap-4">
                {/* Grid */}
                <div className="grid gap-1 p-2 bg-slate-900/10 rounded-lg"
                    style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
                    {grid.map((row, r) => (
                        row.map((cell, c) => {
                            const isStart = r === start.r && c === start.c;
                            const isEnd = r === end.r && c === end.c;
                            const isCurrent = currentPos?.r === r && currentPos?.c === c;
                            const isWall = cell === 1;
                            const isFailed = failedPaths[r][c];
                            const isSuccess = successPath[r][c];
                            const isPathParams = pathStack.some(p => p.r === r && p.c === c);

                            let bgClass = 'bg-slate-100 dark:bg-slate-800';
                            if (isWall) bgClass = 'bg-slate-900 dark:bg-black';
                            else if (isSuccess) bgClass = 'bg-green-500';
                            else if (isFailed) bgClass = 'bg-red-500/50';
                            else if (isPathParams) bgClass = 'bg-blue-400/50';

                            return (
                                <div
                                    key={`${r}-${c}`}
                                    className={cn(
                                        "w-10 h-10 flex items-center justify-center text-lg rounded-sm transition-colors duration-300 border border-slate-200 dark:border-slate-700",
                                        bgClass
                                    )}
                                >
                                    {isCurrent && <span className="animate-pulse">🐀</span>}
                                    {!isCurrent && isStart && '🟢'}
                                    {!isCurrent && isEnd && '🔵'}
                                    {isWall && '⬛'}
                                </div>
                            );
                        })
                    ))}
                </div>

                {/* Message Box */}
                <div className="min-h-[80px] w-full p-3 bg-muted/30 rounded-lg text-center dir-rtl">
                    <p className="text-sm md:text-base font-medium whitespace-pre-line dir-rtl" style={{ direction: 'rtl' }}>
                        {message}
                    </p>
                </div>

                {/* Controls */}
                <div className="flex gap-2">
                    {!isRunning && !isFinished && (
                        <Button onClick={runSimulation} className="bg-green-600 hover:bg-green-700">
                            <Play className="w-4 h-4 mr-2" />
                            ابدأ
                        </Button>
                    )}
                    {isFinished && (
                        <Button onClick={resetSimulation} variant="outline">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            عيدي تاني
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
