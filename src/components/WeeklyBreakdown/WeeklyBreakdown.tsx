import { Habit } from '@/types';
import { WEEK_RANGES } from '@/constants';
import { calculateWeekProgress } from '@/utils';
import { WeekCard } from './WeekCard';

interface WeeklyBreakdownProps {
    habits: Habit[];
    daysInMonth: number;
}

export function WeeklyBreakdown({ habits, daysInMonth }: WeeklyBreakdownProps) {
    const weeks = WEEK_RANGES.map(week => {
        const hasDays = week.start <= daysInMonth;
        const actualEnd = hasDays ? Math.min(week.end, daysInMonth) : null;
        const progress = hasDays ? calculateWeekProgress(habits, week.start, actualEnd!, daysInMonth) : 0;
        const daysLabel = hasDays ? `${week.start}–${actualEnd}` : '—';

        return {
            name: week.name,
            daysLabel,
            progress,
            hasDays
        };
    });

    return (
        <div className="weekly-breakdown">
            <h2>Weekly Breakdown</h2>
            <div className="weeks-container" id="weeksContainer">
                {weeks.map(week => (
                    <WeekCard
                        key={week.name}
                        name={week.name}
                        daysLabel={week.daysLabel}
                        progress={week.progress}
                    />
                ))}
            </div>
        </div>
    );
}
