import { Habit } from '@/types';
import { TableHeader } from './TableHeader';
import { HabitRow } from './HabitRow';

interface TrackerTableProps {
    habits: Habit[];
    daysInMonth: number;
    todayDay: number | null;
    onNameChange: (habitId: string, name: string) => void;
    onDelete: (habitId: string) => void;
    onToggleDay: (habitId: string, day: number) => void;
}

export function TrackerTable({
    habits,
    daysInMonth,
    todayDay,
    onNameChange,
    onDelete,
    onToggleDay
}: TrackerTableProps) {
    // Show horizontal scrollbar only if more than 10 habits
    const showHorizontalScroll = habits.length > 10;

    return (
        <div
            className={`tracker-wrapper ${showHorizontalScroll ? 'show-horizontal-scroll' : ''}`}
        >
            <table className="tracker-table" id="trackerTable">
                <TableHeader daysInMonth={daysInMonth} todayDay={todayDay} />
                <tbody id="habitRows">
                    {habits.map(habit => (
                        <HabitRow
                            key={habit.id}
                            habit={habit}
                            daysInMonth={daysInMonth}
                            todayDay={todayDay}
                            onNameChange={onNameChange}
                            onDelete={onDelete}
                            onToggleDay={onToggleDay}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
