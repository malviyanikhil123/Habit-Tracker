import { Habit } from '@/types';
import { TableHeader } from './TableHeader';
import { HabitRow } from './HabitRow';

interface TrackerTableProps {
    habits: Habit[];
    daysInMonth: number;
    todayDay: number | null;
    onNameChange: (habitId: number, name: string) => void;
    onDelete: (habitId: number) => void;
    onToggleDay: (habitId: number, day: number) => void;
}

export function TrackerTable({
    habits,
    daysInMonth,
    todayDay,
    onNameChange,
    onDelete,
    onToggleDay
}: TrackerTableProps) {
    return (
        <div className="tracker-wrapper">
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
