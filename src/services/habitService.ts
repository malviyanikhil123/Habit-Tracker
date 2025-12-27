/**
 * Habit Service
 * 
 * Handles all habit-related database operations using Supabase.
 * All operations are secured with Row Level Security (RLS).
 * 
 * Features:
 * - CRUD operations for habits
 * - Habit log management for tracking daily completion
 * - Automatic user_id association (via RLS)
 */

import { supabase } from '@/lib/supabase';
import type {
    Habit,
    HabitInsert,
    HabitLog,
    HabitLogInsert
} from '@/types/database';

// Result type for service operations
export interface ServiceResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// ============================================
// HABIT CRUD OPERATIONS
// ============================================

/**
 * Fetch all habits for the current user
 * RLS automatically filters to show only the user's habits
 * 
 * @returns Array of habits
 */
export const getHabits = async (): Promise<ServiceResult<Habit[]>> => {
    try {
        const { data, error } = await supabase
            .from('habits')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data: data || [] };
    } catch (err) {
        return { success: false, error: 'Failed to fetch habits' };
    }
};

/**
 * Create a new habit for the current user
 * user_id is automatically set via RLS policy
 * 
 * @param title - The habit title/name
 * @returns The created habit
 */
export const createHabit = async (
    title: string,
    userId: string
): Promise<ServiceResult<Habit>> => {
    try {
        const habitData: HabitInsert = {
            title,
            user_id: userId
        };

        const { data, error } = await supabase
            .from('habits')
            .insert(habitData)
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (err) {
        return { success: false, error: 'Failed to create habit' };
    }
};

/**
 * Update a habit's title
 * RLS ensures users can only update their own habits
 * 
 * @param habitId - The habit ID to update
 * @param title - The new title
 * @returns The updated habit
 */
export const updateHabit = async (
    habitId: string,
    title: string
): Promise<ServiceResult<Habit>> => {
    try {
        const { data, error } = await supabase
            .from('habits')
            .update({
                title,
                updated_at: new Date().toISOString()
            })
            .eq('id', habitId)
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (err) {
        return { success: false, error: 'Failed to update habit' };
    }
};

/**
 * Delete a habit and all associated logs
 * RLS ensures users can only delete their own habits
 * 
 * @param habitId - The habit ID to delete
 * @returns Success status
 */
export const deleteHabit = async (
    habitId: string
): Promise<ServiceResult<void>> => {
    try {
        // First delete all habit logs (cascade should handle this, but being explicit)
        await supabase
            .from('habit_logs')
            .delete()
            .eq('habit_id', habitId);

        // Then delete the habit
        const { error } = await supabase
            .from('habits')
            .delete()
            .eq('id', habitId);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err) {
        return { success: false, error: 'Failed to delete habit' };
    }
};

// ============================================
// HABIT LOG OPERATIONS
// ============================================

/**
 * Get all habit logs for a specific month
 * Used to display completion status in the tracker
 * 
 * @param year - The year (e.g., 2025)
 * @param month - The month (0-11)
 * @returns Array of habit logs
 */
export const getHabitLogsForMonth = async (
    year: number,
    month: number
): Promise<ServiceResult<HabitLog[]>> => {
    try {
        // Calculate date range for the month
        const startDate = new Date(year, month, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('habit_logs')
            .select('*')
            .gte('log_date', startDate)
            .lte('log_date', endDate);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data: data || [] };
    } catch (err) {
        return { success: false, error: 'Failed to fetch habit logs' };
    }
};

/**
 * Toggle a habit's completion status for a specific date
 * Creates a new log if none exists, updates if it does
 * 
 * @param habitId - The habit ID
 * @param date - The date (YYYY-MM-DD format)
 * @param status - The completion status
 * @returns The created/updated habit log
 */
export const toggleHabitLog = async (
    habitId: string,
    date: string,
    status: boolean
): Promise<ServiceResult<HabitLog>> => {
    try {
        // Check if a log already exists for this date
        const { data: existingLog } = await supabase
            .from('habit_logs')
            .select('*')
            .eq('habit_id', habitId)
            .eq('log_date', date)
            .single();

        if (existingLog) {
            // Update existing log
            const { data, error } = await supabase
                .from('habit_logs')
                .update({ status })
                .eq('id', existingLog.id)
                .select()
                .single();

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true, data };
        } else {
            // Create new log
            const logData: HabitLogInsert = {
                habit_id: habitId,
                log_date: date,
                status
            };

            const { data, error } = await supabase
                .from('habit_logs')
                .insert(logData)
                .select()
                .single();

            if (error) {
                return { success: false, error: error.message };
            }

            return { success: true, data };
        }
    } catch (err) {
        return { success: false, error: 'Failed to update habit log' };
    }
};

/**
 * Get all habit logs for specific habit IDs
 * Useful for fetching logs only for the user's habits
 * 
 * @param habitIds - Array of habit IDs
 * @param year - The year
 * @param month - The month (0-11)
 * @returns Array of habit logs
 */
export const getHabitLogsByHabitIds = async (
    habitIds: string[],
    year: number,
    month: number
): Promise<ServiceResult<HabitLog[]>> => {
    try {
        if (habitIds.length === 0) {
            return { success: true, data: [] };
        }

        const startDate = new Date(year, month, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('habit_logs')
            .select('*')
            .in('habit_id', habitIds)
            .gte('log_date', startDate)
            .lte('log_date', endDate);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data: data || [] };
    } catch (err) {
        return { success: false, error: 'Failed to fetch habit logs' };
    }
};

/**
 * Delete all habit logs for a specific month
 * Used when resetting the month
 * 
 * @param habitIds - Array of habit IDs to reset
 * @param year - The year
 * @param month - The month (0-11)
 * @returns Success status
 */
export const deleteHabitLogsForMonth = async (
    habitIds: string[],
    year: number,
    month: number
): Promise<ServiceResult<void>> => {
    try {
        if (habitIds.length === 0) {
            return { success: true };
        }

        const startDate = new Date(year, month, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

        const { error } = await supabase
            .from('habit_logs')
            .delete()
            .in('habit_id', habitIds)
            .gte('log_date', startDate)
            .lte('log_date', endDate);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err) {
        return { success: false, error: 'Failed to delete habit logs' };
    }
};

// ============================================
// DEFAULT HABITS FOR NEW USERS
// ============================================

/**
 * Default habit suggestions for new users
 * Users can choose which ones to add
 */
export const DEFAULT_HABIT_SUGGESTIONS = [
    { title: '💧 Drink 8 glasses of water', category: 'Health' },
    { title: '🏃 Exercise for 30 minutes', category: 'Health' },
    { title: '📚 Read for 20 minutes', category: 'Learning' },
    { title: '🧘 Meditate for 10 minutes', category: 'Wellness' },
    { title: '😴 Sleep 8 hours', category: 'Health' },
    { title: '🥗 Eat healthy meals', category: 'Health' },
    { title: '📝 Journal/Reflect', category: 'Wellness' },
    { title: '💻 Code practice', category: 'Learning' },
    { title: '🚶 Walk 10,000 steps', category: 'Health' },
    { title: '📵 No social media for 2 hours', category: 'Productivity' },
    { title: '🌅 Wake up early', category: 'Productivity' },
    { title: '🎯 Complete top 3 priorities', category: 'Productivity' },
];

/**
 * Create multiple habits at once for a user
 * Used for onboarding new users with their selected habits
 * 
 * @param titles - Array of habit titles to create
 * @param userId - The user's ID
 * @returns Array of created habits
 */
export const createMultipleHabits = async (
    titles: string[],
    userId: string
): Promise<ServiceResult<Habit[]>> => {
    try {
        if (titles.length === 0) {
            return { success: true, data: [] };
        }

        const habitsData: HabitInsert[] = titles.map(title => ({
            title,
            user_id: userId
        }));

        const { data, error } = await supabase
            .from('habits')
            .insert(habitsData)
            .select();

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data: data || [] };
    } catch (err) {
        return { success: false, error: 'Failed to create habits' };
    }
};
