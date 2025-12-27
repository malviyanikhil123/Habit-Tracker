import { useEffect, useRef } from 'react';
import { renderLineChart } from '@/utils';

interface ProgressLineChartProps {
    data: number[];
    daysInMonth: number;
}

export function ProgressLineChart({ data, daysInMonth }: ProgressLineChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current) {
            renderLineChart(canvasRef.current, data, daysInMonth);
        }
    }, [data, daysInMonth]);

    // Handle resize
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                renderLineChart(canvasRef.current, data, daysInMonth);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [data, daysInMonth]);

    return (
        <div className="chart-card">
            <div className="chart-header">
                <h2 className="chart-title">Progress % over days</h2>
            </div>
            <div className="chart-canvas-wrap">
                <canvas ref={canvasRef} height={220} />
            </div>
        </div>
    );
}
