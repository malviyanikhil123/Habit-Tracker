interface AddHabitButtonProps {
    onClick: () => void;
}

export function AddHabitButton({ onClick }: AddHabitButtonProps) {
    return (
        <button className="add-habit-btn" onClick={onClick}>
            + Add Habit
        </button>
    );
}
