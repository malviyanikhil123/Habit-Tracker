import { useState } from 'react';
import toast from 'react-hot-toast';
import { ScheduleType, RoutineItem, DailyRoutines } from '@/types';
import { useDayGroups } from '@/hooks';
import { RoutineSchedule } from './RoutineSchedule';
import { CurrentTaskHighlight } from './CurrentTaskHighlight';
import { RoutineEditor } from './RoutineEditor';
import { DayGroupConfigModal } from './DayGroupConfigModal';

interface DailyRoutineProps {
    scheduleType: ScheduleType;
    activeTab: ScheduleType;
    setActiveTab: (tab: ScheduleType) => void;
    currentTask: RoutineItem | null;
    routines: DailyRoutines;
    hasCustomRoutines: boolean;
    resetToDefaultRoutines: () => void;
    onUpdateRoutines: (scheduleType: ScheduleType, routines: RoutineItem[]) => void;
}

export function DailyRoutine({
    activeTab,
    setActiveTab,
    currentTask,
    routines,
    hasCustomRoutines,
    resetToDefaultRoutines,
    onUpdateRoutines
}: DailyRoutineProps) {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingScheduleType, setEditingScheduleType] = useState<ScheduleType>('monday');
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        // Remember collapse state in localStorage, default to collapsed (true)
        const saved = localStorage.getItem('dailyRoutine_collapsed');
        return saved === null ? true : saved === 'true';
    });
    const { dayGroups, getCurrentGroup } = useDayGroups();

    // Get the current active group
    const activeGroup = getCurrentGroup(activeTab);

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('dailyRoutine_collapsed', String(newState));
    };

    const handleEditRoutine = (scheduleType: ScheduleType) => {
        setEditingScheduleType(scheduleType);
        setIsEditorOpen(true);
    };

    const handleSaveRoutine = (updatedRoutines: RoutineItem[]) => {
        onUpdateRoutines(editingScheduleType, updatedRoutines);
    };

    const handleResetRoutines = () => {
        toast((t) => (
            <div className="toast-confirm">
                <span>Reset to default routine?</span>
                <div className="toast-buttons">
                    <button
                        className="toast-btn toast-cancel"
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Cancel
                    </button>
                    <button
                        className="toast-btn toast-delete"
                        onClick={() => {
                            resetToDefaultRoutines();
                            toast.dismiss(t.id);
                            toast.success('Routine reset to default!', { icon: '🔄' });
                        }}
                    >
                        Reset
                    </button>
                </div>
            </div>
        ), {
            duration: Infinity,
            position: 'top-center'
        });
    };

    return (
        <section className={`daily-routine-section ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="routine-header">
                <div className="routine-header-left">
                    <button
                        className="routine-collapse-btn"
                        onClick={toggleCollapse}
                        title={isCollapsed ? 'Show Daily Routine' : 'Hide Daily Routine'}
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
                        >
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                    <span className="routine-icon">🗓️</span>
                    <h2>Daily Routine</h2>
                    {hasCustomRoutines && (
                        <span className="custom-routine-badge">Custom</span>
                    )}
                </div>
                <div className="routine-day-indicator">
                    {!isCollapsed && (
                        <>
                            <button
                                className="routine-config-btn"
                                onClick={() => setIsConfigOpen(true)}
                                title="Day Group Settings"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M12 1v6m0 6v6M1 12h6m6 0h6" />
                                </svg>
                            </button>
                            {hasCustomRoutines && (
                                <button
                                    className="reset-routine-btn"
                                    onClick={handleResetRoutines}
                                    title="Reset to default routine"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                        <path d="M3 3v5h5" />
                                    </svg>
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {!isCollapsed && (
                <>
                    <div className="routine-tabs">
                        {dayGroups.map(group => (
                            <button
                                key={group.id}
                                className={`routine-tab ${activeGroup?.id === group.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(group.days[0])}
                            >
                                {group.label}
                            </button>
                        ))}
                        <button
                            className="routine-tab edit-tab"
                            onClick={() => handleEditRoutine(activeTab)}
                            title="Edit current routine"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                        </button>
                    </div>

                    <div className="routine-content">
                        {dayGroups.map(group => {
                            // Use the first day in the group for display
                            const displayDay = group.days[0];
                            const isActive = activeGroup?.id === group.id;

                            return (
                                <RoutineSchedule
                                    key={group.id}
                                    scheduleType={displayDay}
                                    items={routines[displayDay]}
                                    isActive={isActive}
                                    currentTask={isActive ? currentTask : null}
                                />
                            );
                        })}
                    </div>

                    <CurrentTaskHighlight currentTask={currentTask} />
                </>
            )}

            {isEditorOpen && (
                <RoutineEditor
                    routines={routines[editingScheduleType]}
                    onSave={handleSaveRoutine}
                    onClose={() => setIsEditorOpen(false)}
                    dayLabel={activeGroup?.label || ''}
                />
            )}

            <DayGroupConfigModal
                isOpen={isConfigOpen}
                onClose={() => setIsConfigOpen(false)}
            />
        </section>
    );
}
