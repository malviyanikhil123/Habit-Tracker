import { useRef, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getMonthName } from '@/utils';
import { DailyRoutines } from '@/types';

interface HeaderProps {
    currentMonth: number;
    currentYear: number;
    hasAnyChecked: boolean;
    onReset: () => void;
    onImportRoutine: (routines: DailyRoutines) => void;
    onLogout?: () => void;
    userName?: string;
}

// Template structure for importing routines
const ROUTINE_TEMPLATE: DailyRoutines = {
    monday: [
        { time: '6:30 AM – 7:00 AM', task: 'Wake up, freshen up', icon: '🌅', type: 'morning' },
        { time: '7:00 AM – 8:00 AM', task: 'Morning Activity', icon: '💪', type: 'morning' },
        { time: '8:00 AM – 9:00 AM', task: 'Breakfast', icon: '🍳', type: 'break' },
        { time: '9:00 AM – 5:00 PM', task: 'Work Hours', icon: '🏢', type: 'work' },
        { time: '5:00 PM – 6:00 PM', task: 'Exercise', icon: '🏃', type: 'break' },
        { time: '6:00 PM – 7:00 PM', task: 'Dinner', icon: '🍽️', type: 'break' },
        { time: '7:00 PM – 9:00 PM', task: 'Personal Time', icon: '📚', type: 'evening' },
        { time: '9:00 PM – 10:00 PM', task: 'Wind Down', icon: '🧘', type: 'evening' },
        { time: '10:00 PM', task: 'Sleep', icon: '😴', type: 'night' }
    ],
    tuesday: [
        { time: '6:30 AM – 7:00 AM', task: 'Wake up, freshen up', icon: '🌅', type: 'morning' },
        { time: '7:00 AM – 8:00 AM', task: 'Morning Activity', icon: '💪', type: 'morning' },
        { time: '8:00 AM – 9:00 AM', task: 'Breakfast', icon: '🍳', type: 'break' },
        { time: '9:00 AM – 5:00 PM', task: 'Work Hours', icon: '🏢', type: 'work' },
        { time: '5:00 PM – 6:00 PM', task: 'Exercise', icon: '🏃', type: 'break' },
        { time: '6:00 PM – 7:00 PM', task: 'Dinner', icon: '🍽️', type: 'break' },
        { time: '7:00 PM – 9:00 PM', task: 'Personal Time', icon: '📚', type: 'evening' },
        { time: '9:00 PM – 10:00 PM', task: 'Wind Down', icon: '🧘', type: 'evening' },
        { time: '10:00 PM', task: 'Sleep', icon: '😴', type: 'night' }
    ],
    wednesday: [
        { time: '6:30 AM – 7:00 AM', task: 'Wake up, freshen up', icon: '🌅', type: 'morning' },
        { time: '7:00 AM – 8:00 AM', task: 'Morning Activity', icon: '💪', type: 'morning' },
        { time: '8:00 AM – 9:00 AM', task: 'Breakfast', icon: '🍳', type: 'break' },
        { time: '9:00 AM – 5:00 PM', task: 'Work Hours', icon: '🏢', type: 'work' },
        { time: '5:00 PM – 6:00 PM', task: 'Exercise', icon: '🏃', type: 'break' },
        { time: '6:00 PM – 7:00 PM', task: 'Dinner', icon: '🍽️', type: 'break' },
        { time: '7:00 PM – 9:00 PM', task: 'Personal Time', icon: '📚', type: 'evening' },
        { time: '9:00 PM – 10:00 PM', task: 'Wind Down', icon: '🧘', type: 'evening' },
        { time: '10:00 PM', task: 'Sleep', icon: '😴', type: 'night' }
    ],
    thursday: [
        { time: '6:30 AM – 7:00 AM', task: 'Wake up, freshen up', icon: '🌅', type: 'morning' },
        { time: '7:00 AM – 8:00 AM', task: 'Morning Activity', icon: '💪', type: 'morning' },
        { time: '8:00 AM – 9:00 AM', task: 'Breakfast', icon: '🍳', type: 'break' },
        { time: '9:00 AM – 5:00 PM', task: 'Work Hours', icon: '🏢', type: 'work' },
        { time: '5:00 PM – 6:00 PM', task: 'Exercise', icon: '🏃', type: 'break' },
        { time: '6:00 PM – 7:00 PM', task: 'Dinner', icon: '🍽️', type: 'break' },
        { time: '7:00 PM – 9:00 PM', task: 'Personal Time', icon: '📚', type: 'evening' },
        { time: '9:00 PM – 10:00 PM', task: 'Wind Down', icon: '🧘', type: 'evening' },
        { time: '10:00 PM', task: 'Sleep', icon: '😴', type: 'night' }
    ],
    friday: [
        { time: '6:30 AM – 7:00 AM', task: 'Wake up, freshen up', icon: '🌅', type: 'morning' },
        { time: '7:00 AM – 8:00 AM', task: 'Morning Activity', icon: '💪', type: 'morning' },
        { time: '8:00 AM – 9:00 AM', task: 'Breakfast', icon: '🍳', type: 'break' },
        { time: '9:00 AM – 5:00 PM', task: 'Work Hours', icon: '🏢', type: 'work' },
        { time: '5:00 PM – 6:00 PM', task: 'Exercise', icon: '🏃', type: 'break' },
        { time: '6:00 PM – 7:00 PM', task: 'Dinner', icon: '🍽️', type: 'break' },
        { time: '7:00 PM – 9:00 PM', task: 'Personal Time', icon: '📚', type: 'evening' },
        { time: '9:00 PM – 10:00 PM', task: 'Wind Down', icon: '🧘', type: 'evening' },
        { time: '10:00 PM', task: 'Sleep', icon: '😴', type: 'night' }
    ],
    saturday: [
        { time: '8:00 AM – 9:00 AM', task: 'Wake up slowly', icon: '🌅', type: 'morning' },
        { time: '9:00 AM – 12:00 PM', task: 'Personal Projects', icon: '💻', type: 'project' },
        { time: '12:00 PM – 1:00 PM', task: 'Lunch', icon: '🍽️', type: 'break' },
        { time: '1:00 PM – 5:00 PM', task: 'Hobbies / Relaxation', icon: '🎮', type: 'break' },
        { time: '5:00 PM onwards', task: 'Free Time', icon: '🛋️', type: 'night' }
    ],
    sunday: [
        { time: '9:00 AM – 10:00 AM', task: 'Wake up slowly', icon: '🌅', type: 'morning' },
        { time: '10:00 AM – 12:00 PM', task: 'Family Time', icon: '👨‍👩‍👧', type: 'break' },
        { time: '12:00 PM – 1:00 PM', task: 'Lunch', icon: '🍽️', type: 'break' },
        { time: '1:00 PM – 4:00 PM', task: 'Rest / Personal Time', icon: '🛋️', type: 'break' },
        { time: '4:00 PM – 6:00 PM', task: 'Week Planning', icon: '📋', type: 'study' },
        { time: '6:00 PM onwards', task: 'Relax', icon: '🎬', type: 'night' }
    ]
};

