import { useState, useEffect, useMemo, useCallback } from 'react';
import { RoutineItem, ScheduleType, DailyRoutines } from '@/types';
import { DAILY_ROUTINES } from '@/constants';
import { getCurrentDayName, getTodayDayOfWeek, parseTimeRange, getCurrentMinutes } from '@/utils';

const CUSTOM_ROUTINES_KEY = 'habitTracker_customRoutines';

interface UseRoutineReturn {
    currentDayName: string;
    scheduleType: ScheduleType;
    routineBadge: { text: string; className: string };
    activeTab: ScheduleType;
    setActiveTab: (tab: ScheduleType) => void;
    currentTask: RoutineItem | null;
    routines: DailyRoutines;
    setCustomRoutines: (routines: DailyRoutines) => void;
    hasCustomRoutines: boolean;
    resetToDefaultRoutines: () => void;
    updateRoutineForSchedule: (scheduleType: ScheduleType, routines: RoutineItem[]) => void;
}

export function useRoutine(): UseRoutineReturn {
    const [activeTab, setActiveTab] = useState<ScheduleType>('monday');
    const [currentTask, setCurrentTask] = useState<RoutineItem | null>(null);
    const [customRoutines, setCustomRoutinesState] = useState<DailyRoutines | null>(() => {
        const saved = localStorage.getItem(CUSTOM_ROUTINES_KEY);
        return saved ? JSON.parse(saved) : null;
    });

    const routines = customRoutines || DAILY_ROUTINES;
    const hasCustomRoutines = customRoutines !== null;

    const setCustomRoutines = useCallback((newRoutines: DailyRoutines) => {
        setCustomRoutinesState(newRoutines);
        localStorage.setItem(CUSTOM_ROUTINES_KEY, JSON.stringify(newRoutines));
    }, []);

    const resetToDefaultRoutines = useCallback(() => {
        setCustomRoutinesState(null);
        localStorage.removeItem(CUSTOM_ROUTINES_KEY);
    }, []);

    const updateRoutineForSchedule = useCallback((scheduleType: ScheduleType, newRoutines: RoutineItem[]) => {
        const currentRoutines = customRoutines || DAILY_ROUTINES;
        const updated: DailyRoutines = {
            ...currentRoutines,
            [scheduleType]: newRoutines
        };
        setCustomRoutines(updated);
    }, [customRoutines, setCustomRoutines]);

    const currentDayName = getCurrentDayName();
    const todayDayOfWeek = getTodayDayOfWeek();

    const scheduleType = useMemo((): ScheduleType => {
        const dayMap: { [key: number]: ScheduleType } = {
            0: 'sunday',
            1: 'monday',
            2: 'tuesday',
            3: 'wednesday',
            4: 'thursday',
            5: 'friday',
            6: 'saturday'
        };
        return dayMap[todayDayOfWeek] || 'monday';
    }, [todayDayOfWeek]);

    const routineBadge = useMemo(() => {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = dayNames[todayDayOfWeek];
        const isWeekend = todayDayOfWeek === 0 || todayDayOfWeek === 6;
        return {
            text: dayName,
            className: `routine-badge${isWeekend ? ' weekend' : ''}`
        };
    }, [todayDayOfWeek]);

    // Set initial active tab based on current day
    useEffect(() => {
        setActiveTab(scheduleType);
    }, [scheduleType]);

    // Find current task
    const findCurrentTask = useCallback(() => {
        const currentMinutes = getCurrentMinutes();
        const schedule = routines[scheduleType];

        for (const item of schedule) {
            const { start, end } = parseTimeRange(item.time);
            if (start !== null && end !== null && currentMinutes >= start && currentMinutes < end) {
                return item;
            }
        }
        return null;
    }, [scheduleType, routines]);

    // Update current task periodically
    useEffect(() => {
        const updateTask = () => {
            setCurrentTask(findCurrentTask());
        };

        updateTask();
        const interval = setInterval(updateTask, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [findCurrentTask]);

    return {
        currentDayName,
        scheduleType,
        routineBadge,
        activeTab,
        setActiveTab,
        currentTask,
        routines,
        setCustomRoutines,
        hasCustomRoutines,
        resetToDefaultRoutines,
        updateRoutineForSchedule
    };
}
