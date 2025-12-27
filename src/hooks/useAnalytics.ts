import { useMemo } from 'react';
import { Habit } from '@/types';
import {
    calculateMonthlyCompletion,
    calculateTotalHabits,
    calculateBestStreak,
    calculateConsistencyScore,
    getSmartReminderStatus,
    getHabitChartData,
    getProgressChartData
} from '@/utils';

interface UseAnalyticsReturn {
    monthlyCompletion: number;
    totalHabits: number;
    bestStreak: number;
    consistencyScore: number;
    smartReminderStatus: 'on-track' | 'needs-focus' | 'hidden';
    habitChartData: { name: string; value: number }[];
    progressChartData: number[];
}

export function useAnalytics(
    habits: Habit[],
    daysInMonth: number,
    todayDay: number | null
): UseAnalyticsReturn {
    const monthlyCompletion = useMemo(
        () => calculateMonthlyCompletion(habits, daysInMonth),
        [habits, daysInMonth]
    );

    const totalHabits = useMemo(
        () => calculateTotalHabits(habits),
        [habits]
    );

    const bestStreak = useMemo(
        () => calculateBestStreak(habits, daysInMonth),
        [habits, daysInMonth]
    );

    const consistencyScore = useMemo(
        () => calculateConsistencyScore(habits, todayDay, daysInMonth),
        [habits, todayDay, daysInMonth]
    );

    const smartReminderStatus = useMemo(
        () => getSmartReminderStatus(habits, todayDay, daysInMonth),
        [habits, todayDay, daysInMonth]
    );

    const habitChartData = useMemo(
        () => getHabitChartData(habits, daysInMonth),
        [habits, daysInMonth]
    );

    const progressChartData = useMemo(
        () => getProgressChartData(habits, daysInMonth),
        [habits, daysInMonth]
    );

    return {
        monthlyCompletion,
        totalHabits,
        bestStreak,
        consistencyScore,
        smartReminderStatus,
        habitChartData,
        progressChartData
    };
}
