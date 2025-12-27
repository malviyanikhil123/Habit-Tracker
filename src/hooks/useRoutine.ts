import { useState, useEffect, useMemo, useCallback } from 'react';
import { RoutineItem, ScheduleType, DailyRoutines } from '@/types';
import { getCurrentDayName, getTodayDayOfWeek, parseTimeRange, getCurrentMinutes } from '@/utils';

const CUSTOM_ROUTINES_KEY = 'habitTracker_customRoutines';

// Empty routines for when user hasn't created any
const EMPTY_ROUTINES: DailyRoutines = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: []
};

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

interface UseRoutineParams {
    userId: string | null;
}

export function useRoutine({ userId }: UseRoutineParams): UseRoutineReturn {
    const [activeTab, setActiveTab] = useState<ScheduleType>('monday');
    const [currentTask, setCurrentTask] = useState<RoutineItem | null>(null);

    // Get user-specific routine key
    const getRoutineKey = (uid: string | null) => {
        return uid ? `${CUSTOM_ROUTINES_KEY}_${uid}` : CUSTOM_ROUTINES_KEY;
    };

    const [customRoutines, setCustomRoutinesState] = useState<DailyRoutines | null>(() => {
        if (!userId) return null;
        const saved = localStorage.getItem(getRoutineKey(userId));
        return saved ? JSON.parse(saved) : null;
    });

    // Update routines when userId changes
    useEffect(() => {
        if (!userId) {
            setCustomRoutinesState(null);
            return;
        }
        const saved = localStorage.getItem(getRoutineKey(userId));
        setCustomRoutinesState(saved ? JSON.parse(saved) : null);
    }, [userId]);

    const routines = customRoutines || EMPTY_ROUTINES;
    const hasCustomRoutines = customRoutines !== null;

    const setCustomRoutines = useCallback((newRoutines: DailyRoutines) => {
        setCustomRoutinesState(newRoutines);
        if (userId) {
            localStorage.setItem(getRoutineKey(userId), JSON.stringify(newRoutines));
        }
    }, [userId]);

    const resetToDefaultRoutines = useCallback(() => {
        setCustomRoutinesState(null);
        if (userId) {
            localStorage.removeItem(getRoutineKey(userId));
        }
    }, [userId]);

    const updateRoutineForSchedule = useCallback((scheduleType: ScheduleType, newRoutines: RoutineItem[]) => {
        const currentRoutines = customRoutines || EMPTY_ROUTINES;
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
