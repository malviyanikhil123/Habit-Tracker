import { useState, useCallback, useMemo } from 'react';
import { Habit, StorageData } from '@/types';
import { getDaysInMonth } from '@/utils';
import { STORAGE_KEY } from '@/constants';

interface UseHabitsReturn {
    habits: Habit[];
    currentMonth: number;
    currentYear: number;
    daysInMonth: number;
    todayDay: number | null;
    addHabit: () => void;
    deleteHabit: (habitId: number) => void;
    updateHabitName: (habitId: number, newName: string) => void;
    toggleDay: (habitId: number, day: number) => void;
    resetMonth: () => void;
    hasAnyChecked: boolean;
}

function loadFromStorage(): { habits: Habit[]; currentMonth: number; currentYear: number } {
    const now = new Date();
    const defaultMonth = now.getMonth();
    const defaultYear = now.getFullYear();

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const data: StorageData = JSON.parse(stored);

            // Check if we need to reset for a new month
            if (data.currentMonth !== now.getMonth() || data.currentYear !== now.getFullYear()) {
                // New month detected - reset days but keep habits
                return {
                    habits: data.habits.map(h => ({
                        ...h,
                        days: Array(31).fill(false)
                    })),
                    currentMonth: defaultMonth,
                    currentYear: defaultYear
                };
            }

            return {
                habits: data.habits || [],
                currentMonth: data.currentMonth,
                currentYear: data.currentYear
            };
        }
    } catch (e) {
        console.error('Error loading from localStorage:', e);
    }

    return { habits: [], currentMonth: defaultMonth, currentYear: defaultYear };
}

function saveToStorage(habits: Habit[], currentMonth: number, currentYear: number): void {
    const data: StorageData = { habits, currentMonth, currentYear };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useHabits(): UseHabitsReturn {
    const [state, setState] = useState(() => {
        const { habits, currentMonth, currentYear } = loadFromStorage();
        return {
            habits,
            currentMonth,
            currentYear
        };
    });

    const daysInMonth = useMemo(
        () => getDaysInMonth(state.currentYear, state.currentMonth),
        [state.currentYear, state.currentMonth]
    );

    const todayDay = useMemo(() => {
        const now = new Date();
        if (now.getMonth() === state.currentMonth && now.getFullYear() === state.currentYear) {
            return now.getDate();
        }
        return null;
    }, [state.currentMonth, state.currentYear]);

    const hasAnyChecked = useMemo(
        () => state.habits.some(habit => habit.days.slice(0, daysInMonth).some(day => day === true)),
        [state.habits, daysInMonth]
    );

    const addHabit = useCallback(() => {
        setState(prev => {
            const newHabits = [
                ...prev.habits,
                {
                    id: Date.now(),
                    name: '',
                    days: Array(31).fill(false)
                }
            ];
            saveToStorage(newHabits, prev.currentMonth, prev.currentYear);
            return { ...prev, habits: newHabits };
        });
    }, []);

    const deleteHabit = useCallback((habitId: number) => {
        setState(prev => {
            const newHabits = prev.habits.filter(h => h.id !== habitId);
            saveToStorage(newHabits, prev.currentMonth, prev.currentYear);
            return { ...prev, habits: newHabits };
        });
    }, []);

    const updateHabitName = useCallback((habitId: number, newName: string) => {
        setState(prev => {
            const newHabits = prev.habits.map(h =>
                h.id === habitId ? { ...h, name: newName } : h
            );
            saveToStorage(newHabits, prev.currentMonth, prev.currentYear);
            return { ...prev, habits: newHabits };
        });
    }, []);

    const toggleDay = useCallback((habitId: number, day: number) => {
        setState(prev => {
            // Only allow toggling for today and future days
            const now = new Date();
            let todayDayNum: number | null = null;
            if (now.getMonth() === prev.currentMonth && now.getFullYear() === prev.currentYear) {
                todayDayNum = now.getDate();
            }

            if (todayDayNum !== null && day < todayDayNum) {
                return prev; // Don't allow changes for past days
            }

            const newHabits = prev.habits.map(h => {
                if (h.id === habitId) {
                    const newDays = [...h.days];
                    newDays[day - 1] = !newDays[day - 1];
                    return { ...h, days: newDays };
                }
                return h;
            });
            saveToStorage(newHabits, prev.currentMonth, prev.currentYear);
            return { ...prev, habits: newHabits };
        });
    }, []);

    const resetMonth = useCallback(() => {
        setState(prev => {
            const newHabits = prev.habits.map(h => ({
                ...h,
                days: Array(31).fill(false)
            }));
            saveToStorage(newHabits, prev.currentMonth, prev.currentYear);
            return { ...prev, habits: newHabits };
        });
    }, []);

    return {
        habits: state.habits,
        currentMonth: state.currentMonth,
        currentYear: state.currentYear,
        daysInMonth,
        todayDay,
        addHabit,
        deleteHabit,
        updateHabitName,
        toggleDay,
        resetMonth,
        hasAnyChecked
    };
}