export function Header({ currentMonth, currentYear, hasAnyChecked, onReset, onImportRoutine, onLogout, userName }: HeaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const routineMenuRef = useRef<HTMLDivElement>(null);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const [showRoutineMenu, setShowRoutineMenu] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (routineMenuRef.current && !routineMenuRef.current.contains(event.target as Node)) {
                setShowRoutineMenu(false);
            }
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleReset = () => {
        if (hasAnyChecked && window.confirm('Reset all checkboxes for this month? Habit names will be kept.')) {
            onReset();
        }
        setShowProfileMenu(false);
    };

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        }
        setShowProfileMenu(false);
    };

    const handleDownloadTemplate = () => {
        const templateData = JSON.stringify(ROUTINE_TEMPLATE, null, 2);
        const blob = new Blob([templateData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'daily-routine-template.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setShowRoutineMenu(false);
        toast.success('Template downloaded! Edit it and import back.', {
            duration: 3000,
            icon: '📥'
        });
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
        setShowRoutineMenu(false);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const routines = JSON.parse(content) as DailyRoutines;

                // Validate structure
                const requiredDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                const missingDays = requiredDays.filter(day => !routines[day as keyof DailyRoutines]);
                if (missingDays.length > 0) {
                    throw new Error(`Invalid routine structure. Missing days: ${missingDays.join(', ')}`);
                }

                // Validate each routine item
                const validateRoutine = (items: unknown[], dayName: string) => {
                    if (!Array.isArray(items)) {
                        throw new Error(`${dayName} must be an array`);
                    }
                    items.forEach((item, index) => {
                        const routineItem = item as Record<string, unknown>;
                        if (!routineItem.time || !routineItem.task || !routineItem.icon || !routineItem.type) {
                            throw new Error(`Invalid item at ${dayName}[${index}]. Each item must have: time, task, icon, type`);
                        }
                    });
                };

                requiredDays.forEach(day => {
                    validateRoutine(routines[day as keyof DailyRoutines], day);
                });

                onImportRoutine(routines);
                toast.success('Daily routine imported successfully!', {
                    duration: 3000,
                    icon: '✅'
                });
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Failed to import routine. Please check the file format.', {
                    duration: 4000
                });
            }
        };
        reader.readAsText(file);

        // Reset input so same file can be imported again
        event.target.value = '';
    };

    return (
        <header className="main-header">
            <div className="header-left">
                <h1>Habit Tracker</h1>
                <span id="currentMonth">
                    {getMonthName(currentMonth)} {currentYear}
                </span>
            </div>

            <div className="header-right">
                {/* Routine Management Dropdown */}
                <div className="dropdown-container" ref={routineMenuRef}>
                    <button
                        className="header-btn routine-menu-btn"
                        onClick={() => setShowRoutineMenu(!showRoutineMenu)}
                        title="Manage Routines"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Routine
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>
                    {showRoutineMenu && (
                        <div className="dropdown-menu">
                            <button
                                className="dropdown-item"
                                onClick={handleImportClick}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                                Import Routine
                            </button>
                            <button
                                className="dropdown-item"
                                onClick={handleDownloadTemplate}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                Download Template
                            </button>
                        </div>
                    )}
                </div>

                {/* Profile/Settings Dropdown */}
                {userName && (
                    <div className="dropdown-container" ref={profileMenuRef}>
                        <button
                            className="user-menu-btn"
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            title={userName}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </button>
                        {showProfileMenu && (
                            <div className="dropdown-menu dropdown-menu-right">
                                <div className="dropdown-header">
                                    <span className="dropdown-username">{userName}</span>
                                </div>
                                <button
                                    className="dropdown-item"
                                    onClick={handleReset}
                                    disabled={!hasAnyChecked}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="1 4 1 10 7 10" />
                                        <polyline points="23 20 23 14 17 14" />
                                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                                    </svg>
                                    Reset Month
                                </button>
                                {onLogout && (
                                    <button
                                        className="dropdown-item dropdown-item-danger"
                                        onClick={handleLogout}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                            <polyline points="16 17 21 12 16 7" />
                                            <line x1="21" y1="12" x2="9" y2="12" />
                                        </svg>
                                        Logout
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
            </div>
        </header>
    );
}
