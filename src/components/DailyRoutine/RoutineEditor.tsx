import { useState } from 'react';
import { RoutineItem, RoutineType } from '@/types';
import toast from 'react-hot-toast';

interface RoutineEditorProps {
    routines: RoutineItem[];
    onSave: (routines: RoutineItem[]) => void;
    onClose: () => void;
    dayLabel: string;
}

const ROUTINE_TYPES: { value: RoutineType; label: string; icon: string }[] = [
    { value: 'morning', label: 'Morning', icon: '🌅' },
    { value: 'study', label: 'Study', icon: '📚' },
    { value: 'work', label: 'Work', icon: '🏢' },
    { value: 'project', label: 'Project', icon: '💻' },
    { value: 'break', label: 'Break', icon: '☕' },
    { value: 'evening', label: 'Evening', icon: '🌆' },
    { value: 'night', label: 'Night', icon: '🌙' }
];

export function RoutineEditor({ routines, onSave, onClose, dayLabel }: RoutineEditorProps) {
    const [editedRoutines, setEditedRoutines] = useState<RoutineItem[]>(routines);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const handleAddRoutine = () => {
        const newRoutine: RoutineItem = {
            time: '9:00 AM – 10:00 AM',
            task: 'New Task',
            icon: '📝',
            type: 'work'
        };
        setEditedRoutines([...editedRoutines, newRoutine]);
        setEditingIndex(editedRoutines.length);
    };

    const handleUpdateRoutine = (index: number, field: keyof RoutineItem, value: string) => {
        const updated = [...editedRoutines];
        updated[index] = { ...updated[index], [field]: value } as RoutineItem;
        setEditedRoutines(updated);
    };

    const handleDeleteRoutine = (index: number) => {
        const updated = editedRoutines.filter((_, i) => i !== index);
        setEditedRoutines(updated);
        setEditingIndex(null);
        toast.success('Routine item removed');
    };

    const handleSave = () => {
        if (editedRoutines.length === 0) {
            toast.error('Please add at least one routine item');
            return;
        }
        onSave(editedRoutines);
        toast.success('Routine saved successfully!');
        onClose();
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        const updated = [...editedRoutines];
        [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
        setEditedRoutines(updated);
    };

    const moveDown = (index: number) => {
        if (index === editedRoutines.length - 1) return;
        const updated = [...editedRoutines];
        [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
        setEditedRoutines(updated);
    };

    return (
        <div className="routine-editor-overlay" onClick={onClose}>
            <div className="routine-editor-modal" onClick={(e) => e.stopPropagation()}>
                <div className="routine-editor-header">
                    <h3>Edit Routine - {dayLabel}</h3>
                    <button className="close-btn" onClick={onClose} title="Close">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="routine-editor-content">
                    {editedRoutines.map((routine, index) => (
                        <div key={index} className={`routine-edit-item ${editingIndex === index ? 'editing' : ''}`}>
                            <div className="routine-edit-controls">
                                <button
                                    className="control-btn"
                                    onClick={() => moveUp(index)}
                                    disabled={index === 0}
                                    title="Move up"
                                >
                                    ↑
                                </button>
                                <button
                                    className="control-btn"
                                    onClick={() => moveDown(index)}
                                    disabled={index === editedRoutines.length - 1}
                                    title="Move down"
                                >
                                    ↓
                                </button>
                            </div>

                            <div className="routine-edit-fields">
                                <input
                                    type="text"
                                    className="routine-input time-input"
                                    value={routine.time}
                                    onChange={(e) => handleUpdateRoutine(index, 'time', e.target.value)}
                                    placeholder="9:00 AM – 10:00 AM"
                                    onFocus={() => setEditingIndex(index)}
                                />
                                <input
                                    type="text"
                                    className="routine-input icon-input"
                                    value={routine.icon}
                                    onChange={(e) => handleUpdateRoutine(index, 'icon', e.target.value)}
                                    placeholder="📝"
                                    maxLength={2}
                                    onFocus={() => setEditingIndex(index)}
                                />
                                <input
                                    type="text"
                                    className="routine-input task-input"
                                    value={routine.task}
                                    onChange={(e) => handleUpdateRoutine(index, 'task', e.target.value)}
                                    placeholder="Task name"
                                    onFocus={() => setEditingIndex(index)}
                                />
                                <select
                                    className="routine-select"
                                    value={routine.type}
                                    onChange={(e) => handleUpdateRoutine(index, 'type', e.target.value)}
                                    onFocus={() => setEditingIndex(index)}
                                >
                                    {ROUTINE_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.icon} {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                className="delete-routine-btn"
                                onClick={() => handleDeleteRoutine(index)}
                                title="Delete"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                            </button>
                        </div>
                    ))}

                    <button className="add-routine-btn" onClick={handleAddRoutine}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add New Routine Item
                    </button>
                </div>

                <div className="routine-editor-footer">
                    <button className="editor-btn cancel-btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="editor-btn save-btn" onClick={handleSave}>
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
