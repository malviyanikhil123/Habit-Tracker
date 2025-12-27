/**
 * NewUserOnboarding Component
 * 
 * Shows a welcome screen for new users with suggested habits and routines.
 * Users can select which habits they want to track and set up their daily routine.
 */

import { useState } from 'react';
import { DEFAULT_HABIT_SUGGESTIONS, createMultipleHabits } from '@/services/habitService';
import { DEFAULT_ROUTINE_SUGGESTIONS, RoutineTaskSuggestion } from '@/constants/routines';
import { RoutineItem, DailyRoutines } from '@/types';

interface NewUserOnboardingProps {
    userId: string;
    userName: string;
    onComplete: (customRoutines?: DailyRoutines) => void;
}

type OnboardingStep = 'habits' | 'routine';

export const NewUserOnboarding = ({ userId, userName, onComplete }: NewUserOnboardingProps) => {
    const [step, setStep] = useState<OnboardingStep>('habits');
    const [selectedHabits, setSelectedHabits] = useState<Set<string>>(new Set());
    const [customHabit, setCustomHabit] = useState('');
    const [customHabits, setCustomHabits] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Routine selection state
    const [selectedRoutineTasks, setSelectedRoutineTasks] = useState<Set<string>>(new Set());
    const [customRoutineTask, setCustomRoutineTask] = useState('');
    const [customRoutineTasks, setCustomRoutineTasks] = useState<RoutineTaskSuggestion[]>([]);

    // Group habits by category
    const habitsByCategory = DEFAULT_HABIT_SUGGESTIONS.reduce((acc, habit) => {
        if (!acc[habit.category]) {
            acc[habit.category] = [];
        }
        acc[habit.category].push(habit);
        return acc;
    }, {} as Record<string, typeof DEFAULT_HABIT_SUGGESTIONS>);

    // Group routines by category
    const routinesByCategory = DEFAULT_ROUTINE_SUGGESTIONS.reduce((acc, routine) => {
        if (!acc[routine.category]) {
            acc[routine.category] = [];
        }
        acc[routine.category].push(routine);
        return acc;
    }, {} as Record<string, RoutineTaskSuggestion[]>);

    const toggleHabit = (title: string) => {
        setSelectedHabits(prev => {
            const newSet = new Set(prev);
            if (newSet.has(title)) {
                newSet.delete(title);
            } else {
                newSet.add(title);
            }
            return newSet;
        });
    };

    const toggleRoutineTask = (task: string) => {
        setSelectedRoutineTasks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(task)) {
                newSet.delete(task);
            } else {
                newSet.add(task);
            }
            return newSet;
        });
    };

    const addCustomHabit = () => {
        if (customHabit.trim() && !customHabits.includes(customHabit.trim())) {
            setCustomHabits(prev => [...prev, customHabit.trim()]);
            setSelectedHabits(prev => new Set([...prev, customHabit.trim()]));
            setCustomHabit('');
        }
    };

    const removeCustomHabit = (habit: string) => {
        setCustomHabits(prev => prev.filter(h => h !== habit));
        setSelectedHabits(prev => {
            const newSet = new Set(prev);
            newSet.delete(habit);
            return newSet;
        });
    };

    const addCustomRoutineTask = () => {
        if (customRoutineTask.trim()) {
            const newTask: RoutineTaskSuggestion = {
                task: customRoutineTask.trim(),
                icon: '📌',
                type: 'break',
                category: 'Custom',
                defaultTime: '9:00 AM – 10:00 AM'
            };
            setCustomRoutineTasks(prev => [...prev, newTask]);
            setSelectedRoutineTasks(prev => new Set([...prev, customRoutineTask.trim()]));
            setCustomRoutineTask('');
        }
    };

    const removeCustomRoutineTask = (task: string) => {
        setCustomRoutineTasks(prev => prev.filter(t => t.task !== task));
        setSelectedRoutineTasks(prev => {
            const newSet = new Set(prev);
            newSet.delete(task);
            return newSet;
        });
    };

    // Generate daily routines from selected tasks
    const generateRoutinesFromSelection = (): DailyRoutines => {
        const allSuggestions = [...DEFAULT_ROUTINE_SUGGESTIONS, ...customRoutineTasks];
        const selectedItems: RoutineItem[] = allSuggestions
            .filter(s => selectedRoutineTasks.has(s.task))
            .map(s => ({
                time: s.defaultTime || '9:00 AM – 10:00 AM',
                task: s.task,
                icon: s.icon,
                type: s.type
            }))
            .sort((a, b) => {
                // Sort by time
                const getMinutes = (time: string) => {
                    const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
                    if (!match) return 0;
                    let hours = parseInt(match[1]);
                    const mins = parseInt(match[2]);
                    const period = match[3].toUpperCase();
                    if (period === 'PM' && hours !== 12) hours += 12;
                    if (period === 'AM' && hours === 12) hours = 0;
                    return hours * 60 + mins;
                };
                return getMinutes(a.time) - getMinutes(b.time);
            });

        // Apply same routine to all weekdays, with slight variation for weekends
        const weekdayRoutine = selectedItems;
        const weekendRoutine = selectedItems.filter(item =>
            item.type !== 'work' || item.task.toLowerCase().includes('project')
        );

        return {
            monday: weekdayRoutine,
            tuesday: weekdayRoutine,
            wednesday: weekdayRoutine,
            thursday: weekdayRoutine,
            friday: weekdayRoutine,
            saturday: weekendRoutine.length > 0 ? weekendRoutine : weekdayRoutine,
            sunday: weekendRoutine.length > 0 ? weekendRoutine : weekdayRoutine
        };
    };

    const handleNextStep = () => {
        if (step === 'habits') {
            setStep('routine');
        }
    };

    const handlePrevStep = () => {
        if (step === 'routine') {
            setStep('habits');
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError('');

        try {
            // Create habits if any selected
            if (selectedHabits.size > 0) {
                const result = await createMultipleHabits(Array.from(selectedHabits), userId);
                if (!result.success) {
                    throw new Error(result.error);
                }
            }

            // Generate routines if any selected
            let customRoutines: DailyRoutines | undefined;
            if (selectedRoutineTasks.size > 0) {
                customRoutines = generateRoutinesFromSelection();
            }

            onComplete(customRoutines);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to set up your tracker');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkip = () => {
        if (step === 'habits') {
            setStep('routine');
        } else {
            onComplete();
        }
    };

    const handleSkipAll = () => {
        onComplete();
    };

    return (
        <div className="onboarding-overlay">
            <div className="onboarding-modal">
                <div className="onboarding-header">
                    {step === 'habits' ? (
                        <>
                            <h1>🎯 Welcome, {userName}!</h1>
                            <p>Let's set up your habit tracker. Choose the habits you want to track:</p>
                        </>
                    ) : (
                        <>
                            <h1>📅 Set Up Your Daily Routine</h1>
                            <p>Select activities to build your personalized daily schedule:</p>
                        </>
                    )}

                    {/* Step Indicator */}
                    <div className="step-indicator">
                        <div className={`step ${step === 'habits' ? 'active' : 'completed'}`}>
                            <span className="step-number">1</span>
                            <span className="step-label">Habits</span>
                        </div>
                        <div className="step-line"></div>
                        <div className={`step ${step === 'routine' ? 'active' : ''}`}>
                            <span className="step-number">2</span>
                            <span className="step-label">Routine</span>
                        </div>
                    </div>
                </div>

                <div className="onboarding-content">
                    {step === 'habits' ? (
                        <>
                            {/* Habit Categories */}
                            {Object.entries(habitsByCategory).map(([category, habits]) => (
                                <div key={category} className="habit-category">
                                    <h3 className="category-title">{category}</h3>
                                    <div className="habit-options">
                                        {habits.map(habit => (
                                            <button
                                                key={habit.title}
                                                className={`habit-option ${selectedHabits.has(habit.title) ? 'selected' : ''}`}
                                                onClick={() => toggleHabit(habit.title)}
                                            >
                                                <span className="habit-option-text">{habit.title}</span>
                                                {selectedHabits.has(habit.title) && (
                                                    <span className="habit-option-check">✓</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* Custom Habits */}
                            <div className="habit-category">
                                <h3 className="category-title">Custom Habits</h3>
                                <div className="custom-habit-input">
                                    <input
                                        type="text"
                                        value={customHabit}
                                        onChange={(e) => setCustomHabit(e.target.value)}
                                        placeholder="Add your own habit..."
                                        onKeyDown={(e) => e.key === 'Enter' && addCustomHabit()}
                                    />
                                    <button onClick={addCustomHabit} className="add-custom-btn">
                                        + Add
                                    </button>
                                </div>
                                {customHabits.length > 0 && (
                                    <div className="habit-options">
                                        {customHabits.map(habit => (
                                            <button
                                                key={habit}
                                                className="habit-option selected custom"
                                                onClick={() => removeCustomHabit(habit)}
                                            >
                                                <span className="habit-option-text">{habit}</span>
                                                <span className="habit-option-remove">×</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Routine Categories */}
                            {Object.entries(routinesByCategory).map(([category, routines]) => (
                                <div key={category} className="habit-category routine-category">
                                    <h3 className="category-title">{category}</h3>
                                    <div className="habit-options routine-options">
                                        {routines.map(routine => (
                                            <button
                                                key={routine.task}
                                                className={`habit-option routine-option ${selectedRoutineTasks.has(routine.task) ? 'selected' : ''}`}
                                                onClick={() => toggleRoutineTask(routine.task)}
                                            >
                                                <span className="routine-icon">{routine.icon}</span>
                                                <span className="habit-option-text">{routine.task}</span>
                                                {routine.defaultTime && (
                                                    <span className="routine-time">{routine.defaultTime}</span>
                                                )}
                                                {selectedRoutineTasks.has(routine.task) && (
                                                    <span className="habit-option-check">✓</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* Custom Routine Tasks */}
                            <div className="habit-category">
                                <h3 className="category-title">Custom Tasks</h3>
                                <div className="custom-habit-input">
                                    <input
                                        type="text"
                                        value={customRoutineTask}
                                        onChange={(e) => setCustomRoutineTask(e.target.value)}
                                        placeholder="Add your own routine task..."
                                        onKeyDown={(e) => e.key === 'Enter' && addCustomRoutineTask()}
                                    />
                                    <button onClick={addCustomRoutineTask} className="add-custom-btn">
                                        + Add
                                    </button>
                                </div>
                                {customRoutineTasks.length > 0 && (
                                    <div className="habit-options">
                                        {customRoutineTasks.map(routine => (
                                            <button
                                                key={routine.task}
                                                className="habit-option selected custom"
                                                onClick={() => removeCustomRoutineTask(routine.task)}
                                            >
                                                <span className="routine-icon">{routine.icon}</span>
                                                <span className="habit-option-text">{routine.task}</span>
                                                <span className="habit-option-remove">×</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {error && <div className="onboarding-error">{error}</div>}

                <div className="onboarding-footer">
                    <div className="selected-count">
                        {step === 'habits'
                            ? `${selectedHabits.size} habit${selectedHabits.size !== 1 ? 's' : ''} selected`
                            : `${selectedRoutineTasks.size} task${selectedRoutineTasks.size !== 1 ? 's' : ''} selected`
                        }
                    </div>
                    <div className="onboarding-actions">
                        {step === 'routine' && (
                            <button
                                className="back-btn"
                                onClick={handlePrevStep}
                                disabled={isLoading}
                            >
                                ← Back
                            </button>
                        )}
                        <button
                            className="skip-btn"
                            onClick={step === 'habits' ? handleSkipAll : handleSkip}
                            disabled={isLoading}
                        >
                            {step === 'habits' ? 'Skip All' : 'Skip Routine'}
                        </button>
                        {step === 'habits' ? (
                            <button
                                className="start-btn"
                                onClick={handleNextStep}
                            >
                                Next: Daily Routine →
                            </button>
                        ) : (
                            <button
                                className="start-btn"
                                onClick={handleSubmit}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Setting up...' : 'Start Tracking 🚀'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
