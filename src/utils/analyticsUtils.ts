import { Habit } from '@/types';

/**
 * Calculate monthly completion percentage
 */
export function calculateMonthlyCompletion(habits: Habit[], daysInMonth: number): number {
    if (habits.length === 0) return 0;

    let totalProgress = 0;
    habits.forEach(habit => {
        const completed = habit.days.slice(0, daysInMonth).filter(d => d).length;
        totalProgress += (completed / daysInMonth) * 100;
    });

    return Math.round(totalProgress / habits.length);
}

/**
 * Calculate total named habits
 */
export function calculateTotalHabits(habits: Habit[]): number {
    return habits.filter(h => h.name.trim() !== '').length;
}

/**
 * Calculate best streak across all habits
 */
export function calculateBestStreak(habits: Habit[], daysInMonth: number): number {
    let maxStreak = 0;

    habits.forEach(habit => {
        let currentStreak = 0;
        let bestStreakForHabit = 0;

        for (let i = 0; i < daysInMonth; i++) {
            if (habit.days[i]) {
                currentStreak++;
                bestStreakForHabit = Math.max(bestStreakForHabit, currentStreak);
            } else {
                currentStreak = 0;
            }
        }

        maxStreak = Math.max(maxStreak, bestStreakForHabit);
    });

    return maxStreak;
}

/**
 * Calculate consistency score
 */
export function calculateConsistencyScore(
    habits: Habit[],
    todayDay: number | null,
    daysInMonth: number
): number {
    if (habits.length === 0) return 0;

    const today = todayDay ?? daysInMonth;
    const totalPossible = habits.length * today;
    let totalCompleted = 0;

    habits.forEach(habit => {
        totalCompleted += habit.days.slice(0, today).filter(d => d).length;
    });

    return Math.round((totalCompleted / totalPossible) * 100);
}

/**
 * Check if any checkbox is checked
 */
export function hasAnyCheckedBox(habits: Habit[], daysInMonth: number): boolean {
    return habits.some(habit => habit.days.slice(0, daysInMonth).some(day => day === true));
}

/**
 * Determine smart reminder status
 */
export function getSmartReminderStatus(
    habits: Habit[],
    todayDay: number | null,
    daysInMonth: number
): 'on-track' | 'needs-focus' | 'hidden' {
    if (todayDay === null || habits.length === 0) {
        return 'hidden';
    }

    const expectedProgress = (todayDay / daysInMonth) * 100;

    let totalProgress = 0;
    habits.forEach(habit => {
        const completed = habit.days.slice(0, daysInMonth).filter(d => d).length;
        totalProgress += (completed / daysInMonth) * 100;
    });
    const actualProgress = totalProgress / habits.length;

    return actualProgress >= expectedProgress ? 'on-track' : 'needs-focus';
}

/**
 * Calculate week progress
 */
export function calculateWeekProgress(
    habits: Habit[],
    weekStart: number,
    weekEnd: number,
    daysInMonth: number
): number {
    const actualEnd = Math.min(weekEnd, daysInMonth);
    const daysInWeek = actualEnd - weekStart + 1;
    const totalPossible = habits.length * daysInWeek;

    if (totalPossible === 0) return 0;

    let totalCompleted = 0;
    habits.forEach(habit => {
        for (let day = weekStart; day <= actualEnd; day++) {
            if (habit.days[day - 1]) {
                totalCompleted++;
            }
        }
    });

    return Math.round((totalCompleted / totalPossible) * 100);
}

/**
 * Get chart data for habits bar chart
 */
export function getHabitChartData(habits: Habit[], daysInMonth: number) {
    return habits
        .filter(h => (h.name || '').trim() !== '')
        .map(h => ({
            name: h.name,
            value: h.days.slice(0, daysInMonth).filter(Boolean).length
        }));
}

/**
 * Get progress line chart data
 * Shows daily completion percentage (what % of habits were completed each day)
 */
export function getProgressChartData(habits: Habit[], daysInMonth: number): number[] {
    const points: number[] = [];

    if (habits.length === 0) {
        return points;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        let completedCount = 0;
        habits.forEach(h => {
            if (h.days[day - 1]) {
                completedCount++;
            }
        });
        const pct = (completedCount / habits.length) * 100;
        points.push(pct);
    }

    return points;
}
