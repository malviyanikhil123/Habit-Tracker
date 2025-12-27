/**
 * useHabits Hook - Supabase Integration
 * 
 * Manages habit data using Supabase as the backend.
 * All data is stored in the cloud and synced in real-time.
 * 
 * Features:
 * - CRUD operations for habits
 * - Daily completion tracking via habit_logs
 * - Automatic user association via user_id
 * - Loading and error states
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { getDaysInMonth } from '@/utils';
import {
    getHabits,
    createHabit,
    updateHabit as updateHabitService,
    deleteHabit as deleteHabitService,
    getHabitLogsByHabitIds,
    toggleHabitLog,
    deleteHabitLogsForMonth
} from '@/services/habitService';
import type { Habit as SupabaseHabit, HabitLog } from '@/types/database';

// Local habit type that includes computed days array
export interface LocalHabit {
    id: string;           // UUID from Supabase
    name: string;         // Habit title
    days: boolean[];      // Computed from habit_logs for current month
}

interface UseHabitsReturn {
    habits: LocalHabit[];
    currentMonth: number;
    currentYear: number;
    daysInMonth: number;
    todayDay: number | null;
    addHabit: () => Promise<void>;
    deleteHabit: (habitId: string) => Promise<void>;
    updateHabitName: (habitId: string, newName: string) => Promise<void>;
    toggleDay: (habitId: string, day: number) => Promise<void>;
    resetMonth: () => Promise<void>;
    hasAnyChecked: boolean;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

interface UseHabitsProps {
    userId: string | null;
}

export function useHabits({ userId }: UseHabitsProps): UseHabitsReturn {
    const now = new Date();
    const [currentMonth] = useState(now.getMonth());
    const [currentYear] = useState(now.getFullYear());

    // Store raw Supabase data
    const [supabaseHabits, setSupabaseHabits] = useState<SupabaseHabit[]>([]);
    const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);

    // Loading and error states
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const daysInMonth = useMemo(
        () => getDaysInMonth(currentYear, currentMonth),
        [currentYear, currentMonth]
    );

    const todayDay = useMemo(() => {
        if (now.getMonth() === currentMonth && now.getFullYear() === currentYear) {
            return now.getDate();
        }
        return null;
    }, [currentMonth, currentYear]);

    /**
     * Convert Supabase habits + logs to local habit format
     * Computes the days array from habit_logs
     */
    const habits: LocalHabit[] = useMemo(() => {
        return supabaseHabits.map(habit => {
            // Create days array from logs
            const days = Array(31).fill(false);

            habitLogs
                .filter(log => log.habit_id === habit.id)
                .forEach(log => {
                    // Parse date string directly to avoid timezone issues
                    // log_date format is "YYYY-MM-DD"
                    const dateParts = log.log_date.split('-');
                    const dayIndex = parseInt(dateParts[2], 10) - 1;
                    if (dayIndex >= 0 && dayIndex < 31) {
                        days[dayIndex] = log.status;
                    }
                });

            return {
                id: habit.id,
                name: habit.title,
                days
            };
        });
    }, [supabaseHabits, habitLogs]);

    const hasAnyChecked = useMemo(
        () => habits.some(habit => habit.days.slice(0, daysInMonth).some(day => day === true)),
        [habits, daysInMonth]
    );

    /**
     * Fetch habits and logs from Supabase
     */
    const fetchData = useCallback(async () => {
        if (!userId) {
            setSupabaseHabits([]);
            setHabitLogs([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Fetch habits
            const habitsResult = await getHabits();
            if (!habitsResult.success) {
                throw new Error(habitsResult.error);
            }

            const fetchedHabits = habitsResult.data || [];
            setSupabaseHabits(fetchedHabits);

            // Fetch logs for these habits
            if (fetchedHabits.length > 0) {
                const habitIds = fetchedHabits.map(h => h.id);
                const logsResult = await getHabitLogsByHabitIds(habitIds, currentYear, currentMonth);

                if (!logsResult.success) {
                    throw new Error(logsResult.error);
                }

                setHabitLogs(logsResult.data || []);
            } else {
                setHabitLogs([]);
            }
        } catch (err) {
            console.error('Error fetching habits:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch habits');
        } finally {
            setIsLoading(false);
        }
    }, [userId, currentYear, currentMonth]);

    // Reset loading state when userId changes (to prevent race condition on login)
    useEffect(() => {
        if (userId) {
            setIsLoading(true);
        }
    }, [userId]);

    // Fetch data on mount and when userId changes
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    /**
     * Add a new habit
     */
    const addHabit = useCallback(async () => {
        if (!userId) return;

        try {
            const result = await createHabit('', userId);
            if (!result.success) {
                throw new Error(result.error);
            }

            // Add to local state
            if (result.data) {
                setSupabaseHabits(prev => [...prev, result.data!]);
            }
        } catch (err) {
            console.error('Error adding habit:', err);
            setError(err instanceof Error ? err.message : 'Failed to add habit');
        }
    }, [userId]);

    /**
     * Delete a habit
     */
    const deleteHabit = useCallback(async (habitId: string) => {
        try {
            const result = await deleteHabitService(habitId);
            if (!result.success) {
                throw new Error(result.error);
            }

            // Remove from local state
            setSupabaseHabits(prev => prev.filter(h => h.id !== habitId));
            setHabitLogs(prev => prev.filter(l => l.habit_id !== habitId));
        } catch (err) {
            console.error('Error deleting habit:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete habit');
        }
    }, []);

    /**
     * Update a habit's name
     */
    const updateHabitName = useCallback(async (habitId: string, newName: string) => {
        try {
            const result = await updateHabitService(habitId, newName);
            if (!result.success) {
                throw new Error(result.error);
            }

            // Update local state
            setSupabaseHabits(prev =>
                prev.map(h => h.id === habitId ? { ...h, title: newName } : h)
            );
        } catch (err) {
            console.error('Error updating habit:', err);
            setError(err instanceof Error ? err.message : 'Failed to update habit');
        }
    }, []);

    /**
     * Toggle a day's completion status
     */
    const toggleDay = useCallback(async (habitId: string, day: number) => {
        // Only allow toggling for today and future days
        if (todayDay !== null && day < todayDay) {
            return; // Don't allow changes for past days
        }

        // Calculate the date string manually to avoid timezone issues
        // Format: YYYY-MM-DD (month is 0-indexed, so add 1)
        const year = currentYear;
        const month = String(currentMonth + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateString = `${year}-${month}-${dayStr}`;

        // Get current status
        const currentLog = habitLogs.find(
            l => l.habit_id === habitId && l.log_date === dateString
        );
        const newStatus = !currentLog?.status;

        try {
            const result = await toggleHabitLog(habitId, dateString, newStatus);
            if (!result.success) {
                throw new Error(result.error);
            }

            // Update local state
            if (result.data) {
                setHabitLogs(prev => {
                    const existing = prev.find(l => l.id === result.data!.id);
                    if (existing) {
                        return prev.map(l => l.id === result.data!.id ? result.data! : l);
                    }
                    return [...prev, result.data!];
                });
            }
        } catch (err) {
            console.error('Error toggling day:', err);
            setError(err instanceof Error ? err.message : 'Failed to toggle day');
        }
    }, [habitLogs, todayDay, currentYear, currentMonth]);

    /**
     * Reset all habits for the current month
     */
    const resetMonth = useCallback(async () => {
        if (supabaseHabits.length === 0) return;

        try {
            const habitIds = supabaseHabits.map(h => h.id);
            const result = await deleteHabitLogsForMonth(habitIds, currentYear, currentMonth);

            if (!result.success) {
                throw new Error(result.error);
            }

            // Clear logs from local state
            setHabitLogs([]);
        } catch (err) {
            console.error('Error resetting month:', err);
            setError(err instanceof Error ? err.message : 'Failed to reset month');
        }
    }, [supabaseHabits, currentYear, currentMonth]);

    return {
        habits,
        currentMonth,
        currentYear,
        daysInMonth,
        todayDay,
        addHabit,
        deleteHabit,
        updateHabitName,
        toggleDay,
        resetMonth,
        hasAnyChecked,
        isLoading,
        error,
        refetch: fetchData
    };
}
