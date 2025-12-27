import { AnalyticsCard } from './AnalyticsCard';

interface AnalyticsDashboardProps {
    monthlyCompletion: number;
    totalHabits: number;
    bestStreak: number;
    consistencyScore: number;
}

export function AnalyticsDashboard({
    monthlyCompletion,
    totalHabits,
    bestStreak,
    consistencyScore
}: AnalyticsDashboardProps) {
    return (
        <div className="analytics-dashboard">
            <AnalyticsCard label="Monthly Completion" value={`${monthlyCompletion}%`} />
            <AnalyticsCard label="Total Habits" value={String(totalHabits)} />
            <AnalyticsCard label="Best Streak" value={`${bestStreak} days`} />
            <AnalyticsCard label="Consistency Score" value={`${consistencyScore}%`} />
        </div>
    );
}
