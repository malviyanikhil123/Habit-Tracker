import { HabitBarChart } from './HabitBarChart';
import { ProgressLineChart } from './ProgressLineChart';

interface ChartsProps {
    habitChartData: { name: string; value: number }[];
    progressChartData: number[];
    daysInMonth: number;
}

export function Charts({ habitChartData, progressChartData, daysInMonth }: ChartsProps) {
    return (
        <section className="charts" aria-label="Habit charts">
            <HabitBarChart data={habitChartData} />
            <ProgressLineChart data={progressChartData} daysInMonth={daysInMonth} />
        </section>
    );
}
