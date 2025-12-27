interface WeekCardProps {
    name: string;
    daysLabel: string;
    progress: number;
}

export function WeekCard({ name, daysLabel, progress }: WeekCardProps) {
    return (
        <div className="week-card">
            <div className="week-title">{name}</div>
            <div className="week-stats">
                <div className="week-stat-row">
                    <span className="week-stat-label">Days</span>
                    <span className="week-stat-value">{daysLabel}</span>
                </div>
                <div className="week-stat-row">
                    <span className="week-stat-label">Completion</span>
                    <span className="week-stat-value">{progress}%</span>
                </div>
                <div className="week-progress-bar">
                    <div
                        className="week-progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
