import { useEffect, useRef } from 'react';
import { renderBarChart } from '@/utils';

interface HabitBarChartProps {
    data: { name: string; value: number }[];
}

export function HabitBarChart({ data }: HabitBarChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current) {
            renderBarChart(canvasRef.current, data);
        }
    }, [data]);

    // Handle resize
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                renderBarChart(canvasRef.current, data);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [data]);

    return (
        <div className="chart-card">
            <div className="chart-header">
                <h2 className="chart-title">Total completion per habit</h2>
            </div>
            <div className="chart-canvas-wrap">
                <canvas ref={canvasRef} height={220} />
            </div>
        </div>
    );
}
