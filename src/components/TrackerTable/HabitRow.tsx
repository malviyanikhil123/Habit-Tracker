import toast from 'react-hot-toast';
import { Habit } from '@/types';

interface HabitRowProps {
    habit: Habit;
    daysInMonth: number;
    todayDay: number | null;
    onNameChange: (habitId: string, name: string) => void;
    onDelete: (habitId: string) => void;
    onToggleDay: (habitId: string, day: number) => void;
}

export function HabitRow({
    habit,
    daysInMonth,
    todayDay,
    onNameChange,
    onDelete,
    onToggleDay
}: HabitRowProps) {
    const total = habit.days.slice(0, daysInMonth).filter(d => d).length;
    const progress = Math.round((total / daysInMonth) * 100);

    const handleDelete = () => {
        const habitName = habit.name || 'Unnamed habit';
        toast((t) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontWeight: 500 }}>
                    🗑️ Delete "{habitName}"?
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '1px solid #A6E3E9',
                            background: '#CBF1F5',
                            cursor: 'pointer',
                            fontWeight: 500,
                            color: '#2f2f2f',
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            onDelete(habit.id);
                            toast.success(`"${habitName}" deleted`);
                        }}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#e57373',
                            color: '#fff',
                            cursor: 'pointer',
                            fontWeight: 500,
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>
        ), { duration: Infinity });
    };

    return (
        <tr>
            {/* Habit name cell */}
            <td className="habit-name-cell" style={{ backgroundColor: '#CBF1F5' }}>
                <div className="habit-name-cell-content">
                    <input
                        type="text"
                        className="habit-name-input"
                        value={habit.name}
                        placeholder="Enter habit name..."
                        onChange={(e) => onNameChange(habit.id, e.target.value)}
                    />
                    <button
                        className="delete-habit-btn"
                        onClick={handleDelete}
                        title="Delete habit"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            </td>

            {/* Day checkboxes */}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const isPastDay = todayDay !== null && day < todayDay;
                const isToday = todayDay === day;
                const isWeekStart = day === 8 || day === 15 || day === 22 || day === 29;

                const classNames = [
                    'checkbox-cell',
                    isPastDay ? 'past-day' : '',
                    isToday ? 'today-column' : '',
                    isWeekStart ? 'week-start' : ''
                ].filter(Boolean).join(' ');

                return (
                    <td key={day} className={classNames} data-day={day}>
                        <input
                            type="checkbox"
                            checked={habit.days[day - 1]}
                            disabled={isPastDay}
                            onChange={() => onToggleDay(habit.id, day)}
                        />
                    </td>
                );
            })}

            {/* Total cell */}
            <td className="total-cell">{total}</td>

            {/* Progress cell */}
            <td className="progress-cell">{progress}%</td>
        </tr>
    );
}
