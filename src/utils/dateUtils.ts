/**
 * Get the number of days in the current month
 */
export function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

/**
 * Get today's day number (1-31) if it's in the current month, null otherwise
 */
export function getTodayDay(currentMonth: number, currentYear: number): number | null {
    const now = new Date();
    if (now.getMonth() === currentMonth && now.getFullYear() === currentYear) {
        return now.getDate();
    }
    return null;
}

/**
 * Get month name from month index
 */
export function getMonthName(month: number): string {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[month];
}

/**
 * Get current day name
 */
export function getCurrentDayName(): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
}

/**
 * Get today's day of week (0-6, Sunday-Saturday)
 */
export function getTodayDayOfWeek(): number {
    return new Date().getDay();
}

/**
 * Parse time string to minutes since midnight
 */
export function parseTimeToMinutes(timeStr: string): number | null {
    // Handle "onwards" case
    let str = timeStr;
    if (str.includes('onwards')) {
        str = str.replace(' onwards', '').trim();
    }

    const match = str.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return null;

    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return hours * 60 + minutes;
}

/**
 * Parse time range string to start and end minutes
 */
export function parseTimeRange(timeStr: string): { start: number | null; end: number | null } {
    const parts = timeStr.split('–').map(s => s.trim());

    const start = parseTimeToMinutes(parts[0]);
    let end = parts[1] ? parseTimeToMinutes(parts[1]) : (start !== null ? start + 60 : null);

    // Handle "onwards" - extend to end of day
    if (timeStr.includes('onwards')) {
        end = 23 * 60 + 59;
    }

    return { start, end };
}

/**
 * Get current time in minutes since midnight
 */
export function getCurrentMinutes(): number {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
}
