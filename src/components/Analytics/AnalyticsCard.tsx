interface AnalyticsCardProps {
    label: string;
    value: string;
}

export function AnalyticsCard({ label, value }: AnalyticsCardProps) {
    return (
        <div className="analytics-card">
            <div className="analytics-label">{label}</div>
            <div className="analytics-value">{value}</div>
        </div>
    );
}
