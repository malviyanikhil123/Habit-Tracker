import { useState, useCallback } from 'react';
import { DayGroup, DayGroupConfig, ScheduleType } from '@/types';

const DAY_GROUPS_KEY = 'habitTracker_dayGroups';

// Default configurations
export const DEFAULT_CONFIGS = {
    individual: {
        groups: [
            { id: 'monday', label: 'Monday', days: ['monday' as ScheduleType] },
            { id: 'tuesday', label: 'Tuesday', days: ['tuesday' as ScheduleType] },
            { id: 'wednesday', label: 'Wednesday', days: ['wednesday' as ScheduleType] },
            { id: 'thursday', label: 'Thursday', days: ['thursday' as ScheduleType] },
            { id: 'friday', label: 'Friday', days: ['friday' as ScheduleType] },
            { id: 'saturday', label: 'Saturday', days: ['saturday' as ScheduleType] },
            { id: 'sunday', label: 'Sunday', days: ['sunday' as ScheduleType] }
        ]
    },
    weekdayWeekend: {
        groups: [
            { id: 'weekdays', label: 'Mon-Fri', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as ScheduleType[] },
            { id: 'saturday', label: 'Saturday', days: ['saturday' as ScheduleType] },
            { id: 'sunday', label: 'Sunday', days: ['sunday' as ScheduleType] }
        ]
    },
    simplified: {
        groups: [
            { id: 'weekdays', label: 'Weekdays', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as ScheduleType[] },
            { id: 'weekend', label: 'Weekend', days: ['saturday', 'sunday'] as ScheduleType[] }
        ]
    }
};

interface UseDayGroupsReturn {
    dayGroups: DayGroup[];
    setDayGroups: (config: DayGroupConfig) => void;
    getCurrentGroup: (currentDay: ScheduleType) => DayGroup | undefined;
    usePreset: (preset: keyof typeof DEFAULT_CONFIGS) => void;
}

export function useDayGroups(): UseDayGroupsReturn {
    const [dayGroupConfig, setDayGroupConfig] = useState<DayGroupConfig>(() => {
        const saved = localStorage.getItem(DAY_GROUPS_KEY);
        return saved ? JSON.parse(saved) : DEFAULT_CONFIGS.individual;
    });

    const setDayGroups = useCallback((config: DayGroupConfig) => {
        setDayGroupConfig(config);
        localStorage.setItem(DAY_GROUPS_KEY, JSON.stringify(config));
    }, []);

    const getCurrentGroup = useCallback((currentDay: ScheduleType): DayGroup | undefined => {
        return dayGroupConfig.groups.find(group => group.days.includes(currentDay));
    }, [dayGroupConfig]);

    const usePreset = useCallback((preset: keyof typeof DEFAULT_CONFIGS) => {
        setDayGroups(DEFAULT_CONFIGS[preset]);
    }, [setDayGroups]);

    return {
        dayGroups: dayGroupConfig.groups,
        setDayGroups,
        getCurrentGroup,
        usePreset
    };
}
