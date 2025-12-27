// Habit Types
// Updated to use string IDs for Supabase UUID compatibility
export interface Habit {
    id: string;      // UUID from Supabase
    name: string;
    days: boolean[];
}

// Routine Types
export type RoutineType = 'morning' | 'study' | 'work' | 'project' | 'break' | 'evening' | 'night';

export interface RoutineItem {
    time: string;
    task: string;
    icon: string;
    type: RoutineType;
}

export interface DailyRoutines {
    monday: RoutineItem[];
    tuesday: RoutineItem[];
    wednesday: RoutineItem[];
    thursday: RoutineItem[];
    friday: RoutineItem[];
    saturday: RoutineItem[];
    sunday: RoutineItem[];
}

export type ScheduleType = keyof DailyRoutines;

// Day Group Configuration
export interface DayGroup {
    id: string;
    label: string;
    days: ScheduleType[];
}

export interface DayGroupConfig {
    groups: DayGroup[];
}

// Week Types
export interface WeekRange {
    name: string;
    start: number;
    end: number;
}

// Analytics Types
export interface Analytics {
    monthlyCompletion: number;
    totalHabits: number;
    bestStreak: number;
    consistencyScore: number;
}

// Chart Types
export interface ChartDataPoint {
    name: string;
    value: number;
}

// Storage Types
export interface StorageData {
    habits: Habit[];
    currentMonth: number;
    currentYear: number;
}

// Time Range
export interface TimeRange {
    start: number | null;
    end: number | null;
}

// Auth Types
export interface User {
    id: string;
    email: string;
    name: string;
    createdAt: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
