import { WEEK_HEADER_RANGES } from '@/constants';

interface TableHeaderProps {
    daysInMonth: number;
    todayDay: number | null;
}

export function TableHeader({ daysInMonth, todayDay }: TableHeaderProps) {
    // Calculate week headers
    const weekHeaders = WEEK_HEADER_RANGES
        .filter(w => w.start <= daysInMonth)
        .map(w => ({
            ...w,
            actualEnd: Math.min(w.end, daysInMonth),
            span: Math.min(w.end, daysInMonth) - w.start + 1,
            isCurrent: todayDay !== null && todayDay >= w.start && todayDay <= Math.min(w.end, daysInMonth)
        }));

    return (
        <thead>
            {/* Week Headers Row */}
            <tr className="week-header-row">
                <th className="sticky-habit-header">Habit</th>
                {weekHeaders.map(week => (
                    <th
                        key={week.name}
                        colSpan={week.span}
                        className={`week-header ${week.isCurrent ? 'current-week' : ''}`}
                    >
                        {week.name}
                    </th>
                ))}
                <th className="sticky-total-header">Total</th>
                <th className="sticky-progress-header">Progress</th>
            </tr>

            {/* Day Numbers Row */}
            <tr className="day-header-row">
                <th className="sticky-habit-header">Name</th>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                    const isWeekStart = day === 8 || day === 15 || day === 22 || day === 29;
                    const isToday = todayDay === day;

                    const classNames = [
                        isWeekStart ? 'week-start' : '',
                        isToday ? 'today-column' : ''
                    ].filter(Boolean).join(' ');

                    return (
                        <th key={day} data-day={day} className={classNames || undefined}>
                            {day}
                        </th>
                    );
                })}
                <th className="sticky-total-header">Total</th>
                <th className="sticky-progress-header">Progress</th>
            </tr>
        </thead>
    );
}
